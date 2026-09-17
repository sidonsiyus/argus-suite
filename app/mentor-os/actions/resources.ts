"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import crypto from "node:crypto";
import {
  executeCreateResource,
  executeUpdateResource,
  executeArchiveResource,
  executeLinkMilestoneResource,
  executeUnlinkMilestoneResource,
  getResources,
  getActiveMilestonesForCadet,
  getAuthenticatedFaculty,
  ResourceType,
  ResourceFilters,
} from "@/lib/data/resources";

const ResourceTypeEnum = z.enum([
  "COURSE",
  "DOCUMENT",
  "TOOL",
  "VIDEO",
  "GUIDE",
  "OFFICIAL_PORTAL",
  "CERTIFICATION_PREP",
]);

const ResourceInputSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(200, "Title cannot exceed 200 characters"),
  description: z.string().trim().max(2000, "Description cannot exceed 2000 characters").optional(),
  resource_type: ResourceTypeEnum,
  category: z.string().trim().min(1, "Category is required").max(100),
  provider: z.string().trim().max(100).optional(),
  url: z
    .string()
    .trim()
    .url("Must be a valid web URL (e.g. https://...)")
    .optional()
    .or(z.literal("")),
  tags: z.array(z.string().trim().max(40)).max(15).optional(),
  is_public: z.boolean().optional(),
});

export async function createResourceAction(formData: {
  title: string;
  description?: string;
  resource_type: ResourceType;
  category: string;
  provider?: string;
  url?: string;
  tags?: string[];
  is_public?: boolean;
}) {
  try {
    const validated = ResourceInputSchema.parse(formData);

    const res = await executeCreateResource({
      title: validated.title,
      description: validated.description,
      resource_type: validated.resource_type,
      category: validated.category,
      provider: validated.provider,
      url: validated.url || undefined,
      tags: validated.tags,
      is_public: validated.is_public ?? true,
    });

    if (res.success) {
      revalidatePath("/resources");
    }

    return res;
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.errors[0]?.message || "Invalid input data." };
    }
    console.error("Error in createResourceAction:", err);
    return {
      success: false,
      error: err?.message && err.message.includes("Unauthorized")
        ? "Unauthorized. Faculty credentials required."
        : "Failed to create resource. Please try again.",
    };
  }
}

export async function updateResourceAction(
  id: string,
  formData: {
    title: string;
    description?: string;
    resource_type: ResourceType;
    category: string;
    provider?: string;
    url?: string;
    tags?: string[];
    is_public?: boolean;
  }
) {
  try {
    if (!id) return { success: false, error: "Resource ID is required." };

    const validated = ResourceInputSchema.parse(formData);

    const res = await executeUpdateResource(id, {
      title: validated.title,
      description: validated.description,
      resource_type: validated.resource_type,
      category: validated.category,
      provider: validated.provider,
      url: validated.url || undefined,
      tags: validated.tags,
      is_public: validated.is_public ?? true,
    });

    if (res.success) {
      revalidatePath("/resources");
      revalidatePath(`/resources/${id}`);
    }

    return res;
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.errors[0]?.message || "Invalid input data." };
    }
    console.error("Error in updateResourceAction:", err);
    return {
      success: false,
      error: err?.message && err.message.includes("Unauthorized")
        ? "Unauthorized. Faculty credentials required."
        : "Failed to update resource.",
    };
  }
}

export async function archiveResourceAction(id: string, isActive: boolean) {
  try {
    if (!id) return { success: false, error: "Resource ID is required." };

    const res = await executeArchiveResource(id, isActive);
    if (res.success) {
      revalidatePath("/resources");
    }
    return res;
  } catch (err: any) {
    console.error("Error in archiveResourceAction:", err);
    return {
      success: false,
      error: err?.message && err.message.includes("Unauthorized")
        ? "Unauthorized. Faculty credentials required."
        : "Failed to update resource status.",
    };
  }
}

export async function linkMilestoneResourceAction(
  milestoneId: string,
  resourceId: string,
  studentId?: string
) {
  try {
    if (!milestoneId || !resourceId) {
      return { success: false, error: "Both milestone and resource must be selected." };
    }

    const res = await executeLinkMilestoneResource(milestoneId, resourceId);
    if (res.success) {
      revalidatePath("/resources");
      if (studentId) {
        revalidatePath(`/students/${studentId}`);
      }
    }
    return res;
  } catch (err: any) {
    console.error("Error in linkMilestoneResourceAction:", err);
    return {
      success: false,
      error: err?.message && err.message.includes("Unauthorized")
        ? "Unauthorized. Faculty credentials required."
        : "Failed to link resource.",
    };
  }
}

