import { runQuery } from "@/lib/neo4j";
import { generateCompletion } from "@/lib/anthropic";

interface RoleSkills {
  role: string;
  skills: Array<{ name: string; importance: number }>;
}

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
}

/**
 * Get skills for a role. If role is in Neo4j, query graph. Otherwise, use AI.
 */
async function getSkillsForRole(role: string): Promise<string[]> {
  const result = await runQuery<{ skill: string }>(
    `MATCH (r:Role {title: $role})-[:REQUIRES_SKILL]->(s:Skill)
     RETURN s.name AS skill`,
    { role }
  );

  if (result.length > 0) {
    return result.map((r) => r.skill);
  }

  // Role not in graph or no skills — ask AI
  const response = await generateCompletion(
    `List the top 10 most important technical and professional skills for this job role. Respond ONLY with a JSON array of skill names, no markdown: ["skill1", "skill2", ...]`,
    `Role: "${role}"`,
    500
  );

  try {
    const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const match = cleaned.match(/\[[\s\S]*\]/);
    return JSON.parse(match ? match[0] : cleaned);
  } catch {
    return [];
  }
}

/**
 * Find roles in Neo4j that bridge between two skill sets.
 * A bridge role shares skills with both the current and target roles.
 */
async function findBridgeRoles(
  currentSkills: string[],
  targetSkills: string[]
): Promise<BridgeRole[]> {
  if (currentSkills.length === 0 || targetSkills.length === 0) return [];

  const result = await runQuery<{
    title: string;
    current_overlap: string[];
    target_overlap: string[];
    bridge_score: number;
  }>(
    `WITH $currentSkills AS currentSkills, $targetSkills AS targetSkills
     MATCH (r:Role)-[:REQUIRES_SKILL]->(s:Skill)
     WITH r, collect(s.name) AS roleSkills, currentSkills, targetSkills
     WITH r, roleSkills,
       [sk IN roleSkills WHERE sk IN currentSkills] AS current_overlap,
       [sk IN roleSkills WHERE sk IN targetSkills] AS target_overlap
     WHERE size(current_overlap) > 0 AND size(target_overlap) > 0
     RETURN r.title AS title,
       current_overlap,
       target_overlap,
       size(current_overlap) + size(target_overlap) AS bridge_score
     ORDER BY bridge_score DESC
     LIMIT 10`,
    { currentSkills, targetSkills }
  );

  return result.map((r) => ({
    title: r.title,
    shared_with_current: r.current_overlap,
    shared_with_target: r.target_overlap,
    bridge_score: r.bridge_score,
  }));
}

/**
 * Build career paths using skill-first matching.
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
  // Step 1: Get skills for both roles
  const [currentSkills, targetSkills] = await Promise.all([
    getSkillsForRole(currentRole),
    getSkillsForRole(targetRole),
  ]);

  // Merge user's actual skills with role skills
  const allCurrentSkills = [...new Set([...currentSkills, ...(userSkills || [])])];

  // Step 2: Find skill gap
  const skillGap = targetSkills.filter(
    (s) => !allCurrentSkills.some((cs) => cs.toLowerCase() === s.toLowerCase())
  );

  // Step 3: Find bridge roles from Neo4j
  const bridgeRoles = await findBridgeRoles(allCurrentSkills, targetSkills);

  // Step 4: Build paths through bridge roles
  let paths: SkillPath[] = [];

  // Filter out current and target from bridges
  const validBridges = bridgeRoles.filter(
    (b) => b.title !== currentRole && b.title !== targetRole
  );

  if (validBridges.length > 0) {
    // Build 1-hop paths: current → bridge → target
    paths = validBridges.slice(0, 3).map((bridge, i) => ({
      role_names: [currentRole, bridge.title, targetRole],
      total_months: 24 + i * 6,
      path_probability: Math.min(0.5, bridge.bridge_score / 20),
      skill_bridge: [...new Set([...bridge.shared_with_current, ...bridge.shared_with_target])],
    }));

    // Try 2-hop paths if we have enough bridges
    if (validBridges.length >= 2) {
      const [b1, b2] = validBridges;
      // Check if b1 and b2 share skills (making a coherent 2-hop)
      const b1Skills = new Set(b1.shared_with_target);
      const b2Skills = new Set(b2.shared_with_current);
      const overlap = [...b1Skills].filter((s) => b2Skills.has(s));
      if (overlap.length > 0) {
        paths.push({
          role_names: [currentRole, b1.title, b2.title, targetRole],
          total_months: 36,
          path_probability: Math.min(0.3, (b1.bridge_score + b2.bridge_score) / 40),
          skill_bridge: overlap,
        });
      }
    }
  }

  // Step 5: If not enough paths, use AI to generate skill-based paths
  if (paths.length < 2) {
    console.log("[skill-pathfinder] Supplementing with AI-generated paths");
    const aiResponse = await generateCompletion(
      `You are a career path expert. Generate realistic career transition paths based on SKILL OVERLAP.
The key principle: each intermediate role should share skills with both the previous and next role in the path.

Current role skills: ${allCurrentSkills.join(", ")}
Target role skills: ${targetSkills.join(", ")}
Skill gap: ${skillGap.join(", ")}

Respond ONLY with valid JSON, no markdown:
{
  "paths": [
    {
      "role_names": ["${currentRole}", "Intermediate Role", "${targetRole}"],
      "total_months": number,
      "path_probability": 0.0-1.0,
      "skill_bridge": ["skills that connect the roles"]
    }
  ]
}
Generate ${3 - paths.length} paths. Each intermediate role should logically bridge the skill gap.`,
      `From "${currentRole}" to "${targetRole}"`,
      2048
    );

    try {
      const parsed = JSON.parse(
        aiResponse.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
      );
      if (parsed.paths) {
        paths = [...paths, ...parsed.paths].slice(0, 5);
      }
    } catch {
      // If AI fails, create a direct path
      if (paths.length === 0) {
        paths = [{
          role_names: [currentRole, targetRole],
          total_months: 18,
          path_probability: 0.3,
          skill_bridge: skillGap.slice(0, 3),
        }];
      }
    }
  }

  return {
    paths,
    currentSkills: allCurrentSkills,
    targetSkills,
    skillGap,
    bridgeRoles: validBridges.slice(0, 5),
  };
}
