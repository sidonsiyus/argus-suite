"use server";

import { revalidatePath } from "next/cache";
import {
  generateAndPersistRecommendations,
  executeApproveRecommendation,
  executeEditAndApproveRecommendation,
  executeRejectRecommendation,
  executeDraftWithAI,
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
    console.error("AI Copilot generation error (server-side):", {
      code: err?.code,
      message: err?.message,
    });
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
    if (err?.code === "MISSING_CONFIGURATION" || err?.message?.includes("AI service is not configured")) {
      return {
        success: false,
        error: "AI service is not configured. OPENROUTER_API_KEY is missing.",
      };
    }
    if (err?.code === "OPENROUTER_CREDIT_ERROR" || err?.message?.includes("credit")) {
      return {
        success: false,
        error: "AI credit limit reached or token limit exceeded. Please check your OpenRouter credits balance.",
      };
    }
    if (err?.code === "OPENROUTER_AUTH_ERROR" || err?.message?.includes("authentication failed")) {
      return {
        success: false,
        error: "AI authentication failed. Please verify OPENROUTER_API_KEY.",
      };
    }
    if (err?.code === "OPENROUTER_MODEL_ERROR" || err?.message?.includes("model not found")) {
      return {
        success: false,
        error: "AI model error. The configured OpenRouter model is unavailable.",
      };
    }
    if (err?.code === "OPENROUTER_RATE_LIMIT" || err?.message?.includes("rate limit")) {
      return {
        success: false,
        error: "AI rate limit reached. Please wait a moment before generating more insights.",
      };
    }
    if (err?.code === "OPENROUTER_TIMEOUT" || err?.message?.includes("timed out")) {
      return {
        success: false,
        error: "AI generation timed out after 25 seconds. Please try again.",
      };
    }
    if (err?.code === "AI_VALIDATION_ERROR") {
      return {
        success: false,
        error: "AI output validation failed: generated response did not pass evidence grounding requirements.",
      };
    }
    if (err?.code === "NETWORK_ERROR" || err?.message?.includes("Unable to reach")) {
      return {
        success: false,
        error: "Unable to reach AI service. Please check network connectivity.",
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

/**
 * Server Action: Draft or refine mentoring text / Plan of Action using AI.
 * Grounded in keywords or rough notes typed by the mentor.
 */
export async function draftWithAIAction(payload: {
  mode:
    | "session_notes"
    | "session_outcome"
    | "session_agenda"
    | "session_follow_up"
    | "poa_field"
    | "poa_full_plan";
  text: string;
  context?: {
    studentName?: string;
    careerGoal?: string;
    sessionType?: string;
    fieldLabel?: string;
    currentTitle?: string;
  };
}) {
  try {
    if (!payload.text || typeof payload.text !== "string" || payload.text.trim().length === 0) {
      return {
        success: false,
        error: "Please enter some keywords or text first to draft with AI.",
      };
    }

    const result = await executeDraftWithAI({
      mode: payload.mode,
      text: payload.text.trim(),
      context: payload.context,
    });

    return {
      success: true,
      draft: result.draft,
      details: result.details,
    };
  } catch (err: any) {
    console.error("AI Draft error (server-side):", {
      code: err?.code,
      message: err?.message,
    });

    if (err?.code === "MISSING_CONFIGURATION" || err?.message?.includes("AI service is not configured")) {
      return {
        success: false,
        error: "AI service is not configured. OPENROUTER_API_KEY is missing.",
      };
    }
    if (err?.code === "OPENROUTER_CREDIT_ERROR" || err?.message?.includes("credit")) {
      return {
        success: false,
        error: "AI credit limit reached. Please check your OpenRouter credits balance.",
      };
    }
    if (err?.code === "OPENROUTER_AUTH_ERROR" || err?.message?.includes("authentication failed")) {
      return {
        success: false,
        error: "AI authentication failed. Please verify OPENROUTER_API_KEY.",
      };
    }
    if (err?.code === "OPENROUTER_RATE_LIMIT" || err?.message?.includes("rate limit")) {
      return {
        success: false,
        error: "AI rate limit reached. Please wait a moment and try again.",
      };
    }
    if (err?.code === "OPENROUTER_TIMEOUT" || err?.message?.includes("timed out")) {
      return {
        success: false,
        error: "AI generation timed out. Please try again with shorter keywords.",
      };
    }

    return {
      success: false,
      error: err?.message || "Failed to generate AI draft. Please try again.",
    };
  }
}

