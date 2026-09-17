"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  executeCreateSession,
  executeStartSession,
  executeCompleteSession,
  executeCancelSession,
  executeRescheduleSession,
  executeLinkMilestoneToSession,
} from "@/lib/data/sessions";
import { SessionType } from "@/lib/sessions/types";

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------
const scheduleSessionSchema = z.object({
  student_id: z.string().uuid("Invalid student ID"),
  scheduled_at: z.string().min(1, "Scheduled date and time is required"),
  duration_minutes: z.coerce.number().int().min(15).max(180).default(30),
  session_type: z
    .enum([
      "GENERAL_MENTORING",
      "CAREER_GUIDANCE",
      "ACADEMIC_SUPPORT",
      "CAREER_READINESS",
      "INTERNSHIP",
      "PLACEMENT",
      "SKILL_DEVELOPMENT",
      "DOCUMENTATION",
      "FOLLOW_UP",
      "OTHER",
    ])
    .default("GENERAL_MENTORING"),
  focus_area: z.string().trim().max(100).optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
  milestone_ids: z.array(z.string().uuid()).optional(),
});

const rescheduleSessionSchema = z.object({
  sessionId: z.string().uuid("Invalid session ID"),
  scheduled_at: z.string().min(1, "New scheduled date and time is required"),
  duration_minutes: z.coerce.number().int().min(15).max(180).optional(),
});

const completeSessionSchema = z.object({
  sessionId: z.string().uuid("Invalid session ID"),
  observations: z.string().trim().max(2000).optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
  outcome: z.string().trim().max(1000).optional().nullable(),
  follow_up_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
    .optional()
    .nullable()
    .or(z.literal("")),
  follow_up_notes: z.string().trim().max(1000).optional().nullable(),
});

// ---------------------------------------------------------------------------
// Server Actions
// ---------------------------------------------------------------------------
export async function scheduleSessionAction(rawData: any) {
  try {
    const validated = scheduleSessionSchema.parse(rawData);

    const session = await executeCreateSession({
      student_id: validated.student_id,
      scheduled_at: validated.scheduled_at,
      duration_minutes: validated.duration_minutes,
      session_type: validated.session_type as SessionType,
      focus_area: validated.focus_area || undefined,
      notes: validated.notes || undefined,
      milestone_ids: validated.milestone_ids,
    });

    revalidatePath("/sessions");
    revalidatePath("/calendar");
    revalidatePath(`/students/${validated.student_id}`);
    revalidatePath("/dashboard");

    return { success: true, data: session, error: null };
  } catch (err: any) {
    return { success: false, data: null, error: err?.message || "Failed to schedule session" };
  }
}

export async function startSessionAction(sessionId: string) {
  try {
    if (!sessionId) throw new Error("Session ID is required");

    const session = await executeStartSession(sessionId);

    revalidatePath("/sessions");
    revalidatePath("/calendar");
    revalidatePath("/dashboard");

    return { success: true, data: session, error: null };
  } catch (err: any) {
    return { success: false, data: null, error: err?.message || "Failed to start session" };
  }
}

export async function completeSessionAction(rawData: any) {
  try {
    const validated = completeSessionSchema.parse(rawData);

    const session = await executeCompleteSession(validated.sessionId, {
      observations: validated.observations || undefined,
      notes: validated.notes || undefined,
      outcome: validated.outcome || undefined,
      follow_up_date: validated.follow_up_date || null,
      follow_up_notes: validated.follow_up_notes || null,
    });

    revalidatePath("/sessions");
    revalidatePath("/calendar");
    revalidatePath("/dashboard");

    return { success: true, data: session, error: null };
  } catch (err: any) {
    return { success: false, data: null, error: err?.message || "Failed to complete session" };
  }
}

export async function cancelSessionAction(sessionId: string, reason?: string) {
  try {
    if (!sessionId) throw new Error("Session ID is required");

    const session = await executeCancelSession(sessionId, reason);

    revalidatePath("/sessions");
    revalidatePath("/calendar");
    revalidatePath("/dashboard");

    return { success: true, data: session, error: null };
  } catch (err: any) {
    return { success: false, data: null, error: err?.message || "Failed to cancel session" };
  }
}

export async function rescheduleSessionAction(rawData: any) {
  try {
    const validated = rescheduleSessionSchema.parse(rawData);

    const session = await executeRescheduleSession(validated.sessionId, {
      scheduled_at: validated.scheduled_at,
      duration_minutes: validated.duration_minutes,
    });

    revalidatePath("/sessions");
    revalidatePath("/calendar");
    revalidatePath("/dashboard");

    return { success: true, data: session, error: null };
  } catch (err: any) {
    return { success: false, data: null, error: err?.message || "Failed to reschedule session" };
  }
}

export async function linkMilestoneToSessionAction(
  sessionId: string,
  milestoneId: string,
  reviewNotes?: string
) {
  try {
    if (!sessionId || !milestoneId) throw new Error("Missing session or milestone ID");

    await executeLinkMilestoneToSession(sessionId, milestoneId, reviewNotes);

    revalidatePath("/sessions");
    revalidatePath("/calendar");

    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to link milestone" };
  }
}
