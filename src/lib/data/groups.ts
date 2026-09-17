import { cache } from "react";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  GroupItem,
  GroupDetailItem,
  GroupMemberItem,
  StudentGroupItem,
  GroupFilters,
  GroupCategory,
  GroupStatus,
} from "@/lib/groups/types";

export * from "@/lib/groups/types";

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

// 1. Get Groups List with Filtering and Member Count
export const getGroups = cache(async function getGroups(filters?: GroupFilters): Promise<GroupItem[]> {
  const supabase = createServerSupabase();

  let query = supabase
    .from("groups")
    .select("*, group_members(student_id)")
    .order("created_at", { ascending: false });

  if (filters?.status === "ACTIVE") {
    query = query.eq("status", "ACTIVE");
  } else if (filters?.status === "ARCHIVED") {
    query = query.eq("status", "ARCHIVED");
  }

  if (filters?.category && filters.category !== "all") {
    query = query.eq("category", filters.category);
  }

  const { data, error } = await query;

  if (error || !data) {
    console.error("Error fetching groups:", error);
    return [];
  }

  let items: GroupItem[] = data.map((row: any) => {
    const membersList = Array.isArray(row.group_members) ? row.group_members : [];
    return {
      id: row.id,
      name: row.name,
      description: row.description || null,
      category: (row.category as GroupCategory) || "OTHER",
      status: (row.status as GroupStatus) || "ACTIVE",
      career_role_id: row.career_role_id || null,
      created_by: row.created_by || null,
      created_at: row.created_at,
      updated_at: row.updated_at || row.created_at,
      member_count: membersList.length,
    };
  });

  // Client-side search by group name or description
  if (filters?.search && filters.search.trim()) {
    const q = filters.search.trim().toLowerCase();
    items = items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q))
    );
  }

  return items;
});

// 2. Get Group Detail with Student Roster
export const getGroupById = cache(async function getGroupById(id: string): Promise<GroupDetailItem | null> {
  const supabase = createServerSupabase();

  const { data, error } = await supabase
    .from("groups")
    .select(`
      *,
      group_members (
        group_id,
        student_id,
        joined_at,
        added_at,
        notes,
        created_by,
        students (
          id,
          full_name,
          reg_no,
          student_career_goals (
            custom_role_title,
            career_roles (title)
          )
        )
      )
    `)
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("Error fetching group detail:", error);
    return null;
  }

  const members: GroupMemberItem[] = (data.group_members || []).map((gm: any) => {
    const student = gm.students || {};
    const goals = student.student_career_goals || [];
    const primaryGoal = goals[0];
    const goalTitle =
      primaryGoal?.career_roles?.title ||
      primaryGoal?.custom_role_title ||
      "Aviation Track";

    return {
      group_id: gm.group_id,
      student_id: gm.student_id,
      student_name: student.full_name || "Unknown Cadet",
      reg_no: student.reg_no || "",
      career_goal: goalTitle,
      joined_at: gm.joined_at || gm.added_at || data.created_at,
      notes: gm.notes || null,
      created_by: gm.created_by || null,
    };
  });

  return {
    id: data.id,
    name: data.name,
    description: data.description || null,
    category: (data.category as GroupCategory) || "OTHER",
    status: (data.status as GroupStatus) || "ACTIVE",
    career_role_id: data.career_role_id || null,
    created_by: data.created_by || null,
    created_at: data.created_at,
    updated_at: data.updated_at || data.created_at,
    member_count: members.length,
    members,
  };
});

// 3. Get Student's Functional Groups (For Student 360)
export async function getStudentGroups(studentId: string): Promise<StudentGroupItem[]> {
  const supabase = createServerSupabase();

  const { data, error } = await supabase
    .from("group_members")
    .select(`
      group_id,
      joined_at,
      added_at,
      notes,
      groups (
        id,
        name,
        category,
        status
      )
    `)
    .eq("student_id", studentId);

  if (error || !data) {
    console.error("Error fetching student groups:", error);
    return [];
  }

  return data
    .filter((row: any) => row.groups !== null)
    .map((row: any) => ({
      group_id: row.group_id,
      group_name: row.groups.name,
      category: (row.groups.category as GroupCategory) || "OTHER",
      status: (row.groups.status as GroupStatus) || "ACTIVE",
      joined_at: row.joined_at || row.added_at || new Date().toISOString(),
      notes: row.notes || null,
    }));
}

