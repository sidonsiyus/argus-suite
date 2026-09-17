-- ==========================================================================
-- MENTOR OS: Phase 3A Resources Library Schema Migration
-- Migration: 20260917_phase3a_resources.sql
-- ==========================================================================

-- 1. Create resource_type Enum if not exists
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'resource_type') THEN
        CREATE TYPE resource_type AS ENUM (
            'COURSE',
            'DOCUMENT',
            'TOOL',
            'VIDEO',
            'GUIDE',
            'OFFICIAL_PORTAL',
            'CERTIFICATION_PREP'
        );
    END IF;
END $$;

-- 2. Additive columns for public.resources
ALTER TABLE public.resources
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS resource_type resource_type NOT NULL DEFAULT 'GUIDE',
    ADD COLUMN IF NOT EXISTS provider TEXT,
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
    ADD COLUMN IF NOT EXISTS provenance data_provenance NOT NULL DEFAULT 'MENTOR_ENTERED',
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- 3. Additive columns for public.milestone_resources
ALTER TABLE public.milestone_resources
    ADD COLUMN IF NOT EXISTS added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ADD COLUMN IF NOT EXISTS added_by UUID REFERENCES auth.users(id);

-- 4. Safe Indexes for fast search, category/type filtering and join lookups
CREATE INDEX IF NOT EXISTS idx_resources_category_type ON public.resources(category, resource_type, is_active);
CREATE INDEX IF NOT EXISTS idx_resources_is_active ON public.resources(is_active);
CREATE INDEX IF NOT EXISTS idx_resources_created_at ON public.resources(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_milestone_resources_resource ON public.milestone_resources(resource_id);
CREATE INDEX IF NOT EXISTS idx_milestone_resources_milestone ON public.milestone_resources(milestone_id);
