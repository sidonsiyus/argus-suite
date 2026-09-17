export type ResourceType =
  | "COURSE"
  | "DOCUMENT"
  | "TOOL"
  | "VIDEO"
  | "GUIDE"
  | "OFFICIAL_PORTAL"
  | "CERTIFICATION_PREP";

export const RESOURCE_TYPES: { value: ResourceType; label: string }[] = [
  { value: "GUIDE", label: "Guide & Handbook" },
  { value: "COURSE", label: "Course & Training" },
  { value: "DOCUMENT", label: "Official Document / Manual" },
  { value: "TOOL", label: "Software Tool & Simulator" },
  { value: "VIDEO", label: "Video Tutorial" },
  { value: "OFFICIAL_PORTAL", label: "Government / Aviation Portal" },
  { value: "CERTIFICATION_PREP", label: "Exam & Certification Prep" },
];

export const RESOURCE_CATEGORIES: { value: string; label: string }[] = [
  { value: "DGCA_EXAM_PREP", label: "DGCA Exam Preparation" },
  { value: "FLIGHT_TRAINING", label: "Flight Training & Simulators" },
  { value: "ACADEMICS", label: "Aeronautical Science Academics" },
  { value: "CAREER_GUIDE", label: "Aviation Career Guidance" },
  { value: "RESUME_INTERVIEW", label: "Airline Resume & Interview Prep" },
  { value: "TECHNICAL_MANUAL", label: "Aircraft Technical Manuals" },
  { value: "OTHER", label: "General Aviation Resources" },
];

export interface ResourceItem {
  id: string;
  title: string;
  description: string | null;
  resource_type: ResourceType;
  category: string;
  provider: string | null;
  url: string | null;
  tags: string[];
  is_public: boolean;
  is_active: boolean;
  provenance: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  usage_count?: number;
  linked_milestones?: Array<{
    id: string;
    title: string;
    status: string;
    student_id: string;
    student_name: string;
    reg_no: string;
  }>;
}

export interface ResourceFilters {
  search?: string;
  category?: string;
  type?: string;
  status?: "all" | "active" | "archived";
}