// 4. Create Group
export async function executeCreateGroup(input: {
  name: string;
  category?: GroupCategory;
  description?: string;
}): Promise<{ success: boolean; groupId?: string; error?: string }> {
  const { supabase, user } = await getAuthenticatedFaculty();

  const name = input.name.trim();
  if (!name) {
    return { success: false, error: "Group name is required." };
  }

  const category = input.category || "OTHER";

  const { data, error } = await supabase
    .from("groups")
    .insert({
      name,
      category,
      description: input.description?.trim() || null,
      status: "ACTIVE",
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("Error creating group:", error);
    return { success: false, error: "Failed to create group." };
  }

  // Audit log
  await supabase.from("audit_logs").insert({
    entity_table: "groups",
    entity_id: data.id,
    action: "INSERT",
    actor_id: user.id,
    actor_role: "faculty",
    new_values: { name, category },
  });

  return { success: true, groupId: data.id };
}

// 5. Update Group
export async function executeUpdateGroup(
  id: string,
  input: {
    name: string;
    category?: GroupCategory;
    description?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const { supabase, user } = await getAuthenticatedFaculty();

  const name = input.name.trim();
  if (!name) {
    return { success: false, error: "Group name is required." };
  }

  const updatePayload: Record<string, any> = {
    name,
    description: input.description?.trim() || null,
    updated_at: new Date().toISOString(),
  };

  if (input.category) {
    updatePayload.category = input.category;
  }

  const { error } = await supabase.from("groups").update(updatePayload).eq("id", id);

  if (error) {
    console.error("Error updating group:", error);
    return { success: false, error: "Failed to update group." };
  }

  // Audit log
  await supabase.from("audit_logs").insert({
    entity_table: "groups",
    entity_id: id,
    action: "UPDATE",
    actor_id: user.id,
    actor_role: "faculty",
    new_values: updatePayload,
  });

  return { success: true };
}

// 6. Archive / Restore Group (Non-Destructive)
export async function executeArchiveGroup(
  id: string,
  status: GroupStatus
): Promise<{ success: boolean; error?: string }> {
  const { supabase, user } = await getAuthenticatedFaculty();

  const { error } = await supabase
    .from("groups")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Error archiving/restoring group:", error);
    return { success: false, error: "Failed to update group status." };
  }

  // Audit log
  await supabase.from("audit_logs").insert({
    entity_table: "groups",
    entity_id: id,
    action: "UPDATE",
    actor_id: user.id,
    actor_role: "faculty",
    new_values: { status, transition: status === "ARCHIVED" ? "ARCHIVE" : "RESTORE" },
  });

  return { success: true };
}

// 7. Add Students to Group (Multi-Student Support & Duplicate Prevention)
export async function executeAddStudentsToGroup(
  groupId: string,
  studentIds: string[],
  notes?: string
): Promise<{ success: boolean; addedCount?: number; error?: string }> {
  const { supabase, user } = await getAuthenticatedFaculty();

  if (!groupId || !studentIds || studentIds.length === 0) {
    return { success: false, error: "Group ID and student selections are required." };
  }

  // Query existing memberships to prevent duplicates
  const { data: existing, error: fetchErr } = await supabase
    .from("group_members")
    .select("student_id")
    .eq("group_id", groupId);

  if (fetchErr) {
    console.error("Error checking existing members:", fetchErr);
    return { success: false, error: "Failed to verify group membership." };
  }

  const existingSet = new Set((existing || []).map((row: any) => row.student_id));
  const newStudentIds = studentIds.filter((sid) => !existingSet.has(sid));

  if (newStudentIds.length === 0) {
    return { success: true, addedCount: 0 };
  }

  const now = new Date().toISOString();
  const insertRows = newStudentIds.map((sid) => ({
    group_id: groupId,
    student_id: sid,
    joined_at: now,
    added_at: now,
    notes: notes?.trim() || null,
    created_by: user.id,
    updated_at: now,
  }));

  const { error: insertErr } = await supabase.from("group_members").insert(insertRows);

  if (insertErr) {
    console.error("Error adding students to group:", insertErr);
    return { success: false, error: "Failed to add students to group." };
  }

  // Audit log
  await supabase.from("audit_logs").insert({
    entity_table: "group_members",
    entity_id: groupId,
    action: "INSERT",
    actor_id: user.id,
    actor_role: "faculty",
    new_values: {
      added_students_count: newStudentIds.length,
      student_ids: newStudentIds,
      operation: "GROUP_MEMBER_ADD",
    },
  });

  return { success: true, addedCount: newStudentIds.length };
}

// 8. Remove Student From Group (Non-Destructive: Does NOT Delete Student)
export async function executeRemoveStudentFromGroup(
  groupId: string,
  studentId: string
): Promise<{ success: boolean; error?: string }> {
  const { supabase, user } = await getAuthenticatedFaculty();

  if (!groupId || !studentId) {
    return { success: false, error: "Group ID and Student ID are required." };
  }

  const { error } = await supabase
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("student_id", studentId);

  if (error) {
    console.error("Error removing student from group:", error);
    return { success: false, error: "Failed to remove student from group." };
  }

  // Audit log
  await supabase.from("audit_logs").insert({
    entity_table: "group_members",
    entity_id: groupId,
    action: "DELETE",
    actor_id: user.id,
    actor_role: "faculty",
    old_values: {
      student_id: studentId,
      operation: "GROUP_MEMBER_REMOVE",
    },
  });

  return { success: true };
}
