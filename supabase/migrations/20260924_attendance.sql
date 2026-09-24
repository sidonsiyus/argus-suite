-- ==========================================================================
-- Professor Console: attendance (native rebuild on Supabase)
-- Migration: 20260924_attendance.sql
-- Per-student daily attendance, plus a per-day lock flag. Roster is the shared
-- public.students table (AERO-2025-28 cohort). Faculty-only via is_faculty().
-- ==========================================================================

CREATE TABLE IF NOT EXISTS public.attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    day DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'present'
        CHECK (status IN ('present', 'absent', 'late', 'od')),  -- od = on-duty/excused
    note TEXT,
    marked_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (student_id, day)
);

CREATE INDEX IF NOT EXISTS idx_attendance_day ON public.attendance_records(day);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON public.attendance_records(student_id);

-- Per-day metadata (lock a finalised day so it can't be edited by accident).
CREATE TABLE IF NOT EXISTS public.attendance_days (
    day DATE PRIMARY KEY,
    locked BOOLEAN NOT NULL DEFAULT false,
    note TEXT,
    updated_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Row Level Security — strict faculty only (attendance is sensitive).
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_days ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Faculty manage attendance records" ON public.attendance_records;
CREATE POLICY "Faculty manage attendance records" ON public.attendance_records
    FOR ALL TO authenticated
    USING (public.is_faculty()) WITH CHECK (public.is_faculty());

DROP POLICY IF EXISTS "Faculty manage attendance days" ON public.attendance_days;
CREATE POLICY "Faculty manage attendance days" ON public.attendance_days
    FOR ALL TO authenticated
    USING (public.is_faculty()) WITH CHECK (public.is_faculty());
