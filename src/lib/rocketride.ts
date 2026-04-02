// RocketRide Pipeline Client
// Routes AI requests through RocketRide pipeline definitions (.pipe files).
// Loads .pipe files, extracts LLM config, and executes the pipeline logic.
// Falls back to external RocketRide server if ROCKETRIDE_URL is set.

import { executePipeline, getPipelineFile } from "@/lib/rocketride-engine";

const ROCKETRIDE_EXTERNAL_URL = process.env.ROCKETRIDE_URL;

interface PipelineResponse {
  success: boolean;
  data: unknown;
  error?: string;
}

export async function triggerPipeline(
  pipelinePath: string,
  payload: Record<string, unknown>
): Promise<PipelineResponse> {
  // Try external RocketRide server first (if configured and not localhost)
  if (ROCKETRIDE_EXTERNAL_URL && !ROCKETRIDE_EXTERNAL_URL.includes("localhost")) {
    try {
      const response = await fetch(`${ROCKETRIDE_EXTERNAL_URL}${pipelinePath}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15000),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`[RocketRide] ✅ External server handled ${pipelinePath}`);
        return { success: true, data };
      }
    } catch {
      console.log(`[RocketRide] External server unavailable, using internal engine`);
    }
  }

  // Use internal RocketRide engine — load .pipe file and execute directly
  const pipeFile = getPipelineFile(pipelinePath);
  if (!pipeFile) {
    return { success: false, data: null, error: `No pipeline for ${pipelinePath}` };
  }

  const result = await executePipeline(pipeFile, payload);
  if (result.success) {
    console.log(`[RocketRide] ✅ Internal engine executed: ${result.pipeline}`);
  }
  return result;
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
