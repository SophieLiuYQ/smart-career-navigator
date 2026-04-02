import { runQuery } from "@/lib/neo4j";
import { generateCompletion } from "@/lib/anthropic";

// Cache of all role titles from Neo4j
let roleCache: string[] | null = null;

async function getAllRoles(): Promise<string[]> {
  if (roleCache) return roleCache;
  const results = await runQuery<{ title: string }>(
    "MATCH (r:Role) RETURN r.title AS title ORDER BY r.title"
  );
  roleCache = results.map((r) => r.title);
  return roleCache;
}

/**
 * Resolves a user-typed role to a Neo4j role.
 * Returns the exact role if it exists, or the closest match via AI.
 */
export async function resolveRole(userRole: string): Promise<{
  resolved: string;
  original: string;
  exact: boolean;
}> {
  const roles = await getAllRoles();

  // Check exact match (case-insensitive)
  const exact = roles.find((r) => r.toLowerCase() === userRole.toLowerCase());
  if (exact) {
    return { resolved: exact, original: userRole, exact: true };
  }

  // Check partial match
  const partial = roles.find(
    (r) =>
      r.toLowerCase().includes(userRole.toLowerCase()) ||
      userRole.toLowerCase().includes(r.toLowerCase())
  );
  if (partial) {
    return { resolved: partial, original: userRole, exact: false };
  }

  // AI match — ask which role is closest
  const response = await generateCompletion(
    `You map job titles to the closest match from a predefined list. Respond with ONLY the exact matching title from the list, nothing else.`,
    `Job title: "${userRole}"\n\nAvailable roles:\n${roles.join("\n")}\n\nClosest match:`,
    100
  );

  const aiMatch = roles.find(
    (r) => r.toLowerCase() === response.trim().toLowerCase()
  );

  return {
    resolved: aiMatch || roles[0],
    original: userRole,
    exact: false,
  };
}
