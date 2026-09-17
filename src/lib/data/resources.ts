import { cache } from "react";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

import { ResourceItem, ResourceFilters, ResourceType } from "@/lib/resources/types";
export * from "@/lib/resources/types";

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

// 1. Get Resources with Filtering and Search
export const getResources = cache(async function getResources(filters?: ResourceFilters): Promise<ResourceItem[]> {
  const supabase = createServerSupabase();

  let query = supabase
    .from("resources")
    .select("*, milestone_resources(milestone_id)")
    .order("created_at", { ascending: false });

  if (filters?.status === "active") {
    query = query.eq("is_active", true);
  } else if (filters?.status === "archived") {
    query = query.eq("is_active", false);
  } else if (!filters?.status) {
    // Default to active resources if unspecified
    query = query.eq("is_active", true);
  }

  if (filters?.category && filters.category !== "all") {
    query = query.eq("category", filters.category);
  }

  if (filters?.type && filters.type !== "all") {
    query = query.eq("resource_type", filters.type);
  }

  const { data, error } = await query;

  if (error || !data) {
    console.error("Error querying resources:", error);
    return [];
  }

  let items: ResourceItem[] = data.map((row: any) => ({
    id: row.id,
    title: row.title,
    description: row.description || null,
    resource_type: row.resource_type || "GUIDE",
    category: row.category,
    provider: row.provider || null,
    url: row.url || null,
    tags: row.tags || [],
    is_public: row.is_public ?? true,
    is_active: row.is_active ?? true,
    provenance: row.provenance || "MENTOR_ENTERED",
    created_by: row.created_by,
    created_at: row.created_at,
    updated_at: row.updated_at || row.created_at,
    usage_count: Array.isArray(row.milestone_resources) ? row.milestone_resources.length : 0,
  }));

  // Client-side / in-memory search for multi-field filtering (title, provider, tags)
  if (filters?.search && filters.search.trim()) {
    const q = filters.search.trim().toLowerCase();
    items = items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.provider && item.provider.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        item.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  return items;
});

// 2. Get Single Resource with full Linked Milestones & Cadets
export async function getResourceById(id: string): Promise<ResourceItem | null> {
  const supabase = createServerSupabase();

  const { data: res, error } = await supabase
    .from("resources")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !res) return null;

  // Query linked milestones with cadet details
  const { data: links } = await supabase
    .from("milestone_resources")
    .select("milestone_id, milestones(id, title, status, student_id, students(id, full_name, reg_no))")
    .eq("resource_id", id);

  const linkedMilestones = (links || [])
    .map((l: any) => {
      const m = l.milestones;
      if (!m) return null;
      return {
        id: m.id,
        title: m.title,
        status: m.status,
        student_id: m.students?.id || m.student_id,
        student_name: m.students?.full_name || "Unknown Cadet",
        reg_no: m.students?.reg_no || "",
      };
    })
    .filter(Boolean);

  return {
    id: res.id,
    title: res.title,
    description: res.description || null,
    resource_type: res.resource_type || "GUIDE",
    category: res.category,
    provider: res.provider || null,
    url: res.url || null,
    tags: res.tags || [],
    is_public: res.is_public ?? true,
    is_active: res.is_active ?? true,
    provenance: res.provenance || "MENTOR_ENTERED",
    created_by: res.created_by,
    created_at: res.created_at,
    updated_at: res.updated_at || res.created_at,
    usage_count: linkedMilestones.length,
    linked_milestones: linkedMilestones as any,
  };
}

// 3. Create Resource
export async function executeCreateResource(input: {
  title: string;
  description?: string;
  resource_type: ResourceType;
  category: string;
  provider?: string;
  url?: string;
  tags?: string[];
  is_public?: boolean;
}): Promise<{ success: boolean; resourceId?: string; error?: string }> {
  const { supabase, user } = await getAuthenticatedFaculty();

  const title = input.title.trim();
  if (!title) {
    return { success: false, error: "Resource title is required." };
  }

  const cleanTags = (input.tags || [])
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length > 0);

  const { data, error } = await supabase
    .from("resources")
    .insert({
      title,
      description: input.description?.trim() || null,
      resource_type: input.resource_type || "GUIDE",
      category: input.category,
      provider: input.provider?.trim() || null,
      url: input.url?.trim() || null,
      tags: cleanTags,
      is_public: input.is_public ?? true,
      is_active: true,
      created_by: user.id,
      provenance: "MENTOR_ENTERED",
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("Error creating resource:", error);
    return { success: false, error: "Failed to create resource. Please check inputs." };
  }

  // Audit log
  await supabase.from("audit_logs").insert({
    entity_table: "resources",
    entity_id: data.id,
    action: "INSERT",
    actor_id: user.id,
    actor_role: "faculty",
    new_values: {
      title,
      resource_type: input.resource_type,
      category: input.category,
      provider: input.provider,
    },
  });

  return { success: true, resourceId: data.id };
}

