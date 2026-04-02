import { NextResponse } from "next/server";
import { runQuery } from "@/lib/neo4j";

export async function GET() {
  try {
    const roles = await runQuery<{
      title: string;
      level: string;
      avg_salary: number;
      demand_score: number;
    }>(
      `MATCH (r:Role)
       RETURN r.title AS title, r.level AS level, r.avg_salary AS avg_salary, r.demand_score AS demand_score
       ORDER BY r.title`
    );
    return NextResponse.json(roles);
  } catch (error) {
    console.error("Failed to fetch roles:", error);
    return NextResponse.json(
      { error: "Failed to fetch roles" },
      { status: 500 }
    );
  }
}
