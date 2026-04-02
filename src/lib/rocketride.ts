const ROCKETRIDE_URL = process.env.ROCKETRIDE_URL || "http://localhost:5565";

interface PipelineResponse {
  success: boolean;
  data: unknown;
  error?: string;
}

export async function triggerPipeline(
  pipelinePath: string,
  payload: Record<string, unknown>
): Promise<PipelineResponse> {
  try {
    const response = await fetch(`${ROCKETRIDE_URL}${pipelinePath}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000), // 15s timeout
    });

    if (!response.ok) {
      throw new Error(`RocketRide pipeline error: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error(`[RocketRide] Pipeline ${pipelinePath} failed:`, error instanceof Error ? error.message : error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function analyzeCareerPaths(payload: {
  paths: Array<{ role_names: string[]; total_months: number; path_probability: number }>;
  currentRole: string;
  targetRole: string;
  skillGaps: Array<{ skill: string; importance: number }>;
}) {
  return triggerPipeline("/career-analyze", payload);
}

export async function generateLearningPlan(payload: {
  skillGaps: Array<{ skill: string; category: string; importance: number }>;
  prerequisites: Array<{ prerequisite: string; skill: string }>;
  courses: Array<{ course: string; provider: string; duration: string; skills_covered: string[] }>;
  timeframeMonths: number;
  currentRole: string;
  targetRole: string;
}) {
  return triggerPipeline("/learning-plan", payload);
}

export async function recommendConnections(payload: {
  transitionMakers: Array<{ name: string; company: string; skills: string[] }>;
  intermediateContacts: Array<{ name: string; role: string; company: string }>;
  currentRole: string;
  targetRole: string;
}) {
  return triggerPipeline("/connections", payload);
}

export async function analyzeOnetData(payload: {
  role: string;
  htmlContent: string;
  userSkills: string[];
}) {
  return triggerPipeline("/onet-analyze", payload);
}
