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

export default function ConnectionsView({ data }: ConnectionsViewProps) {
  const { connections, networking_strategy } = data;

  return (
    <div>
      {networking_strategy && (
        <div className="rounded-[14px] p-5 mb-4" style={{ border: "1px solid rgba(124,58,237,0.2)", background: "rgba(124,58,237,0.06)" }}>
          <div className="text-[13px] font-semibold text-purple-400 mb-2">Networking Strategy</div>
          <p className="text-[12px] text-gray-400 leading-relaxed">{networking_strategy}</p>
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
