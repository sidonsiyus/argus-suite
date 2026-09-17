import { cache } from "react";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  SessionItem,
  SessionFilters,
  SessionStatus,
  SessionType,
  LinkedMilestoneItem,
  isValidSessionTransition,
} from "@/lib/sessions/types";

// ---------------------------------------------------------------------------
// 1. Authenticated Faculty Identity Resolver
// ---------------------------------------------------------------------------
export async function getAuthenticatedFaculty() {
  const supabase = createServerSupabase();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Unauthorized: Please log in as faculty mentor");
  }

  const { data: isFaculty, error: roleError } = await supabase.rpc("is_faculty");
  if (roleError || !isFaculty) {
    throw new Error("Forbidden: Faculty mentor access required");
  }

  return { user, supabase };
}

// ---------------------------------------------------------------------------
// 2. Audit Trail Logger
// ---------------------------------------------------------------------------
async function recordAuditLog(
  supabase: any,
  action: string,
  entityId: string,
  actorId: string,
  oldValues?: any,
  newValues?: any
) {
  try {
    await supabase.from("audit_logs").insert({
      entity_table: "sessions",
      entity_id: entityId,
      action,
      actor_id: actorId,
      actor_role: "faculty",
      old_values: oldValues ? JSON.parse(JSON.stringify(oldValues)) : null,
      new_values: newValues ? JSON.parse(JSON.stringify(newValues)) : null,
    });
  } catch (err) {
    console.error("Failed to write audit log for session:", err);
  }
}

// Helper to sanitize database rows into SessionItem
function mapSessionRow(row: any): SessionItem {
  const isHistorical = !row.status || row.status === "HISTORICAL";
  const status: SessionStatus = isHistorical
    ? "HISTORICAL"
    : (row.status as SessionStatus);

  const linkedMilestones: LinkedMilestoneItem[] = (row.session_milestones || []).map(
    (sm: any) => ({
      milestone_id: sm.milestone_id,
      title: sm.milestones?.title || "Milestone",
      status: sm.status_at_session || sm.milestones?.status || "NOT_STARTED",
      review_notes: sm.review_notes || null,
    })
  );

  return {
    id: row.id,
    student_id: row.student_id,
    student_name: row.students?.full_name || "Unknown Cadet",
    reg_no: row.students?.reg_no || "",
    mentor_id: row.mentor_id,
    scheduled_at: row.scheduled_at || null,
    session_date: row.session_date,
    duration_minutes: row.duration_minutes || 30,
    status,
    session_type: (row.session_type as SessionType) || "GENERAL_MENTORING",
    focus_area: row.focus_area || "General Mentoring",
    observations: row.observations || "",
    notes: row.notes || null,
    outcome: row.outcome || null,
    follow_up_date: row.follow_up_date || null,
    follow_up_notes: row.follow_up_notes || null,
    linked_milestones: linkedMilestones,
    is_historical: isHistorical,
    provenance: row.provenance || "MENTOR_ENTERED",
    created_at: row.created_at,
    updated_at: row.updated_at || row.created_at,
  };
}

