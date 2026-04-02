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

  // If plan is empty but summary has content, try to parse it as a readable fallback
  if ((!plan || plan.length === 0) && summary) {
    return (
      <div className="rounded-xl p-5 bg-blue-500/10 border border-blue-500/30">
        <h4 className="text-blue-400 font-semibold text-sm mb-3">Learning Plan</h4>
        <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
          {summary}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Summary */}
      {summary && (
        <div className="rounded-xl p-5 bg-blue-500/10 border border-blue-500/30 mb-6">
          <h4 className="text-blue-400 font-semibold text-sm mb-2">
            Plan Overview
          </h4>
          <p className="text-gray-300 text-sm leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 opacity-30" />

        {plan.map((week, idx) => (
          <div
            key={idx}
            className="relative pl-14 pb-6 path-node"
            style={{ animationDelay: `${idx * 0.08}s` }}
          >
            {/* Week circle */}
            <div className="absolute left-2 w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold border-2 border-indigo-400">
              {week.week}
            </div>

            <div className="rounded-xl p-4 bg-gray-800/60 border border-gray-700">
              {/* Focus */}
              <h4 className="text-white font-semibold text-sm mb-2">
                {week.focus}
              </h4>

              {/* Skills */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {week.skills.map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    className="px-2 py-0.5 rounded text-xs bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Courses */}
              {week.courses.length > 0 && (
                <div className="mb-2">
                  {week.courses.map((course, cIdx) => (
                    <div
                      key={cIdx}
                      className="text-xs text-gray-400 flex items-center gap-1.5 mb-1"
                    >
                      <svg
                        className="w-3 h-3 text-purple-400 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                      <span>
                        {course.name}{" "}
                        <span className="text-gray-500">
                          ({course.provider})
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Milestone */}
              {week.milestone && (
                <p className="text-xs text-emerald-400 italic mt-2">
                  Milestone: {week.milestone}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
