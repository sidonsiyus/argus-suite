export type SessionStatus =
  | "PLANNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "HISTORICAL";

export type SessionType =
  | "GENERAL_MENTORING"
  | "CAREER_GUIDANCE"
  | "ACADEMIC_SUPPORT"
  | "CAREER_READINESS"
  | "INTERNSHIP"
  | "PLACEMENT"
  | "SKILL_DEVELOPMENT"
  | "DOCUMENTATION"
  | "FOLLOW_UP"
  | "OTHER";

export const SESSION_TYPES: {
  value: SessionType;
  label: string;
  description: string;
}[] = [
  {
    value: "GENERAL_MENTORING",
    label: "General Mentoring",
    description: "Holistic 1-on-1 progress review, academic check-in, and well-being discussion",
  },
  {
    value: "CAREER_GUIDANCE",
    label: "Career Track Guidance",
    description: "Targeted airline, commercial pilot, or aeronautical engineering pathway planning",
  },
  {
    value: "ACADEMIC_SUPPORT",
    label: "Academic Support & Ground School",
    description: "DGCA theory, air regulations, navigation, and aeronautical course exam prep",
  },
  {
    value: "CAREER_READINESS",
    label: "Career Readiness & Verification",
    description: "Resume audit, LinkedIn profile review, passport and clearance document tracking",
  },
  {
    value: "INTERNSHIP",
    label: "Internship & Industry Attachment",
    description: "Airline training programs, MRO attachment opportunities, and application support",
  },
  {
    value: "PLACEMENT",
    label: "Placement & Cadetship Prep",
    description: "Airline cadet pilot technical panels, psychometric exams, and interview readiness",
  },
  {
    value: "SKILL_DEVELOPMENT",
    label: "Technical Skills & Simulator",
    description: "Aeronautical knowledge, simulator practice benchmarks, and radio telephony",
  },
  {
    value: "DOCUMENTATION",
    label: "Documentation & Clearances",
    description: "DGCA computer number, class 1 medical status, police verification clearances",
  },
  {
    value: "FOLLOW_UP",
    label: "Follow-Up Review",
    description: "Follow-up discussion on previously agreed action plans and commitments",
  },
  {
    value: "OTHER",
    label: "Other Mentoring Activity",
    description: "Specialized mentor intervention or student-requested consultation",
  },
];

export const SESSION_STATUSES: {
  value: SessionStatus;
  label: string;
}[] = [
  { value: "PLANNED", label: "Planned" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "HISTORICAL", label: "Historical" },
];

export const SESSION_DURATIONS = [15, 30, 45, 60] as const;
export type SessionDuration = (typeof SESSION_DURATIONS)[number];

export interface LinkedMilestoneItem {
  milestone_id: string;
  title: string;
  status: string;
  review_notes?: string | null;
}

export interface SessionItem {
  id: string;
  student_id: string;
  student_name: string;
  reg_no: string;
  mentor_id: string;
  scheduled_at: string | null; // ISO string with timezone
  session_date: string; // YYYY-MM-DD
  duration_minutes: number;
  status: SessionStatus;
  session_type: SessionType;
  focus_area: string;
  observations: string;
  notes?: string | null;
  outcome?: string | null;
  follow_up_date?: string | null; // YYYY-MM-DD
  follow_up_notes?: string | null;
  linked_milestones?: LinkedMilestoneItem[];
  is_historical: boolean;
  provenance: string;
  created_at: string;
  updated_at: string;
}

export interface SessionFilters {
  status?: "upcoming" | "today" | "completed" | "cancelled" | "all";
  session_type?: string;
  search?: string;
  student_id?: string;
}

// Strict Lifecycle Transition Rules
export const VALID_SESSION_TRANSITIONS: Record<string, SessionStatus[]> = {
  PLANNED: ["IN_PROGRESS", "CANCELLED", "PLANNED"], // PLANNED -> PLANNED represents rescheduling
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  COMPLETED: [], // Terminal
  CANCELLED: [], // Terminal
  HISTORICAL: [], // Historical records are read-only
};

export function isValidSessionTransition(
  currentStatus: SessionStatus | null | undefined,
  targetStatus: SessionStatus
): boolean {
  if (!currentStatus) return false;
  const allowed = VALID_SESSION_TRANSITIONS[currentStatus] || [];
  return allowed.includes(targetStatus);
}

// Unified Calendar Domain Types
export type CalendarEventType =
  | "SESSION"
  | "MILESTONE"
  | "INTERNSHIP_DEADLINE"
  | "FOLLOW_UP";

export interface CalendarEvent {
  id: string;
  type: CalendarEventType;
  title: string;
  start: string; // ISO String
  end: string; // ISO String
  date: string; // YYYY-MM-DD
  studentId?: string;
  studentName?: string;
  regNo?: string;
  sourceId: string;
  status?: string;
  details?: Record<string, any>;
}

export type CalendarViewMode = "month" | "week" | "day";
