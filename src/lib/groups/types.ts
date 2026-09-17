export type GroupCategory =
  | "CAREER"
  | "SKILLS"
  | "READINESS"
  | "DOCUMENTATION"
  | "INTERVIEW"
  | "INTERNSHIP"
  | "ACADEMIC_SUPPORT"
  | "LANGUAGE"
  | "PLACEMENT"
  | "OTHER";

export const GROUP_CATEGORIES: {
  value: GroupCategory;
  label: string;
  description: string;
}[] = [
  {
    value: "CAREER",
    label: "Career Track Guidance",
    description: "Targeted pathway mentorship for specific aviation roles and trajectories",
  },
  {
    value: "SKILLS",
    label: "Skills Development",
    description: "Technical aeronautical, flight simulation, and navigation proficiency support",
  },
  {
    value: "READINESS",
    label: "Readiness & Credentials",
    description: "Essential documentation, medical assessment, and passport compliance",
  },
  {
    value: "DOCUMENTATION",
    label: "Documentation & Clearances",
    description: "DGCA computer number, police clearance, and background verification assistance",
  },
  {
    value: "INTERVIEW",
    label: "Interview Preparation",
    description: "Airline panel interview, technical ground exam, and psychometric preparation",
  },
  {
    value: "INTERNSHIP",
    label: "Internship & Attachments",
    description: "Airport operations attachments, airline internships, and industry placement prep",
  },
  {
    value: "ACADEMIC_SUPPORT",
    label: "Academic & Ground School Support",
    description: "Targeted ground school tutoring for meteorology, navigation, and air regulations",
  },
  {
    value: "LANGUAGE",
    label: "Aviation English & Radio Telephony",
    description: "ICAO language proficiency, RTR(A) radio telephony, and phraseology coaching",
  },
  {
    value: "PLACEMENT",
    label: "Placement & Cadetship",
    description: "Airline cadet pilot programmes and graduate placement facilitation",
  },
  {
    value: "OTHER",
    label: "General Faculty Intervention",
    description: "Custom faculty-managed cohort intervention and peer support",
  },
];

export type GroupStatus = "ACTIVE" | "ARCHIVED";

export const GROUP_STATUSES: {
  value: GroupStatus;
  label: string;
}[] = [
  { value: "ACTIVE", label: "Active" },
  { value: "ARCHIVED", label: "Archived" },
];

export interface GroupItem {
  id: string;
  name: string;
  description: string | null;
  category: GroupCategory;
  status: GroupStatus;
  career_role_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  member_count?: number;
}

export interface GroupMemberItem {
  group_id: string;
  student_id: string;
  student_name: string;
  reg_no: string;
  career_goal?: string | null;
  joined_at: string;
  notes: string | null;
  created_by: string | null;
}

export interface GroupDetailItem extends GroupItem {
  members: GroupMemberItem[];
}

export interface GroupFilters {
  search?: string;
  category?: string;
  status?: "all" | "ACTIVE" | "ARCHIVED";
}

// Student 360 membership representation
export interface StudentGroupItem {
  group_id: string;
  group_name: string;
  category: GroupCategory;
  status: GroupStatus;
  joined_at: string;
  notes: string | null;
}
