-- ==========================================================================
-- Professor Console: marks (per subject, per student)
-- Migration: 20260925_marks.sql
-- mark_subjects holds the subjects the professor enters marks for, each with
-- editable max marks per assessment. marks holds one row per (student, subject)
-- with the four assessment scores. Roster is the shared public.students.
-- Faculty-only via is_faculty().
-- ==========================================================================

CREATE TABLE IF NOT EXISTS public.mark_subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    cat1_max INT NOT NULL DEFAULT 50,
    cat2_max INT NOT NULL DEFAULT 50,
    model_max INT NOT NULL DEFAULT 100,
    end_sem_max INT NOT NULL DEFAULT 100,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.marks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.mark_subjects(id) ON DELETE CASCADE,
    cat1 NUMERIC,
    cat2 NUMERIC,
    model NUMERIC,
    end_sem NUMERIC,
    updated_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (student_id, subject_id)
);

CREATE INDEX IF NOT EXISTS idx_marks_subject ON public.marks(subject_id);
CREATE INDEX IF NOT EXISTS idx_marks_student ON public.marks(student_id);

ALTER TABLE public.mark_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Faculty manage mark subjects" ON public.mark_subjects;
CREATE POLICY "Faculty manage mark subjects" ON public.mark_subjects
    FOR ALL TO authenticated
    USING (public.is_faculty()) WITH CHECK (public.is_faculty());

DROP POLICY IF EXISTS "Faculty manage marks" ON public.marks;
CREATE POLICY "Faculty manage marks" ON public.marks
    FOR ALL TO authenticated
    USING (public.is_faculty()) WITH CHECK (public.is_faculty());
