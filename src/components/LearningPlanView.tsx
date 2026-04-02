"use client";

import React from "react";

interface WeekPlan {
  week: number;
  focus: string;
  skills: string[];
  courses: Array<{ name: string; provider: string }>;
  milestone: string;
}

interface LearningPlanViewProps {
  data: {
    plan: WeekPlan[];
    summary: string;
  };
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
        {plan.map((week, idx) => (
          <div key={idx} className="relative mb-4 fade-in" style={{ animationDelay: `${idx * 0.06}s` }}>
            <div className="absolute -left-10 w-[26px] h-[26px] rounded-full flex items-center justify-center text-[13px] font-semibold font-mono text-purple-300"
              style={{ background: "rgba(124,58,237,0.3)", border: "1px solid rgba(124,58,237,0.5)" }}>
              {week.week}
            </div>
            <div className="rounded-xl p-3.5" style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
              <div className="text-[15px] font-semibold text-white mb-2">{week.focus}</div>

              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {week.skills.map((skill, sIdx) => (
                  <span key={sIdx} className="px-2.5 py-0.5 rounded-full text-[12px] text-purple-400"
                    style={{ border: "1px solid rgba(124,58,237,0.3)", background: "rgba(124,58,237,0.1)" }}>
                    {skill}
                  </span>
                ))}
              </div>

              {week.courses.map((course, cIdx) => (
                <div key={cIdx} className="text-[13px] text-gray-500 mb-1.5">
                  📖 {course.name} ({course.provider})
                </div>
              ))}

              {week.milestone && (
                <div className="text-[13px] text-green-400 italic mt-2">
                  Milestone: {week.milestone}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
