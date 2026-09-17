import { cache } from "react";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  AchievementItem,
  AchievementFilters,
  AchievementCategory,
} from "@/lib/achievements/types";

export * from "@/lib/achievements/types";

// Authoritative server-side identity & faculty authorization check
export async function getAuthenticatedFaculty() {
  const supabase = createServerSupabase();

  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr || !user) {
    throw new Error("Unauthorized. Faculty mentor authentication is required.");
  }

  const { data: profile, error: profErr } = await supabase
    .from("profiles")
    .select("id, role, full_name")
    .eq("id", user.id)
    .single();

  if (profErr || !profile || (profile.role !== "instructor" && profile.role !== "admin")) {
    throw new Error("Unauthorized. User does not possess authorized faculty credentials.");
  }

  return { supabase, user, profile };
}

// 1. Get Achievements with optional filtering and search
export const getAchievements = cache(async function getAchievements(filters?: AchievementFilters): Promise<AchievementItem[]> {
  const supabase = createServerSupabase();

  let query = supabase
    .from("achievements")
    .select("*, students(id, full_name, reg_no), student_documents(id, title, storage_path, mime_type)")
    .order("date_achieved", { ascending: false });

  if (filters?.student_id) {
    query = query.eq("student_id", filters.student_id);
  }

  if (filters?.category && filters.category !== "all") {
    query = query.eq("category", filters.category);
  }

  if (filters?.status === "verified") {
    query = query.eq("is_verified", true);
  } else if (filters?.status === "unverified") {
    query = query.eq("is_verified", false);
  }

  const { data, error } = await query;

  if (error || !data) {
    console.error("Error querying achievements:", error);
    return [];
  }

  let items: AchievementItem[] = data.map((row: any) => ({
    id: row.id,
    student_id: row.student_id,
    student_name: row.students?.full_name || "Unknown Cadet",
    reg_no: row.students?.reg_no || "",
    title: row.title,
    category: row.category as AchievementCategory,
    description: row.description || row.notes || null,
    issued_by: row.issued_by || null,
    date_achieved: row.date_achieved || null,
    notes: row.notes || null,
    certificate_doc_id: row.certificate_doc_id || null,
    certificate_document: row.student_documents
      ? {
          id: row.student_documents.id,
          title: row.student_documents.title,
          storage_path: row.student_documents.storage_path,
          mime_type: row.student_documents.mime_type,
        }
      : null,
    is_verified: row.is_verified ?? false,
    verified_by: row.verified_by || null,
    verified_at: row.verified_at || null,
    created_by: row.created_by || null,
    provenance: row.provenance || "MENTOR_ENTERED",
    created_at: row.created_at,
    updated_at: row.updated_at || row.created_at,
  }));

  // Client-side / in-memory search for multi-field filtering (title, issued_by, cadet name, reg_no)
  if (filters?.search && filters.search.trim()) {
    const q = filters.search.trim().toLowerCase();
    items = items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.issued_by && item.issued_by.toLowerCase().includes(q)) ||
        (item.student_name && item.student_name.toLowerCase().includes(q)) ||
        (item.reg_no && item.reg_no.toLowerCase().includes(q))
    );
  }

  return items;
});

// 2. Fast lookup for Student 360 achievements panel
export async function getAchievementsByStudentId(studentId: string): Promise<AchievementItem[]> {
  return getAchievements({ student_id: studentId });
}

// 3. Fetch cadet's available uploaded documents to attach as supporting evidence
export async function getAvailableDocumentsForStudent(
  studentId: string
): Promise<Array<{ id: string; title: string; category: string }>> {
  const supabase = createServerSupabase();

  const { data, error } = await supabase
    .from("student_documents")
    .select("id, title, category")
    .eq("student_id", studentId)
    .order("uploaded_at", { ascending: false });

  if (error || !data) return [];
  return data;
}

