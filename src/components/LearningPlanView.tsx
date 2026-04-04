"use client";

import React from "react";

interface Resource {
  name: string;
  type?: string;
  provider?: string;
  url?: string;
}

interface WeekPlan {
  week: number;
  focus: string;
  skills: string[];
  resources?: Resource[];
  courses?: Array<{ name: string; provider: string }>;
  milestone: string;
}

interface LearningPlanViewProps {
  data: {
    plan: WeekPlan[];
    summary: string;
  };
}

const typeIcons: Record<string, string> = {
  course: "🎓",
  video: "▶️",
  book: "📚",
  tutorial: "💻",
  docs: "📄",
};

const typeColors: Record<string, { bg: string; border: string; text: string }> = {
  course: { bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.25)", text: "#60a5fa" },
  video: { bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.25)", text: "#f87171" },
  book: { bg: "rgba(234,179,8,0.08)", border: "rgba(234,179,8,0.25)", text: "#facc15" },
  tutorial: { bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.25)", text: "#4ade80" },
  docs: { bg: "rgba(168,85,247,0.08)", border: "rgba(168,85,247,0.25)", text: "#c084fc" },
};

function ResourceLink({ resource }: { resource: Resource }) {
  const type = resource.type || "course";
  const icon = typeIcons[type] || "📖";
  const colors = typeColors[type] || typeColors.course;

  if (resource.url) {
    return (
      <a
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all hover:brightness-125"
        style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
      >
        <span>{icon}</span>
        <span style={{ color: colors.text }} className="font-medium">{resource.name}</span>
        {resource.provider && (
          <span className="text-[11px] text-gray-500 ml-auto">{resource.provider}</span>
        )}
        <svg className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    );
  }

  return (
    <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px]"
      style={{ background: colors.bg, border: `1px solid ${colors.border}` }}>
      <span>{icon}</span>
      <span style={{ color: colors.text }}>{resource.name}</span>
      {resource.provider && (
        <span className="text-[11px] text-gray-500 ml-auto">{resource.provider}</span>
      )}
    </div>
  );
}

export default function LearningPlanView({ data }: LearningPlanViewProps) {
  const { plan = [], summary } = data;

  if ((!plan || plan.length === 0) && summary) {
    return (
      <div className="rounded-[14px] p-5" style={{ border: "1px solid rgba(59,130,246,0.2)", background: "rgba(59,130,246,0.04)" }}>
        <div className="text-[15px] font-semibold text-blue-400 mb-2">Learning Plan</div>
        <div className="text-[14px] text-gray-400 leading-relaxed whitespace-pre-wrap">{summary}</div>
      </div>
    );
  }

  return (
    <div>
      {summary && (
        <div className="rounded-[14px] p-[18px] mb-5" style={{ border: "1px solid rgba(59,130,246,0.2)", background: "rgba(59,130,246,0.04)" }}>
          <div className="text-[15px] font-semibold text-blue-400 mb-2">Plan Overview</div>
          <div className="text-[14px] text-gray-400 leading-relaxed">{summary}</div>
        </div>
      )}

      <div className="timeline">
        {plan.map((week, idx) => {
          // Merge resources and legacy courses into one list
          const resources: Resource[] = week.resources || [];
          if (week.courses && resources.length === 0) {
            week.courses.forEach((c) => resources.push({ name: c.name, provider: c.provider, type: "course" }));
          }

          return (
            <div key={idx} className="relative mb-4 fade-in" style={{ animationDelay: `${idx * 0.06}s` }}>
              <div className="absolute -left-[44px] w-[28px] h-[28px] rounded-full flex items-center justify-center text-[12px] font-semibold font-mono text-purple-300"
                style={{ background: "rgba(124,58,237,0.3)", border: "1px solid rgba(124,58,237,0.5)" }}>
                {week.week}
              </div>
              <div className="rounded-xl p-4" style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                <div className="text-[15px] font-semibold text-white mb-2">{week.focus}</div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {week.skills.map((skill, sIdx) => (
                    <span key={sIdx} className="px-2.5 py-0.5 rounded-full text-[12px] text-purple-400"
                      style={{ border: "1px solid rgba(124,58,237,0.3)", background: "rgba(124,58,237,0.1)" }}>
                      {skill}
                    </span>
                  ))}
                </div>

                {resources.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {resources.map((resource, rIdx) => (
                      <ResourceLink key={rIdx} resource={resource} />
                    ))}
                  </div>
                )}

                {week.milestone && (
                  <div className="text-[13px] text-green-400 italic mt-2">
                    Milestone: {week.milestone}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
