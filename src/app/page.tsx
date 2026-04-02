"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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

type Tab = "setup" | "paths" | "learning" | "connections";

interface SocialState {
  linkedin: boolean;
  facebook: boolean;
  instagram: boolean;
}

interface ResumeData {
  name?: string;
  current_role?: string;
  years_experience?: number;
  skills?: string[];
  experience?: Array<{ title: string; company: string; duration: string }>;
  summary?: string;
}

export default function Home() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [currentRole, setCurrentRole] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("setup");
  const [loading, setLoading] = useState(false);

  // Profile state
  const [resumeFile, setResumeFile] = useState<string | null>(null);
  const [resumeParsing, setResumeParsing] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [social, setSocial] = useState<SocialState>({ linkedin: false, facebook: false, instagram: false });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Results state
  const [pathsData, setPathsData] = useState<CareerPathsResponse | null>(null);
  const [learningData, setLearningData] = useState<LearningPlanResponse | null>(null);
  const [connectionsData, setConnectionsData] = useState<ConnectionsResponse | null>(null);
  const [pathsLoading, setPathsLoading] = useState(false);
  const [learningLoading, setLearningLoading] = useState(false);
  const [connectionsLoading, setConnectionsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/roles")
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setRoles(data); })
      .catch(() => setError("Failed to load roles. Is Neo4j running?"));
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResumeFile(file.name);
    setResumeParsing(true);
    setResumeData(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload-resume", { method: "POST", body: formData });
      const data = await res.json();

      if (data.error) throw new Error(data.error);

      setResumeData(data);

      // Auto-fill current role if we find a match
      if (data.current_role && roles.length > 0) {
        const match = roles.find((r) =>
          r.title.toLowerCase().includes(data.current_role.toLowerCase()) ||
          data.current_role.toLowerCase().includes(r.title.toLowerCase())
        );
        if (match) setCurrentRole(match.title);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse resume");
    } finally {
      setResumeParsing(false);
    }
  };

  const toggleSocial = async (platform: keyof SocialState) => {
    // LinkedIn uses OAuth via NextAuth
    if (platform === "linkedin" && !social.linkedin) {
      const { signIn } = await import("next-auth/react");
      signIn("linkedin", { redirect: false });
      return;
    }
    setSocial((prev) => ({ ...prev, [platform]: !prev[platform] }));
  };

  const getAiInsight = () => {
    const sources: string[] = [];
    if (resumeFile) sources.push("resume");
    if (social.linkedin) sources.push("LinkedIn");
    if (social.facebook) sources.push("Facebook");
    if (social.instagram) sources.push("Instagram");
    if (sources.length === 0 && !currentRole && !resumeData) return null;

    if (resumeParsing) return "Analyzing your resume with AI...";

    let msg = "";
    if (resumeData) {
      msg += `AI detected: ${resumeData.current_role || "role"} with ${resumeData.years_experience || "?"} years experience. `;
      if (resumeData.skills && resumeData.skills.length > 0) {
        msg += `Skills: ${resumeData.skills.slice(0, 6).join(", ")}. `;
      }
    } else if (currentRole) {
      msg += `Current: ${currentRole}. `;
    }
    if (sources.length > 1) msg += `Cross-referencing ${sources.join(", ")} for deeper career signals.`;
    return msg;
  };

  const handleSearch = useCallback(async () => {
    if (!currentRole || !targetRole) return;
    if (currentRole === targetRole) { setError("Please select different roles"); return; }

    setError(null);
    setLoading(true);
    setPathsData(null);
    setLearningData(null);
    setConnectionsData(null);
    setActiveTab("paths");

    const fetchPaths = async () => {
      setPathsLoading(true);
      try {
        const res = await fetch("/api/career-paths", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentRole, targetRole }) });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setPathsData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to find paths");
      } finally { setPathsLoading(false); }
    };

    const fetchSkillGaps = async (): Promise<SkillGap[]> => {
      try {
        const userSkills = resumeData?.skills || [];
        const res = await fetch("/api/skill-gap", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentRole, targetRole, userSkills }) });
        return await res.json();
      } catch { return []; }
    };

    const fetchLearning = async (skillGaps: SkillGap[]) => {
      setLearningLoading(true);
      try {
        const res = await fetch("/api/learning-plan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentRole, targetRole, skillGaps, timeframeMonths: 6 }) });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setLearningData(data);
      } catch { console.error("Failed to generate learning plan"); }
      finally { setLearningLoading(false); }
    };

    const fetchConnections = async () => {
      setConnectionsLoading(true);
      try {
        const res = await fetch("/api/connections", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentRole, targetRole }) });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setConnectionsData(data);
      } catch { console.error("Failed to fetch connections"); }
      finally { setConnectionsLoading(false); }
    };

    try {
      const [, skillGaps] = await Promise.all([fetchPaths(), fetchSkillGaps()]);
      await Promise.all([fetchLearning(skillGaps), fetchConnections()]);
    } finally { setLoading(false); }
  }, [currentRole, targetRole]);

  const tabs: { key: Tab; label: string }[] = [
    { key: "setup", label: "Profile Setup" },
    { key: "paths", label: "Career Paths" },
    { key: "learning", label: "Learning Plan" },
    { key: "connections", label: "Connections" },
  ];

  const aiInsight = getAiInsight();

  return (
    <div className="max-w-3xl mx-auto my-8 rounded-2xl overflow-hidden" style={{ background: "#0d1021", minHeight: "600px" }}>
      {/* Header */}
      <div className="px-8 pt-7 pb-0" style={{ background: "linear-gradient(180deg, #131629 0%, #0d1021 100%)", borderBottom: "1px solid rgba(120, 100, 255, 0.15)" }}>
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #7b5ef8, #3b82f6)" }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="white"><path d="M8 1L15 5V11L8 15L1 11V5L8 1Z" /></svg>
          </div>
          <div>
            <div className="text-[15px] font-semibold" style={{ letterSpacing: "-0.3px" }}>Career Navigator</div>
            <div className="text-[11px] text-gray-500 font-mono">AI-Powered Path Intelligence</div>
          </div>
        </div>
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`nav-tab ${activeTab === tab.key ? "active" : ""}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-6">
        {error && (
          <div className="rounded-xl p-3 mb-4 text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}>
            {error}
          </div>
        )}

        {/* Profile Setup Tab */}
        {activeTab === "setup" && (
          <div className="fade-in">
            <div className="section-label">Your Profile</div>

            {/* Resume Upload */}
            <input ref={fileInputRef} type="file" accept=".pdf,.docx,.doc" className="hidden" onChange={handleFileUpload} />
            <div
              className={`upload-zone mb-4 ${resumeFile ? "has-file" : ""}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-9 h-9 rounded-[10px] flex items-center justify-center" style={{ background: "rgba(124,58,237,0.15)" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14,2 14,8 20,8" />
                  <line x1="12" y1="18" x2="12" y2="12" />
                  <polyline points="9,15 12,12 15,15" />
                </svg>
              </div>
              {resumeParsing ? (
                <>
                  <div className="text-[13px] font-medium text-purple-300">Analyzing resume...</div>
                  <svg className="animate-spin h-5 w-5 text-purple-400" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </>
              ) : resumeData ? (
                <>
                  <div className="text-[13px] font-medium text-purple-300">
                    {resumeData.name || "Resume"} — {resumeData.current_role || "Parsed"}
                  </div>
                  <div className="text-[11px] text-gray-500">
                    {resumeData.years_experience ? `${resumeData.years_experience} yrs experience` : ""}
                    {resumeData.skills ? ` · ${resumeData.skills.slice(0, 5).join(", ")}` : ""}
                  </div>
                  <div className="px-2.5 py-1 rounded-md text-[11px] font-mono text-purple-400" style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.3)" }}>
                    {resumeFile}
                  </div>
                </>
              ) : resumeFile ? (
                <>
                  <div className="text-[13px] font-medium text-purple-300">Resume uploaded</div>
                  <div className="px-2.5 py-1 rounded-md text-[11px] font-mono text-purple-400" style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.3)" }}>
                    {resumeFile}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-[13px] font-medium text-purple-300">Upload your resume</div>
                  <div className="text-[11px] text-gray-600">PDF or DOCX · We&apos;ll extract your experience automatically</div>
                </>
              )}
            </div>

            {/* Social Links */}
            <div className="section-label mt-4 mb-3">Connect Accounts</div>
            <div className="grid grid-cols-3 gap-3 mb-0">
              <SocialCard name="LinkedIn" platform="linkedin" linked={social.linkedin} onClick={() => toggleSocial("linkedin")} color="rgba(10,102,194,0.2)" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="#0a66c2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>} />
              <SocialCard name="Facebook" platform="facebook" linked={social.facebook} onClick={() => toggleSocial("facebook")} color="rgba(24,119,242,0.15)" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="#1877f2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>} />
              <SocialCard name="Instagram" platform="instagram" linked={social.instagram} onClick={() => toggleSocial("instagram")} color="rgba(225,48,108,0.15)" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="#e1306c"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" /></svg>} />
            </div>

            <div className="h-px my-5" style={{ background: "rgba(255,255,255,0.05)" }} />

            {/* AI Insight */}
            {aiInsight && (
              <div className="ai-strip mb-5">
                <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ background: "#7c3aed" }} />
                <div className="text-[12px] text-gray-400 leading-relaxed">{aiInsight}</div>
              </div>
            )}

            {/* Role Selection */}
            <div className="section-label">Your Journey</div>
            <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center mb-5">
              <div>
                <div className="text-[10px] text-gray-600 uppercase tracking-widest font-medium mb-1.5">Current Role</div>
                <select value={currentRole} onChange={(e) => setCurrentRole(e.target.value)} className="role-select">
                  <option value="">-- Select or auto-detect --</option>
                  {roles.map((r) => <option key={r.title} value={r.title}>{r.title}</option>)}
                </select>
              </div>
              <div className="text-gray-600 text-lg pt-4">→</div>
              <div>
                <div className="text-[10px] text-gray-600 uppercase tracking-widest font-medium mb-1.5">Dream Role</div>
                <select value={targetRole} onChange={(e) => setTargetRole(e.target.value)} className="role-select">
                  <option value="">-- Your destination --</option>
                  {roles.map((r) => <option key={r.title} value={r.title}>{r.title}</option>)}
                </select>
              </div>
            </div>

            <button
              onClick={handleSearch}
              disabled={!currentRole || !targetRole || loading}
              className="cta-btn"
            >
              {loading ? "Analyzing..." : "Find My Path →"}
            </button>
          </div>
        )}

        {/* Career Paths Tab */}
        {activeTab === "paths" && (
          <div className="fade-in">
            {pathsLoading && <Spinner />}
            {pathsData && pathsData.rawPaths.length > 0 && (
              <div className="mb-6">
                <GraphVisualization paths={pathsData.rawPaths} currentRole={currentRole} targetRole={targetRole} />
              </div>
            )}
            {pathsData && <CareerPathsView data={pathsData} />}
            {!pathsLoading && !pathsData && (
              <EmptyState text="Complete your profile setup and click 'Find My Path' to see career paths." />
            )}
          </div>
        )}

        {/* Learning Plan Tab */}
        {activeTab === "learning" && (
          <div className="fade-in">
            {learningLoading && <Spinner />}
            {learningData && <LearningPlanView data={learningData} />}
            {!learningLoading && !learningData && (
              <EmptyState text="Your personalized learning plan will appear here after analysis." />
            )}
          </div>
        )}

        {/* Connections Tab */}
        {activeTab === "connections" && (
          <div className="fade-in">
            {connectionsLoading && <Spinner />}
            {connectionsData && <ConnectionsView data={connectionsData} />}
            {!connectionsLoading && !connectionsData && (
              <EmptyState text="Connection recommendations will appear here after analysis." />
            )}
          </div>
        )}
      </div>

      <div className="app-footer">Powered by Neo4j Graph Database · RocketRide AI Pipelines</div>
    </div>
  );
}

function SocialCard({ name, platform, linked, onClick, color, icon }: {
  name: string; platform: string; linked: boolean; onClick: () => void; color: string;
  icon: React.ReactNode;
}) {
  return (
    <div className={`social-card ${linked ? "linked" : ""}`} onClick={onClick}>
      <div className="w-9 h-9 rounded-[9px] flex items-center justify-center flex-shrink-0" style={{ background: color }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium">{name}</div>
        <div className={`text-[11px] ${linked ? "text-green-400" : "text-gray-600"}`}>
          {linked ? "Connected" : "Not connected"}
        </div>
      </div>
      <button
        className={`text-[11px] px-3 py-1 rounded-md border transition-all font-[Sora] ${
          linked
            ? "border-green-500/30 text-green-400"
            : "border-white/10 text-gray-400 hover:bg-white/5 hover:text-white"
        }`}
      >
        {linked ? "Linked ✓" : "Link"}
      </button>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <svg className="animate-spin h-8 w-8 text-purple-500" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-center py-16">
      <div className="text-gray-600 text-sm">{text}</div>
    </div>
  );
}
