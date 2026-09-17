"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  executeCreateGroup,
  executeUpdateGroup,
  executeArchiveGroup,
  executeAddStudentsToGroup,
  executeRemoveStudentFromGroup,
} from "@/lib/data/groups";
import { GroupCategory, GroupStatus } from "@/lib/groups/types";

const GroupInputSchema = z.object({
  name: z.string().trim().min(2, "Group name must be at least 2 characters.").max(150),
  category: z
    .enum([
      "CAREER",
      "SKILLS",
      "READINESS",
      "DOCUMENTATION",
      "INTERVIEW",
      "INTERNSHIP",
      "ACADEMIC_SUPPORT",
      "LANGUAGE",
      "PLACEMENT",
      "OTHER",
    ])
    .default("OTHER"),
  description: z.string().trim().max(2000).optional(),
});

// 1. Create Group
export async function createGroupAction(formData: {
  name: string;
  category?: GroupCategory;
  description?: string;
}) {
  try {
    const validated = GroupInputSchema.parse(formData);

    const res = await executeCreateGroup({
      name: validated.name,
      category: validated.category,
      description: validated.description,
    });

    if (res.success) {
      revalidatePath("/groups");
    }

    return res;
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.errors[0]?.message || "Invalid input." };
    }
    console.error("Error in createGroupAction:", err);
    return {
      success: false,
      error: err?.message && err.message.includes("Unauthorized")
        ? "Unauthorized. Faculty credentials required."
        : "Failed to create group.",
    };
  }
}

// 2. Update Group
export async function updateGroupAction(
  id: string,
  formData: {
    name: string;
    category?: GroupCategory;
    description?: string;
  }
) {
  try {
    if (!id) return { success: false, error: "Group ID is required." };

    const validated = GroupInputSchema.parse(formData);

    const res = await executeUpdateGroup(id, {
      name: validated.name,
      category: validated.category,
      description: validated.description,
    });

    if (res.success) {
      revalidatePath("/groups");
      revalidatePath(`/groups/${id}`);
    }

    return res;
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.errors[0]?.message || "Invalid input." };
    }
    console.error("Error in updateGroupAction:", err);
    return {
      success: false,
      error: err?.message && err.message.includes("Unauthorized")
        ? "Unauthorized. Faculty credentials required."
        : "Failed to update group.",
    };
  }
}

// 3. Archive / Restore Group
export async function archiveGroupAction(id: string, status: GroupStatus) {
  try {
    if (!id) return { success: false, error: "Group ID is required." };

    const res = await executeArchiveGroup(id, status);

    if (res.success) {
      revalidatePath("/groups");
      revalidatePath(`/groups/${id}`);
    }

    return res;
  } catch (err: any) {
    console.error("Error in archiveGroupAction:", err);
    return {
      success: false,
      error: err?.message && err.message.includes("Unauthorized")
        ? "Unauthorized. Faculty credentials required."
        : "Failed to update group status.",
    };
  }
}

// 4. Add Students to Group
export async function addStudentsToGroupAction(
  groupId: string,
  studentIds: string[],
  notes?: string
) {
  try {
    if (!groupId || !studentIds || studentIds.length === 0) {
      return { success: false, error: "Group ID and student selections are required." };
    }

    const res = await executeAddStudentsToGroup(groupId, studentIds, notes);

    if (res.success) {
      revalidatePath("/groups");
      revalidatePath(`/groups/${groupId}`);
      studentIds.forEach((sid) => revalidatePath(`/students/${sid}`));
    }

    return res;
  } catch (err: any) {
    console.error("Error in addStudentsToGroupAction:", err);
    return {
      success: false,
      error: err?.message && err.message.includes("Unauthorized")
        ? "Unauthorized. Faculty credentials required."
        : "Failed to add students to group.",
    };
  }
}

// 5. Remove Student From Group
export async function removeStudentFromGroupAction(
  groupId: string,
  studentId: string
) {
  try {
    if (!groupId || !studentId) {
      return { success: false, error: "Group ID and Student ID are required." };
    }

    const res = await executeRemoveStudentFromGroup(groupId, studentId);

    if (res.success) {
      revalidatePath("/groups");
      revalidatePath(`/groups/${groupId}`);
      revalidatePath(`/students/${studentId}`);
    }

    return res;
  } catch (err: any) {
    console.error("Error in removeStudentFromGroupAction:", err);
    return {
      success: false,
      error: err?.message && err.message.includes("Unauthorized")
        ? "Unauthorized. Faculty credentials required."
        : "Failed to remove student from group.",
    };
  }
}
