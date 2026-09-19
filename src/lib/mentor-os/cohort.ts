/**
 * MENTOR OS is scoped to a single cohort — B.Sc Aeronautical Science, Batch
 * 2025–2028, Section A ("Aero IIA"), the 43 cadets. Other cohorts that may
 * exist in the shared `students` table must never appear anywhere in MENTOR OS.
 *
 * Every primary students query filters by this cohort via an inner join:
 *   .select("… , cohorts!inner(code)").eq("cohorts.code", MENTOR_COHORT_CODE)
 * which keeps only rows whose cohort matches — in a single query.
 */
export const MENTOR_COHORT_CODE = "AERO-2025-28";
