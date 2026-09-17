import { cache } from "react";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  StudentDocumentItem,
  DocumentFilters,
} from "@/lib/documents/types";

export * from "@/lib/documents/types";

export const getStudentDocuments = cache(async function getStudentDocuments(
  studentId: string,
  filters?: DocumentFilters
): Promise<StudentDocumentItem[]> {
  try {
    const supabase = createServerSupabase();

    if (!studentId) return [];

    let query = supabase
      .from("student_documents")
      .select(`
        *,
        internships:student_documents_internship_id_fkey (id, organization, role_description),
        milestones:student_documents_milestone_id_fkey (id, title, category)
      `)
      .eq("student_id", studentId)
      .order("uploaded_at", { ascending: false });

    if (filters?.internship_id) {
      query = query.eq("internship_id", filters.internship_id);
    }

    if (filters?.milestone_id) {
      query = query.eq("milestone_id", filters.milestone_id);
    }

    if (filters?.category && filters.category !== "ALL") {
      query = query.eq("category", filters.category);
    }

    if (filters?.tab === "general") {
      query = query.is("internship_id", null);
    } else if (filters?.tab === "internship") {
      query = query.not("internship_id", "is", null);
    } else if (filters?.tab === "poa") {
      query = query.not("milestone_id", "is", null);
    }

    const { data, error } = await query;

    if (error) {
      console.error("getStudentDocuments query error:", error);
      return [];
    }

    const rawRows = data || [];

    // Collect distinct uploader IDs to fetch names from profiles
    const uploaderIds = Array.from(
      new Set(rawRows.map((r: any) => r.uploaded_by).filter(Boolean))
    );

    let profileMap: Record<string, { id: string; full_name: string; role: string }> = {};
    if (uploaderIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, role")
        .in("id", uploaderIds);

      if (profiles) {
        for (const p of profiles) {
          profileMap[p.id] = p;
        }
      }
    }

    let documents: StudentDocumentItem[] = rawRows.map((row: any) => ({
      id: row.id,
      student_id: row.student_id,
      title: row.title,
      category: row.category,
      description: row.description || null,
      storage_path: row.storage_path,
      file_size_bytes: Number(row.file_size_bytes) || 0,
      mime_type: row.mime_type,
      is_verified: row.is_verified ?? false,
      verified_by: row.verified_by || null,
      verified_at: row.verified_at || null,
      uploaded_by: row.uploaded_by || null,
      uploaded_at: row.uploaded_at,
      internship_id: row.internship_id || null,
      milestone_id: row.milestone_id || null,
      internship: row.internships
        ? {
            id: row.internships.id,
            organization: row.internships.organization,
            role_description: row.internships.role_description,
          }
        : null,
      milestone: row.milestones
        ? {
            id: row.milestones.id,
            title: row.milestones.title,
            category: row.milestones.category,
          }
        : null,
      uploader: row.uploaded_by ? profileMap[row.uploaded_by] || null : null,
    }));

    // In-memory text search filtering
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      documents = documents.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          (d.description && d.description.toLowerCase().includes(q))
      );
    }

    // In-memory file type filtering
    if (filters?.file_type && filters.file_type !== "ALL") {
      documents = documents.filter((d) =>
        d.mime_type.toLowerCase().includes(filters.file_type!.toLowerCase())
      );
    }

    return documents;
  } catch (err) {
    console.error("getStudentDocuments exception:", err);
    return [];
  }
});
