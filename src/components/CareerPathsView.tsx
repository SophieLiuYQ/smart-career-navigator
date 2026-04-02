"use client";

import React from "react";

interface PathAnalysis {
  roles: string[];
  assessment: string;
  recommended: boolean;
}

interface CareerPathsViewProps {
  data: {
    paths: PathAnalysis[];
    overall_advice: string;
    rawPaths: Array<{
      role_names: string[];
      total_months: number;
      path_probability: number;
    }>;
  };
}

export default function CareerPathsView({ data }: CareerPathsViewProps) {
  const { paths, overall_advice, rawPaths } = data;

  return (
    <div className="space-y-4">
      {paths.map((path, idx) => {
        const raw = rawPaths[idx];
        return (
          <div
            key={idx}
            className={`rounded-xl p-5 border path-node ${
              path.recommended
                ? "border-yellow-500/50 bg-yellow-500/5"
                : "border-gray-700 bg-gray-800/60"
            }`}
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            {path.recommended && (
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400 mb-3">
                Recommended
              </span>
            )}

            {/* Role flow */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {path.roles.map((role, rIdx) => (
                <React.Fragment key={rIdx}>
                  <span
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                      rIdx === 0
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : rIdx === path.roles.length - 1
                          ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                          : "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                    }`}
                  >
                    {role}
                  </span>
                  {rIdx < path.roles.length - 1 && (
                    <svg
                      className="w-4 h-4 text-gray-500 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Stats */}
            {raw && (
              <div className="flex gap-4 mb-3 text-xs text-gray-400">
                <span>
                  ~{Math.round(raw.total_months)} months
                </span>
                <span>
                  {(raw.path_probability * 100).toFixed(1)}% probability
                </span>
              </div>
            )}

            {/* Assessment */}
            <p className="text-gray-300 text-sm leading-relaxed">
              {path.assessment}
            </p>
          </div>
        );
      })}

      {/* Overall advice */}
      {overall_advice && (
        <div className="rounded-xl p-5 bg-indigo-500/10 border border-indigo-500/30 mt-6">
          <h4 className="text-indigo-400 font-semibold text-sm mb-2">
            AI Career Advisor
          </h4>
          <p className="text-gray-300 text-sm leading-relaxed">
            {overall_advice}
          </p>
        </div>
      )}
    </div>
  );
}
