import { NextResponse } from "next/server";
import { runQuery } from "@/lib/neo4j";
import { resolveRole } from "@/lib/role-matcher";

interface SkillGapResult {
  skill: string;
  category: string;
  importance: number;
  courses: Array<{
    name: string | null;
    provider: string | null;
    duration: string | null;
    url: string | null;
  }>;
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

    const [currentResolved, targetResolved] = await Promise.all([
      resolveRole(currentRole),
      resolveRole(targetRole),
    ]);

    const skillGaps = await runQuery<SkillGapResult>(
      `MATCH (target:Role {title: $targetRole})-[req:REQUIRES_SKILL]->(s:Skill)
       WHERE NOT s.name IN $userSkills
       AND NOT EXISTS {
         MATCH (source:Role {title: $currentRole})-[:REQUIRES_SKILL {importance: req.importance}]->(s)
       }
       OPTIONAL MATCH (c:Course)-[:TEACHES]->(s)
       RETURN s.name AS skill, s.category AS category, req.importance AS importance,
         collect(CASE WHEN c IS NOT NULL THEN {name: c.name, provider: c.provider, duration: c.duration, url: c.url} END) AS courses
       ORDER BY req.importance DESC`,
      { currentRole: currentResolved.resolved, targetRole: targetResolved.resolved, userSkills }
    );

    // Filter out null courses
    const cleaned = skillGaps.map((gap) => ({
      ...gap,
      courses: gap.courses.filter((c) => c.name !== null),
    }));

    return NextResponse.json(cleaned);
  } catch (error) {
    console.error("Failed to analyze skill gap:", error);
    return NextResponse.json(
      { error: "Failed to analyze skill gap" },
      { status: 500 }
    );
  }
}
