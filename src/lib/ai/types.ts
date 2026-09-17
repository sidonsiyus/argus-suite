import { z } from "zod";

// Explicit Allowlist of Non-Sensitive Student Context for AI
export interface SanitizedStudentContext {
  studentId: string;
  regNo: string;
  fullName: string;
  programme: string;
  yearOfStudy: string;
  section: string;
  academicYear: string;
  primaryCareerGoal: string;
  dreamOrganizations: string[];
  careerRoleCategory?: string;
  careerPrerequisites: string[];
  skills: Array<{
    name: string;
    category: string;
    rating: number;
    assessmentType: string;
    provenance: string;
  }>;
  readinessStates: Record<string, string>;
  activeMilestones: Array<{
    title: string;
    priority: string;
    criteria?: string;
  }>;
  recentSessionObservations: Array<{
    date: string;
    focus: string;
    notes: string;
  }>;
  strengths: string[];
  developmentAreas: string[];
  biggestChallenge?: string;
  mentorHelpNeeded?: string;
}

// Zod Validation Schemas for Structured AI Copilot Output
export const copilotEvidenceSchema = z.object({
  source: z.string().min(1, "Evidence source is required"),
  value: z.string().min(1, "Evidence value is required"),
  provenance: z.string().min(1, "Evidence provenance is required"),
});

export const copilotRecommendationSchema = z.object({
  type: z.enum(["INSIGHT", "MENTORING_FOCUS", "MILESTONE", "QUESTION"]),
  title: z.string().min(3).max(200),
  rationale: z.string().min(5).max(1000),
  suggested_action: z.string().min(5).max(1000),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  evidence: z.array(copilotEvidenceSchema).min(1, "Every recommendation must include at least one grounded evidence item"),
});

export const copilotAnalysisSchema = z.object({
  student_summary: z.string().min(10).max(1000),
  career_alignment_observation: z.string().min(10).max(1000),
  recommendations: z.array(copilotRecommendationSchema).min(1).max(8),
});

export type CopilotEvidenceItem = z.infer<typeof copilotEvidenceSchema>;
export type CopilotRecommendationItem = z.infer<typeof copilotRecommendationSchema> & {
  id?: string;
  db_id?: string;
  status?: "PENDING" | "APPROVED" | "EDITED" | "REJECTED";
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  review_notes?: string | null;
  created_at?: string;
};
export type CopilotAnalysisResult = z.infer<typeof copilotAnalysisSchema>;

export interface SuggestedAction {
  title: string;
  category: 'Licensing' | 'Academic' | 'Aviation English' | 'Interview' | 'Technical';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  successCriteria: string;
  rationale: string;
  estimatedDaysToComplete: number;
}

export interface ImprovementPlanResult {
  summary: string;
  focusAreas: string[];
  mentorActionableInputs: string[];
  recommendedMilestones: SuggestedAction[];
}

export interface CohortSummaryPayload {
  totalStudents: number;
  academicYear: string;
  careerDistribution: { role: string; count: number; percentage: number }[];
  weakestSkills: { skill: string; averageRating: number }[];
  commonChallenges: { theme: string; frequency: number }[];
  unmetCadetsCount: number;
}

export interface CohortSynthesisResult {
  executiveSummary: string;
  cohortThemes: string[];
  highPriorityInterventions: string[];
  curriculumGaps: string[];
}

export interface AIProvider {
  name: 'openrouter' | 'groq' | 'anthropic' | 'openai' | 'gemini';
  modelName?: string;
  generateCopilotInsights(context: SanitizedStudentContext): Promise<CopilotAnalysisResult>;
  generatePOA(context: SanitizedStudentContext): Promise<SuggestedAction[]>;
  generateImprovementPlan(context: SanitizedStudentContext): Promise<ImprovementPlanResult>;
  synthesizeCohort(summary: CohortSummaryPayload): Promise<CohortSynthesisResult>;
}