export async function unlinkMilestoneResourceAction(
  milestoneId: string,
  resourceId: string,
  studentId?: string
) {
  try {
    if (!milestoneId || !resourceId) {
      return { success: false, error: "Both milestone and resource are required." };
    }

    const res = await executeUnlinkMilestoneResource(milestoneId, resourceId);
    if (res.success) {
      revalidatePath("/resources");
      if (studentId) {
        revalidatePath(`/students/${studentId}`);
      }
    }
    return res;
  } catch (err: any) {
    console.error("Error in unlinkMilestoneResourceAction:", err);
    return {
      success: false,
      error: err?.message && err.message.includes("Unauthorized")
        ? "Unauthorized. Faculty credentials required."
        : "Failed to unlink resource.",
    };
  }
}

export async function getResourcesAction(filters?: ResourceFilters) {
  try {
    return await getResources(filters);
  } catch (err) {
    console.error("Error in getResourcesAction:", err);
    return [];
  }
}

export async function getActiveMilestonesForCadetAction(studentId: string) {
  try {
    return await getActiveMilestonesForCadet(studentId);
  } catch (err) {
    console.error("Error in getActiveMilestonesForCadetAction:", err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Upload Reusable Document Resource Action
// ---------------------------------------------------------------------------
const ALLOWED_RESOURCE_DOC_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];
const MAX_RESOURCE_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export async function uploadResourceDocumentAction(formData: FormData) {
  try {
    const { supabase, user } = await getAuthenticatedFaculty();

    const file = formData.get("file") as File | null;
    const title = formData.get("title") as string | null;
    const category = formData.get("category") as string | null;
    const description = formData.get("description") as string | null;
    const provider = formData.get("provider") as string | null;
    const tagsRaw = formData.get("tags") as string | null;

    if (!file || !title?.trim() || !category?.trim()) {
      return { success: false, error: "File, title, and category are required." };
    }

    if (file.size > MAX_RESOURCE_FILE_SIZE_BYTES) {
      return { success: false, error: "File size exceeds maximum allowed limit (10 MB)." };
    }

    if (!ALLOWED_RESOURCE_DOC_TYPES.includes(file.type)) {
      return { success: false, error: "Only PDF, DOC, and DOCX documents are supported." };
    }

    const resourceId = crypto.randomUUID();
    const safeFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `resources/${resourceId}/${safeFilename}`;
    const fileBuffer = await file.arrayBuffer();

    const { error: uploadErr } = await supabase.storage
      .from("student-documents")
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadErr) {
      console.error("Storage upload error for resource:", uploadErr);
      return { success: false, error: "Failed to upload document to secure storage." };
    }

    let parsedTags: string[] = [];
    if (tagsRaw) {
      parsedTags = tagsRaw
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0);
    }

    const { data: newResource, error: dbErr } = await supabase
      .from("resources")
      .insert({
        id: resourceId,
        title: title.trim(),
        description: description?.trim() || null,
        resource_type: "DOCUMENT",
        category: category.trim(),
        provider: provider?.trim() || "Faculty Document",
        url: storagePath,
        tags: parsedTags,
        is_public: true,
        is_active: true,
        created_by: user.id,
        provenance: "MENTOR_ENTERED",
      })
      .select("*")
      .single();

    if (dbErr || !newResource) {
      console.error("Database insert error for resource:", dbErr);
      await supabase.storage.from("student-documents").remove([storagePath]);
      return { success: false, error: "Failed to create resource record." };
    }

    await supabase.from("audit_logs").insert({
      entity_table: "resources",
      entity_id: resourceId,
      action: "INSERT",
      actor_id: user.id,
      actor_role: "faculty",
      new_values: {
        id: resourceId,
        title: title.trim(),
        resource_type: "DOCUMENT",
        category: category.trim(),
        url: storagePath,
        file_size_bytes: file.size,
        mime_type: file.type,
      },
    });

    revalidatePath("/resources");

    return {
      success: true,
      resourceId,
      resource: {
        id: newResource.id,
        title: newResource.title,
        description: newResource.description,
        resource_type: newResource.resource_type,
        category: newResource.category,
        provider: newResource.provider,
        url: newResource.url,
        tags: newResource.tags || [],
        is_public: newResource.is_public ?? true,
        is_active: newResource.is_active ?? true,
        provenance: newResource.provenance || "MENTOR_ENTERED",
        created_by: newResource.created_by,
        created_at: newResource.created_at,
        updated_at: newResource.updated_at,
        usage_count: 0,
      },
    };
  } catch (err: any) {
    console.error("Error in uploadResourceDocumentAction:", err);
    return {
      success: false,
      error: err?.message && err.message.includes("Unauthorized")
        ? "Unauthorized. Faculty credentials required."
        : err?.message || "Failed to upload resource document.",
    };
  }
}

