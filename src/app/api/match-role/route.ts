import { NextResponse } from "next/server";
import { runQuery } from "@/lib/neo4j";

interface RoleMatch {
  title: string;
  matched_skills: string[];
  match_score: number;
  total_required: number;
}

export async function POST(request: Request) {
  try {
    const { skills, currentTitle } = await request.json();

    if (!Array.isArray(skills) || skills.length === 0) {
      return NextResponse.json({ error: "skills array is required" }, { status: 400 });
    }

    // Find roles whose required skills overlap most with the user's skills
    const matches = await runQuery<RoleMatch>(
      `MATCH (r:Role)-[:REQUIRES_SKILL]->(s:Skill)
       WITH r, collect(s.name) AS requiredSkills
       WITH r, requiredSkills,
         [sk IN $userSkills WHERE sk IN requiredSkills] AS matched_skills
       WHERE size(matched_skills) > 0
       RETURN r.title AS title,
         matched_skills,
         toFloat(size(matched_skills)) AS match_score,
         toFloat(size(requiredSkills)) AS total_required
       ORDER BY match_score DESC, total_required ASC
       LIMIT 5`,
      { userSkills: skills }
    );

    // Also include the parsed title for context
    return NextResponse.json({
      parsedTitle: currentTitle || null,
      matches: matches.map((m) => ({
        title: m.title,
        matched_skills: m.matched_skills,
        match_score: m.match_score,
        total_required: m.total_required,
        match_percentage: Math.round((m.match_score / Math.max(m.total_required, 1)) * 100),
      })),
      bestMatch: matches.length > 0 ? matches[0].title : null,
    });
  } catch (error) {
    console.error("Failed to match role:", error);
    return NextResponse.json({ error: "Failed to match role" }, { status: 500 });
  }
}
