"use client";

import React from "react";

interface OnetInsights {
  title: string;
  description: string;
  onet_code?: string | null;
  salary?: { median: string; range?: string };
  outlook?: { growth: string; description: string; bright: boolean };
  top_skills?: Array<{ name: string; importance: number; have: boolean }>;
  key_tasks?: string[];
  education?: string;
  related_roles?: string[];
  hot_technologies?: string[];
  knowledge_areas?: string[];
}

interface RoleInsightsViewProps {
  data: OnetInsights;
}

function SkillBar({ name, importance, have }: { name: string; importance: number; have: boolean }) {
  return (
    <div className="flex items-center gap-3 mb-2">
      <span className={`text-[13px] w-4 flex-shrink-0 ${have ? "text-green-400" : "text-red-400"}`}>
        {have ? "✓" : "✗"}
      </span>
      <span className="text-[14px] text-gray-300 w-36 truncate">{name}</span>
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${importance}%`,
            background: have
              ? "linear-gradient(90deg, #22c55e, #4ade80)"
              : "linear-gradient(90deg, #7c3aed, #a78bfa)",
          }}
        />
      </div>
      <span className="text-[12px] text-gray-500 w-8 text-right font-mono">{importance}</span>
    </div>
  );
}

export default function RoleInsightsView({ data }: RoleInsightsViewProps) {
  return (
    <div className="space-y-4 fade-in">
      {/* Header */}
      <div className="rounded-[14px] p-5" style={{ border: "1px solid rgba(124,58,237,0.2)", background: "rgba(124,58,237,0.06)" }}>
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="text-[17px] font-semibold text-white">{data.title}</div>
            {data.onet_code && (
              <div className="text-[12px] text-gray-500 font-mono mt-0.5">O*NET {data.onet_code}</div>
            )}
          </div>
          {data.outlook?.bright && (
            <span className="px-2.5 py-1 rounded-full text-[12px] font-semibold"
              style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.3)" }}>
              Bright Outlook
            </span>
          )}
        </div>
        <p className="text-[14px] text-gray-400 leading-relaxed mb-3">{data.description}</p>

        {/* Stats row */}
        <div className="flex gap-4 flex-wrap">
          {data.salary?.median && (
            <div className="px-3 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="text-[12px] text-gray-500 uppercase tracking-wider">Median Salary</div>
              <div className="text-[16px] font-semibold text-green-400">{data.salary.median}</div>
            </div>
          )}
          {data.outlook && (
            <div className="px-3 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="text-[12px] text-gray-500 uppercase tracking-wider">Growth</div>
              <div className="text-[16px] font-semibold text-blue-400">{data.outlook.growth}</div>
              <div className="text-[12px] text-gray-500">{data.outlook.description}</div>
            </div>
          )}
          {data.education && (
            <div className="px-3 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="text-[12px] text-gray-500 uppercase tracking-wider">Education</div>
              <div className="text-[15px] font-medium text-gray-300">{data.education}</div>
            </div>
          )}
        </div>
      </div>

      {/* Skills with gap analysis */}
      {data.top_skills && data.top_skills.length > 0 && (
        <div className="rounded-[14px] p-5" style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
          <div className="text-[15px] font-semibold text-white mb-3">Skills Required — Your Gap Analysis</div>
          {data.top_skills.map((skill, i) => (
            <SkillBar key={i} name={skill.name} importance={skill.importance} have={skill.have} />
          ))}
          <div className="flex gap-4 mt-3 text-[12px] text-gray-500">
            <span className="flex items-center gap-1"><span className="text-green-400">✓</span> You have</span>
            <span className="flex items-center gap-1"><span className="text-red-400">✗</span> Gap to fill</span>
          </div>
        </div>
      )}

      {/* Key Tasks */}
      {data.key_tasks && data.key_tasks.length > 0 && (
        <div className="rounded-[14px] p-5" style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
          <div className="text-[15px] font-semibold text-white mb-3">Key Tasks</div>
          <ul className="space-y-2">
            {data.key_tasks.map((task, i) => (
              <li key={i} className="flex gap-2.5 text-[14px] text-gray-400 leading-relaxed">
                <span className="text-purple-400 flex-shrink-0 mt-0.5">•</span>
                <span>{task}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Hot Technologies */}
      {data.hot_technologies && data.hot_technologies.length > 0 && (
        <div className="rounded-[14px] p-5" style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
          <div className="text-[15px] font-semibold text-white mb-3">In-Demand Technologies</div>
          <div className="flex flex-wrap gap-2">
            {data.hot_technologies.map((tech, i) => (
              <span key={i} className="px-2.5 py-1 rounded-full text-[13px]"
                style={{ background: "rgba(59,130,246,0.1)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.25)" }}>
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Related Roles */}
      {data.related_roles && data.related_roles.length > 0 && (
        <div className="rounded-[14px] p-5" style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
          <div className="text-[15px] font-semibold text-white mb-3">Related Roles to Consider</div>
          <div className="flex flex-wrap gap-2">
            {data.related_roles.map((role, i) => (
              <span key={i} className="px-3 py-1.5 rounded-lg text-[14px] font-medium"
                style={{ background: "rgba(124,58,237,0.12)", color: "#c4b5fd", border: "1px solid rgba(124,58,237,0.3)" }}>
                {role}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
