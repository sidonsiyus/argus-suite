-- ==========================================================================
-- MENTOR OS: Phase 2 Initial Schema Migration (Non-Destructive)
-- Migration: 20260915_mentor_os_init.sql
-- ==========================================================================

-- --------------------------------------------------------------------------
-- 1. Custom Types & Enums (Safe Idempotent Creation)
-- --------------------------------------------------------------------------
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'data_provenance') THEN
        CREATE TYPE data_provenance AS ENUM (
            'STUDENT_REPORTED',
            'MENTOR_ENTERED',
            'SYSTEM_GENERATED',
            'AI_GENERATED',
            'VERIFIED',
            'LEGACY_IMPORTED',
            'HISTORICAL_PROFILE'
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'skill_assessment_type') THEN
        CREATE TYPE skill_assessment_type AS ENUM (
            'SELF_REPORTED',
            'MENTOR_ASSESSED',
            'VERIFIED',
            'HISTORICAL_PROFILE',
            'LEGACY_IMPORTED'
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'readiness_state') THEN
        CREATE TYPE readiness_state AS ENUM (
            'NOT_REPORTED',
            'AVAILABLE',
            'VERIFIED'
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'milestone_status') THEN
        CREATE TYPE milestone_status AS ENUM (
            'NOT_STARTED',
            'ACTIVE',
            'SUBMITTED',
            'UNDER_REVIEW',
            'COMPLETED',
            'BLOCKED',
            'CANCELLED'
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'milestone_priority') THEN
        CREATE TYPE milestone_priority AS ENUM (
            'LOW',
            'MEDIUM',
            'HIGH',
            'CRITICAL'
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ai_rec_status') THEN
        CREATE TYPE ai_rec_status AS ENUM (
            'PENDING',
            'APPROVED',
            'EDITED',
            'REJECTED'
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_category') THEN
        CREATE TYPE document_category AS ENUM (
            'RESUME',
            'PASSPORT',
            'DRIVING_LICENSE',
            'PAN_CARD',
            'AADHAAR_CARD',
            'DGCA_RESULT',
            'INTERNSHIP_CERTIFICATE',
            'INDUSTRIAL_VISIT_CERTIFICATE',
            'MEDICAL_ASSESSMENT',
            'OTHER'
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'audit_action') THEN
        CREATE TYPE audit_action AS ENUM (
            'INSERT',
            'UPDATE',
            'DELETE',
            'RECONCILE',
            'APPROVE_AI',
            'VERIFY_DOCUMENT',
            'STATUS_TRANSITION'
        );
    END IF;
END $$;

-- --------------------------------------------------------------------------
-- 1.5. User Profiles (Auth & Role Mapping)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    reg_no TEXT,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'instructor', 'admin')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_reg_no ON public.profiles(reg_no);

-- Auto-create profile trigger on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, reg_no, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'full_name', ''),
    NULLIF(new.raw_user_meta_data ->> 'reg_no', ''),
    COALESCE(new.raw_user_meta_data ->> 'role', 'student')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- --------------------------------------------------------------------------
-- 2. Cohorts & Academic Batches
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cohorts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    programme TEXT NOT NULL DEFAULT 'B.Sc. Aeronautical Science',
    academic_year TEXT NOT NULL,
    current_year_of_study TEXT NOT NULL DEFAULT '2nd Year',
    section TEXT NOT NULL DEFAULT 'A',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cohorts_code ON public.cohorts(code);
CREATE INDEX IF NOT EXISTS idx_cohorts_academic_year ON public.cohorts(academic_year);

-- --------------------------------------------------------------------------
-- 3. Canonical Students Table
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reg_no TEXT UNIQUE NOT NULL,
    sno INTEGER NOT NULL,
    full_name TEXT NOT NULL,
    cohort_id UUID NOT NULL REFERENCES public.cohorts(id) ON DELETE RESTRICT,
    phone TEXT,
    email TEXT,
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_students_reg_no ON public.students(reg_no);
CREATE INDEX IF NOT EXISTS idx_students_cohort ON public.students(cohort_id);
CREATE INDEX IF NOT EXISTS idx_students_sno ON public.students(sno);

-- --------------------------------------------------------------------------
-- 4. Identity Reconciliation Ledger
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.student_identities_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    source_dataset TEXT NOT NULL,
    raw_name TEXT NOT NULL,
    raw_reg_no TEXT NOT NULL,
    raw_phone TEXT,
    canonical_reg_no TEXT NOT NULL,
    resolution_status TEXT NOT NULL,
    resolution_rationale TEXT NOT NULL,
    resolved_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_identities_audit_student ON public.student_identities_audit(student_id);
