import { NextResponse } from "next/server";
import { generateCompletion } from "@/lib/anthropic";
import { analyzeOnetData } from "@/lib/rocketride";

async function fetchPage(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "CareerNavigator/1.0 (hackathon project)" },
  });
  return res.text();
}

export async function POST(request: Request) {
  try {
    const { role, userSkills = [] } = await request.json();
    if (!role) {
      return NextResponse.json({ error: "role is required" }, { status: 400 });
    }

    // Step 1: Search O*NET for the role
    const searchUrl = `https://www.onetonline.org/find/quick?s=${encodeURIComponent(role)}`;
    const searchHtml = await fetchPage(searchUrl);

    // Extract first O*NET code from search results
    const codeMatch = searchHtml.match(/\/link\/summary\/(\d{2}-\d{4}\.\d{2})/);
    if (!codeMatch) {
      // No match found — use AI to generate insights without O*NET
      const fallback = await generateCompletion(
        `You are a career research analyst. Provide detailed job insights for the role "${role}". Respond ONLY with valid JSON, no markdown:
{
  "title": "Official job title",
  "description": "2-3 sentence description",
  "onet_code": null,
  "salary": { "median": "$XXX,XXX", "range": "$XX,XXX - $XXX,XXX" },
  "outlook": { "growth": "X%", "description": "Faster than average", "bright": true },
  "top_skills": [{ "name": "Skill", "importance": 85, "have": false }],
  "key_tasks": ["Task 1", "Task 2", "Task 3", "Task 4", "Task 5"],
  "education": "Typical education requirement",
  "related_roles": ["Role 1", "Role 2", "Role 3"],
  "hot_technologies": ["Tech 1", "Tech 2", "Tech 3"]
}`,
        `Role: ${role}. User's current skills: ${userSkills.join(", ") || "none provided"}`
      );
      try {
        const cleaned = fallback.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const match = cleaned.match(/\{[\s\S]*\}/);
        return NextResponse.json(JSON.parse(match ? match[0] : cleaned));
      } catch {
        return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 });
      }
    }

    const onetCode = codeMatch[1];

    // Step 2: Fetch the O*NET summary page
    const summaryUrl = `https://www.onetonline.org/link/summary/${onetCode}`;
    const summaryHtml = await fetchPage(summaryUrl);

    // Truncate HTML to fit in prompt (keep first 15k chars which has the key data)
    const truncated = summaryHtml.slice(0, 15000);

    // Step 3: RocketRide AI Pipeline to extract structured data
    let parsed;
    let aiSource = "anthropic";
    const rocketResult = await analyzeOnetData({ role, htmlContent: truncated, userSkills });

    if (rocketResult.success && rocketResult.data) {
      aiSource = "rocketride";
      console.log("[onet-insights] ✅ Using RocketRide pipeline");
      try {
        parsed = typeof rocketResult.data === "string"
          ? JSON.parse(rocketResult.data.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim())
          : rocketResult.data;
      } catch {
        parsed = rocketResult.data;
      }
    } else {
      // Fallback: Direct Anthropic call
      console.log("[onet-insights] ⚠️ RocketRide unavailable, falling back to Anthropic");
      const systemPrompt = `You are a career data analyst. Extract structured job information from this O*NET occupation page HTML.
The user has these skills: ${userSkills.join(", ") || "none provided"}.
For each skill in top_skills, set "have" to true if it matches or is closely related to one of the user's skills.

Respond ONLY with valid JSON, no markdown:
{
  "title": "Official O*NET job title",
  "description": "2-3 sentence job description",
  "onet_code": "${onetCode}",
  "salary": { "median": "$XXX,XXX", "range": "$XX,XXX - $XXX,XXX" },
  "outlook": { "growth": "X%", "description": "e.g. Much faster than average", "bright": true/false },
  "top_skills": [{ "name": "Skill Name", "importance": 1-100, "have": true/false }],
  "key_tasks": ["Task 1", "Task 2", "Task 3", "Task 4", "Task 5"],
  "education": "Typical education requirement",
  "related_roles": ["Role 1", "Role 2", "Role 3"],
  "hot_technologies": ["Tech 1", "Tech 2", "Tech 3", "Tech 4", "Tech 5"],
  "knowledge_areas": ["Area 1", "Area 2", "Area 3"]
}`;

      const aiResponse = await generateCompletion(systemPrompt, truncated);

      try {
        const cleaned = aiResponse.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const match = cleaned.match(/\{[\s\S]*\}/);
        parsed = JSON.parse(match ? match[0] : cleaned);
      } catch {
        parsed = { error: "Failed to parse O*NET data", raw: aiResponse };
      }
    }

    return NextResponse.json({ ...parsed, _source: aiSource });
  } catch (error) {
    console.error("O*NET insights failed:", error);
    return NextResponse.json({ error: "Failed to fetch O*NET insights" }, { status: 500 });
  }
}
