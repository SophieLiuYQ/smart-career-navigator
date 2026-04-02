"use client";

import React, { useState } from "react";

interface Connection {
  name: string;
  reason: string;
  outreach_tip: string;
  company?: string;
  role?: string;
  years_exp?: number;
}

interface ConnectionsViewProps {
  data: {
    connections: Connection[];
    networking_strategy?: string;
  };
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function ConnectionCard({ connection, index }: { connection: Connection; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl p-4 fade-in" style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", animationDelay: `${index * 0.08}s` }}>
      <div className="conn-avatar mb-2.5">{getInitials(connection.name)}</div>
      <div className="text-[13px] font-medium text-white mb-0.5">{connection.name}</div>
      {(connection.company || connection.role) && (
        <div className="text-[11px] text-gray-500 mb-2">
          {connection.role}{connection.role && connection.company && " at "}{connection.company}
        </div>
      )}
      <p className="text-[11px] text-gray-400 leading-relaxed mb-2">{connection.reason}</p>

      <button onClick={() => setExpanded(!expanded)} className="text-[11px] text-purple-400 hover:text-purple-300 transition-colors">
        {expanded ? "Hide suggestion ▾" : "Outreach suggestion ▸"}
      </button>
      {expanded && (
        <p className="text-[11px] text-gray-500 mt-1.5 leading-relaxed">{connection.outreach_tip}</p>
      )}
    </div>
  );
}

function StrategyList({ text }: { text: string }) {
  // Split on numbered patterns like "1)", "1.", "2)", etc.
  const items = text.split(/\d+\)\s*|\d+\.\s+/).filter((s) => s.trim());

  if (items.length <= 1) {
    // No numbered list found — try splitting on sentences
    return <p className="text-[12px] text-gray-400 leading-relaxed">{text}</p>;
  }

  return (
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-[12px] text-gray-400 leading-relaxed">
          <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold text-purple-300 mt-0.5"
            style={{ background: "rgba(124,58,237,0.25)" }}>
            {i + 1}
          </span>
          <span>{item.trim()}</span>
        </li>
      ))}
    </ul>
  );
}

export default function ConnectionsView({ data }: ConnectionsViewProps) {
  const { connections, networking_strategy } = data;

  return (
    <div>
      {networking_strategy && (
        <div className="rounded-[14px] p-5 mb-4" style={{ border: "1px solid rgba(124,58,237,0.2)", background: "rgba(124,58,237,0.06)" }}>
          <div className="text-[13px] font-semibold text-purple-400 mb-3">Networking Strategy</div>
          <StrategyList text={networking_strategy} />
        </div>
      )}
      <div className="section-label">People on similar paths</div>
      <div className="grid grid-cols-2 gap-3">
        {connections.map((c, idx) => (
          <ConnectionCard key={idx} connection={c} index={idx} />
        ))}
      </div>
    </div>
  );
}
