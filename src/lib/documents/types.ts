export type GeneralDocumentCategory =
  | "RESUME"
  | "AADHAAR_CARD"
  | "PAN_CARD"
  | "PASSPORT"
  | "DRIVING_LICENSE"
  | "ACADEMIC_DOCUMENT"
  | "CERTIFICATE"
  | "TRAINING_CERTIFICATE"
  | "ACHIEVEMENT"
  | "RECOMMENDATION_LETTER"
  | "OFFER_LETTER"
  | "IELTS_DOCUMENT"
  | "IMAT_DOCUMENT"
  | "DGCA_RESULT"
  | "MEDICAL_ASSESSMENT"
  | "OTHER";

export type InternshipDocumentCategory =
  | "INTERNSHIP_OFFER_LETTER"
  | "JOINING_LETTER"
  | "INTERNSHIP_AGREEMENT"
  | "INTERNSHIP_COMPLETION_CERTIFICATE"
  | "INTERNSHIP_EVALUATION_REPORT"
  | "INTERNSHIP_ATTENDANCE"
  | "INTERNSHIP_REPORT"
  | "INTERNSHIP_CERTIFICATE"
  | "OTHER";

export type DocumentCategory = GeneralDocumentCategory | InternshipDocumentCategory;

export interface DocumentCategoryMeta {
  value: DocumentCategory;
  label: string;
  scope: "general" | "internship" | "both";
  description?: string;
}

export const GENERAL_DOCUMENT_CATEGORIES: DocumentCategoryMeta[] = [
  { value: "RESUME", label: "Resume / CV", scope: "general" },
  { value: "ACADEMIC_DOCUMENT", label: "Academic Documents", scope: "general" },
  { value: "CERTIFICATE", label: "Certificates", scope: "general" },
  { value: "TRAINING_CERTIFICATE", label: "Training Certificates", scope: "general" },
  { value: "ACHIEVEMENT", label: "Achievements", scope: "general" },
  { value: "RECOMMENDATION_LETTER", label: "Recommendation Letters", scope: "general" },
  { value: "OFFER_LETTER", label: "Offer Letters", scope: "general" },
  { value: "IELTS_DOCUMENT", label: "IELTS Documents", scope: "general" },
  { value: "IMAT_DOCUMENT", label: "IMAT Documents", scope: "general" },
  { value: "AADHAAR_CARD", label: "Aadhaar Card", scope: "general" },
  { value: "PAN_CARD", label: "PAN Card", scope: "general" },
  { value: "PASSPORT", label: "Passport", scope: "general" },
  { value: "DRIVING_LICENSE", label: "Driving License", scope: "general" },
  { value: "DGCA_RESULT", label: "DGCA Exam Result", scope: "general" },
  { value: "MEDICAL_ASSESSMENT", label: "Medical Assessment", scope: "general" },
  { value: "OTHER", label: "Other Document", scope: "both" },
];

export const INTERNSHIP_DOCUMENT_CATEGORIES: DocumentCategoryMeta[] = [
  { value: "INTERNSHIP_OFFER_LETTER", label: "Offer Letter", scope: "internship" },
  { value: "JOINING_LETTER", label: "Joining Letter", scope: "internship" },
  { value: "INTERNSHIP_AGREEMENT", label: "Internship Agreement", scope: "internship" },
  { value: "INTERNSHIP_COMPLETION_CERTIFICATE", label: "Completion Certificate", scope: "internship" },
  { value: "INTERNSHIP_EVALUATION_REPORT", label: "Evaluation Report", scope: "internship" },
  { value: "INTERNSHIP_ATTENDANCE", label: "Attendance Record", scope: "internship" },
  { value: "INTERNSHIP_REPORT", label: "Internship Report", scope: "internship" },
  { value: "INTERNSHIP_CERTIFICATE", label: "Internship Certificate", scope: "internship" },
  { value: "OTHER", label: "Other", scope: "both" },
];

export const ALL_DOCUMENT_CATEGORIES: DocumentCategoryMeta[] = [
  ...GENERAL_DOCUMENT_CATEGORIES,
  ...INTERNSHIP_DOCUMENT_CATEGORIES.filter(
    (ic) => !GENERAL_DOCUMENT_CATEGORIES.some((gc) => gc.value === ic.value)
  ),
];

export function getCategoryLabel(category: string): string {
  const meta = ALL_DOCUMENT_CATEGORIES.find((c) => c.value === category);
  if (meta) return meta.label;
  return category.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export interface StudentDocumentItem {
  id: string;
  student_id: string;
  title: string;
  category: DocumentCategory | string;
  description: string | null;
  storage_path: string;
  file_size_bytes: number;
  mime_type: string;
  is_verified: boolean;
  verified_by: string | null;
  verified_at: string | null;
  uploaded_by: string | null;
  uploaded_at: string;
  internship_id: string | null;
  milestone_id: string | null;
  // Associated entity labels
  internship?: {
    id: string;
    organization: string;
    role_description?: string | null;
  } | null;
  milestone?: {
    id: string;
    title: string;
    category?: string | null;
  } | null;
  uploader?: {
    id: string;
    full_name: string;
    role: string;
  } | null;
}

export interface DocumentFilters {
  tab?: "all" | "general" | "internship" | "poa";
  category?: string;
  internship_id?: string;
  milestone_id?: string;
  search?: string;
  file_type?: string;
  date_from?: string;
  date_to?: string;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
