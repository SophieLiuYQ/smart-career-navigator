import { NextResponse } from "next/server";
import { runQuery } from "@/lib/neo4j";
import { generateCompletion } from "@/lib/anthropic";
import { analyzeCareerPaths } from "@/lib/rocketride";
import { resolveRole } from "@/lib/role-matcher";

interface CareerPath {
  role_names: string[];
  total_months: number;
  path_probability: number;
}

interface SkillGapResult {
  skill: string;
  importance: number;
}

function parseJson(raw: string) {
  const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  return JSON.parse(match ? match[0] : cleaned);
}

async function generateAIPaths(currentRole: string, targetRole: string): Promise<CareerPath[]> {
  const response = await generateCompletion(
    `You are a career path expert. Generate 3 realistic career transition paths between two roles.
Each path should have sensible intermediate steps that a real professional would take.
Respond ONLY with valid JSON, no markdown:
{
  "paths": [
    { "role_names": ["Start Role", "Step 1", "Step 2", "Target Role"], "total_months": number, "path_probability": 0.0-1.0 }
  ]
}`,
    `From: "${currentRole}" To: "${targetRole}". Generate 3 realistic paths with intermediate roles.`,
    2048
  );

  try {
    const parsed = parseJson(response);
    return parsed.paths || [];
  } catch {
    return [];
  }
}

export async function POST(request: Request) {
  try {
    const { currentRole, targetRole } = await request.json();

    if (!currentRole || !targetRole) {
      return NextResponse.json(
        { error: "currentRole and targetRole are required" },
        { status: 400 }
      );
    }

    // Resolve user-typed roles to Neo4j roles
    const [currentResolved, targetResolved] = await Promise.all([
      resolveRole(currentRole),
      resolveRole(targetRole),
    ]);

    const graphCurrentRole = currentResolved.resolved;
    const graphTargetRole = targetResolved.resolved;

    // Neo4j: Graph pathfinding
    let rawPaths = await runQuery<CareerPath>(
      `MATCH path = allShortestPaths(
        (current:Role {title: $currentRole})-[:LEADS_TO*..6]->(target:Role {title: $targetRole})
      )
      WITH path,
        reduce(months = 0, r IN relationships(path) | months + toInteger(r.avg_transition_months)) AS total_months,
        reduce(freq = 1.0, r IN relationships(path) | freq * r.frequency) AS path_probability,
        [n IN nodes(path) | n.title] AS role_names
      RETURN role_names, total_months, path_probability
      ORDER BY path_probability DESC, total_months ASC
      LIMIT 5`,
      { currentRole: graphCurrentRole, targetRole: graphTargetRole }
    );

    let pathSource: "graph" | "ai" | "hybrid" = "graph";

    // If no graph paths found, generate with AI
    if (rawPaths.length === 0) {
      console.log("[career-paths] No graph paths found, generating with AI");
      rawPaths = await generateAIPaths(currentRole, targetRole);
      pathSource = "ai";
    } else {
      // Validate graph paths — check if they make sense (not too many hops through unrelated roles)
      const suspicious = rawPaths.every(
        (p) => p.role_names.length > 4 || p.path_probability < 0.001
      );
      if (suspicious) {
        console.log("[career-paths] Graph paths look suspicious, supplementing with AI");
        const aiPaths = await generateAIPaths(currentRole, targetRole);
        // Combine: AI paths first (likely more sensible), then graph paths
        rawPaths = [...aiPaths, ...rawPaths].slice(0, 5);
        pathSource = "hybrid";
      }
    }

    if (rawPaths.length === 0) {
      return NextResponse.json({
        rawPaths: [],
        paths: [],
        overall_advice: `No career paths could be determined from ${currentRole} to ${targetRole}. These roles may be in very different industries.`,
        _source: "anthropic",
      });
    }

    // Neo4j: Skill gap query
    const skillGaps = await runQuery<SkillGapResult>(
      `MATCH (target:Role {title: $targetRole})-[req:REQUIRES_SKILL]->(s:Skill)
       WHERE NOT EXISTS {
         MATCH (source:Role {title: $currentRole})-[:REQUIRES_SKILL]->(s)
       }
       RETURN s.name AS skill, req.importance AS importance
       ORDER BY req.importance DESC
       LIMIT 10`,
      { currentRole: graphCurrentRole, targetRole: graphTargetRole }
    );

    // RocketRide AI Pipeline: Analyze career paths
    const pipelinePayload = {
      paths: rawPaths,
      currentRole,
      targetRole,
      skillGaps,
      pathSource,
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
      // Fallback: Direct Anthropic call
      console.log("[career-paths] ⚠️ RocketRide unavailable, falling back to Anthropic");
      const systemPrompt = `You are a career advisor AI. You analyze career transition paths and provide personalized recommendations.
Given career paths, analyze each path and provide:
1. A brief assessment of each path (1-2 sentences)
2. Which path you recommend and why
3. Key risks and considerations
Respond ONLY with valid JSON, no markdown: { "paths": [{ "roles": [...], "assessment": "...", "recommended": false }], "overall_advice": "..." }`;

      const userMessage = `Analyze these career paths from ${currentRole} to ${targetRole}:

Paths: ${JSON.stringify(rawPaths)}

Key skill gaps to bridge: ${JSON.stringify(skillGaps)}

Path source: ${pathSource} (graph = from Neo4j database, ai = AI-generated, hybrid = both)`;

      const aiResponseRaw = await generateCompletion(systemPrompt, userMessage);

      try {
        aiAnalysis = parseJson(aiResponseRaw);
      } catch {
        aiAnalysis = {
          paths: rawPaths.map((p, i) => ({
            roles: p.role_names,
            assessment: i === 0 ? "Most probable path." : "Alternative path.",
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
      _pathSource: pathSource,
      _roleMapping: {
        current: { input: currentRole, resolved: graphCurrentRole, exact: currentResolved.exact, created: currentResolved.created },
        target: { input: targetRole, resolved: graphTargetRole, exact: targetResolved.exact, created: targetResolved.created },
      },
    });
  } catch (error) {
    console.error("Failed to find career paths:", error);
    return NextResponse.json(
      { error: "Failed to find career paths" },
      { status: 500 }
    );
  }
}
