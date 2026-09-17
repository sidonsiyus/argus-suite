"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  executeCreateAchievement,
  executeUpdateAchievement,
  executeVerifyAchievement,
  executeDeleteAchievement,
  getAchievements,
  getAvailableDocumentsForStudent,
  AchievementCategory,
  AchievementFilters,
} from "@/lib/data/achievements";

const AchievementCategoryEnum = z.enum([
  "CERTIFICATION",
  "COMPETITION",
  "PROJECT",
  "WORKSHOP",
  "DGCA_EXAM",
  "ATHLETICS",
  "LEADERSHIP",
  "ACADEMIC_HONOR",
  "OTHER",
]);

const AchievementInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title cannot exceed 200 characters"),
  category: AchievementCategoryEnum,
  description: z.string().trim().max(2000, "Description cannot exceed 2000 characters").optional(),
  issued_by: z.string().trim().max(150, "Issuer cannot exceed 150 characters").optional(),
  date_achieved: z.string().trim().optional().or(z.literal("")),
  certificate_doc_id: z.string().uuid("Invalid document identifier").optional().or(z.literal("")),
});

export async function createAchievementAction(
  studentId: string,
  formData: {
    title: string;
    category: AchievementCategory;
    description?: string;
    issued_by?: string;
    date_achieved?: string;
    certificate_doc_id?: string;
  }
) {
  try {
    if (!studentId) {
      return { success: false, error: "Cadet ID is required." };
    }

    const validated = AchievementInputSchema.parse(formData);

    const res = await executeCreateAchievement(studentId, {
      title: validated.title,
      category: validated.category,
      description: validated.description,
      issued_by: validated.issued_by,
      date_achieved: validated.date_achieved || undefined,
      certificate_doc_id: validated.certificate_doc_id || undefined,
    });

    if (res.success) {
      revalidatePath(`/students/${studentId}`);
      revalidatePath("/achievements");
    }

    return res;
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.errors[0]?.message || "Invalid input." };
    }
    console.error("Error in createAchievementAction:", err);
    return {
      success: false,
      error: err?.message && err.message.includes("Unauthorized")
        ? "Unauthorized. Faculty credentials required."
        : "Failed to record achievement.",
    };
  }
}

export async function updateAchievementAction(
  achievementId: string,
  studentId: string,
  formData: {
    title: string;
    category: AchievementCategory;
    description?: string;
    issued_by?: string;
    date_achieved?: string;
    certificate_doc_id?: string;
  }
) {
  try {
    if (!achievementId) {
      return { success: false, error: "Achievement ID is required." };
    }

    const validated = AchievementInputSchema.parse(formData);

    const res = await executeUpdateAchievement(achievementId, {
      title: validated.title,
      category: validated.category,
      description: validated.description,
      issued_by: validated.issued_by,
      date_achieved: validated.date_achieved || undefined,
      certificate_doc_id: validated.certificate_doc_id || undefined,
    });

    if (res.success) {
      if (studentId) revalidatePath(`/students/${studentId}`);
      revalidatePath("/achievements");
    }

    return res;
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.errors[0]?.message || "Invalid input." };
    }
    console.error("Error in updateAchievementAction:", err);
    return {
      success: false,
      error: err?.message && err.message.includes("Unauthorized")
        ? "Unauthorized. Faculty credentials required."
        : "Failed to update achievement.",
    };
  }
}

export async function verifyAchievementAction(achievementId: string, studentId: string) {
  try {
    if (!achievementId) {
      return { success: false, error: "Achievement ID is required." };
    }

    const res = await executeVerifyAchievement(achievementId);

    if (res.success) {
      if (studentId) revalidatePath(`/students/${studentId}`);
      revalidatePath("/achievements");
    }

    return res;
  } catch (err: any) {
    console.error("Error in verifyAchievementAction:", err);
    return {
      success: false,
      error: err?.message && err.message.includes("Unauthorized")
        ? "Unauthorized. Faculty credentials required."
        : "Failed to verify achievement.",
    };
  }
}

export async function deleteAchievementAction(achievementId: string, studentId: string) {
  try {
    if (!achievementId) {
      return { success: false, error: "Achievement ID is required." };
    }

    const res = await executeDeleteAchievement(achievementId);

    if (res.success) {
      if (studentId) revalidatePath(`/students/${studentId}`);
      revalidatePath("/achievements");
    }

    return res;
  } catch (err: any) {
    console.error("Error in deleteAchievementAction:", err);
    return {
      success: false,
      error: err?.message && err.message.includes("Unauthorized")
        ? "Unauthorized. Faculty credentials required."
        : "Failed to delete achievement.",
    };
  }
}

export async function fetchAchievementsAction(filters?: AchievementFilters) {
  try {
    return await getAchievements(filters);
  } catch (err) {
    console.error("Error in fetchAchievementsAction:", err);
    return [];
  }
}

export async function fetchAvailableDocumentsAction(studentId: string) {
  try {
    return await getAvailableDocumentsForStudent(studentId);
  } catch (err) {
    console.error("Error in fetchAvailableDocumentsAction:", err);
    return [];
  }
}
