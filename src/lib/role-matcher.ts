import { runQuery } from "@/lib/neo4j";
import { generateCompletion } from "@/lib/anthropic";

let roleCache: string[] | null = null;

async function getAllRoles(): Promise<string[]> {
  if (roleCache) return roleCache;
  const results = await runQuery<{ title: string }>(
    "MATCH (r:Role) RETURN r.title AS title ORDER BY r.title"
  );
  roleCache = results.map((r) => r.title);
  return roleCache;
}

export function clearRoleCache() {
  roleCache = null;
}

/**
 * Check if a role exists in Neo4j. Returns the exact title if found, null if not.
 */
export async function findRole(userRole: string): Promise<string | null> {
  const roles = await getAllRoles();
  const exact = roles.find((r) => r.toLowerCase() === userRole.toLowerCase());
  return exact || null;
}

/**
 * Create a new role in Neo4j using AI-generated data.
 * Returns the created role details.
 */
export async function createRoleFromAI(roleTitle: string): Promise<{
  title: string;
  skills: string[];
  transitions_from: string[];
  transitions_to: string[];
}> {
  const roles = await getAllRoles();

  const response = await generateCompletion(
    `You are a career data expert. Given a job title, generate realistic career data to add to a career graph database.
The existing roles in the database are: ${roles.join(", ")}

Respond ONLY with valid JSON, no markdown:
{
  "title": "Exact job title as provided",
  "level": "junior|mid|senior|lead|principal|director|vp",
  "avg_salary": number,
  "demand_score": 1-10,
  "skills": [{"name": "Skill Name", "importance": 1-5}],
  "transitions_from": [{"role": "Existing Role Title", "frequency": 0.0-1.0, "months": number}],
  "transitions_to": [{"role": "Existing Role Title", "frequency": 0.0-1.0, "months": number}]
}

For transitions, ONLY use roles from the existing list. Include 2-5 realistic transitions in each direction.
For skills, include 5-8 key skills. Use existing skill names from the database when possible.`,
    `Job title: "${roleTitle}"`,
    2048
  );

  let parsed;
  try {
    const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(match ? match[0] : cleaned);
  } catch {
    // Minimal fallback
    parsed = {
      title: roleTitle,
      level: "mid",
      avg_salary: 100000,
      demand_score: 5,
      skills: [],
      transitions_from: [],
      transitions_to: [],
    };
  }

  // Create role node in Neo4j
  await runQuery(
    `MERGE (r:Role {title: $title})
     SET r.level = $level, r.avg_salary = $avg_salary, r.demand_score = $demand_score, r.ai_generated = true`,
    {
      title: parsed.title || roleTitle,
      level: parsed.level || "mid",
      avg_salary: parsed.avg_salary || 100000,
      demand_score: parsed.demand_score || 5,
    }
  );

  // Create skill relationships
  for (const skill of parsed.skills || []) {
    await runQuery(
      `MERGE (s:Skill {name: $name})
       ON CREATE SET s.category = 'AI Generated'
       WITH s
       MATCH (r:Role {title: $role})
       MERGE (r)-[:REQUIRES_SKILL {importance: $importance}]->(s)`,
      { name: skill.name, role: parsed.title || roleTitle, importance: skill.importance || 3 }
    );
  }

  // Create transitions FROM existing roles to this role
  for (const t of parsed.transitions_from || []) {
    await runQuery(
      `MATCH (from:Role {title: $fromRole}), (to:Role {title: $toRole})
       MERGE (from)-[:LEADS_TO {frequency: $freq, avg_transition_months: $months}]->(to)`,
      { fromRole: t.role, toRole: parsed.title || roleTitle, freq: t.frequency || 0.1, months: t.months || 18 }
    );
  }

  // Create transitions FROM this role TO existing roles
  for (const t of parsed.transitions_to || []) {
    await runQuery(
      `MATCH (from:Role {title: $fromRole}), (to:Role {title: $toRole})
       MERGE (from)-[:LEADS_TO {frequency: $freq, avg_transition_months: $months}]->(to)`,
      { fromRole: parsed.title || roleTitle, toRole: t.role, freq: t.frequency || 0.1, months: t.months || 18 }
    );
  }

  // Clear cache so new role is picked up
  clearRoleCache();

  return {
    title: parsed.title || roleTitle,
    skills: (parsed.skills || []).map((s: { name: string }) => s.name),
    transitions_from: (parsed.transitions_from || []).map((t: { role: string }) => t.role),
    transitions_to: (parsed.transitions_to || []).map((t: { role: string }) => t.role),
  };
}

/**
 * Resolve a role: return as-is if it exists, or create it in the graph via AI.
 */
export async function resolveRole(userRole: string): Promise<{
  resolved: string;
  original: string;
  exact: boolean;
  created: boolean;
}> {
  const existing = await findRole(userRole);
  if (existing) {
    return { resolved: existing, original: userRole, exact: true, created: false };
  }

  // Role doesn't exist — create it with AI
  console.log(`[role-matcher] "${userRole}" not in graph, creating via AI...`);
  const created = await createRoleFromAI(userRole);
  console.log(`[role-matcher] Created "${created.title}" with ${created.skills.length} skills, ${created.transitions_from.length + created.transitions_to.length} transitions`);

  return {
    resolved: created.title,
    original: userRole,
    exact: false,
    created: true,
  };
}
