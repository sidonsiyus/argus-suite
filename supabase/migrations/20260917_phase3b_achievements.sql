-- ==========================================================================
-- MENTOR OS: Phase 3B Student Achievements Schema Migration
-- Migration: 20260917_phase3b_achievements.sql
-- ==========================================================================

-- 1. Additive columns for public.achievements
ALTER TABLE public.achievements
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id),
    ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- 2. Safe Indexes for student lookup, verification filtering, and sorting
CREATE INDEX IF NOT EXISTS idx_achievements_student_category ON public.achievements(student_id, category);
CREATE INDEX IF NOT EXISTS idx_achievements_is_verified ON public.achievements(is_verified);
CREATE INDEX IF NOT EXISTS idx_achievements_created_at ON public.achievements(created_at DESC);
