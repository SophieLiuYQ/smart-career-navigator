import { runQuery } from "@/lib/neo4j";
import { generateCompletion } from "@/lib/anthropic";

interface BridgeRole {
  title: string;
  shared_with_current: string[];
  shared_with_target: string[];
  bridge_score: number;
}

interface SkillPath {
  role_names: string[];
  total_months: number;
  path_probability: number;
  skill_bridge: string[];
  reasoning?: string;
}

/**
 * Get skills for a role from Neo4j, or generate with AI if not found.
 */
async function getSkillsForRole(role: string): Promise<string[]> {
  try {
    const result = await runQuery<{ skill: string }>(
      `MATCH (r:Role {title: $role})-[:REQUIRES_SKILL]->(s:Skill) RETURN s.name AS skill`,
      { role }
    );
    if (result.length > 0) return result.map((r) => r.skill);
  } catch (e) {
    console.error("[skill-pathfinder] Neo4j query failed:", e);
  }

  // AI fallback
  try {
    const response = await generateCompletion(
      `List the top 8 most important skills for this role. Respond ONLY with a JSON array: ["skill1", "skill2", ...]`,
      `Role: "${role}"`,
      300
    );
    const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const match = cleaned.match(/\[[\s\S]*\]/);
    return JSON.parse(match ? match[0] : cleaned);
  } catch {
    return [];
  }
}

/**
 * Try to find bridge roles from Neo4j graph (supplementary, not primary).
 */
async function findGraphBridges(
  currentSkills: string[],
  targetSkills: string[]
): Promise<BridgeRole[]> {
  if (currentSkills.length === 0 || targetSkills.length === 0) return [];

  try {
    const result = await runQuery<{
      title: string;
      current_overlap: string[];
      target_overlap: string[];
      bridge_score: number;
    }>(
      `MATCH (r:Role)-[:REQUIRES_SKILL]->(s:Skill)
       WITH r, collect(s.name) AS roleSkills
       WITH r, roleSkills,
         [sk IN roleSkills WHERE sk IN $currentSkills] AS current_overlap,
         [sk IN roleSkills WHERE sk IN $targetSkills] AS target_overlap
       WHERE size(current_overlap) > 0 AND size(target_overlap) > 0
       RETURN r.title AS title, current_overlap, target_overlap,
         toFloat(size(current_overlap) + size(target_overlap)) AS bridge_score
       ORDER BY bridge_score DESC
       LIMIT 5`,
      { currentSkills, targetSkills }
    );
    return result.map((r) => ({
      title: r.title,
      shared_with_current: r.current_overlap,
      shared_with_target: r.target_overlap,
      bridge_score: r.bridge_score,
    }));
  } catch {
    return [];
  }
}

/**
 * AI generates realistic career transition paths.
 * This is the PRIMARY path source — graph data is supplementary context.
 */
async function generateRealisticPaths(
  currentRole: string,
  targetRole: string,
  currentSkills: string[],
  targetSkills: string[],
  skillGap: string[],
  graphBridges: BridgeRole[]
): Promise<SkillPath[]> {
  const graphContext = graphBridges.length > 0
    ? `\nGraph database found these skill-overlapping roles (use as hints, not requirements): ${graphBridges.map((b) => b.title).join(", ")}`
    : "";

  const response = await generateCompletion(
    `You are an expert career transition advisor. Generate realistic career paths between two roles.

IMPORTANT RULES:
- Paths must reflect how REAL PEOPLE actually make this career change
- Include practical steps like certifications, side projects, lateral moves, or hybrid roles
- Intermediate steps should be REAL job titles or actions people take (e.g., "Get Real Estate License", "Junior Agent at Brokerage")
- Do NOT route through unrelated roles just because they share generic skills
- Consider industry context: some transitions happen through education, licensing, networking, or gradual pivots
- Each path should have a different strategy (e.g., direct pivot, gradual transition, education-first)

Respond ONLY with valid JSON, no markdown:
{
  "paths": [
    {
      "role_names": ["Current Role", "Step 1", "Step 2", "Target Role"],
      "total_months": estimated_months,
      "path_probability": 0.0-1.0,
      "skill_bridge": ["key skills that connect the steps"],
      "reasoning": "Why this path works"
    }
  ]
}
Generate 3 distinct realistic paths.`,
    `From: "${currentRole}" → To: "${targetRole}"

Current role skills: ${currentSkills.join(", ") || "general professional skills"}
Target role skills: ${targetSkills.join(", ") || "to be determined"}
Skills to acquire: ${skillGap.join(", ") || "various"}
${graphContext}`,
    3000
  );

  try {
    const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(match ? match[0] : cleaned);
    return parsed.paths || [];
  } catch {
    return [{
      role_names: [currentRole, targetRole],
      total_months: 12,
      path_probability: 0.5,
      skill_bridge: skillGap.slice(0, 3),
      reasoning: "Direct transition path.",
    }];
  }
}

/**
 * Main entry: find career paths using AI as primary, graph as context.
 */
export async function findSkillBasedPaths(
  currentRole: string,
  targetRole: string,
  userSkills?: string[]
): Promise<{
  paths: SkillPath[];
  currentSkills: string[];
  targetSkills: string[];
  skillGap: string[];
  bridgeRoles: BridgeRole[];
}> {
  // Get skills for both roles
  let currentSkills: string[] = [];
  let targetSkills: string[] = [];
  try {
    [currentSkills, targetSkills] = await Promise.all([
      getSkillsForRole(currentRole),
      getSkillsForRole(targetRole),
    ]);
  } catch (e) {
    console.error("[skill-pathfinder] Failed to get skills:", e);
  }

  const allCurrentSkills = [...new Set([...currentSkills, ...(userSkills || [])])];

  const skillGap = targetSkills.filter(
    (s) => !allCurrentSkills.some((cs) => cs.toLowerCase() === s.toLowerCase())
  );

  // Get graph bridges as supplementary context (not primary paths)
  let bridgeRoles: BridgeRole[] = [];
  try {
    bridgeRoles = await findGraphBridges(allCurrentSkills, targetSkills);
  } catch (e) {
    console.error("[skill-pathfinder] Bridge query failed:", e);
  }

  // AI generates the actual realistic paths
  const paths = await generateRealisticPaths(
    currentRole,
    targetRole,
    allCurrentSkills,
    targetSkills,
    skillGap,
    bridgeRoles
  );

  return {
    paths,
    currentSkills: allCurrentSkills,
    targetSkills,
    skillGap,
    bridgeRoles,
  };
}