// 4. Update Resource
export async function executeUpdateResource(
  id: string,
  input: {
    title: string;
    description?: string;
    resource_type: ResourceType;
    category: string;
    provider?: string;
    url?: string;
    tags?: string[];
    is_public?: boolean;
  }
): Promise<{ success: boolean; error?: string }> {
  const { supabase, user } = await getAuthenticatedFaculty();

  const title = input.title.trim();
  if (!title) {
    return { success: false, error: "Resource title is required." };
  }

  const cleanTags = (input.tags || [])
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length > 0);

  const { error } = await supabase
    .from("resources")
    .update({
      title,
      description: input.description?.trim() || null,
      resource_type: input.resource_type,
      category: input.category,
      provider: input.provider?.trim() || null,
      url: input.url?.trim() || null,
      tags: cleanTags,
      is_public: input.is_public ?? true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating resource:", error);
    return { success: false, error: "Failed to update resource." };
  }

  // Audit log
  await supabase.from("audit_logs").insert({
    entity_table: "resources",
    entity_id: id,
    action: "UPDATE",
    actor_id: user.id,
    actor_role: "faculty",
    new_values: {
      title,
      resource_type: input.resource_type,
      category: input.category,
      updated_at: new Date().toISOString(),
    },
  });

  return { success: true };
}

// 5. Archive / Deactivate or Restore Resource (Soft Toggle)
export async function executeArchiveResource(
  id: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  const { supabase, user } = await getAuthenticatedFaculty();

  const { error } = await supabase
    .from("resources")
    .update({
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Error archiving resource:", error);
    return { success: false, error: "Failed to update resource status." };
  }

  // Audit log
  await supabase.from("audit_logs").insert({
    entity_table: "resources",
    entity_id: id,
    action: "UPDATE",
    actor_id: user.id,
    actor_role: "faculty",
    new_values: {
      is_active: isActive,
      status_change: isActive ? "RESTORED" : "ARCHIVED",
    },
  });

  return { success: true };
}

// 6. Link Resource to Milestone (Prevents Duplicates)
export async function executeLinkMilestoneResource(
  milestoneId: string,
  resourceId: string
): Promise<{ success: boolean; error?: string }> {
  const { supabase, user } = await getAuthenticatedFaculty();

  // Check if link already exists
  const { data: existing } = await supabase
    .from("milestone_resources")
    .select("milestone_id")
    .eq("milestone_id", milestoneId)
    .eq("resource_id", resourceId)
    .single();

  if (existing) {
    return { success: false, error: "Resource is already linked to this milestone." };
  }

  const { error } = await supabase.from("milestone_resources").insert({
    milestone_id: milestoneId,
    resource_id: resourceId,
    added_by: user.id,
    added_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Error linking milestone resource:", error);
    return { success: false, error: "Failed to link resource to milestone." };
  }

  // Audit log
  await supabase.from("audit_logs").insert({
    entity_table: "milestone_resources",
    entity_id: milestoneId,
    action: "INSERT",
    actor_id: user.id,
    actor_role: "faculty",
    new_values: {
      milestone_id: milestoneId,
      resource_id: resourceId,
      linked_at: new Date().toISOString(),
    },
  });

  return { success: true };
}

// 7. Unlink Resource from Milestone
export async function executeUnlinkMilestoneResource(
  milestoneId: string,
  resourceId: string
): Promise<{ success: boolean; error?: string }> {
  const { supabase, user } = await getAuthenticatedFaculty();

  const { error } = await supabase
    .from("milestone_resources")
    .delete()
    .eq("milestone_id", milestoneId)
    .eq("resource_id", resourceId);

  if (error) {
    console.error("Error unlinking milestone resource:", error);
    return { success: false, error: "Failed to unlink resource." };
  }

  // Audit log
  await supabase.from("audit_logs").insert({
    entity_table: "milestone_resources",
    entity_id: milestoneId,
    action: "DELETE",
    actor_id: user.id,
    actor_role: "faculty",
    old_values: {
      milestone_id: milestoneId,
      resource_id: resourceId,
      unlinked_at: new Date().toISOString(),
    },
  });

  return { success: true };
}

// 8. Fetch Linked Resources for specific milestones
export async function getLinkedResourcesForMilestones(
  milestoneIds: string[]
): Promise<Record<string, ResourceItem[]>> {
  if (!milestoneIds || milestoneIds.length === 0) return {};

  const supabase = createServerSupabase();

  const { data, error } = await supabase
    .from("milestone_resources")
    .select("milestone_id, resources(*)")
    .in("milestone_id", milestoneIds);

  if (error || !data) return {};

  const mapping: Record<string, ResourceItem[]> = {};

  data.forEach((row: any) => {
    const mId = row.milestone_id;
    const res = row.resources;
    if (!res) return;

    if (!mapping[mId]) {
      mapping[mId] = [];
    }

    mapping[mId].push({
      id: res.id,
      title: res.title,
      description: res.description || null,
      resource_type: res.resource_type || "GUIDE",
      category: res.category,
      provider: res.provider || null,
      url: res.url || null,
      tags: res.tags || [],
      is_public: res.is_public ?? true,
      is_active: res.is_active ?? true,
      provenance: res.provenance || "MENTOR_ENTERED",
      created_by: res.created_by,
      created_at: res.created_at,
      updated_at: res.updated_at || res.created_at,
    });
  });

  return mapping;
}

// 9. Fetch Active Milestones Available for Linking
export async function getActiveMilestonesForCadet(
  studentId: string
): Promise<Array<{ id: string; title: string; priority: string; status: string }>> {
  const supabase = createServerSupabase();

  const { data, error } = await supabase
    .from("milestones")
    .select("id, title, priority, status")
    .eq("student_id", studentId)
    .in("status", ["ACTIVE", "NOT_STARTED", "UNDER_REVIEW"])
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data;
}
