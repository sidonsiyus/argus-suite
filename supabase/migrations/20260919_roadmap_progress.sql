-- ==========================================================================
-- MENTOR OS: Career Roadmaps — per-student stage placement
-- Migration: 20260919_roadmap_progress.sql
-- Lets a mentor confirm/override where a cadet stands on a career roadmap.
-- Read paths degrade gracefully if this table is absent (all stages estimated).
-- ==========================================================================

CREATE TABLE IF NOT EXISTS public.roadmap_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    track_slug TEXT NOT NULL,
    current_stage_key TEXT NOT NULL,
    note TEXT,
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (student_id, track_slug)
);

CREATE INDEX IF NOT EXISTS idx_roadmap_progress_track ON public.roadmap_progress(track_slug);
CREATE INDEX IF NOT EXISTS idx_roadmap_progress_student ON public.roadmap_progress(student_id);

-- Row Level Security (strict faculty only, matching the rest of MENTOR OS)
ALTER TABLE public.roadmap_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Faculty manage roadmap progress" ON public.roadmap_progress;
CREATE POLICY "Faculty manage roadmap progress" ON public.roadmap_progress
    FOR ALL TO authenticated
    USING (public.is_faculty())
    WITH CHECK (public.is_faculty());
