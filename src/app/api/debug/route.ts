import { NextResponse } from "next/server";
import { getDriver } from "@/lib/neo4j";

export async function GET() {
  const uri = process.env.NEO4J_URI || "NOT SET";
  const user = process.env.NEO4J_USER || "NOT SET";
  const hasPassword = !!process.env.NEO4J_PASSWORD;

  try {
    const driver = getDriver();
    const info = await driver.getServerInfo();
    return NextResponse.json({
      uri: uri.substring(0, 20) + "...",
      user,
      hasPassword,
      connected: true,
      server: info.address,
    });
  } catch (error) {
    return NextResponse.json({
      uri: uri.substring(0, 20) + "...",
      user,
      hasPassword,
      connected: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
