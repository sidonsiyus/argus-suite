import { cache } from "react";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  InternshipOpportunityItem,
  StudentInternshipItem,
  OpportunityFilters,
  StudentInternshipFilters,
  WorkMode,
  InternshipStatus,
  isValidStatusTransition,
} from "@/lib/internships/types";

export * from "@/lib/internships/types";

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

// ---------------------------------------------------------------------------
// 1. OPPORTUNITY CATALOGUE
// ---------------------------------------------------------------------------

export const getInternshipOpportunities = cache(async function getInternshipOpportunities(
  filters?: OpportunityFilters
): Promise<InternshipOpportunityItem[]> {
  const supabase = createServerSupabase();

  let query = supabase
    .from("internship_opportunities")
    .select("*, internships(id, student_id, status)")
    .order("application_deadline", { ascending: true, nullsFirst: false });

  if (filters?.status === "active") {
    query = query.eq("is_active", true);
  } else if (filters?.status === "archived") {
    query = query.eq("is_active", false);
  }

  if (filters?.work_mode && filters.work_mode !== "all") {
    query = query.eq("work_mode", filters.work_mode);
  }

  const { data, error } = await query;

  if (error || !data) {
    console.error("Error fetching internship opportunities:", error);
    return [];
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let items: InternshipOpportunityItem[] = data.map((row: any) => {
    const pursuingList = Array.isArray(row.internships) ? row.internships : [];
    return {
      id: row.id,
      organization: row.organization,
      title: row.title,
      location: row.location || null,
      work_mode: (row.work_mode as WorkMode) || "ON_SITE",
      description: row.description || null,
      requirements: row.requirements || null,
      application_deadline: row.application_deadline || null,
      application_url: row.application_url || null,
      is_active: row.is_active ?? true,
      created_by: row.created_by || null,
      created_at: row.created_at,
      updated_at: row.updated_at || row.created_at,
      pursuing_count: pursuingList.length,
    };
  });

  // Closing soon filter (within next 7 days and active)
  if (filters?.status === "closing_soon") {
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    items = items.filter((item) => {
      if (!item.is_active || !item.application_deadline) return false;
      const d = new Date(item.application_deadline);
      return d >= today && d <= nextWeek;
    });
  }

  // Client-side text search (organization, title, location, description)
  if (filters?.search && filters.search.trim()) {
    const q = filters.search.trim().toLowerCase();
    items = items.filter(
      (item) =>
        item.organization.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        (item.location && item.location.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q))
    );
  }

  return items;
});

export async function getInternshipOpportunityById(
  id: string
): Promise<InternshipOpportunityItem | null> {
  const supabase = createServerSupabase();

  const { data, error } = await supabase
    .from("internship_opportunities")
    .select(`
      *,
      internships (
        id,
        student_id,
        status,
        applied_date,
        students (
          id,
          full_name,
          reg_no
        )
      )
    `)
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("Error fetching opportunity details:", error);
    return null;
  }

  const pursuingList = (data.internships || []).map((row: any) => ({
    internship_id: row.id,
    student_id: row.student_id,
    full_name: row.students?.full_name || "Cadet",
    reg_no: row.students?.reg_no || "",
    status: row.status as InternshipStatus,
    applied_date: row.applied_date || null,
  }));

  return {
    id: data.id,
    organization: data.organization,
    title: data.title,
    location: data.location || null,
    work_mode: (data.work_mode as WorkMode) || "ON_SITE",
    description: data.description || null,
    requirements: data.requirements || null,
    application_deadline: data.application_deadline || null,
    application_url: data.application_url || null,
    is_active: data.is_active ?? true,
    created_by: data.created_by || null,
    created_at: data.created_at,
    updated_at: data.updated_at || data.created_at,
    pursuing_count: pursuingList.length,
    students_pursuing: pursuingList,
  };
}

