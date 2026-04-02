import { NextResponse } from "next/server";
import { generateCompletion } from "@/lib/anthropic";
import { analyzeCareerPaths } from "@/lib/rocketride";
import { resolveRole } from "@/lib/role-matcher";
import { findSkillBasedPaths } from "@/lib/skill-pathfinder";

function parseJson(raw: string) {
  const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  return JSON.parse(match ? match[0] : cleaned);
}

export async function POST(request: Request) {
  try {
    const { currentRole, targetRole, userSkills = [] } = await request.json();

    if (!currentRole || !targetRole) {
      return NextResponse.json(
        { error: "currentRole and targetRole are required" },
        { status: 400 }
      );
    }

    // Resolve roles (creates in Neo4j if new)
    let currentResolved, targetResolved;
    try {
      [currentResolved, targetResolved] = await Promise.all([
        resolveRole(currentRole),
        resolveRole(targetRole),
      ]);
    } catch (e) {
      console.error("[career-paths] Role resolution failed:", e);
      // Fallback: use roles as-is
      currentResolved = { resolved: currentRole, original: currentRole, exact: false, created: false };
      targetResolved = { resolved: targetRole, original: targetRole, exact: false, created: false };
    }

    // Skill-first pathfinding
    const skillResult = await findSkillBasedPaths(
      currentResolved.resolved,
      targetResolved.resolved,
      userSkills
    );

    const rawPaths = skillResult.paths.map((p) => ({
      role_names: p.role_names,
      total_months: p.total_months,
      path_probability: p.path_probability,
    }));

    if (rawPaths.length === 0) {
      return NextResponse.json({
        rawPaths: [],
        paths: [],
        overall_advice: `No career paths could be determined from ${currentRole} to ${targetRole}.`,
        _source: "anthropic",
      });
    }

    // RocketRide AI Pipeline: Analyze the skill-based paths
    const pipelinePayload = {
      paths: skillResult.paths,
      currentRole,
      targetRole,
      skillGap: skillResult.skillGap,
      currentSkills: skillResult.currentSkills,
      targetSkills: skillResult.targetSkills,
      bridgeRoles: skillResult.bridgeRoles,
    };

    let aiAnalysis;
    let aiSource = "anthropic";
    const rocketResult = await analyzeCareerPaths(pipelinePayload);

    if (rocketResult.success && rocketResult.data) {
      aiSource = "rocketride";
      console.log("[career-paths] ✅ Using RocketRide pipeline");
      try {
        const data = rocketResult.data;
        const rawStr = (typeof data === "object" && data !== null && "raw" in data)
          ? (data as { raw: string }).raw : null;
        if (rawStr) {
          aiAnalysis = JSON.parse(rawStr.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim());
        } else if (typeof data === "string") {
          aiAnalysis = JSON.parse(data.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim());
        } else {
          aiAnalysis = data;
        }
      } catch {
        aiAnalysis = {
          paths: rawPaths.map((p, i) => ({ roles: p.role_names, assessment: "AI analysis.", recommended: i === 0 })),
          overall_advice: "Analysis complete.",
        };
      }
    } else {
      console.log("[career-paths] ⚠️ RocketRide unavailable, falling back to Anthropic");
      const systemPrompt = `You are a career advisor AI. Analyze career transition paths that were found using SKILL-BASED matching.
Each path connects roles that share overlapping skills. Assess each path and provide recommendations.
Respond ONLY with valid JSON, no markdown:
{ "paths": [{ "roles": [...], "assessment": "...", "recommended": false }], "overall_advice": "..." }`;

      const userMessage = `Career transition from "${currentRole}" to "${targetRole}"

Paths found via skill matching: ${JSON.stringify(skillResult.paths)}

Current skills: ${skillResult.currentSkills.join(", ")}
Target skills: ${skillResult.targetSkills.join(", ")}
Skill gap: ${skillResult.skillGap.join(", ")}
Bridge roles found: ${skillResult.bridgeRoles.map((b) => `${b.title} (shares: ${[...b.shared_with_current, ...b.shared_with_target].join(", ")})`).join("; ")}`;

      const aiResponseRaw = await generateCompletion(systemPrompt, userMessage, 4096);

      try {
        aiAnalysis = parseJson(aiResponseRaw);
      } catch {
        aiAnalysis = {
          paths: rawPaths.map((p, i) => ({
            roles: p.role_names,
            assessment: i === 0 ? "Recommended path based on skill overlap." : "Alternative path.",
            recommended: i === 0,
          })),
          overall_advice: aiResponseRaw,
        };
      }
    }

    return NextResponse.json({
      rawPaths,
      ...aiAnalysis,
      _source: aiSource,
      _pathSource: skillResult.bridgeRoles.length > 0 ? "graph" : "ai",
      _skillAnalysis: {
        currentSkills: skillResult.currentSkills,
        targetSkills: skillResult.targetSkills,
        skillGap: skillResult.skillGap,
        bridgeRoles: skillResult.bridgeRoles.map((b) => b.title),
      },
      _roleMapping: {
        current: { input: currentRole, resolved: currentResolved.resolved, exact: currentResolved.exact, created: currentResolved.created },
        target: { input: targetRole, resolved: targetResolved.resolved, exact: targetResolved.exact, created: targetResolved.created },
      },
    });
  } catch (error) {
    console.error("Failed to find career paths:", error);
    return NextResponse.json(
      { error: "Failed to find career paths", detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
