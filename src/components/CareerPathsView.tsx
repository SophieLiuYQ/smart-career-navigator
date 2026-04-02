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
            className={`path-card fade-in ${path.recommended ? "recommended" : ""}`}
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            {path.recommended && (
              <div className="inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider mb-3.5"
                style={{ background: "rgba(255,165,0,0.15)", color: "#f59e0b", letterSpacing: "1px" }}>
                Recommended
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 mb-3">
              {path.roles.map((role, rIdx) => (
                <React.Fragment key={rIdx}>
                  <span className={`px-3.5 py-1.5 rounded-lg text-[12px] font-medium border ${
                    rIdx === 0
                      ? "text-green-400 border-green-500/30"
                      : rIdx === path.roles.length - 1
                        ? "text-amber-400 border-amber-500/30"
                        : "text-purple-300 border-purple-500/30"
                  }`}
                  style={{
                    background: rIdx === 0 ? "rgba(34,197,94,0.15)"
                      : rIdx === path.roles.length - 1 ? "rgba(245,158,11,0.15)"
                      : "rgba(124,58,237,0.12)"
                  }}>
                    {role}
                  </span>
                  {rIdx < path.roles.length - 1 && (
                    <span className="text-gray-600 text-[12px]">›</span>
                  )}
                </React.Fragment>
              ))}
            </div>

            {raw && (
              <div className="text-[11px] text-gray-600 mb-2.5 font-mono">
                ~{Math.round(raw.total_months)} months · {(raw.path_probability * 100).toFixed(1)}% probability
              </div>
            )}

            <p className="text-[12px] text-gray-400 leading-relaxed">{path.assessment}</p>
          </div>
        );
      })}

      {overall_advice && (
        <div className="rounded-[14px] p-5 mt-4" style={{ border: "1px solid rgba(59,130,246,0.2)", background: "rgba(59,130,246,0.04)" }}>
          <div className="text-[13px] font-semibold text-blue-400 mb-2.5">AI Career Advisor</div>
          <p className="text-[12px] text-gray-400 leading-relaxed">{overall_advice}</p>
        </div>
      )}
    </div>
  );
}
