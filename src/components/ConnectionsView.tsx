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
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const avatarColors = [
  "bg-indigo-600",
  "bg-purple-600",
  "bg-pink-600",
  "bg-teal-600",
  "bg-amber-600",
  "bg-emerald-600",
  "bg-rose-600",
  "bg-cyan-600",
];

function ConnectionCard({
  connection,
  index,
}: {
  connection: Connection;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const color = avatarColors[index % avatarColors.length];

  return (
    <div
      className="rounded-xl p-5 bg-gray-800/60 backdrop-blur-sm border border-gray-700 hover:border-gray-600 transition-colors path-node"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-12 h-12 rounded-full ${color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
        >
          {getInitials(connection.name)}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-white font-semibold text-base truncate">
            {connection.name}
          </h4>
          {(connection.company || connection.role) && (
            <p className="text-gray-400 text-sm mt-0.5">
              {connection.role}
              {connection.role && connection.company && " at "}
              {connection.company}
            </p>
          )}
          {connection.years_exp != null && (
            <p className="text-gray-500 text-xs mt-1">
              {connection.years_exp} years experience
            </p>
          )}
        </div>
      </div>

      <p className="text-gray-300 text-sm mt-4 leading-relaxed">
        {connection.reason}
      </p>

      <div className="mt-3 border-t border-gray-700 pt-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-indigo-400 text-sm font-medium hover:text-indigo-300 transition-colors"
        >
          <svg
            className={`w-4 h-4 transition-transform ${expanded ? "rotate-90" : ""}`}
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
          Outreach Suggestion
        </button>
        {expanded && (
          <p className="text-gray-400 text-sm mt-2 pl-6 leading-relaxed">
            {connection.outreach_tip}
          </p>
        )}
      </div>
    </div>
  );
}

export default function ConnectionsView({ data }: ConnectionsViewProps) {
  const { connections, networking_strategy } = data;

  return (
    <div className="space-y-4">
      {networking_strategy && (
        <div className="rounded-xl p-5 bg-purple-500/10 border border-purple-500/30 mb-4">
          <h4 className="text-purple-400 font-semibold text-sm mb-2">
            Networking Strategy
          </h4>
          <p className="text-gray-300 text-sm leading-relaxed">
            {networking_strategy}
          </p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {connections.map((connection, idx) => (
          <ConnectionCard key={idx} connection={connection} index={idx} />
        ))}
      </div>
    </div>
  );
}
