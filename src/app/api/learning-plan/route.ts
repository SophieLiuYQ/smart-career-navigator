import { NextResponse } from "next/server";
import { runQuery } from "@/lib/neo4j";
import { generateCompletion } from "@/lib/anthropic";

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

    const systemPrompt = `You are a career learning plan architect. Given skill gaps, their prerequisites, available courses, and a timeframe, create a detailed week-by-week learning plan.
Consider prerequisite ordering — learn foundational skills before advanced ones.
Respond ONLY with valid JSON, no markdown: { "plan": [{ "week": 1, "focus": "...", "skills": [...], "courses": [{"name": "...", "provider": "..."}], "milestone": "..." }], "summary": "..." }`;

    const userMessage = `Create a learning plan for transitioning from ${currentRole} to ${targetRole} within ${timeframeMonths} months.

Skill gaps: ${JSON.stringify(skillGaps)}

Prerequisites: ${JSON.stringify(prerequisites)}

Available courses: ${JSON.stringify(courses)}`;

    const aiPlanRaw = await generateCompletion(systemPrompt, userMessage);

    let learningPlan;
    try {
      let cleaned = aiPlanRaw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      // Extract JSON object if surrounded by other text
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) cleaned = jsonMatch[0];
      learningPlan = JSON.parse(cleaned);
    } catch {
      // Try to extract any JSON array for plan
      try {
        const arrayMatch = aiPlanRaw.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
          const plan = JSON.parse(arrayMatch[0]);
          learningPlan = { plan, summary: "AI-generated learning plan" };
        } else {
          learningPlan = { plan: [], summary: aiPlanRaw };
        }
      } catch {
        learningPlan = { plan: [], summary: aiPlanRaw };
      }
    }

    return NextResponse.json({
      currentRole,
      targetRole,
      timeframeMonths,
      prerequisites,
      courses,
      ...learningPlan,
    });
  } catch (error) {
    console.error("Failed to generate learning plan:", error);
    return NextResponse.json(
      { error: "Failed to generate learning plan" },
      { status: 500 }
    );
  }
}
