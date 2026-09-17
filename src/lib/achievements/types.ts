export type AchievementCategory =
  | "CERTIFICATION"
  | "COMPETITION"
  | "PROJECT"
  | "WORKSHOP"
  | "DGCA_EXAM"
  | "ATHLETICS"
  | "LEADERSHIP"
  | "ACADEMIC_HONOR"
  | "OTHER";

export const ACHIEVEMENT_CATEGORIES: { value: AchievementCategory; label: string }[] = [
  { value: "CERTIFICATION", label: "Professional & Flight Certification" },
  { value: "DGCA_EXAM", label: "DGCA Examination Cleared" },
  { value: "COMPETITION", label: "Aviation Competition / Hackathon" },
  { value: "PROJECT", label: "Aeronautical Research / Capstone Project" },
  { value: "WORKSHOP", label: "Industry Workshop / Symposium" },
  { value: "LEADERSHIP", label: "Student Leadership / Club Responsibility" },
  { value: "ACADEMIC_HONOR", label: "Academic Distinction / Dean's Honor" },
  { value: "ATHLETICS", label: "Sports & Athletics Achievement" },
  { value: "OTHER", label: "Other Recognized Achievement" },
];

export interface AchievementItem {
  id: string;
  student_id: string;
  student_name?: string;
  reg_no?: string;
  title: string;
  category: AchievementCategory;
  description: string | null;
  issued_by: string | null;
  date_achieved: string | null;
  notes: string | null;
  certificate_doc_id: string | null;
  certificate_document?: {
    id: string;
    title: string;
    storage_path: string;
    mime_type: string;
  } | null;
  is_verified: boolean;
  verified_by: string | null;
  verified_at: string | null;
  created_by: string | null;
  provenance: string;
  created_at: string;
  updated_at: string;
}

export interface AchievementFilters {
  student_id?: string;
  category?: string;
  status?: "all" | "verified" | "unverified";
  search?: string;
}