// ---------------------------------------------------------------------------
// 3. Query Sessions with Filtering
// ---------------------------------------------------------------------------
export const getSessions = cache(async function getSessions(filters: SessionFilters = {}): Promise<{
  data: SessionItem[];
  error: any;
}> {
  try {
    const supabase = createServerSupabase();

    let query = supabase
      .from("sessions")
      .select(
        `
        *,
        students ( id, full_name, reg_no ),
        session_milestones (
          milestone_id,
          status_at_session,
          review_notes,
          milestones ( id, title, status )
        )
      `
      );

    if (filters.student_id) {
      query = query.eq("student_id", filters.student_id);
    }

    if (filters.session_type) {
      query = query.eq("session_type", filters.session_type);
    }

    // Status filtering
    const today = new Date().toISOString().split("T")[0];
    if (filters.status === "upcoming") {
      query = query
        .in("status", ["PLANNED", "IN_PROGRESS"])
        .gte("session_date", today)
        .order("scheduled_at", { ascending: true, nullsFirst: false })
        .order("session_date", { ascending: true });
    } else if (filters.status === "today") {
      query = query
        .eq("session_date", today)
        .order("scheduled_at", { ascending: true, nullsFirst: false });
    } else if (filters.status === "completed") {
      query = query
        .or("status.eq.COMPLETED,status.is.null,status.eq.HISTORICAL")
        .order("session_date", { ascending: false });
    } else if (filters.status === "cancelled") {
      query = query
        .eq("status", "CANCELLED")
        .order("session_date", { ascending: false });
    } else {
      query = query.order("session_date", { ascending: false });
    }

    const { data, error } = await query;
    if (error) throw error;

    let mapped = (data || []).map(mapSessionRow);

    // Filter by search query if provided (strictly Cadet Name, Reg No, or Topic)
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      mapped = mapped.filter(
        (s) =>
          s.student_name.toLowerCase().includes(q) ||
          s.reg_no.toLowerCase().includes(q) ||
          s.focus_area.toLowerCase().includes(q) ||
          (s.notes && s.notes.toLowerCase().includes(q))
      );
    }

    return { data: mapped, error: null };
  } catch (err: any) {
    console.error("Error fetching sessions:", err);
    return { data: [], error: err?.message || "Failed to load sessions" };
  }
});

