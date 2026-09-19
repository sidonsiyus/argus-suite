-- ==========================================================================
-- MENTOR OS: Career Roadmaps — support material attached to a roadmap stage
-- Migration: 20260919_roadmap_stage_resources.sql
-- Links an existing/uploaded resource to a (track, stage). Faculty-only.
-- Reads degrade gracefully if this table is absent.
-- ==========================================================================

CREATE TABLE IF NOT EXISTS public.roadmap_stage_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    track_slug TEXT NOT NULL,
    stage_key TEXT NOT NULL,
    resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (track_slug, stage_key, resource_id)
);

CREATE INDEX IF NOT EXISTS idx_roadmap_stage_resources_stage ON public.roadmap_stage_resources(track_slug, stage_key);

ALTER TABLE public.roadmap_stage_resources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Faculty manage roadmap stage resources" ON public.roadmap_stage_resources;
CREATE POLICY "Faculty manage roadmap stage resources" ON public.roadmap_stage_resources
    FOR ALL TO authenticated
    USING (public.is_faculty())
    WITH CHECK (public.is_faculty());
