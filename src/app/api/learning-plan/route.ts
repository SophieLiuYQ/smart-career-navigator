import { NextResponse } from "next/server";
import { runQuery } from "@/lib/neo4j";
import { generateCompletion } from "@/lib/anthropic";
import { generateLearningPlan } from "@/lib/rocketride";

interface SkillGapInput {
  skill: string;
  category: string;
  importance: number;
}

interface Prerequisite {
  prerequisite: string;
  skill: string;
}

interface CourseResult {
  course: string;
  provider: string;
  duration: string;
  url: string;
  skills_covered: string[];
}

function parseJson(raw: string) {
  let cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) cleaned = jsonMatch[0];
  return JSON.parse(cleaned);
}

export async function POST(request: Request) {
  try {
    const { currentRole, targetRole, skillGaps, timeframeMonths } =
      await request.json();

    if (!currentRole || !targetRole || !Array.isArray(skillGaps) || !timeframeMonths) {
      return NextResponse.json(
        { error: "currentRole, targetRole, skillGaps (array), and timeframeMonths are required" },
        { status: 400 }
      );
    }

    const skillNames = skillGaps.map((g: SkillGapInput) => g.skill);

    // Neo4j: Query prerequisites and courses from the graph
    const [prerequisites, courses] = await Promise.all([
      runQuery<Prerequisite>(
        `MATCH (s:Skill)-[:PREREQUISITE_FOR]->(target:Skill)
         WHERE target.name IN $skillNames
         RETURN s.name AS prerequisite, target.name AS skill`,
        { skillNames }
      ),
      runQuery<CourseResult>(
        `MATCH (c:Course)-[:TEACHES]->(s:Skill)
         WHERE s.name IN $skillNames
         RETURN c.name AS course, c.provider AS provider, c.duration AS duration, c.url AS url, collect(s.name) AS skills_covered
         ORDER BY size(skills_covered) DESC`,
        { skillNames }
      ),
    ]);

    // RocketRide AI Pipeline: Generate learning plan
    const pipelinePayload = {
      skillGaps,
      prerequisites,
      courses,
      timeframeMonths,
      currentRole,
      targetRole,
    };

    let learningPlan;
    let aiSource = "anthropic";
    const rocketResult = await generateLearningPlan(pipelinePayload);

    if (rocketResult.success && rocketResult.data) {
      aiSource = "rocketride";
      console.log("[learning-plan] ✅ Using RocketRide pipeline");
      try {
        const data = rocketResult.data;
        if (typeof data === "string") {
          learningPlan = parseJson(data);
        } else if (typeof data === "object" && data !== null && "raw" in data) {
          // Engine couldn't parse — try once more
          learningPlan = parseJson((data as { raw: string }).raw);
        } else {
          learningPlan = data;
        }
      } catch {
        // Last resort: try to extract plan array from raw data
        const rawStr = typeof rocketResult.data === "object" && rocketResult.data !== null && "raw" in rocketResult.data
          ? (rocketResult.data as { raw: string }).raw
          : typeof rocketResult.data === "string" ? rocketResult.data : "";
        try {
          const arrayMatch = rawStr.replace(/```json\n?/g, "").replace(/```\n?/g, "").match(/\[[\s\S]*\]/);
          if (arrayMatch) {
            learningPlan = { plan: JSON.parse(arrayMatch[0]), summary: "AI-generated learning plan" };
          } else {
            learningPlan = { plan: [], summary: rawStr || "AI-generated plan" };
          }
        } catch {
          learningPlan = { plan: [], summary: rawStr || "AI-generated plan" };
        }
      }
    } else {
      // Fallback: Direct Anthropic call
      console.log("[learning-plan] ⚠️ RocketRide unavailable, falling back to Anthropic");
      const systemPrompt = `You are a career learning plan architect. Given skill gaps, their prerequisites, available courses, and a timeframe, create a detailed week-by-week learning plan.
Consider prerequisite ordering — learn foundational skills before advanced ones.
Respond ONLY with valid JSON, no markdown: { "plan": [{ "week": 1, "focus": "...", "skills": [...], "courses": [{"name": "...", "provider": "..."}], "milestone": "..." }], "summary": "..." }`;

      const userMessage = `Create a learning plan for transitioning from ${currentRole} to ${targetRole} within ${timeframeMonths} months.

Skill gaps: ${JSON.stringify(skillGaps)}

Prerequisites: ${JSON.stringify(prerequisites)}

Available courses: ${JSON.stringify(courses)}`;

      const aiPlanRaw = await generateCompletion(systemPrompt, userMessage);

      try {
        learningPlan = parseJson(aiPlanRaw);
      } catch {
        try {
          const arrayMatch = aiPlanRaw.match(/\[[\s\S]*\]/);
          if (arrayMatch) {
            learningPlan = { plan: JSON.parse(arrayMatch[0]), summary: "AI-generated learning plan" };
          } else {
            learningPlan = { plan: [], summary: aiPlanRaw };
          }
        } catch {
          learningPlan = { plan: [], summary: aiPlanRaw };
        }
      }
    }

    return NextResponse.json({
      currentRole,
      targetRole,
      timeframeMonths,
      prerequisites,
      courses,
      ...learningPlan,
      _source: aiSource,
    });
  } catch (error) {
    console.error("Failed to generate learning plan:", error);
    return NextResponse.json(
      { error: "Failed to generate learning plan" },
      { status: 500 }
    );
  }
}
