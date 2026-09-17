export type WorkMode = "ON_SITE" | "REMOTE" | "HYBRID";

export const WORK_MODES: { value: WorkMode; label: string }[] = [
  { value: "ON_SITE", label: "On-site" },
  { value: "REMOTE", label: "Remote" },
  { value: "HYBRID", label: "Hybrid" },
];

export type InternshipStatus =
  | "SAVED"
  | "RECOMMENDED"
  | "APPLIED"
  | "INTERVIEW"
  | "SELECTED"
  | "REJECTED"
  | "COMPLETED";

export const INTERNSHIP_STATUSES: {
  value: InternshipStatus;
  label: string;
  badgeVariant: "stone" | "emerald" | "amber" | "rose" | "sky" | "purple";
  description: string;
}[] = [
  {
    value: "SAVED",
    label: "Saved / Shortlisted",
    badgeVariant: "stone",
    description: "Bookmarked for future application consideration",
  },
  {
    value: "RECOMMENDED",
    label: "Faculty Recommended",
    badgeVariant: "purple",
    description: "Faculty mentor explicitly endorsed or suggested this position",
  },
  {
    value: "APPLIED",
    label: "Application Submitted",
    badgeVariant: "sky",
    description: "Student has dispatched formal application to the employer",
  },
  {
    value: "INTERVIEW",
    label: "Interview Scheduled",
    badgeVariant: "amber",
    description: "Candidate is undergoing technical, operational, or HR rounds",
  },
  {
    value: "SELECTED",
    label: "Offer Accepted / Placed",
    badgeVariant: "emerald",
    description: "Internship placement confirmed with official offer letter",
  },
  {
    value: "REJECTED",
    label: "Application Declined",
    badgeVariant: "rose",
    description: "Application closed without placement",
  },
  {
    value: "COMPLETED",
    label: "Internship Completed",
    badgeVariant: "emerald",
    description: "Attachment tenure concluded with performance review",
  },
];

// Strictly controlled status transition rules
export const VALID_STATUS_TRANSITIONS: Record<InternshipStatus, InternshipStatus[]> = {
  SAVED: ["RECOMMENDED", "APPLIED", "REJECTED"],
  RECOMMENDED: ["SAVED", "APPLIED", "REJECTED"],
  APPLIED: ["INTERVIEW", "SELECTED", "REJECTED"],
  INTERVIEW: ["SELECTED", "REJECTED", "APPLIED"],
  SELECTED: ["COMPLETED", "REJECTED"],
  REJECTED: ["APPLIED", "SAVED"],
  COMPLETED: [], // Terminal stage, can only update notes/evidence
};

export function isValidStatusTransition(
  currentStatus: InternshipStatus,
  targetStatus: InternshipStatus
): boolean {
  if (currentStatus === targetStatus) return true;
  const allowed = VALID_STATUS_TRANSITIONS[currentStatus] || [];
  return allowed.includes(targetStatus);
}

export interface InternshipOpportunityItem {
  id: string;
  organization: string;
  title: string;
  location: string | null;
  work_mode: WorkMode;
  description: string | null;
  requirements: string | null;
  application_deadline: string | null;
  application_url: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  pursuing_count?: number;
  students_pursuing?: Array<{
    internship_id: string;
    student_id: string;
    full_name: string;
    reg_no: string;
    status: InternshipStatus;
    applied_date: string | null;
  }>;
}

export interface StudentInternshipItem {
  id: string;
  student_id: string;
  student_name?: string;
  reg_no?: string;
  opportunity_id: string | null;
  opportunity?: {
    id: string;
    organization: string;
    title: string;
    location: string | null;
    work_mode: WorkMode;
    application_deadline: string | null;
    application_url: string | null;
  } | null;
  organization: string;
  role_description: string | null;
  status: InternshipStatus;
  applied_date: string | null;
  start_date: string | null;
  end_date: string | null;
  mentor_notes: string | null;
  is_verified: boolean;
  verified_by: string | null;
  verified_at: string | null;
  certificate_doc_id: string | null;
  certificate_document?: {
    id: string;
    title: string;
    storage_path: string;
    mime_type: string;
  } | null;
  provenance: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface OpportunityFilters {
  search?: string;
  status?: "all" | "active" | "closing_soon" | "archived";
  work_mode?: string;
}

export interface StudentInternshipFilters {
  student_id?: string;
  opportunity_id?: string;
  status?: InternshipStatus | "all";
  search?: string;
}

// Deterministic Deadline Calculation (No AI risk scores, strictly chronological)
export function getDeadlineDisplay(deadlineStr: string | null | undefined): {
  text: string;
  isPassed: boolean;
  isClosingSoon: boolean;
  formattedDate: string;
} {
  if (!deadlineStr) {
    return {
      text: "No deadline specified",
      isPassed: false,
      isClosingSoon: false,
      formattedDate: "Rolling",
    };
  }

  const deadlineDate = new Date(deadlineStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(deadlineDate);
  targetDate.setHours(0, 0, 0, 0);

  const diffMs = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const formattedDate = deadlineDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  if (diffDays < 0) {
    return {
      text: "Deadline passed",
      isPassed: true,
      isClosingSoon: false,
      formattedDate,
    };
  }

  if (diffDays === 0) {
    return {
      text: "Deadline today",
      isPassed: false,
      isClosingSoon: true,
      formattedDate,
    };
  }

  if (diffDays === 1) {
    return {
      text: "Due tomorrow",
      isPassed: false,
      isClosingSoon: true,
      formattedDate,
    };
  }

  if (diffDays <= 7) {
    return {
      text: `Due in ${diffDays} days`,
      isPassed: false,
      isClosingSoon: true,
      formattedDate,
    };
  }

  return {
    text: `Due in ${diffDays} days`,
    isPassed: false,
    isClosingSoon: false,
    formattedDate,
  };
}