// ---------------------------------------------------------------------------
// Get Resource File URL (Direct or Signed URL)
// ---------------------------------------------------------------------------
export async function getResourceFileUrlAction(resourceId: string, download = false) {
  try {
    const { supabase } = await getAuthenticatedFaculty();

    if (!resourceId) {
      return { success: false, error: "Resource ID is required." };
    }

    const { data: res, error: rErr } = await supabase
      .from("resources")
      .select("id, title, url, resource_type")
      .eq("id", resourceId)
      .single();

    if (rErr || !res) {
      return { success: false, error: "Resource not found." };
    }

    if (!res.url) {
      return { success: false, error: "This resource does not have a linked file or URL." };
    }

    if (res.url.startsWith("http://") || res.url.startsWith("https://")) {
      return { success: true, url: res.url, isExternal: true, title: res.title };
    }

    if (res.url.startsWith("resources/")) {
      const filename = res.url.split("/").pop() || `${res.title}.pdf`;
      const { data, error: signErr } = await supabase.storage
        .from("student-documents")
        .createSignedUrl(res.url, 300, {
          download: download ? filename : false,
        });

      if (signErr || !data?.signedUrl) {
        console.error("createSignedUrl error for resource:", signErr);
        return { success: false, error: "Failed to generate secure document download URL." };
      }

      return { success: true, url: data.signedUrl, isExternal: false, title: res.title };
    }

    return { success: false, error: "Invalid resource URL format." };
  } catch (err: any) {
    console.error("Error in getResourceFileUrlAction:", err);
    return { success: false, error: err?.message || "Failed to retrieve resource link." };
  }
}

// ---------------------------------------------------------------------------
// Delete Resource Action (Storage + DB + Audit)
// ---------------------------------------------------------------------------
export async function deleteResourceAction(resourceId: string) {
  try {
    const { supabase, user } = await getAuthenticatedFaculty();

    if (!resourceId) {
      return { success: false, error: "Resource ID is required." };
    }

    const { data: res, error: rErr } = await supabase
      .from("resources")
      .select("*")
      .eq("id", resourceId)
      .single();

    if (rErr || !res) {
      return { success: false, error: "Resource not found." };
    }

    await supabase.from("audit_logs").insert({
      entity_table: "resources",
      entity_id: resourceId,
      action: "DELETE",
      actor_id: user.id,
      actor_role: "faculty",
      old_values: {
        id: res.id,
        title: res.title,
        url: res.url,
        resource_type: res.resource_type,
        category: res.category,
      },
    });

    if (res.url && res.url.startsWith("resources/")) {
      const { error: storageErr } = await supabase.storage
        .from("student-documents")
        .remove([res.url]);
      if (storageErr) {
        console.warn("Storage delete warning:", storageErr);
      }
    }

    await supabase.from("milestone_resources").delete().eq("resource_id", resourceId);

    const { error: dbErr } = await supabase.from("resources").delete().eq("id", resourceId);
    if (dbErr) {
      console.error("Database error deleting resource:", dbErr);
      return { success: false, error: "Failed to delete resource record." };
    }

    revalidatePath("/resources");
    return { success: true };
  } catch (err: any) {
    console.error("Error in deleteResourceAction:", err);
    return {
      success: false,
      error: err?.message && err.message.includes("Unauthorized")
        ? "Unauthorized. Faculty credentials required."
        : err?.message || "Failed to delete resource.",
    };
  }
}


