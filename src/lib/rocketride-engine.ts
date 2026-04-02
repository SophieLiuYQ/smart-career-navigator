import fs from "fs";
import path from "path";
import { generateCompletion } from "@/lib/anthropic";

interface PipelineNode {
  id: string;
  type: string;
  config: {
    model?: string;
    system_prompt?: string;
    temperature?: number;
    max_tokens?: number;
    [key: string]: unknown;
  };
}

interface PipelineDefinition {
  name: string;
  description: string;
  nodes: PipelineNode[];
  edges: Array<{ from: string; to: string }>;
}

// Load and parse a .pipe file
function loadPipeline(pipeName: string): PipelineDefinition | null {
  try {
    // Try multiple paths (works both locally and on Vercel)
    const candidates = [
      path.join(process.cwd(), "pipelines", pipeName),
      path.join(process.cwd(), "..", "pipelines", pipeName),
    ];

    for (const filePath of candidates) {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(raw) as PipelineDefinition;
      }
    }
    return null;
  } catch (error) {
    console.error(`[RocketRide Engine] Failed to load pipeline ${pipeName}:`, error);
    return null;
  }
}

// Extract the LLM node from the pipeline
function getLLMNode(pipeline: PipelineDefinition): PipelineNode | null {
  return pipeline.nodes.find((n) => n.type.startsWith("llm/")) || null;
}

// Execute a pipeline with the given payload
export async function executePipeline(
  pipeFile: string,
  payload: Record<string, unknown>
): Promise<{ success: boolean; data: unknown; pipeline: string | null }> {
  const pipeline = loadPipeline(pipeFile);

  if (!pipeline) {
    return { success: false, data: null, pipeline: null };
  }

  const llmNode = getLLMNode(pipeline);
  if (!llmNode || !llmNode.config.system_prompt) {
    return { success: false, data: null, pipeline: pipeline.name };
  }

  console.log(`[RocketRide Engine] Executing pipeline: ${pipeline.name}`);
  console.log(`[RocketRide Engine] LLM node: ${llmNode.id} (${llmNode.type})`);

  try {
    const response = await generateCompletion(
      llmNode.config.system_prompt,
      JSON.stringify(payload)
    );

    // Parse the response
    let parsed;
    try {
      const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const match = cleaned.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(match ? match[0] : cleaned);
    } catch {
      parsed = response;
    }

    return { success: true, data: parsed, pipeline: pipeline.name };
  } catch (error) {
    console.error(`[RocketRide Engine] Pipeline execution failed:`, error);
    return { success: false, data: null, pipeline: pipeline.name };
  }
}

// Pipeline registry — maps webhook paths to .pipe files
const PIPELINE_MAP: Record<string, string> = {
  "/career-analyze": "career_path_analyzer.pipe",
  "/learning-plan": "learning_plan_generator.pipe",
  "/connections": "connection_recommender.pipe",
  "/onet-analyze": "onet_analyzer.pipe",
};

export function getPipelineFile(webhookPath: string): string | null {
  return PIPELINE_MAP[webhookPath] || null;
}
