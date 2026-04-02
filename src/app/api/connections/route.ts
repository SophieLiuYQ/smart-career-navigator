import { NextResponse } from "next/server";
import { runQuery } from "@/lib/neo4j";
import { generateCompletion } from "@/lib/anthropic";
import { recommendConnections } from "@/lib/rocketride";

interface TransitionPerson {
  name: string;
  years_exp: number;
  company: string;
  skills: string[];
}

interface IntermediatePerson {
  name: string;
  role: string;
  company: string;
  years_exp: number;
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

    // Neo4j: Find people who made this transition + intermediate contacts
    const [transitionMakers, intermediatePeople] = await Promise.all([
      runQuery<TransitionPerson>(
        `MATCH (p:Person)-[:PREVIOUSLY_HELD]->(source:Role {title: $currentRole}),
              (p)-[:HOLDS_ROLE]->(target:Role {title: $targetRole}),
              (p)-[:WORKS_AT]->(company:Company),
              (p)-[:HAS_SKILL]->(s:Skill)
         RETURN p.name AS name, p.years_exp AS years_exp, company.name AS company,
           collect(DISTINCT s.name) AS skills
         LIMIT 10`,
        { currentRole, targetRole }
      ),
      runQuery<IntermediatePerson>(
        `MATCH path = shortestPath(
           (current:Role {title: $currentRole})-[:LEADS_TO*..4]->(target:Role {title: $targetRole})
         ),
           (p:Person)-[:HOLDS_ROLE]->(intermediate:Role)
         WHERE intermediate IN nodes(path) AND intermediate.title <> $currentRole AND intermediate.title <> $targetRole
         OPTIONAL MATCH (p)-[:WORKS_AT]->(company:Company)
         RETURN p.name AS name, intermediate.title AS role, company.name AS company, p.years_exp AS years_exp
         LIMIT 10`,
        { currentRole, targetRole }
      ),
    ]);

    // RocketRide AI Pipeline: Generate outreach recommendations
    const pipelinePayload = {
      transitionMakers,
      intermediateContacts: intermediatePeople,
      currentRole,
      targetRole,
    };

    let outreach;
    let aiSource = "anthropic";
    const rocketResult = await recommendConnections(pipelinePayload);

    if (rocketResult.success && rocketResult.data) {
      aiSource = "rocketride";
      console.log("[connections] ✅ Using RocketRide pipeline");
      try {
        const data = rocketResult.data;
        if (typeof data === "string") {
          outreach = parseJson(data);
        } else if (typeof data === "object" && data !== null && "raw" in data) {
          outreach = parseJson((data as { raw: string }).raw);
        } else {
          outreach = data;
        }
      } catch {
        outreach = { connections: [], networking_strategy: typeof rocketResult.data === "string" ? rocketResult.data : "Analysis complete." };
      }
    } else {
      // Fallback: Direct Anthropic call
      console.log("[connections] ⚠️ RocketRide unavailable, falling back to Anthropic");
      const systemPrompt = `You are a networking advisor. Given a list of connections who made career transitions relevant to the user's goal, suggest personalized outreach strategies.
For each person, suggest a brief message or talking point that would make a meaningful connection.
Respond ONLY with valid JSON, no markdown: { "connections": [{ "name": "...", "company": "...", "role": "...", "reason": "...", "outreach_tip": "..." }], "networking_strategy": "..." }`;

      const userMessage = `The user wants to transition from ${currentRole} to ${targetRole}.

People who completed this transition: ${JSON.stringify(transitionMakers)}

People in intermediate roles on the path: ${JSON.stringify(intermediatePeople)}

Suggest outreach strategies for each person.`;

      const aiSuggestionsRaw = await generateCompletion(systemPrompt, userMessage);

      try {
        outreach = parseJson(aiSuggestionsRaw);
      } catch {
        outreach = { connections: [], networking_strategy: aiSuggestionsRaw };
      }
    }

    return NextResponse.json({
      transitionMakers,
      intermediatePeople,
      ...outreach,
      _source: aiSource,
    });
  } catch (error) {
    console.error("Failed to fetch connections:", error);
    return NextResponse.json(
      { error: "Failed to fetch connections" },
      { status: 500 }
    );
  }
}
