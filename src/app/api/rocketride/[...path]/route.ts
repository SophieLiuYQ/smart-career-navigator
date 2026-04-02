import { NextResponse } from "next/server";
import { executePipeline, getPipelineFile } from "@/lib/rocketride-engine";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    const webhookPath = "/" + pathSegments.join("/");
    const pipeFile = getPipelineFile(webhookPath);

    if (!pipeFile) {
      return NextResponse.json(
        { error: `No pipeline registered for path: ${webhookPath}` },
        { status: 404 }
      );
    }

    const payload = await request.json();
    const result = await executePipeline(pipeFile, payload);

    if (!result.success) {
      return NextResponse.json(
        { error: "Pipeline execution failed", pipeline: result.pipeline },
        { status: 500 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("[RocketRide API] Error:", error);
    return NextResponse.json(
      { error: "Internal pipeline error" },
      { status: 500 }
    );
  }
}
