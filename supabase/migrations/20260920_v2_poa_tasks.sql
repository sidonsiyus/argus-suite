-- ==========================================================================
-- MENTOR OS: V2 Plan of Action, Tasks & Document Storage Migration
-- Migration: 20260920_v2_poa_tasks.sql
--
-- Safety Guarantees:
-- 1. ADDITIVE ONLY: Zero DROP TABLE, zero DROP COLUMN, zero TRUNCATE.
-- 2. ZERO DELETES: Existing 16 historical milestones remain 100% untouched.
-- 3. NO CASCADE DELETE: Uses ON DELETE RESTRICT on parent_milestone_id and
--    milestone_tasks to prevent accidental cascading data loss.
-- 4. Preserves external tables: public.subjects, public.notes.
-- ==========================================================================

-- 1. Milestone / POA Hierarchy & Outcome Columns (Additive)
ALTER TABLE public.milestones
    ADD COLUMN IF NOT EXISTS parent_milestone_id UUID REFERENCES public.milestones(id) ON DELETE RESTRICT,
    ADD COLUMN IF NOT EXISTS target_outcome TEXT,
    ADD COLUMN IF NOT EXISTS outcome_statement TEXT,
    ADD COLUMN IF NOT EXISTS completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
    ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS text_instructions TEXT,
    ADD COLUMN IF NOT EXISTS evidence_requirement TEXT;

-- 2. Dedicated Granular Action Plan Tasks Table (Additive)
CREATE TABLE IF NOT EXISTS public.milestone_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    milestone_id UUID NOT NULL REFERENCES public.milestones(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMPTZ,
    completed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for milestone_tasks
CREATE INDEX IF NOT EXISTS idx_milestone_tasks_milestone ON public.milestone_tasks(milestone_id);
CREATE INDEX IF NOT EXISTS idx_milestone_tasks_completed ON public.milestone_tasks(is_completed);

-- Row Level Security for milestone_tasks
ALTER TABLE public.milestone_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Faculty manage milestone tasks" ON public.milestone_tasks;
CREATE POLICY "Faculty manage milestone tasks" ON public.milestone_tasks
    FOR ALL TO authenticated
    USING (public.is_faculty())
    WITH CHECK (public.is_faculty());

-- 3. Milestone Resources Mapping (Additive Columns & Policies)
CREATE TABLE IF NOT EXISTS public.milestone_resources (
    milestone_id UUID NOT NULL REFERENCES public.milestones(id) ON DELETE RESTRICT,
    resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE RESTRICT,
    title TEXT,
    url TEXT,
    resource_type TEXT NOT NULL DEFAULT 'URL',
    assigned_by UUID REFERENCES auth.users(id),
    added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    added_by UUID REFERENCES auth.users(id),
    PRIMARY KEY (milestone_id, resource_id)
);

ALTER TABLE public.milestone_resources
    ADD COLUMN IF NOT EXISTS title TEXT,
    ADD COLUMN IF NOT EXISTS url TEXT,
    ADD COLUMN IF NOT EXISTS resource_type TEXT NOT NULL DEFAULT 'URL',
    ADD COLUMN IF NOT EXISTS assigned_by UUID REFERENCES auth.users(id);

ALTER TABLE public.milestone_resources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Faculty manage milestone resources" ON public.milestone_resources;
CREATE POLICY "Faculty manage milestone resources" ON public.milestone_resources
    FOR ALL TO authenticated
    USING (public.is_faculty())
    WITH CHECK (public.is_faculty());

-- 4. Private Storage Bucket for Student Documents (10MB limit, PDF/DOCX only)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'student-documents',
    'student-documents',
    false,
    10485760, -- 10MB
    ARRAY[
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY[
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

-- Storage RLS Policies for student-documents
DROP POLICY IF EXISTS "Faculty read student documents" ON storage.objects;
CREATE POLICY "Faculty read student documents" ON storage.objects
    FOR SELECT TO authenticated
    USING (bucket_id = 'student-documents' AND public.is_faculty());

DROP POLICY IF EXISTS "Faculty upload student documents" ON storage.objects;
CREATE POLICY "Faculty upload student documents" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'student-documents' AND public.is_faculty());

DROP POLICY IF EXISTS "Faculty delete student documents" ON storage.objects;
CREATE POLICY "Faculty delete student documents" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'student-documents' AND public.is_faculty());

-- 5. Extend audit_action enum if needed for POA and document lifecycle
DO $$ BEGIN
    ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'POA_CREATE';
    ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'POA_UPDATE';
    ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'POA_ARCHIVE';
    ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'TASK_CREATE';
    ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'TASK_UPDATE';
    ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'TASK_COMPLETE';
    ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'DOCUMENT_UPLOAD';
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;