// ---------------------------------------------------------------------------
// 4. Query Single Session by ID
// ---------------------------------------------------------------------------
export async function getSessionById(id: string): Promise<SessionItem | null> {
  try {
    const supabase = createServerSupabase();
    const { data, error } = await supabase
      .from("sessions")
      .select(
        `
        *,
        students ( id, full_name, reg_no ),
        session_milestones (
          milestone_id,
          status_at_session,
          review_notes,
          milestones ( id, title, status )
        )
      `
      )
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return mapSessionRow(data);
  } catch (err) {
    console.error("Error getting session by ID:", err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// 5. Query Sessions by Student ID (For Student 360)
// ---------------------------------------------------------------------------
export async function getSessionsByStudentId(studentId: string): Promise<{
  upcoming: SessionItem[];
  completed: SessionItem[];
  historical: SessionItem[];
  cancelled: SessionItem[];
}> {
  const { data } = await getSessions({ student_id: studentId, status: "all" });
  const today = new Date().toISOString().split("T")[0];

  const upcoming: SessionItem[] = [];
  const completed: SessionItem[] = [];
  const historical: SessionItem[] = [];
  const cancelled: SessionItem[] = [];

  for (const s of data) {
    if (s.is_historical) {
      historical.push(s);
    } else if (s.status === "PLANNED" || s.status === "IN_PROGRESS") {
      upcoming.push(s);
    } else if (s.status === "COMPLETED") {
      completed.push(s);
    } else if (s.status === "CANCELLED") {
      cancelled.push(s);
    }
  }

  return { upcoming, completed, historical, cancelled };
}

// ---------------------------------------------------------------------------
// 6. Conflict Detection Engine
// ---------------------------------------------------------------------------
export async function checkMentorSchedulingConflict(
  mentorId: string,
  scheduledAtISO: string,
  durationMinutes: number,
  excludeSessionId?: string
): Promise<{ conflict: boolean; message?: string }> {
  try {
    const supabase = createServerSupabase();
    const newStart = new Date(scheduledAtISO).getTime();
    const newEnd = newStart + durationMinutes * 60000;

    // Determine query window around same day
    const sessionDate = scheduledAtISO.split("T")[0];

    const { data: candidateSessions } = await supabase
      .from("sessions")
      .select("id, scheduled_at, duration_minutes, students(full_name)")
      .eq("mentor_id", mentorId)
      .eq("session_date", sessionDate)
      .in("status", ["PLANNED", "IN_PROGRESS"]);

    if (!candidateSessions) return { conflict: false };

    for (const sess of candidateSessions) {
      if (excludeSessionId && sess.id === excludeSessionId) continue;
      if (!sess.scheduled_at) continue;

      const existingStart = new Date(sess.scheduled_at).getTime();
      const existingDuration = sess.duration_minutes || 30;
      const existingEnd = existingStart + existingDuration * 60000;

      // Overlap condition: startA < endB && endA > startB
      if (newStart < existingEnd && newEnd > existingStart) {
        const studentName = (sess.students as any)?.full_name || "a cadet";
        const conflictTime = new Date(sess.scheduled_at).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
          timeZone: "Asia/Kolkata",
        });
        return {
          conflict: true,
          message: `Scheduling conflict: You already have a session booked with ${studentName} at ${conflictTime} (${existingDuration} mins).`,
        };
      }
    }

    return { conflict: false };
  } catch (err) {
    console.error("Conflict detection check error:", err);
    return { conflict: false }; // Non-blocking if query fails
  }
}

// ---------------------------------------------------------------------------
// 7. Execute Session Creation
// ---------------------------------------------------------------------------
export async function executeCreateSession(payload: {
  student_id: string;
  scheduled_at: string;
  duration_minutes?: number;
  session_type?: SessionType;
  focus_area?: string;
  notes?: string;
  milestone_ids?: string[];
}) {
  const { user, supabase } = await getAuthenticatedFaculty();

  const duration = payload.duration_minutes || 30;
  const sessionType = payload.session_type || "GENERAL_MENTORING";
  const sessionDate = payload.scheduled_at.split("T")[0];

  // Conflict detection
  const conflictCheck = await checkMentorSchedulingConflict(
    user.id,
    payload.scheduled_at,
    duration
  );
  if (conflictCheck.conflict) {
    throw new Error(conflictCheck.message);
  }

  const { data: newSession, error } = await supabase
    .from("sessions")
    .insert({
      student_id: payload.student_id,
      mentor_id: user.id,
      session_date: sessionDate,
      scheduled_at: payload.scheduled_at,
      duration_minutes: duration,
      session_type: sessionType,
      focus_area: payload.focus_area || sessionType.replace(/_/g, " "),
      observations: payload.notes || "",
      notes: payload.notes || null,
      status: "PLANNED",
      provenance: "MENTOR_ENTERED",
    })
    .select()
    .single();

  if (error || !newSession) {
    throw new Error(error?.message || "Failed to schedule mentoring session");
  }

  // Link milestones if provided
  if (payload.milestone_ids && payload.milestone_ids.length > 0) {
    for (const milestoneId of payload.milestone_ids) {
      await executeLinkMilestoneToSession(newSession.id, milestoneId);
    }
  }

  await recordAuditLog(supabase, "SESSION_CREATE", newSession.id, user.id, null, {
    student_id: newSession.student_id,
    scheduled_at: newSession.scheduled_at,
    session_type: newSession.session_type,
  });

  return newSession;
}

// ---------------------------------------------------------------------------
// 8. Execute Start Session (PLANNED -> IN_PROGRESS)
// ---------------------------------------------------------------------------
export async function executeStartSession(sessionId: string) {
  const { user, supabase } = await getAuthenticatedFaculty();

  const existing = await getSessionById(sessionId);
  if (!existing) throw new Error("Session not found");

  if (existing.status !== "PLANNED") {
    throw new Error(`Cannot start session in status: ${existing.status}`);
  }

  const { data, error } = await supabase
    .from("sessions")
    .update({
      status: "IN_PROGRESS",
      updated_at: new Date().toISOString(),
    })
    .eq("id", sessionId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  await recordAuditLog(supabase, "SESSION_START", sessionId, user.id, { status: "PLANNED" }, { status: "IN_PROGRESS" });

  return data;
}

// ---------------------------------------------------------------------------
// 9. Execute Complete Session (IN_PROGRESS -> COMPLETED)
// ---------------------------------------------------------------------------
export async function executeCompleteSession(
  sessionId: string,
  payload: {
    observations?: string;
    notes?: string;
    outcome?: string;
    follow_up_date?: string | null;
    follow_up_notes?: string | null;
  }
) {
  const { user, supabase } = await getAuthenticatedFaculty();

  const existing = await getSessionById(sessionId);
  if (!existing) throw new Error("Session not found");

  if (existing.status !== "IN_PROGRESS" && existing.status !== "PLANNED") {
    throw new Error(`Cannot complete session in status: ${existing.status}`);
  }

  const updates: any = {
    status: "COMPLETED",
    updated_at: new Date().toISOString(),
  };

  if (payload.observations !== undefined) updates.observations = payload.observations;
  if (payload.notes !== undefined) updates.notes = payload.notes;
  if (payload.outcome !== undefined) updates.outcome = payload.outcome;
  if (payload.follow_up_date !== undefined) updates.follow_up_date = payload.follow_up_date || null;
  if (payload.follow_up_notes !== undefined) updates.follow_up_notes = payload.follow_up_notes || null;

  const { data, error } = await supabase
    .from("sessions")
    .update(updates)
    .eq("id", sessionId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  await recordAuditLog(
    supabase,
    "SESSION_COMPLETE",
    sessionId,
    user.id,
    { status: existing.status },
    { status: "COMPLETED", outcome: payload.outcome, follow_up_date: payload.follow_up_date }
  );

  return data;
}

// ---------------------------------------------------------------------------
// 10. Execute Cancel Session (PLANNED / IN_PROGRESS -> CANCELLED)
// ---------------------------------------------------------------------------
export async function executeCancelSession(sessionId: string, reason?: string) {
  const { user, supabase } = await getAuthenticatedFaculty();

  const existing = await getSessionById(sessionId);
  if (!existing) throw new Error("Session not found");

  if (!isValidSessionTransition(existing.status, "CANCELLED")) {
    throw new Error(`Cannot cancel session with status: ${existing.status}`);
  }

  const updatedNotes = reason
    ? `${existing.notes ? existing.notes + "\n" : ""}[Cancelled]: ${reason}`
    : existing.notes;

  const { data, error } = await supabase
    .from("sessions")
    .update({
      status: "CANCELLED",
      notes: updatedNotes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", sessionId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  await recordAuditLog(
    supabase,
    "SESSION_CANCEL",
    sessionId,
    user.id,
    { status: existing.status },
    { status: "CANCELLED", reason }
  );

  return data;
}

// ---------------------------------------------------------------------------
// 11. Execute Reschedule Session (PLANNED -> PLANNED)
// ---------------------------------------------------------------------------
export async function executeRescheduleSession(
  sessionId: string,
  payload: {
    scheduled_at: string;
    duration_minutes?: number;
  }
) {
  const { user, supabase } = await getAuthenticatedFaculty();

  const existing = await getSessionById(sessionId);
  if (!existing) throw new Error("Session not found");

  if (existing.status !== "PLANNED") {
    throw new Error(`Cannot reschedule session with status: ${existing.status}`);
  }

  const duration = payload.duration_minutes || existing.duration_minutes || 30;
  const sessionDate = payload.scheduled_at.split("T")[0];

  // Conflict detection
  const conflictCheck = await checkMentorSchedulingConflict(
    user.id,
    payload.scheduled_at,
    duration,
    sessionId
  );
  if (conflictCheck.conflict) {
    throw new Error(conflictCheck.message);
  }

  const oldValues = {
    scheduled_at: existing.scheduled_at,
    session_date: existing.session_date,
    duration_minutes: existing.duration_minutes,
  };

  const { data, error } = await supabase
    .from("sessions")
    .update({
      scheduled_at: payload.scheduled_at,
      session_date: sessionDate,
      duration_minutes: duration,
      updated_at: new Date().toISOString(),
    })
    .eq("id", sessionId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  await recordAuditLog(
    supabase,
    "SESSION_RESCHEDULE",
    sessionId,
    user.id,
    oldValues,
    {
      scheduled_at: payload.scheduled_at,
      session_date: sessionDate,
      duration_minutes: duration,
    }
  );

  return data;
}

// ---------------------------------------------------------------------------
// 12. Link Milestone to Session
// ---------------------------------------------------------------------------
export async function executeLinkMilestoneToSession(
  sessionId: string,
  milestoneId: string,
  reviewNotes?: string
) {
  const { user, supabase } = await getAuthenticatedFaculty();

  // Check if milestone exists and retrieve current status
  const { data: milestone, error: mErr } = await supabase
    .from("milestones")
    .select("id, status")
    .eq("id", milestoneId)
    .single();

  if (mErr || !milestone) {
    throw new Error("Milestone not found");
  }

  // Insert or update link
  const { error } = await supabase.from("session_milestones").upsert(
    {
      session_id: sessionId,
      milestone_id: milestoneId,
      status_at_session: milestone.status,
      review_notes: reviewNotes || null,
    },
    { onConflict: "session_id,milestone_id" }
  );

  if (error) throw new Error(error.message);

  await recordAuditLog(
    supabase,
    "SESSION_MILESTONE_LINK",
    milestoneId,
    user.id,
    null,
    { session_id: sessionId, milestone_id: milestoneId, status: milestone.status }
  );

  return { success: true };
}

// ---------------------------------------------------------------------------
// 13. Execute Delete Session
// ---------------------------------------------------------------------------
export async function executeDeleteSession(sessionId: string) {
  const { user, supabase } = await getAuthenticatedFaculty();

  const existing = await getSessionById(sessionId);
  if (!existing) {
    throw new Error("Mentoring session not found or already deleted");
  }

  // Historical Protection: Never allow deleting historical baseline records
  if (
    existing.is_historical ||
    existing.status === "HISTORICAL" ||
    existing.provenance === "HISTORICAL_IMPORT" ||
    existing.provenance === "HISTORICAL_PROFILE"
  ) {
    throw new Error(
      "Historical mentoring sessions are permanent institutional records and cannot be deleted."
    );
  }

  // Authorization Check: Must be the mentor who created the session, or an admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (existing.mentor_id !== user.id && profile?.role !== "admin") {
    throw new Error(
      "Unauthorized: You can only delete mentoring sessions you created."
    );
  }

  // 1. Record Audit Log before deleting (preserves historical record & before-state)
  await recordAuditLog(
    supabase,
    "DELETE",
    sessionId,
    user.id,
    {
      id: existing.id,
      student_id: existing.student_id,
      student_name: existing.student_name,
      mentor_id: existing.mentor_id,
      scheduled_at: existing.scheduled_at,
      session_date: existing.session_date,
      session_type: existing.session_type,
      focus_area: existing.focus_area,
      status: existing.status,
      observations: existing.observations,
      notes: existing.notes,
      outcome: existing.outcome,
      follow_up_date: existing.follow_up_date,
      deleted_at: new Date().toISOString(),
    },
    null
  );

  // 2. Safely remove session-specific association records (session_milestones)
  const { error: smError } = await supabase
    .from("session_milestones")
    .delete()
    .eq("session_id", sessionId);

  if (smError) {
    console.error("Warning: Error deleting session_milestones:", smError);
  }

  // 3. Delete the session record
  const { error: delError } = await supabase
    .from("sessions")
    .delete()
    .eq("id", sessionId);

  if (delError) {
    throw new Error(delError.message || "Failed to delete mentoring session");
  }

  return { success: true, studentId: existing.student_id };
}

