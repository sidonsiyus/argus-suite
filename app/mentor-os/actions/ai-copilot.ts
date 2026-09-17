"use server";

import { revalidatePath } from "next/cache";
import {
  generateAndPersistRecommendations,
  executeApproveRecommendation,
  executeEditAndApproveRecommendation,
  executeRejectRecommendation,
} from "@/lib/data/ai-copilot";

/**
 * Server Action: Generate AI Copilot recommendations for a cadet.
 * NEVER accepts mentorId from the client. Identity is derived server-side.
 */
export async function generateInsightsAction(studentId: string) {
  try {
    if (!studentId || typeof studentId !== "string") {
      return {
        success: false,
        error: "Invalid cadet identifier provided.",
      };
    }

    const result = await generateAndPersistRecommendations(studentId);
    revalidatePath(`/mentor-os/students/${studentId}`);
    revalidatePath(`/students/${studentId}`);

    return {
      success: true,
      result,
    };
  } catch (err: any) {
    console.error("AI Copilot generation error (server-side):", err);
    // Return safe user-facing message, never exposing stack traces, API keys, or raw SQL
    const isPrivacyViolation = err?.message && err.message.includes("CRITICAL PRIVACY VIOLATION");
    if (isPrivacyViolation) {
      return {
        success: false,
        error: "Data privacy gate triggered. Generation aborted.",
      };
    }
    if (err?.message && err.message.includes("Unauthorized")) {
      return {
        success: false,
        error: "Unauthorized. Faculty mentor credentials required.",
      };
    }
    if (err?.message && (
      err.message.includes("AI service is not configured") ||
      err.message.includes("timed out") ||
      err.message.includes("rate limit") ||
      err.message.includes("authentication failed") ||
      err.message.includes("Unable to reach")
    )) {
      return {
        success: false,
        error: err.message,
      };
    }
    return {
      success: false,
      error: "Mentor insights could not be generated at this time. Please try again.",
    };
  }
}

/**
 * Server Action: Approve an AI recommendation.
 * NEVER accepts mentorId from the client. Identity is derived server-side.
 * Concurrency-safe, transactional, only creates milestone if type === 'MILESTONE'.
 */
export async function approveRecommendationAction(
  recId: string,
  studentId: string
) {
  try {
    if (!recId || !studentId) {
      return {
        success: false,
        error: "Missing required recommendation or cadet identifier.",
      };
    }

    const res = await executeApproveRecommendation(recId, studentId);
    if (res.success) {
      revalidatePath(`/mentor-os/students/${studentId}`);
      revalidatePath(`/students/${studentId}`);
    }
    return res;
  } catch (err: any) {
    console.error("AI Copilot approve error (server-side):", err);
    return {
      success: false,
      error: err?.message && err.message.includes("Unauthorized")
        ? "Unauthorized. Faculty mentor credentials required."
        : "An unexpected error occurred while approving the recommendation.",
    };
  }
}

/**
 * Server Action: Edit & Approve an AI recommendation.
 * NEVER accepts mentorId from the client. Identity is derived server-side.
 * Concurrency-safe, transactional, records MENTOR_ENTERED provenance.
 */
export async function editAndApproveRecommendationAction(
  recId: string,
  studentId: string,
  edits: {
    title: string;
    suggested_action: string;
    priority: "LOW" | "MEDIUM" | "HIGH";
    review_notes: string;
  }
) {
  try {
    if (!recId || !studentId || !edits?.title?.trim()) {
      return {
        success: false,
        error: "Invalid input. Recommendation title is required.",
      };
    }

    const res = await executeEditAndApproveRecommendation(
      recId,
      studentId,
      edits
    );
    if (res.success) {
      revalidatePath(`/mentor-os/students/${studentId}`);
      revalidatePath(`/students/${studentId}`);
    }
    return res;
  } catch (err: any) {
    console.error("AI Copilot edit-and-approve error (server-side):", err);
    return {
      success: false,
      error: err?.message && err.message.includes("Unauthorized")
        ? "Unauthorized. Faculty mentor credentials required."
        : "An unexpected error occurred while refining the recommendation.",
    };
  }
}

/**
 * Server Action: Reject an AI recommendation.
 * NEVER accepts mentorId from the client. Identity is derived server-side.
 * Zero student database records are modified.
 */
export async function rejectRecommendationAction(
  recId: string,
  studentId: string,
  reason?: string
) {
  try {
    if (!recId || !studentId) {
      return {
        success: false,
        error: "Missing required recommendation or cadet identifier.",
      };
    }

    const res = await executeRejectRecommendation(
      recId,
      studentId,
      reason
    );
    if (res.success) {
      revalidatePath(`/mentor-os/students/${studentId}`);
      revalidatePath(`/students/${studentId}`);
    }
    return res;
  } catch (err: any) {
    console.error("AI Copilot reject error (server-side):", err);
    return {
      success: false,
      error: err?.message && err.message.includes("Unauthorized")
        ? "Unauthorized. Faculty mentor credentials required."
        : "An unexpected error occurred while rejecting the recommendation.",
    };
  }
}
