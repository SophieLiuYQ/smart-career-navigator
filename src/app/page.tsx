"use client";

import React, { useState, useEffect, useCallback } from "react";
import CareerPathsView from "@/components/CareerPathsView";
import LearningPlanView from "@/components/LearningPlanView";
import ConnectionsView from "@/components/ConnectionsView";
import GraphVisualization from "@/components/GraphVisualization";
import type {
  Role,
  CareerPathsResponse,
  LearningPlanResponse,
  ConnectionsResponse,
  SkillGap,
} from "@/types";

type Tab = "paths" | "learning" | "connections";

export default function Home() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [currentRole, setCurrentRole] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("paths");
  const [loading, setLoading] = useState(false);

  const [pathsData, setPathsData] = useState<CareerPathsResponse | null>(null);
  const [learningData, setLearningData] =
    useState<LearningPlanResponse | null>(null);
  const [connectionsData, setConnectionsData] =
    useState<ConnectionsResponse | null>(null);

  const [pathsLoading, setPathsLoading] = useState(false);
  const [learningLoading, setLearningLoading] = useState(false);
  const [connectionsLoading, setConnectionsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/roles")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setRoles(data);
      })
      .catch(() => setError("Failed to load roles. Is Neo4j running?"));
  }, []);

  const handleSearch = useCallback(async () => {
    if (!currentRole || !targetRole) return;
    if (currentRole === targetRole) {
      setError("Please select different roles");
      return;
    }

    setError(null);
    setLoading(true);
    setPathsData(null);
    setLearningData(null);
    setConnectionsData(null);
    setActiveTab("paths");

    const fetchPaths = async () => {
      setPathsLoading(true);
      try {
        const res = await fetch("/api/career-paths", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currentRole, targetRole }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setPathsData(data);
        return data;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to find paths");
        return null;
      } finally {
        setPathsLoading(false);
      }
    };

    const fetchLearning = async (skillGaps: SkillGap[]) => {
      setLearningLoading(true);
      try {
        const res = await fetch("/api/learning-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentRole,
            targetRole,
            skillGaps,
            timeframeMonths: 6,
          }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setLearningData(data);
      } catch {
        console.error("Failed to generate learning plan");
      } finally {
        setLearningLoading(false);
      }
    };

    const fetchConnections = async () => {
      setConnectionsLoading(true);
      try {
        const res = await fetch("/api/connections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currentRole, targetRole }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setConnectionsData(data);
      } catch {
        console.error("Failed to fetch connections");
      } finally {
        setConnectionsLoading(false);
      }
    };

    const fetchSkillGaps = async (): Promise<SkillGap[]> => {
      try {
        const res = await fetch("/api/skill-gap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currentRole, targetRole, userSkills: [] }),
        });
        return await res.json();
      } catch {
        return [];
      }
    };

    try {
      const [, skillGaps] = await Promise.all([
        fetchPaths(),
        fetchSkillGaps(),
      ]);

      await Promise.all([fetchLearning(skillGaps), fetchConnections()]);
    } finally {
      setLoading(false);
    }
  }, [currentRole, targetRole]);

  const tabs: { key: Tab; label: string }[] = [
    { key: "paths", label: "Career Paths" },
    { key: "learning", label: "Learning Plan" },
    { key: "connections", label: "Connections" },
  ];

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
            Smart Career Navigator
          </h1>
          <p className="text-gray-400 text-lg">
            AI-Powered Career Path Intelligence &middot; Neo4j + RocketRide AI
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">
                Current Role
              </label>
              <select
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="">Select your current role...</option>
                {roles.map((r) => (
                  <option key={r.title} value={r.title}>
                    {r.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">
                Target Role
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="">Select your target role...</option>
                {roles.map((r) => (
                  <option key={r.title} value={r.title}>
                    {r.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={handleSearch}
            disabled={!currentRole || !targetRole || loading}
            className="w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Analyzing career paths...
              </span>
            ) : (
              "Find My Path"
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm mb-6">
            {error}
          </div>
        )}

        {/* Graph Visualization */}
        {pathsData && pathsData.rawPaths.length > 0 && (
          <div className="mb-8">
            <GraphVisualization
              paths={pathsData.rawPaths}
              currentRole={currentRole}
              targetRole={targetRole}
            />
          </div>
        )}

        {/* Results Tabs */}
        {(pathsData || learningData || connectionsData) && (
          <div>
            <div className="flex border-b border-gray-700 mb-6">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-5 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? "tab-active text-indigo-400"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div>
              {activeTab === "paths" && (
                <>
                  {pathsLoading && <Spinner />}
                  {pathsData && <CareerPathsView data={pathsData} />}
                </>
              )}
              {activeTab === "learning" && (
                <>
                  {learningLoading && <Spinner />}
                  {learningData && <LearningPlanView data={learningData} />}
                  {!learningLoading && !learningData && (
                    <p className="text-gray-500 text-sm">
                      No learning plan available yet.
                    </p>
                  )}
                </>
              )}
              {activeTab === "connections" && (
                <>
                  {connectionsLoading && <Spinner />}
                  {connectionsData && (
                    <ConnectionsView data={connectionsData} />
                  )}
                  {!connectionsLoading && !connectionsData && (
                    <p className="text-gray-500 text-sm">
                      No connections data available yet.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        <div className="text-center mt-12 text-gray-600 text-xs">
          Powered by Neo4j Graph Database + RocketRide AI Pipelines
        </div>
      </div>
    </main>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <svg
        className="animate-spin h-8 w-8 text-indigo-500"
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
    </div>
  );
}