CREATE INDEX IF NOT EXISTS idx_identities_audit_raw_reg ON public.student_identities_audit(raw_reg_no);

-- --------------------------------------------------------------------------
-- 5. Student Profiles (Intake Demographics & Admin Background)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.student_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL UNIQUE REFERENCES public.students(id) ON DELETE CASCADE,
    gender TEXT CHECK (gender IN ('Male', 'Female', 'Other', 'Prefer not to say')),
    dob DATE,
    blood_group TEXT,
    parent_phone TEXT,
    emergency_contact_number TEXT,
    emergency_contact_relation TEXT,
    father_name TEXT,
    father_occupation TEXT,
    mother_name TEXT,
    mother_occupation TEXT,
    family_income_band TEXT,
    sslc_score TEXT,
    hsc_score TEXT,
    why_aviation TEXT,
    inspired_by TEXT,
    dream_organizations TEXT[] DEFAULT '{}',
    after_graduation_plan TEXT,
    five_year_vision TEXT,
    languages TEXT[] DEFAULT '{}',
    technical_expertise TEXT,
    sports TEXT[] DEFAULT '{}',
    hobbies TEXT[] DEFAULT '{}',
    clubs_of_interest TEXT[] DEFAULT '{}',
    learning_styles TEXT[] DEFAULT '{}',
    preferred_communication TEXT[] DEFAULT '{}',
    medical_conditions TEXT,
    allergies TEXT,
    fitness_routine TEXT,
    biggest_challenge TEXT,
    mentor_help_needed TEXT,
    dgca_status TEXT,
    provenance data_provenance NOT NULL DEFAULT 'STUDENT_REPORTED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_student ON public.student_profiles(student_id);

-- --------------------------------------------------------------------------
-- 6. Career Roles & Goals
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.career_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    short_title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    prerequisites TEXT[] NOT NULL DEFAULT '{}',
    required_skills TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_career_roles_slug ON public.career_roles(slug);

CREATE TABLE IF NOT EXISTS public.student_career_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    career_role_id UUID REFERENCES public.career_roles(id) ON DELETE SET NULL,
    custom_role_title TEXT,
    is_primary BOOLEAN NOT NULL DEFAULT true,
    confidence_level INTEGER CHECK (confidence_level BETWEEN 1 AND 5),
    target_timeline TEXT,
    mentor_notes TEXT,
    provenance data_provenance NOT NULL DEFAULT 'HISTORICAL_PROFILE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_career_goals_student ON public.student_career_goals(student_id);

-- --------------------------------------------------------------------------
-- 7. Skills & Historical Skill Assessments
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    is_universal BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_skills_slug ON public.skills(slug);

