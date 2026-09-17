-- ==========================================================================
-- MENTOR OS: Phase 3D Functional Intervention Groups Schema Migration
-- Migration: 20260917_phase3d_groups.sql
-- ==========================================================================

-- 1. Additive columns for public.groups (Functional Intervention Support)
ALTER TABLE public.groups
    ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'OTHER',
    ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ACTIVE',
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- 2. Additive columns for public.group_members
ALTER TABLE public.group_members
    ADD COLUMN IF NOT EXISTS joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ADD COLUMN IF NOT EXISTS notes TEXT,
    ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- 3. Optimized indexes for fast roster lookup, category, and status filtering
CREATE INDEX IF NOT EXISTS idx_groups_status ON public.groups(status);
CREATE INDEX IF NOT EXISTS idx_groups_category ON public.groups(category);
CREATE INDEX IF NOT EXISTS idx_group_members_student ON public.group_members(student_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group ON public.group_members(group_id);

-- 4. Idempotently expand audit_action enum if needed
DO $$ BEGIN
    ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'GROUP_MEMBER_ADD';
    ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'GROUP_MEMBER_REMOVE';
    ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'ARCHIVE';
    ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'RESTORE';
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- 5. Row Level Security policies (Strict Faculty Only)
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Faculty manage groups" ON public.groups;
CREATE POLICY "Faculty manage groups" ON public.groups
    FOR ALL TO authenticated
    USING (public.is_faculty())
    WITH CHECK (public.is_faculty());

DROP POLICY IF EXISTS "Faculty manage group members" ON public.group_members;
CREATE POLICY "Faculty manage group members" ON public.group_members
    FOR ALL TO authenticated
    USING (public.is_faculty())
    WITH CHECK (public.is_faculty());
