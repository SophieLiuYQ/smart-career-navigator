"use client";

import React from "react";

interface Story {
  title: string;
  url: string;
  subreddit: string;
  summary: string;
  relevance?: string;
}

interface Subreddit {
  name: string;
  url: string;
  description: string;
}

interface CommunityStoriesViewProps {
  data: {
    stories: Story[];
    advice: string;
    subreddits: Subreddit[];
    postsFound: number;
  };
}

export default function CommunityStoriesView({ data }: CommunityStoriesViewProps) {
  const { stories, advice, subreddits } = data;

  return (
    <div className="space-y-4">
      {/* Advice summary */}
      {advice && (
        <div className="rounded-[14px] p-5" style={{ border: "1px solid rgba(255,69,0,0.2)", background: "rgba(255,69,0,0.04)" }}>
          <div className="text-[15px] font-semibold mb-2" style={{ color: "#ff6b35" }}>Community Insights</div>
          <p className="text-[14px] text-gray-400 leading-relaxed">{advice}</p>
        </div>
      )}

      {/* Stories */}
      {stories.length > 0 && (
        <div>
          <div className="section-label">Real Discussions</div>
          <div className="space-y-3">
            {stories.map((story, idx) => (
              <a
                key={idx}
                href={story.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl p-4 transition-all hover:brightness-125 fade-in"
                style={{
                  border: "1px solid rgba(255,255,255,0.06)",
                  background: "rgba(255,255,255,0.02)",
                  animationDelay: `${idx * 0.08}s`,
                }}
              >
                <div className="flex items-start gap-3">
                  {/* Reddit icon */}
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: "rgba(255,69,0,0.15)" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#ff4500">
                      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-medium text-white mb-1 leading-snug">{story.title}</div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[12px] font-mono" style={{ color: "#ff6b35" }}>r/{story.subreddit}</span>
                      {story.relevance === "high" && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                          style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.3)" }}>
                          Highly Relevant
                        </span>
                      )}
                    </div>
                    <p className="text-[13px] text-gray-500">{story.summary}</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-600 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Relevant subreddits */}
      <div>
        <div className="section-label mt-4">Relevant Communities</div>
        <div className="grid grid-cols-3 gap-3">
          {subreddits.map((sub, idx) => (
            <a
              key={idx}
              href={sub.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl p-3.5 text-center transition-all hover:brightness-125"
              style={{ border: "1px solid rgba(255,69,0,0.15)", background: "rgba(255,69,0,0.04)" }}
            >
              <div className="text-[14px] font-medium mb-1" style={{ color: "#ff6b35" }}>{sub.name}</div>
              <div className="text-[12px] text-gray-500">{sub.description}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
