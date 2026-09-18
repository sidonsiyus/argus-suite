"use server";

import { getStudentAnalytics } from "@/lib/data/analytics";
import { StudentAnalytics } from "@/lib/analytics/types";

/**
 * Fetch a cadet's analytics on demand (when the profile "Analytics" tab is
 * opened) instead of on every Student 360 page load. Runs server-side with the
 * mentor's session, so RLS/auth are unchanged.
 */
export async function getStudentAnalyticsAction(
  studentId: string
): Promise<{ data: StudentAnalytics | null; error: string | null }> {
  try {
    const data = await getStudentAnalytics(studentId);
    return { data, error: null };
  } catch {
    return { data: null, error: "Failed to load cadet analytics." };
  }
}
