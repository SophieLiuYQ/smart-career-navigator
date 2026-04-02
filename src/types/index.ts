export interface Role {
  title: string;
  level: string;
  avg_salary: number;
  demand_score: number;
}

export interface CareerPath {
  role_names: string[];
  total_months: number;
  path_probability: number;
}

export interface PathAnalysis {
  roles: string[];
  assessment: string;
  strengths?: string[];
  challenges?: string[];
  recommended: boolean;
}

export interface CareerPathsResponse {
  paths: PathAnalysis[];
  overall_advice: string;
  market_insight?: string;
  rawPaths: CareerPath[];
  _source?: string;
  _pathSource?: "graph" | "ai" | "hybrid";
  _roleMapping?: {
    current: { input: string; resolved: string; exact: boolean; created?: boolean };
    target: { input: string; resolved: string; exact: boolean; created?: boolean };
  };
}

export interface SkillGap {
  skill: string;
  category: string;
  importance: number;
  courses: Course[];
}

export interface Course {
  name: string;
  provider: string;
  duration: string;
  url: string;
}

export interface WeekPlan {
  week: number;
  focus: string;
  skills: string[];
  courses: { name: string; provider: string }[];
  hours?: number;
  milestone: string;
}

export interface LearningPlanResponse {
  plan: WeekPlan[];
  summary: string;
  total_weeks?: number;
  key_milestones?: string[];
  estimated_readiness?: string;
  _source?: string;
}

export interface Connection {
  name: string;
  company?: string;
  role?: string;
  years_exp?: number;
  priority?: string;
  reason: string;
  outreach_message?: string;
  outreach_tip: string;
  talking_points?: string[];
}

export interface ConnectionsResponse {
  connections: Connection[];
  networking_strategy?: string;
  _source?: string;
}
