// Domain types for Phase 3F Mentor Daily Command Center

export interface DashboardKpis {
  todaySessionsCount: number;
  followUpsDueCount: number;
  overdueMilestonesCount: number;
  pendingAiRecommendationsCount: number;
  totalStudents: number;
  activeMilestonesCount: number;
}

export type SessionDisplayStatus = "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "HISTORICAL";

export interface DashboardSessionItem {
  id: string;
  studentId: string;
  studentName: string;
  regNo: string;
  careerGoal?: string;
  sessionType: string;
  focusArea?: string;
  status: SessionDisplayStatus;
  scheduledAt: string | null;
  sessionDate: string;
  timeStr: string | null;
  durationMinutes: number;
  isNext?: boolean;
}

export type FollowUpCategory = "OVERDUE" | "TODAY" | "UPCOMING";

export interface DashboardFollowUpItem {
  id: string;
  sessionId: string;
  studentId: string;
  studentName: string;
  regNo: string;
  followUpDate: string;
  followUpNotes?: string;
  category: FollowUpCategory;
  daysDiff: number; // negative = overdue, 0 = today, positive = days until due
}

export interface DashboardMilestoneItem {
  id: string;
  studentId: string;
  studentName: string;
  regNo: string;
  title: string;
  targetDate: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  category: string;
  status: string;
  isOverdue: boolean;
  daysDiff: number;
  isAiSuggested?: boolean;
}

export interface DashboardInternshipItem {
  id: string;
  companyName: string;
  roleTitle: string;
  location?: string;
  applicationDeadline: string;
  status: string;
  pursuitsCount: number;
  daysRemaining: number;
}

export interface DashboardAIRecommendationItem {
  id: string;
  studentId: string;
  studentName: string;
  regNo: string;
  recommendationType: string;
  suggestedTitle: string;
  suggestedDescription: string;
  suggestedCategory: string;
  suggestedTargetDays: number;
  evidenceSummary?: string;
  createdAt: string;
}

export type AttentionUrgency = "HIGH" | "MEDIUM" | "INFORMATIONAL";

export interface DashboardAttentionItem {
  studentId: string;
  studentName: string;
  regNo: string;
  careerGoal: string;
  urgency: AttentionUrgency;
  primaryReason: string;
  reasons: string[];
  signalTypes: string[];
}

export interface DashboardActivityItem {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  timestamp: string;
  title: string;
  description: string;
  actorRole: string;
}

export interface CareerDistributionItem {
  role_id: string;
  title: string;
  short_title: string;
  slug: string;
  count: number;
}

export interface SearchIndexItem {
  id: string;
  full_name: string;
  reg_no: string;
  career_goal?: string;
}

export interface CommandCenterData {
  kpis: DashboardKpis;
  todaySessions: DashboardSessionItem[];
  nextSession: DashboardSessionItem | null;
  followUps: {
    overdue: DashboardFollowUpItem[];
    today: DashboardFollowUpItem[];
    upcoming: DashboardFollowUpItem[];
    all: DashboardFollowUpItem[];
  };
  milestones: {
    overdue: DashboardMilestoneItem[];
    approaching: DashboardMilestoneItem[];
  };
  internships: {
    approachingDeadlines: DashboardInternshipItem[];
  };
  aiRecommendations: DashboardAIRecommendationItem[];
  needingAttention: DashboardAttentionItem[];
  recentActivity: DashboardActivityItem[];
  careerDistribution: CareerDistributionItem[];
  searchIndex: SearchIndexItem[];
}