CREATE TABLE IF NOT EXISTS public.skill_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    assessment_type skill_assessment_type NOT NULL,
    assessed_by UUID REFERENCES auth.users(id),
    assessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    notes TEXT,
    provenance data_provenance NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_skill_assessments_lookup ON public.skill_assessments(student_id, skill_id, assessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_skill_assessments_type ON public.skill_assessments(assessment_type);

-- --------------------------------------------------------------------------
-- 8. Career Readiness (Tri-State Verification)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.career_readiness (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL UNIQUE REFERENCES public.students(id) ON DELETE CASCADE,
    resume_status readiness_state NOT NULL DEFAULT 'NOT_REPORTED',
    resume_doc_id UUID,
    linkedin_status readiness_state NOT NULL DEFAULT 'NOT_REPORTED',
    linkedin_url TEXT,
    passport_status readiness_state NOT NULL DEFAULT 'NOT_REPORTED',
    passport_doc_id UUID,
    driving_license_status readiness_state NOT NULL DEFAULT 'NOT_REPORTED',
    driving_license_doc_id UUID,
    pan_card_status readiness_state NOT NULL DEFAULT 'NOT_REPORTED',
    pan_card_doc_id UUID,
    aadhaar_card_status readiness_state NOT NULL DEFAULT 'NOT_REPORTED',
    aadhaar_card_doc_id UUID,
    student_reported_raw JSONB NOT NULL DEFAULT '{}',
    verified_by UUID REFERENCES auth.users(id),
    verified_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_readiness_student ON public.career_readiness(student_id);

-- --------------------------------------------------------------------------
-- 9. Student Documents
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.student_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category document_category NOT NULL DEFAULT 'OTHER',
    storage_path TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    mime_type TEXT NOT NULL DEFAULT 'application/pdf',
    is_verified BOOLEAN NOT NULL DEFAULT false,
    verified_by UUID REFERENCES auth.users(id),
    verified_at TIMESTAMPTZ,
    uploaded_by UUID REFERENCES auth.users(id),
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_documents_student ON public.student_documents(student_id);

-- --------------------------------------------------------------------------
-- 10. Milestones & Status History
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    gap_addressed TEXT,
    category TEXT NOT NULL,
    priority milestone_priority NOT NULL DEFAULT 'MEDIUM',
    status milestone_status NOT NULL DEFAULT 'NOT_STARTED',
    completion_percentage INTEGER NOT NULL DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
    success_criteria TEXT NOT NULL,
    target_date DATE,
    blocked_reason TEXT,
    mentor_feedback TEXT,
    student_notes TEXT,
    evidence_text TEXT,
    evidence_doc_id UUID REFERENCES public.student_documents(id) ON DELETE SET NULL,
    evidence_submitted_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id),
    reviewed_by UUID REFERENCES auth.users(id),
    provenance data_provenance NOT NULL DEFAULT 'MENTOR_ENTERED',
    is_ai_suggested BOOLEAN NOT NULL DEFAULT false,
    ai_recommendation_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_milestones_student_status ON public.milestones(student_id, status);
CREATE INDEX IF NOT EXISTS idx_milestones_target_date ON public.milestones(target_date);

CREATE TABLE IF NOT EXISTS public.milestone_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    milestone_id UUID NOT NULL REFERENCES public.milestones(id) ON DELETE CASCADE,
    from_status milestone_status,
    to_status milestone_status NOT NULL,
    reason TEXT,
    notes TEXT,
    changed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_milestone_history_lookup ON public.milestone_status_history(milestone_id, created_at DESC);

-- --------------------------------------------------------------------------
-- 11. Resources & Milestone Resources
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    url TEXT,
    category TEXT NOT NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    is_public BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.milestone_resources (
    milestone_id UUID NOT NULL REFERENCES public.milestones(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
    PRIMARY KEY (milestone_id, resource_id)
);

-- --------------------------------------------------------------------------
-- 12. Sessions & Session Milestones
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    mentor_id UUID NOT NULL REFERENCES auth.users(id),
    session_date DATE NOT NULL DEFAULT CURRENT_DATE,
    focus_area TEXT NOT NULL,
    observations TEXT NOT NULL,
    student_commitments TEXT,
    progress_delta INTEGER DEFAULT 0,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    provenance data_provenance NOT NULL DEFAULT 'MENTOR_ENTERED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sessions_student_date ON public.sessions(student_id, session_date DESC);

CREATE TABLE IF NOT EXISTS public.session_milestones (
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    milestone_id UUID NOT NULL REFERENCES public.milestones(id) ON DELETE CASCADE,
    status_at_session milestone_status NOT NULL,
    review_notes TEXT,
    PRIMARY KEY (session_id, milestone_id)
);

-- --------------------------------------------------------------------------
-- 13. Internships & Achievements
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.internships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    organization TEXT NOT NULL,
    role_description TEXT,
    start_date DATE,
    end_date DATE,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    certificate_doc_id UUID REFERENCES public.student_documents(id) ON DELETE SET NULL,
    provenance data_provenance NOT NULL DEFAULT 'STUDENT_REPORTED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    issued_by TEXT,
    date_achieved DATE,
    notes TEXT,
    certificate_doc_id UUID REFERENCES public.student_documents(id) ON DELETE SET NULL,
    provenance data_provenance NOT NULL DEFAULT 'STUDENT_REPORTED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------------------
-- 14. Groups & Members
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    career_role_id UUID REFERENCES public.career_roles(id) ON DELETE SET NULL,
    description TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.group_members (
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (group_id, student_id)
);

-- --------------------------------------------------------------------------
-- 15. AI Recommendations (Human-in-the-Loop Audit Table)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    provider TEXT NOT NULL DEFAULT 'groq',
    model_name TEXT NOT NULL,
    prompt_scope TEXT NOT NULL,
    sanitized_input_context JSONB NOT NULL,
    raw_response JSONB NOT NULL,
    suggested_actions JSONB NOT NULL,
    status ai_rec_status NOT NULL DEFAULT 'PENDING',
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_rec_student ON public.ai_recommendations(student_id, status);

-- --------------------------------------------------------------------------
-- 16. System Audit Logs
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_table TEXT NOT NULL,
    entity_id UUID NOT NULL,
    action audit_action NOT NULL,
    actor_id UUID REFERENCES auth.users(id),
    actor_role TEXT NOT NULL DEFAULT 'faculty',
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_table, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- --------------------------------------------------------------------------
-- 17. Dynamic Views (Replacing Static Excel Sheets)
-- --------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.view_latest_student_skills AS
SELECT DISTINCT ON (student_id, skill_id)
    sa.student_id,
    sa.skill_id,
    s.name AS skill_name,
    s.category AS skill_category,
    sa.rating AS latest_rating,
    sa.assessment_type AS latest_assessment_type,
    sa.assessed_at AS latest_assessed_at,
    sa.notes AS latest_notes,
    sa.provenance AS latest_provenance
FROM public.skill_assessments sa
JOIN public.skills s ON s.id = sa.skill_id
ORDER BY student_id, skill_id, assessed_at DESC;

CREATE OR REPLACE VIEW public.view_career_distribution AS
SELECT 
    COALESCE(cr.title, scg.custom_role_title, 'Undecided') AS career_goal,
    COUNT(DISTINCT scg.student_id) AS student_count,
    ROUND(COUNT(DISTINCT scg.student_id)::NUMERIC / NULLIF((SELECT COUNT(*) FROM public.students WHERE is_active = true), 0) * 100, 1) AS share_percentage
FROM public.student_career_goals scg
LEFT JOIN public.career_roles cr ON cr.id = scg.career_role_id
WHERE scg.is_primary = true
GROUP BY COALESCE(cr.title, scg.custom_role_title, 'Undecided')
ORDER BY student_count DESC;

CREATE OR REPLACE VIEW public.view_priority_attention AS
SELECT 
    s.id AS student_id,
    s.reg_no,
    s.full_name,
    c.academic_year,
    c.section,
    MAX(sess.session_date) AS last_session_date,
    COUNT(m.id) FILTER (WHERE m.status = 'BLOCKED') AS blocked_milestones_count,
    COUNT(m.id) FILTER (WHERE m.status = 'ACTIVE' AND m.target_date < CURRENT_DATE) AS overdue_milestones_count,
    (scg.id IS NULL) AS missing_career_goal
FROM public.students s
JOIN public.cohorts c ON c.id = s.cohort_id
LEFT JOIN public.sessions sess ON sess.student_id = s.id
LEFT JOIN public.milestones m ON m.student_id = s.id
LEFT JOIN public.student_career_goals scg ON scg.student_id = s.id AND scg.is_primary = true
WHERE s.is_active = true
GROUP BY s.id, s.reg_no, s.full_name, c.academic_year, c.section, scg.id
HAVING 
    MAX(sess.session_date) IS NULL 
    OR MAX(sess.session_date) < (CURRENT_DATE - INTERVAL '45 days')
    OR COUNT(m.id) FILTER (WHERE m.status = 'BLOCKED') > 0
    OR COUNT(m.id) FILTER (WHERE m.status = 'ACTIVE' AND m.target_date < CURRENT_DATE) > 0
    OR scg.id IS NULL;

-- --------------------------------------------------------------------------
-- 18. Row Level Security (RLS) Setup
-- --------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_identities_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_career_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_readiness ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestone_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestone_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Recursion-safe faculty check helper (compatible with existing portal if present)
CREATE OR REPLACE FUNCTION public.is_faculty()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('instructor', 'admin')
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_faculty() TO authenticated;

-- Profiles access policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Faculty can view all profiles" ON public.profiles;
CREATE POLICY "Faculty can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.is_faculty());


-- Public taxonomy read policies
DROP POLICY IF EXISTS "Anyone authenticated can view cohorts" ON public.cohorts;
CREATE POLICY "Anyone authenticated can view cohorts" ON public.cohorts FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Anyone authenticated can view career roles" ON public.career_roles;
CREATE POLICY "Anyone authenticated can view career roles" ON public.career_roles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Anyone authenticated can view skills" ON public.skills;
CREATE POLICY "Anyone authenticated can view skills" ON public.skills FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Anyone authenticated can view resources" ON public.resources;
CREATE POLICY "Anyone authenticated can view resources" ON public.resources FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Anyone authenticated can view milestone resources" ON public.milestone_resources;
CREATE POLICY "Anyone authenticated can view milestone resources" ON public.milestone_resources FOR SELECT TO authenticated USING (true);

-- Faculty full CRUD policies across all MENTOR OS tables
DROP POLICY IF EXISTS "Faculty manage cohorts" ON public.cohorts;
CREATE POLICY "Faculty manage cohorts" ON public.cohorts FOR ALL TO authenticated USING (public.is_faculty()) WITH CHECK (public.is_faculty());

DROP POLICY IF EXISTS "Faculty manage students" ON public.students;
CREATE POLICY "Faculty manage students" ON public.students FOR ALL TO authenticated USING (public.is_faculty()) WITH CHECK (public.is_faculty());

DROP POLICY IF EXISTS "Faculty manage identities audit" ON public.student_identities_audit;
CREATE POLICY "Faculty manage identities audit" ON public.student_identities_audit FOR ALL TO authenticated USING (public.is_faculty()) WITH CHECK (public.is_faculty());

DROP POLICY IF EXISTS "Faculty manage student profiles" ON public.student_profiles;
CREATE POLICY "Faculty manage student profiles" ON public.student_profiles FOR ALL TO authenticated USING (public.is_faculty()) WITH CHECK (public.is_faculty());

DROP POLICY IF EXISTS "Faculty manage career roles" ON public.career_roles;
CREATE POLICY "Faculty manage career roles" ON public.career_roles FOR ALL TO authenticated USING (public.is_faculty()) WITH CHECK (public.is_faculty());

DROP POLICY IF EXISTS "Faculty manage career goals" ON public.student_career_goals;
CREATE POLICY "Faculty manage career goals" ON public.student_career_goals FOR ALL TO authenticated USING (public.is_faculty()) WITH CHECK (public.is_faculty());

DROP POLICY IF EXISTS "Faculty manage skills" ON public.skills;
CREATE POLICY "Faculty manage skills" ON public.skills FOR ALL TO authenticated USING (public.is_faculty()) WITH CHECK (public.is_faculty());

DROP POLICY IF EXISTS "Faculty manage skill assessments" ON public.skill_assessments;
CREATE POLICY "Faculty manage skill assessments" ON public.skill_assessments FOR ALL TO authenticated USING (public.is_faculty()) WITH CHECK (public.is_faculty());

DROP POLICY IF EXISTS "Faculty manage career readiness" ON public.career_readiness;
CREATE POLICY "Faculty manage career readiness" ON public.career_readiness FOR ALL TO authenticated USING (public.is_faculty()) WITH CHECK (public.is_faculty());

DROP POLICY IF EXISTS "Faculty manage student documents" ON public.student_documents;
CREATE POLICY "Faculty manage student documents" ON public.student_documents FOR ALL TO authenticated USING (public.is_faculty()) WITH CHECK (public.is_faculty());

DROP POLICY IF EXISTS "Faculty manage milestones" ON public.milestones;
CREATE POLICY "Faculty manage milestones" ON public.milestones FOR ALL TO authenticated USING (public.is_faculty()) WITH CHECK (public.is_faculty());

DROP POLICY IF EXISTS "Faculty manage milestone status history" ON public.milestone_status_history;
CREATE POLICY "Faculty manage milestone status history" ON public.milestone_status_history FOR ALL TO authenticated USING (public.is_faculty()) WITH CHECK (public.is_faculty());

DROP POLICY IF EXISTS "Faculty manage resources" ON public.resources;
CREATE POLICY "Faculty manage resources" ON public.resources FOR ALL TO authenticated USING (public.is_faculty()) WITH CHECK (public.is_faculty());

DROP POLICY IF EXISTS "Faculty manage milestone resources" ON public.milestone_resources;
CREATE POLICY "Faculty manage milestone resources" ON public.milestone_resources FOR ALL TO authenticated USING (public.is_faculty()) WITH CHECK (public.is_faculty());

DROP POLICY IF EXISTS "Faculty manage sessions" ON public.sessions;
CREATE POLICY "Faculty manage sessions" ON public.sessions FOR ALL TO authenticated USING (public.is_faculty()) WITH CHECK (public.is_faculty());

DROP POLICY IF EXISTS "Faculty manage session milestones" ON public.session_milestones;
CREATE POLICY "Faculty manage session milestones" ON public.session_milestones FOR ALL TO authenticated USING (public.is_faculty()) WITH CHECK (public.is_faculty());

DROP POLICY IF EXISTS "Faculty manage internships" ON public.internships;
CREATE POLICY "Faculty manage internships" ON public.internships FOR ALL TO authenticated USING (public.is_faculty()) WITH CHECK (public.is_faculty());

DROP POLICY IF EXISTS "Faculty manage achievements" ON public.achievements;
CREATE POLICY "Faculty manage achievements" ON public.achievements FOR ALL TO authenticated USING (public.is_faculty()) WITH CHECK (public.is_faculty());

DROP POLICY IF EXISTS "Faculty manage groups" ON public.groups;
CREATE POLICY "Faculty manage groups" ON public.groups FOR ALL TO authenticated USING (public.is_faculty()) WITH CHECK (public.is_faculty());

DROP POLICY IF EXISTS "Faculty manage group members" ON public.group_members;
CREATE POLICY "Faculty manage group members" ON public.group_members FOR ALL TO authenticated USING (public.is_faculty()) WITH CHECK (public.is_faculty());

DROP POLICY IF EXISTS "Faculty manage AI recommendations" ON public.ai_recommendations;
CREATE POLICY "Faculty manage AI recommendations" ON public.ai_recommendations FOR ALL TO authenticated USING (public.is_faculty()) WITH CHECK (public.is_faculty());

DROP POLICY IF EXISTS "Faculty manage audit logs" ON public.audit_logs;
CREATE POLICY "Faculty manage audit logs" ON public.audit_logs FOR ALL TO authenticated USING (public.is_faculty()) WITH CHECK (public.is_faculty());

-- Student Self-Access (Read-Only) Policies: Cadets can ONLY view their own records
DROP POLICY IF EXISTS "Students can view their own student record" ON public.students;
CREATE POLICY "Students can view their own student record" ON public.students FOR SELECT TO authenticated USING (
  reg_no = (SELECT p.reg_no FROM public.profiles p WHERE p.id = auth.uid())
);

DROP POLICY IF EXISTS "Students can view their own milestones" ON public.milestones;
CREATE POLICY "Students can view their own milestones" ON public.milestones FOR SELECT TO authenticated USING (
  student_id = (SELECT s.id FROM public.students s JOIN public.profiles p ON p.reg_no = s.reg_no WHERE p.id = auth.uid())
);

DROP POLICY IF EXISTS "Students can view their own career goals" ON public.student_career_goals;
CREATE POLICY "Students can view their own career goals" ON public.student_career_goals FOR SELECT TO authenticated USING (
  student_id = (SELECT s.id FROM public.students s JOIN public.profiles p ON p.reg_no = s.reg_no WHERE p.id = auth.uid())
);

DROP POLICY IF EXISTS "Students can view their own skill assessments" ON public.skill_assessments;
CREATE POLICY "Students can view their own skill assessments" ON public.skill_assessments FOR SELECT TO authenticated USING (
  student_id = (SELECT s.id FROM public.students s JOIN public.profiles p ON p.reg_no = s.reg_no WHERE p.id = auth.uid())
);

DROP POLICY IF EXISTS "Students can view their own readiness checklist" ON public.career_readiness;
CREATE POLICY "Students can view their own readiness checklist" ON public.career_readiness FOR SELECT TO authenticated USING (
  student_id = (SELECT s.id FROM public.students s JOIN public.profiles p ON p.reg_no = s.reg_no WHERE p.id = auth.uid())
);

DROP POLICY IF EXISTS "Students can view their own documents" ON public.student_documents;
CREATE POLICY "Students can view their own documents" ON public.student_documents FOR SELECT TO authenticated USING (
  student_id = (SELECT s.id FROM public.students s JOIN public.profiles p ON p.reg_no = s.reg_no WHERE p.id = auth.uid())
);

-- --------------------------------------------------------------------------
-- 19. Storage Bucket Configuration (Private 'student-documents')
-- --------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('student-documents', 'student-documents', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Faculty can manage student documents bucket" ON storage.objects;
CREATE POLICY "Faculty can manage student documents bucket" ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'student-documents' AND public.is_faculty())
WITH CHECK (bucket_id = 'student-documents' AND public.is_faculty());

DROP POLICY IF EXISTS "Students can read their own documents in storage" ON storage.objects;
CREATE POLICY "Students can read their own documents in storage" ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'student-documents' AND
  (storage.foldername(name))[1] = (SELECT p.reg_no FROM public.profiles p WHERE p.id = auth.uid())
);

