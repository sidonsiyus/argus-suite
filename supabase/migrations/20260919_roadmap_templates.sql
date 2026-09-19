-- ==========================================================================
-- MENTOR OS: Career Roadmaps — editable / AI-suggested templates
-- Migration: 20260919_roadmap_templates.sql
-- One active roadmap template per track (overrides the hardcoded seed). The AI
-- proposes stages; a mentor reviews, edits and approves them into this table.
-- Read paths fall back to the code seed if this table is absent/empty.
-- ==========================================================================

CREATE TABLE IF NOT EXISTS public.roadmap_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    track_slug TEXT NOT NULL,
    stages JSONB NOT NULL,          -- [{ key, title, phase, objective, criteria[] }]
    exam_guidance TEXT,
    source TEXT NOT NULL DEFAULT 'MENTOR_EDITED', -- SEED | AI_SUGGESTED | MENTOR_EDITED
    version INTEGER NOT NULL DEFAULT 1,
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (track_slug)             -- one active template per track (upsert)
);

CREATE INDEX IF NOT EXISTS idx_roadmap_templates_track ON public.roadmap_templates(track_slug);

ALTER TABLE public.roadmap_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Faculty manage roadmap templates" ON public.roadmap_templates;
CREATE POLICY "Faculty manage roadmap templates" ON public.roadmap_templates
    FOR ALL TO authenticated
    USING (public.is_faculty())
    WITH CHECK (public.is_faculty());
