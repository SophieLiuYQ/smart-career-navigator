import { NextResponse } from "next/server";
import { generateCompletion } from "@/lib/anthropic";

interface RedditPost {
  title: string;
  url: string;
  subreddit: string;
  score?: number;
}

async function searchReddit(query: string): Promise<RedditPost[]> {
  try {
    const searchUrl = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=relevance&limit=10&type=link`;
    const res = await fetch(searchUrl, {
      headers: { "User-Agent": "CareerNavigator/1.0" },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return [];

    const data = await res.json();
    const posts = data?.data?.children || [];

    return posts
      .filter((p: { data: { is_self: boolean; num_comments: number } }) =>
        p.data.is_self && p.data.num_comments > 2
      )
      .map((p: { data: { title: string; permalink: string; subreddit: string; score: number } }) => ({
        title: p.data.title,
        url: `https://www.reddit.com${p.data.permalink}`,
        subreddit: p.data.subreddit,
        score: p.data.score,
      }));
  } catch (e) {
    console.error("[community-stories] Reddit search failed:", e);
    return [];
  }
}

export async function POST(request: Request) {
  try {
    const { currentRole, targetRole } = await request.json();

    if (!currentRole || !targetRole) {
      return NextResponse.json({ error: "currentRole and targetRole are required" }, { status: 400 });
    }

    // Search Reddit for career transition stories
    const queries = [
      `${currentRole} to ${targetRole} career transition`,
      `switched from ${currentRole} to ${targetRole}`,
      `${targetRole} career change advice`,
    ];

    const allPosts: RedditPost[] = [];
    const results = await Promise.all(queries.map(searchReddit));
    for (const posts of results) {
      for (const post of posts) {
        if (!allPosts.some((p) => p.url === post.url)) {
          allPosts.push(post);
        }
      }
    }

    // Sort by score and take top results
    const topPosts = allPosts
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 8);

    // Use AI to curate and summarize the most relevant posts
    let curated;
    if (topPosts.length > 0) {
      const aiResponse = await generateCompletion(
        `You curate career transition resources from Reddit posts. Given a list of Reddit posts, select the most relevant ones and add a brief summary of why each is useful.

Respond ONLY with valid JSON, no markdown:
{
  "stories": [
    {
      "title": "Post title",
      "url": "https://reddit.com/...",
      "subreddit": "subreddit_name",
      "summary": "Why this post is relevant (1 sentence)",
      "relevance": "high|medium"
    }
  ],
  "advice": "Overall advice based on community patterns (2-3 sentences)"
}`,
        `Career transition: "${currentRole}" → "${targetRole}"

Reddit posts found:
${topPosts.map((p, i) => `${i + 1}. [r/${p.subreddit}] "${p.title}" (${p.score} upvotes) — ${p.url}`).join("\n")}

Select the most relevant posts for someone making this career change.`,
        2048
      );

      try {
        const cleaned = aiResponse.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const match = cleaned.match(/\{[\s\S]*\}/);
        curated = JSON.parse(match ? match[0] : cleaned);
      } catch {
        curated = {
          stories: topPosts.map((p) => ({
            title: p.title,
            url: p.url,
            subreddit: p.subreddit,
            summary: "Community discussion about this career path",
            relevance: "medium",
          })),
          advice: "Check these community discussions for real-world perspectives on this transition.",
        };
      }
    } else {
      // No Reddit results — generate relevant community links
      curated = {
        stories: [
          {
            title: `How to transition from ${currentRole} to ${targetRole}`,
            url: `https://www.reddit.com/search/?q=${encodeURIComponent(`${currentRole} to ${targetRole} career`)}`,
            subreddit: "search",
            summary: "Search Reddit for relevant discussions",
            relevance: "medium",
          },
          {
            title: `${targetRole} career advice and tips`,
            url: `https://www.reddit.com/search/?q=${encodeURIComponent(`${targetRole} career advice`)}`,
            subreddit: "search",
            summary: "Browse career advice for your target role",
            relevance: "medium",
          },
        ],
        advice: `No specific transition stories found for ${currentRole} → ${targetRole}. Try browsing the search links above or post your own question on r/careerguidance or r/cscareerquestions.`,
      };
    }

    // Add useful subreddit links
    const relevantSubreddits = [
      { name: "r/careerguidance", url: "https://www.reddit.com/r/careerguidance/", description: "General career transition advice" },
      { name: "r/cscareerquestions", url: "https://www.reddit.com/r/cscareerquestions/", description: "Tech career discussions" },
      { name: "r/careerchange", url: "https://www.reddit.com/r/careerchange/", description: "Career change stories and support" },
    ];

    return NextResponse.json({
      ...curated,
      subreddits: relevantSubreddits,
      postsFound: topPosts.length,
    });
  } catch (error) {
    console.error("Failed to fetch community stories:", error);
    return NextResponse.json({ error: "Failed to fetch community stories" }, { status: 500 });
  }
}