// 4. Create Achievement
export async function executeCreateAchievement(
  studentId: string,
  input: {
    title: string;
    category: AchievementCategory;
    description?: string;
    issued_by?: string;
    date_achieved?: string;
    certificate_doc_id?: string;
  }
): Promise<{ success: boolean; achievementId?: string; error?: string }> {
  const { supabase, user } = await getAuthenticatedFaculty();

  const title = input.title.trim();
  if (!title) {
    return { success: false, error: "Achievement title is required." };
  }

  // Verify cadet exists
  const { data: student, error: sErr } = await supabase
    .from("students")
    .select("id")
    .eq("id", studentId)
    .single();

  if (sErr || !student) {
    return { success: false, error: "Cadet record not found." };
  }

  const { data, error } = await supabase
    .from("achievements")
    .insert({
      student_id: studentId,
      title,
      category: input.category,
      description: input.description?.trim() || null,
      notes: input.description?.trim() || null,
      issued_by: input.issued_by?.trim() || null,
      date_achieved: input.date_achieved || null,
      certificate_doc_id: input.certificate_doc_id || null,
      is_verified: false,
      created_by: user.id,
      provenance: "MENTOR_ENTERED",
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("Error creating achievement:", error);
    return { success: false, error: "Failed to record achievement." };
  }

  // Audit log (Zero secrets, server-derived actor)
  await supabase.from("audit_logs").insert({
    entity_table: "achievements",
    entity_id: data.id,
    action: "INSERT",
    actor_id: user.id,
    actor_role: "faculty",
    new_values: {
      student_id: studentId,
      title,
      category: input.category,
      issued_by: input.issued_by,
      date_achieved: input.date_achieved,
    },
  });

  return { success: true, achievementId: data.id };
}

// 5. Update Achievement
export async function executeUpdateAchievement(
  id: string,
  input: {
    title: string;
    category: AchievementCategory;
    description?: string;
    issued_by?: string;
    date_achieved?: string;
    certificate_doc_id?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const { supabase, user } = await getAuthenticatedFaculty();

  const title = input.title.trim();
  if (!title) {
    return { success: false, error: "Achievement title is required." };
  }

  const { error } = await supabase
    .from("achievements")
    .update({
      title,
      category: input.category,
      description: input.description?.trim() || null,
      notes: input.description?.trim() || null,
      issued_by: input.issued_by?.trim() || null,
      date_achieved: input.date_achieved || null,
      certificate_doc_id: input.certificate_doc_id || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating achievement:", error);
    return { success: false, error: "Failed to update achievement." };
  }

  // Audit log
  await supabase.from("audit_logs").insert({
    entity_table: "achievements",
    entity_id: id,
    action: "UPDATE",
    actor_id: user.id,
    actor_role: "faculty",
    new_values: {
      title,
      category: input.category,
      updated_at: new Date().toISOString(),
    },
  });

  return { success: true };
}

// 6. Verify Achievement (Explicit Mentor Action)
// Crucial: Updates achievement provenance to 'VERIFIED' and populates verified_by & verified_at
// Strictly leaves skill_assessments, career_readiness, and milestones UNMODIFIED.
export async function executeVerifyAchievement(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const { supabase, user } = await getAuthenticatedFaculty();

  const now = new Date().toISOString();

  const { error } = await supabase
    .from("achievements")
    .update({
      is_verified: true,
      verified_by: user.id,
      verified_at: now,
      provenance: "VERIFIED",
      updated_at: now,
    })
    .eq("id", id);

  if (error) {
    console.error("Error verifying achievement:", error);
    return { success: false, error: "Failed to verify achievement." };
  }

  // Audit log
  await supabase.from("audit_logs").insert({
    entity_table: "achievements",
    entity_id: id,
    action: "VERIFY_DOCUMENT",
    actor_id: user.id,
    actor_role: "faculty",
    new_values: {
      is_verified: true,
      verified_by: user.id,
      verified_at: now,
      provenance: "VERIFIED",
    },
  });

  return { success: true };
}

// 7. Delete Achievement
export async function executeDeleteAchievement(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const { supabase, user } = await getAuthenticatedFaculty();

  const { error } = await supabase.from("achievements").delete().eq("id", id);

  if (error) {
    console.error("Error deleting achievement:", error);
    return { success: false, error: "Failed to delete achievement." };
  }

  // Audit log
  await supabase.from("audit_logs").insert({
    entity_table: "achievements",
    entity_id: id,
    action: "DELETE",
    actor_id: user.id,
    actor_role: "faculty",
    old_values: { id },
  });

  return { success: true };
}
