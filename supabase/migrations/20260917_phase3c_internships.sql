-- ==========================================================================
-- MENTOR OS: Phase 3C Internships & Opportunities Hub Schema Migration
-- Migration: 20260917_phase3c_internships.sql
-- ==========================================================================

-- 1. Create Internship Opportunities Catalogue (Reusable Institutional Knowledge)
CREATE TABLE IF NOT EXISTS public.internship_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization TEXT NOT NULL,
    title TEXT NOT NULL,
    location TEXT,
    work_mode TEXT NOT NULL DEFAULT 'ON_SITE',
    description TEXT,
    requirements TEXT,
    application_deadline DATE,
    application_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Additive columns for student internship pursuits (public.internships)
ALTER TABLE public.internships
    ADD COLUMN IF NOT EXISTS opportunity_id UUID REFERENCES public.internship_opportunities(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'APPLIED',
    ADD COLUMN IF NOT EXISTS applied_date DATE,
    ADD COLUMN IF NOT EXISTS mentor_notes TEXT,
    ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id),
    ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- 3. Optimized indexes for querying, status filtering, and foreign key traversal
CREATE INDEX IF NOT EXISTS idx_internships_student_status ON public.internships(student_id, status);
CREATE INDEX IF NOT EXISTS idx_internships_opportunity ON public.internships(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_internship_opportunities_active ON public.internship_opportunities(is_active);
CREATE INDEX IF NOT EXISTS idx_internship_opportunities_deadline ON public.internship_opportunities(application_deadline);

-- 4. Row Level Security for internship opportunities (Strict Faculty/Admin Gate)
ALTER TABLE public.internship_opportunities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Faculty manage internship opportunities" ON public.internship_opportunities;
CREATE POLICY "Faculty manage internship opportunities" ON public.internship_opportunities
    FOR ALL TO authenticated
    USING (public.is_faculty())
    WITH CHECK (public.is_faculty());
