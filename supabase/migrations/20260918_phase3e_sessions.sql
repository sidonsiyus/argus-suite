-- ==========================================================================
-- MENTOR OS: Phase 3E Mentoring Sessions & Calendar Schema Migration
-- Migration: 20260918_phase3e_sessions.sql
-- ==========================================================================

-- 1. Additive columns for public.sessions
ALTER TABLE public.sessions
    ADD COLUMN IF NOT EXISTS status TEXT,
    ADD COLUMN IF NOT EXISTS session_type TEXT NOT NULL DEFAULT 'GENERAL_MENTORING',
    ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS outcome TEXT,
    ADD COLUMN IF NOT EXISTS follow_up_date DATE,
    ADD COLUMN IF NOT EXISTS follow_up_notes TEXT,
    ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2. Relax observations NOT NULL constraint so PLANNED sessions can be scheduled without upfront observations
ALTER TABLE public.sessions ALTER COLUMN observations DROP NOT NULL;
ALTER TABLE public.sessions ALTER COLUMN observations SET DEFAULT '';

-- 3. Controlled status check constraint supporting NULL/HISTORICAL for 14 historical records
DO $$ BEGIN
    ALTER TABLE public.sessions 
        DROP CONSTRAINT IF EXISTS check_session_status;
    ALTER TABLE public.sessions 
        ADD CONSTRAINT check_session_status 
        CHECK (status IS NULL OR status IN ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'HISTORICAL'));
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- 4. Controlled session type check constraint
DO $$ BEGIN
    ALTER TABLE public.sessions 
        DROP CONSTRAINT IF EXISTS check_session_type;
    ALTER TABLE public.sessions 
        ADD CONSTRAINT check_session_type 
        CHECK (session_type IN (
            'GENERAL_MENTORING',
            'CAREER_GUIDANCE',
            'ACADEMIC_SUPPORT',
            'CAREER_READINESS',
            'INTERNSHIP',
            'PLACEMENT',
            'SKILL_DEVELOPMENT',
            'DOCUMENTATION',
            'FOLLOW_UP',
            'OTHER'
        ));
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- 5. Optimized indexes for scheduling, status filtering, and calendar aggregation
CREATE INDEX IF NOT EXISTS idx_sessions_scheduled_at ON public.sessions(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON public.sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_mentor_scheduled ON public.sessions(mentor_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_sessions_follow_up ON public.sessions(follow_up_date) WHERE follow_up_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sessions_student_status ON public.sessions(student_id, status);

-- 6. Additive columns for public.session_milestones if needed
ALTER TABLE public.session_milestones
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- 7. Idempotently expand audit_action enum for session lifecycle and calendar events
DO $$ BEGIN
    ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'SESSION_CREATE';
    ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'SESSION_UPDATE';
    ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'SESSION_START';
    ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'SESSION_COMPLETE';
    ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'SESSION_CANCEL';
    ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'SESSION_RESCHEDULE';
    ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'FOLLOW_UP_UPDATE';
    ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'SESSION_MILESTONE_LINK';
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- 8. Row Level Security policies (Strict Faculty Only)
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_milestones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Faculty manage sessions" ON public.sessions;
CREATE POLICY "Faculty manage sessions" ON public.sessions
    FOR ALL TO authenticated
    USING (public.is_faculty())
    WITH CHECK (public.is_faculty());

DROP POLICY IF EXISTS "Faculty manage session milestones" ON public.session_milestones;
CREATE POLICY "Faculty manage session milestones" ON public.session_milestones
    FOR ALL TO authenticated
    USING (public.is_faculty())
    WITH CHECK (public.is_faculty());
