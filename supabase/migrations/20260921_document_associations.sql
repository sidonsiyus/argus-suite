-- ==========================================================================
-- MENTOR OS: Phase 4 Document System Enhancement
-- Migration: 20260921_document_associations.sql
--
-- Safety Guarantees:
-- 1. ADDITIVE ONLY: Zero DROP TABLE, zero DROP COLUMN, zero TRUNCATE.
-- 2. ZERO DELETES: Existing documents, internships, milestones remain untouched.
-- 3. Enum Preserved: Extends document_category enum safely without converting to TEXT.
-- 4. Foreign Keys: ON DELETE SET NULL prevents cascading deletions.
-- ==========================================================================

-- 1. Extend document_category enum with new General & Internship categories
ALTER TYPE public.document_category ADD VALUE IF NOT EXISTS 'ACADEMIC_DOCUMENT';
ALTER TYPE public.document_category ADD VALUE IF NOT EXISTS 'CERTIFICATE';
ALTER TYPE public.document_category ADD VALUE IF NOT EXISTS 'TRAINING_CERTIFICATE';
ALTER TYPE public.document_category ADD VALUE IF NOT EXISTS 'ACHIEVEMENT';
ALTER TYPE public.document_category ADD VALUE IF NOT EXISTS 'RECOMMENDATION_LETTER';
ALTER TYPE public.document_category ADD VALUE IF NOT EXISTS 'OFFER_LETTER';
ALTER TYPE public.document_category ADD VALUE IF NOT EXISTS 'IELTS_DOCUMENT';
ALTER TYPE public.document_category ADD VALUE IF NOT EXISTS 'IMAT_DOCUMENT';
ALTER TYPE public.document_category ADD VALUE IF NOT EXISTS 'INTERNSHIP_OFFER_LETTER';
ALTER TYPE public.document_category ADD VALUE IF NOT EXISTS 'JOINING_LETTER';
ALTER TYPE public.document_category ADD VALUE IF NOT EXISTS 'INTERNSHIP_AGREEMENT';
ALTER TYPE public.document_category ADD VALUE IF NOT EXISTS 'INTERNSHIP_COMPLETION_CERTIFICATE';
ALTER TYPE public.document_category ADD VALUE IF NOT EXISTS 'INTERNSHIP_EVALUATION_REPORT';
ALTER TYPE public.document_category ADD VALUE IF NOT EXISTS 'INTERNSHIP_ATTENDANCE';
ALTER TYPE public.document_category ADD VALUE IF NOT EXISTS 'INTERNSHIP_REPORT';

-- 2. Add description, internship_id, and milestone_id columns to student_documents
ALTER TABLE public.student_documents
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS internship_id UUID REFERENCES public.internships(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS milestone_id UUID REFERENCES public.milestones(id) ON DELETE SET NULL;

-- 3. Optimized Indexes
CREATE INDEX IF NOT EXISTS idx_documents_student ON public.student_documents(student_id);
CREATE INDEX IF NOT EXISTS idx_student_documents_internship ON public.student_documents(internship_id);
CREATE INDEX IF NOT EXISTS idx_student_documents_milestone ON public.student_documents(milestone_id);
CREATE INDEX IF NOT EXISTS idx_student_documents_category ON public.student_documents(category);

-- 4. Extend audit_action enum for document deletion
DO $$ BEGIN
    ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'DOCUMENT_DELETE';
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;
