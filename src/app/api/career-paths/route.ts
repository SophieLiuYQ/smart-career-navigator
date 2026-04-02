import { NextResponse } from "next/server";
import { runQuery } from "@/lib/neo4j";
import { generateCompletion } from "@/lib/anthropic";
import { analyzeCareerPaths } from "@/lib/rocketride";

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

export async function POST(request: Request) {
  try {
    const { currentRole, targetRole } = await request.json();

    if (!currentRole || !targetRole) {
      return NextResponse.json(
        { error: "currentRole and targetRole are required" },
        { status: 400 }
      );
    }

    // Neo4j: Graph pathfinding
    const rawPaths = await runQuery<CareerPath>(
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
      { currentRole, targetRole }
    );

    if (rawPaths.length === 0) {
      return NextResponse.json({
        rawPaths: [],
        paths: [],
        overall_advice: "No career paths found between these roles. Try selecting roles that are more closely related.",
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
      { currentRole, targetRole }
    );

    // RocketRide AI Pipeline: Analyze career paths
    const pipelinePayload = {
      paths: rawPaths,
      currentRole,
      targetRole,
      skillGaps,
    };

    let aiAnalysis;
    const rocketResult = await analyzeCareerPaths(pipelinePayload);

    if (rocketResult.success && rocketResult.data) {
      // RocketRide pipeline succeeded
      console.log("[career-paths] Using RocketRide pipeline result");
      try {
        aiAnalysis = typeof rocketResult.data === "string"
          ? parseJson(rocketResult.data)
          : rocketResult.data;
      } catch {
        aiAnalysis = rocketResult.data;
      }
    } else {
      // Fallback: Direct Anthropic call
      console.log("[career-paths] RocketRide unavailable, falling back to direct Anthropic");
      const systemPrompt = `You are a career advisor AI. You analyze career transition paths and provide personalized recommendations.
Given career paths from a graph database, analyze each path and provide:
1. A brief assessment of each path (1-2 sentences)
2. Which path you recommend and why
3. Key risks and considerations
Respond ONLY with valid JSON, no markdown: { "paths": [{ "roles": [...], "assessment": "...", "recommended": false }], "overall_advice": "..." }`;

      const userMessage = `Analyze these career paths from ${currentRole} to ${targetRole}:

Paths: ${JSON.stringify(rawPaths)}

Key skill gaps to bridge: ${JSON.stringify(skillGaps)}`;

      const aiResponseRaw = await generateCompletion(systemPrompt, userMessage);

      try {
        aiAnalysis = parseJson(aiResponseRaw);
      } catch {
        aiAnalysis = {
          paths: rawPaths.map((p, i) => ({
            roles: p.role_names,
            assessment: i === 0 ? "Most probable path based on industry data." : "Alternative path worth considering.",
            recommended: i === 0,
          })),
          overall_advice: aiResponseRaw,
        };
      }
    }

    return NextResponse.json({
      rawPaths,
      ...aiAnalysis,
    });
  } catch (error) {
    console.error("Failed to find career paths:", error);
    return NextResponse.json(
      { error: "Failed to find career paths" },
      { status: 500 }
    );
  }
}
