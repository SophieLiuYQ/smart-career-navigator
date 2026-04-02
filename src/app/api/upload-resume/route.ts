import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    const isPdf = file.name.endsWith(".pdf");

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: isPdf
            ? [
                {
                  type: "document" as const,
                  source: { type: "base64" as const, media_type: "application/pdf" as const, data: base64 },
                },
                {
                  type: "text" as const,
                  text: `Parse this resume. Respond ONLY with valid JSON:
{
  "name": "Full Name",
  "current_role": "Most recent job title",
  "years_experience": number,
  "skills": ["skill1", "skill2"],
  "experience": [{"title": "Job Title", "company": "Company", "duration": "2 years"}],
  "summary": "One sentence career summary",
  "suggested_match": "The closest standard tech role from this list: Software Engineer, Senior Software Engineer, Frontend Engineer, Backend Engineer, Full Stack Developer, Data Analyst, Data Scientist, ML Engineer, AI Engineer, DevOps Engineer, Product Manager, Engineering Manager, QA Engineer, UX Designer, Security Engineer, Mobile Developer (iOS), Mobile Developer (Android), Data Engineer, Platform Engineer, Cloud Architect, Solutions Architect, Technical Program Manager, Database Administrator, Technical Writer"
}`,
                },
              ]
            : `Parse this resume text. Respond ONLY with valid JSON:
{
  "name": "Full Name",
  "current_role": "Most recent job title",
  "years_experience": number,
  "skills": ["skill1", "skill2"],
  "experience": [{"title": "Job Title", "company": "Company", "duration": "2 years"}],
  "summary": "One sentence career summary",
  "suggested_match": "The closest standard tech role from this list: Software Engineer, Senior Software Engineer, Frontend Engineer, Backend Engineer, Full Stack Developer, Data Analyst, Data Scientist, ML Engineer, AI Engineer, DevOps Engineer, Product Manager, Engineering Manager, QA Engineer, UX Designer, Security Engineer, Mobile Developer (iOS), Mobile Developer (Android), Data Engineer, Platform Engineer, Cloud Architect, Solutions Architect, Technical Program Manager, Database Administrator, Technical Writer"
}

Resume text:
${buffer.toString("utf-8").slice(0, 8000)}`,
        },
      ],
    });

    const aiText = message.content[0].type === "text" ? message.content[0].text : "";

    let parsed;
    try {
      const cleaned = aiText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const match = cleaned.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(match ? match[0] : cleaned);
    } catch {
      parsed = { error: "Failed to parse resume", raw: aiText };
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Resume upload failed:", error);
    return NextResponse.json({ error: "Failed to process resume" }, { status: 500 });
  }
}
