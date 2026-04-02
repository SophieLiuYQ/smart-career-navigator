import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ connected: false });
  }

  return NextResponse.json({
    connected: true,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    provider: (session as any).provider,
  });
}
