-- ==========================================================================
-- Professor Console: daily class schedule
-- Migration: 20260924_professor_schedules.sql
-- One row per calendar day holding the professor's timetable for that day.
-- Entries are stored as JSON so the shape can evolve without a schema change.
-- Read paths degrade gracefully if this table is absent (no schedule shown).
-- ==========================================================================

CREATE TABLE IF NOT EXISTS public.schedules (
    day DATE PRIMARY KEY,
    entries JSONB NOT NULL DEFAULT '[]'::jsonb,   -- [{ time, subject, room, group }]
    source TEXT,                                   -- 'manual' | 'image' | null
    updated_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Row Level Security (faculty only, matching the rest of the suite)
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Faculty manage schedules" ON public.schedules;
CREATE POLICY "Faculty manage schedules" ON public.schedules
    FOR ALL TO authenticated
    USING (public.is_faculty())
    WITH CHECK (public.is_faculty());