export async function executeCreateOpportunity(input: {
  organization: string;
  title: string;
  location?: string;
  work_mode?: WorkMode;
  description?: string;
  requirements?: string;
  application_deadline?: string;
  application_url?: string;
}): Promise<{ success: boolean; opportunityId?: string; error?: string }> {
  const { supabase, user } = await getAuthenticatedFaculty();

  const org = input.organization.trim();
  const title = input.title.trim();
  if (!org || !title) {
    return { success: false, error: "Organization and Title are required." };
  }

  const { data, error } = await supabase
    .from("internship_opportunities")
    .insert({
      organization: org,
      title,
      location: input.location?.trim() || null,
      work_mode: input.work_mode || "ON_SITE",
      description: input.description?.trim() || null,
      requirements: input.requirements?.trim() || null,
      application_deadline: input.application_deadline || null,
      application_url: input.application_url?.trim() || null,
      is_active: true,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("Error creating opportunity:", error);
    return { success: false, error: "Failed to create internship opportunity." };
  }

  // Audit log
  await supabase.from("audit_logs").insert({
    entity_table: "internship_opportunities",
    entity_id: data.id,
    action: "INSERT",
    actor_id: user.id,
    actor_role: "faculty",
    new_values: { organization: org, title, work_mode: input.work_mode || "ON_SITE" },
  });

  return { success: true, opportunityId: data.id };
}

export async function executeUpdateOpportunity(
  id: string,
  input: {
    organization: string;
    title: string;
    location?: string;
    work_mode?: WorkMode;
    description?: string;
    requirements?: string;
    application_deadline?: string;
    application_url?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const { supabase, user } = await getAuthenticatedFaculty();

  const org = input.organization.trim();
  const title = input.title.trim();
  if (!org || !title) {
    return { success: false, error: "Organization and Title are required." };
  }

  const { error } = await supabase
    .from("internship_opportunities")
    .update({
      organization: org,
      title,
      location: input.location?.trim() || null,
      work_mode: input.work_mode || "ON_SITE",
      description: input.description?.trim() || null,
      requirements: input.requirements?.trim() || null,
      application_deadline: input.application_deadline || null,
      application_url: input.application_url?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating opportunity:", error);
    return { success: false, error: "Failed to update opportunity." };
  }

  // Audit log
  await supabase.from("audit_logs").insert({
    entity_table: "internship_opportunities",
    entity_id: id,
    action: "UPDATE",
    actor_id: user.id,
    actor_role: "faculty",
    new_values: { organization: org, title },
  });

  return { success: true };
}

export async function executeArchiveOpportunity(
  id: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  const { supabase, user } = await getAuthenticatedFaculty();

  const { error } = await supabase
    .from("internship_opportunities")
    .update({
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Error archiving/restoring opportunity:", error);
    return { success: false, error: "Failed to update opportunity status." };
  }

  // Audit log
  await supabase.from("audit_logs").insert({
    entity_table: "internship_opportunities",
    entity_id: id,
    action: "UPDATE",
    actor_id: user.id,
    actor_role: "faculty",
    new_values: { is_active: isActive, status_change: isActive ? "RESTORED" : "ARCHIVED" },
  });

  return { success: true };
}

// ---------------------------------------------------------------------------
// 2. STUDENT INTERNSHIP PURSUITS
// ---------------------------------------------------------------------------

export const getStudentInternships = cache(async function getStudentInternships(
  filters?: StudentInternshipFilters
): Promise<StudentInternshipItem[]> {
  const supabase = createServerSupabase();

  let query = supabase
    .from("internships")
    .select(`
      *,
      students (id, full_name, reg_no),
      internship_opportunities (id, organization, title, location, work_mode, application_deadline, application_url),
      student_documents:internships_certificate_doc_id_fkey (id, title, storage_path, mime_type)
    `)
    .order("created_at", { ascending: false });

  if (filters?.student_id) {
    query = query.eq("student_id", filters.student_id);
  }

  if (filters?.opportunity_id) {
    query = query.eq("opportunity_id", filters.opportunity_id);
  }

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;

  if (error || !data) {
    console.error("Error fetching student internships:", error);
    return [];
  }

  let items: StudentInternshipItem[] = data.map((row: any) => ({
    id: row.id,
    student_id: row.student_id,
    student_name: row.students?.full_name || "Cadet",
    reg_no: row.students?.reg_no || "",
    opportunity_id: row.opportunity_id || null,
    opportunity: row.internship_opportunities
      ? {
          id: row.internship_opportunities.id,
          organization: row.internship_opportunities.organization,
          title: row.internship_opportunities.title,
          location: row.internship_opportunities.location || null,
          work_mode: row.internship_opportunities.work_mode || "ON_SITE",
          application_deadline: row.internship_opportunities.application_deadline || null,
          application_url: row.internship_opportunities.application_url || null,
        }
      : null,
    organization: row.organization,
    role_description: row.role_description || null,
    status: (row.status as InternshipStatus) || "APPLIED",
    applied_date: row.applied_date || null,
    start_date: row.start_date || null,
    end_date: row.end_date || null,
    mentor_notes: row.mentor_notes || null,
    is_verified: row.is_verified ?? false,
    verified_by: row.verified_by || null,
    verified_at: row.verified_at || null,
    certificate_doc_id: row.certificate_doc_id || null,
    certificate_document: row.student_documents
      ? {
          id: row.student_documents.id,
          title: row.student_documents.title,
          storage_path: row.student_documents.storage_path,
          mime_type: row.student_documents.mime_type,
        }
      : null,
    provenance: row.provenance || "MENTOR_ENTERED",
    created_by: row.created_by || null,
    created_at: row.created_at,
    updated_at: row.updated_at || row.created_at,
  }));

  // Text search filter
  if (filters?.search && filters.search.trim()) {
    const q = filters.search.trim().toLowerCase();
    items = items.filter(
      (item) =>
        item.organization.toLowerCase().includes(q) ||
        (item.role_description && item.role_description.toLowerCase().includes(q)) ||
        (item.student_name && item.student_name.toLowerCase().includes(q)) ||
        (item.reg_no && item.reg_no.toLowerCase().includes(q)) ||
        (item.mentor_notes && item.mentor_notes.toLowerCase().includes(q))
    );
  }

  return items;
});

export async function getStudentInternshipsByStudentId(
  studentId: string
): Promise<StudentInternshipItem[]> {
  return getStudentInternships({ student_id: studentId });
}

export async function executeRecordStudentInternship(
  studentId: string,
  input: {
    opportunity_id?: string | null;
    organization?: string;
    role_description?: string;
    status?: InternshipStatus;
    applied_date?: string;
    start_date?: string;
    end_date?: string;
    mentor_notes?: string;
    certificate_doc_id?: string;
  }
): Promise<{ success: boolean; internshipId?: string; error?: string }> {
  const { supabase, user } = await getAuthenticatedFaculty();

  let organization = input.organization?.trim();
  let roleDescription = input.role_description?.trim();

  // If linked to an existing catalogue opportunity and fields weren't explicitly supplied, populate from catalogue
  if (input.opportunity_id) {
    const { data: opp, error: oppErr } = await supabase
      .from("internship_opportunities")
      .select("organization, title")
      .eq("id", input.opportunity_id)
      .single();

    if (!oppErr && opp) {
      if (!organization) organization = opp.organization;
      if (!roleDescription) roleDescription = opp.title;
    }
  }

  if (!organization) {
    return { success: false, error: "Organization name is required." };
  }

  const initialStatus = input.status || "APPLIED";

  const { data, error } = await supabase
    .from("internships")
    .insert({
      student_id: studentId,
      opportunity_id: input.opportunity_id || null,
      organization,
      role_description: roleDescription || null,
      status: initialStatus,
      applied_date: input.applied_date || new Date().toISOString().split("T")[0],
      start_date: input.start_date || null,
      end_date: input.end_date || null,
      mentor_notes: input.mentor_notes?.trim() || null,
      certificate_doc_id: input.certificate_doc_id || null,
      is_verified: false,
      provenance: "MENTOR_ENTERED",
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("Error recording student internship:", error);
    return { success: false, error: "Failed to record student internship." };
  }

  // Audit log
  await supabase.from("audit_logs").insert({
    entity_table: "internships",
    entity_id: data.id,
    action: "INSERT",
    actor_id: user.id,
    actor_role: "faculty",
    new_values: {
      student_id: studentId,
      opportunity_id: input.opportunity_id || null,
      organization,
      status: initialStatus,
    },
  });

  return { success: true, internshipId: data.id };
}

export async function executeUpdateStudentInternshipStatus(
  internshipId: string,
  targetStatus: InternshipStatus,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  const { supabase, user } = await getAuthenticatedFaculty();

  const { data: existing, error: fetchErr } = await supabase
    .from("internships")
    .select("id, status, mentor_notes")
    .eq("id", internshipId)
    .single();

  if (fetchErr || !existing) {
    return { success: false, error: "Internship record not found." };
  }

  const currentStatus = existing.status as InternshipStatus;

  // Enforce controlled status transitions
  if (!isValidStatusTransition(currentStatus, targetStatus)) {
    return {
      success: false,
      error: `Invalid status transition from ${currentStatus} to ${targetStatus}.`,
    };
  }

  const updatedNotes = notes !== undefined ? notes.trim() : existing.mentor_notes;

  const { error } = await supabase
    .from("internships")
    .update({
      status: targetStatus,
      mentor_notes: updatedNotes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", internshipId);

  if (error) {
    console.error("Error updating internship status:", error);
    return { success: false, error: "Failed to update internship status." };
  }

  // Audit log with STATUS_TRANSITION action
  await supabase.from("audit_logs").insert({
    entity_table: "internships",
    entity_id: internshipId,
    action: "STATUS_TRANSITION",
    actor_id: user.id,
    actor_role: "faculty",
    old_values: { status: currentStatus },
    new_values: { status: targetStatus, mentor_notes: updatedNotes },
  });

  return { success: true };
}

export async function executeUpdateStudentInternship(
  internshipId: string,
  input: {
    organization?: string;
    role_description?: string;
    applied_date?: string;
    start_date?: string;
    end_date?: string;
    mentor_notes?: string;
    certificate_doc_id?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const { supabase, user } = await getAuthenticatedFaculty();

  const updatePayload: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (input.organization !== undefined) updatePayload.organization = input.organization.trim();
  if (input.role_description !== undefined) updatePayload.role_description = input.role_description.trim() || null;
  if (input.applied_date !== undefined) updatePayload.applied_date = input.applied_date || null;
  if (input.start_date !== undefined) updatePayload.start_date = input.start_date || null;
  if (input.end_date !== undefined) updatePayload.end_date = input.end_date || null;
  if (input.mentor_notes !== undefined) updatePayload.mentor_notes = input.mentor_notes.trim() || null;
  if (input.certificate_doc_id !== undefined) updatePayload.certificate_doc_id = input.certificate_doc_id || null;

  const { error } = await supabase
    .from("internships")
    .update(updatePayload)
    .eq("id", internshipId);

  if (error) {
    console.error("Error updating student internship details:", error);
    return { success: false, error: "Failed to update internship details." };
  }

  // Audit log
  await supabase.from("audit_logs").insert({
    entity_table: "internships",
    entity_id: internshipId,
    action: "UPDATE",
    actor_id: user.id,
    actor_role: "faculty",
    new_values: updatePayload,
  });

  return { success: true };
}

export async function executeAttachCompletionDocument(
  internshipId: string,
  documentId: string
): Promise<{ success: boolean; error?: string }> {
  const { supabase, user } = await getAuthenticatedFaculty();

  const now = new Date().toISOString();

  const { error } = await supabase
    .from("internships")
    .update({
      certificate_doc_id: documentId,
      is_verified: true,
      verified_by: user.id,
      verified_at: now,
      provenance: "VERIFIED",
      updated_at: now,
    })
    .eq("id", internshipId);

  if (error) {
    console.error("Error attaching internship completion certificate:", error);
    return { success: false, error: "Failed to attach completion certificate." };
  }

  // Audit log
  await supabase.from("audit_logs").insert({
    entity_table: "internships",
    entity_id: internshipId,
    action: "VERIFY_DOCUMENT",
    actor_id: user.id,
    actor_role: "faculty",
    new_values: {
      certificate_doc_id: documentId,
      is_verified: true,
      provenance: "VERIFIED",
    },
  });

  return { success: true };
}

export async function executeDeleteStudentInternship(
  internshipId: string
): Promise<{ success: boolean; error?: string }> {
  const { supabase, user } = await getAuthenticatedFaculty();

  const { data: existing, error: fetchErr } = await supabase
    .from("internships")
    .select("id, organization, student_id")
    .eq("id", internshipId)
    .single();

  if (fetchErr || !existing) {
    return { success: false, error: "Internship record not found." };
  }

  const { error } = await supabase
    .from("internships")
    .delete()
    .eq("id", internshipId);

  if (error) {
    console.error("Error deleting student internship:", error);
    return { success: false, error: "Failed to delete internship record." };
  }

  // Audit log
  await supabase.from("audit_logs").insert({
    entity_table: "internships",
    entity_id: internshipId,
    action: "DELETE",
    actor_id: user.id,
    actor_role: "faculty",
    old_values: {
      student_id: existing.student_id,
      organization: existing.organization,
    },
  });

  return { success: true };
}
