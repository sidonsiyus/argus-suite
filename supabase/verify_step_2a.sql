-- ==========================================================================
-- MENTOR OS — STEP 2A POST-INGESTION VERIFICATION SCRIPT (READ-ONLY)
-- Run this in Supabase SQL Editor to verify all 20 requirements in a single query.
-- ==========================================================================

WITH checks AS (
    -- 1. Table Counts
    SELECT 'cohorts count' AS check_item, count(*)::text AS actual, '1' AS expected, (count(*) = 1) AS pass FROM public.cohorts
    UNION ALL
    SELECT 'career_roles count', count(*)::text, '8', (count(*) = 8) FROM public.career_roles
    UNION ALL
    SELECT 'skills count', count(*)::text, '10', (count(*) = 10) FROM public.skills
    UNION ALL
    SELECT 'students count', count(*)::text, '43', (count(*) = 43) FROM public.students
    UNION ALL
    SELECT 'student_identities_audit count', count(*)::text, '43', (count(*) = 43) FROM public.student_identities_audit
    UNION ALL
    SELECT 'student_profiles count', count(*)::text, '43', (count(*) = 43) FROM public.student_profiles
    UNION ALL
    SELECT 'student_career_goals count', count(*)::text, '39', (count(*) = 39) FROM public.student_career_goals
    UNION ALL
    SELECT 'skill_assessments count', count(*)::text, '430', (count(*) = 430) FROM public.skill_assessments
    UNION ALL
    SELECT 'career_readiness count', count(*)::text, '43', (count(*) = 43) FROM public.career_readiness

    -- 2. Step 2B Tables (Must all be 0)
    UNION ALL
    SELECT 'sessions count (Step 2B)', count(*)::text, '0', (count(*) = 0) FROM public.sessions
    UNION ALL
    SELECT 'milestones count (Step 2B)', count(*)::text, '0', (count(*) = 0) FROM public.milestones
    UNION ALL
    SELECT 'session_milestones count (Step 2B)', count(*)::text, '0', (count(*) = 0) FROM public.session_milestones
    UNION ALL
    SELECT 'internships count (Step 2B)', count(*)::text, '0', (count(*) = 0) FROM public.internships
    UNION ALL
    SELECT 'achievements count (Step 2B)', count(*)::text, '0', (count(*) = 0) FROM public.achievements
    UNION ALL
    SELECT 'groups count (Step 2B)', count(*)::text, '0', (count(*) = 0) FROM public.groups
    UNION ALL
    SELECT 'group_members count (Step 2B)', count(*)::text, '0', (count(*) = 0) FROM public.group_members
    UNION ALL
    SELECT 'student_documents count (Step 2B)', count(*)::text, '0', (count(*) = 0) FROM public.student_documents
    UNION ALL
    SELECT 'milestone_resources count (Step 2B)', count(*)::text, '0', (count(*) = 0) FROM public.milestone_resources
    UNION ALL
    SELECT 'ai_recommendations count (Step 2B)', count(*)::text, '0', (count(*) = 0) FROM public.ai_recommendations
    UNION ALL
    SELECT 'audit_logs count (Step 2B)', count(*)::text, '0', (count(*) = 0) FROM public.audit_logs

    -- 3. Student Uniqueness & Canonical Consistency
    UNION ALL
    SELECT 'unique canonical student reg_no', count(DISTINCT reg_no)::text, '43', (count(DISTINCT reg_no) = 43) FROM public.students
    UNION ALL
    SELECT 'duplicate reg_no count', (count(*) - count(DISTINCT reg_no))::text, '0', (count(*) = count(DISTINCT reg_no)) FROM public.students

    -- 4. Six Identity Resolutions Preserved Exactly
    UNION ALL
    SELECT 'resolution: Anjana (253105 -> 25153105)', count(*)::text, '1', (count(*) = 1)
    FROM public.student_identities_audit WHERE raw_reg_no = '253105' AND canonical_reg_no = '25153105' AND resolution_status = 'TYPO_CORRECTED'
    UNION ALL
    SELECT 'resolution: Raksha (253128 -> 25153128)', count(*)::text, '1', (count(*) = 1)
    FROM public.student_identities_audit WHERE raw_reg_no = '253128' AND canonical_reg_no = '25153128' AND resolution_status = 'TYPO_CORRECTED'
    UNION ALL
    SELECT 'resolution: Vijay (25143137 -> 25153137)', count(*)::text, '1', (count(*) = 1)
    FROM public.student_identities_audit WHERE raw_reg_no = '25143137' AND canonical_reg_no = '25153137' AND resolution_status = 'TYPO_CORRECTED'
    UNION ALL
    SELECT 'resolution: Mohanned (25153145 -> 23153145)', count(*)::text, '1', (count(*) = 1)
    FROM public.student_identities_audit WHERE raw_reg_no = '25153145' AND canonical_reg_no = '23153145' AND resolution_status = 'TYPO_CORRECTED'
    UNION ALL
    SELECT 'resolution: Kevin (25153107 -> 25153119)', count(*)::text, '1', (count(*) = 1)
    FROM public.student_identities_audit WHERE raw_name LIKE '%Kevin%' AND raw_reg_no = '25153107' AND canonical_reg_no = '25153119' AND resolution_status = 'DUPLICATE_RESOLVED'
    UNION ALL
    SELECT 'resolution: Nishaanth (25153143 -> 25153142)', count(*)::text, '1', (count(*) = 1)
    FROM public.student_identities_audit WHERE raw_name LIKE '%Nishaanth%' AND raw_reg_no = '25153143' AND canonical_reg_no = '25153142' AND resolution_status = 'DUPLICATE_RESOLVED'

    -- 5. Foreign Key & Orphan Records Checks
    UNION ALL
    SELECT 'orphan student_profiles', count(*)::text, '0', (count(*) = 0)
    FROM public.student_profiles sp LEFT JOIN public.students s ON sp.student_id = s.id WHERE s.id IS NULL
    UNION ALL
    SELECT 'orphan student_career_goals', count(*)::text, '0', (count(*) = 0)
    FROM public.student_career_goals scg LEFT JOIN public.students s ON scg.student_id = s.id WHERE s.id IS NULL
    UNION ALL
    SELECT 'orphan skill_assessments', count(*)::text, '0', (count(*) = 0)
    FROM public.skill_assessments sa LEFT JOIN public.students s ON sa.student_id = s.id WHERE s.id IS NULL
    UNION ALL
    SELECT 'orphan career_readiness', count(*)::text, '0', (count(*) = 0)
    FROM public.career_readiness cr LEFT JOIN public.students s ON cr.student_id = s.id WHERE s.id IS NULL
    UNION ALL
    SELECT 'orphan student_identities_audit', count(*)::text, '0', (count(*) = 0)
    FROM public.student_identities_audit sia LEFT JOIN public.students s ON sia.student_id = s.id WHERE s.id IS NULL

    -- 6. Baseline Skill Assessment Type & Provenance Integrity
    UNION ALL
    SELECT 'skill_assessments with SELF_REPORTED type', count(*)::text, '430', (count(*) = 430)
    FROM public.skill_assessments WHERE assessment_type = 'SELF_REPORTED'
    UNION ALL
    SELECT 'skill_assessments with STUDENT_REPORTED provenance', count(*)::text, '430', (count(*) = 430)
    FROM public.skill_assessments WHERE provenance = 'STUDENT_REPORTED'
    UNION ALL
    SELECT 'skill_assessments incorrectly MENTOR_ASSESSED', count(*)::text, '0', (count(*) = 0)
    FROM public.skill_assessments WHERE assessment_type = 'MENTOR_ASSESSED' OR provenance = 'MENTOR_ENTERED'
    UNION ALL
    SELECT 'skill_assessments incorrectly VERIFIED', count(*)::text, '0', (count(*) = 0)
    FROM public.skill_assessments WHERE assessment_type = 'VERIFIED' OR provenance = 'VERIFIED'

    -- 7. Career Readiness Tri-State & Raw Preservation
    UNION ALL
    SELECT 'readiness invalid status count', count(*)::text, '0', (count(*) = 0)
    FROM public.career_readiness
    WHERE resume_status NOT IN ('AVAILABLE', 'NOT_REPORTED')
       OR linkedin_status NOT IN ('AVAILABLE', 'NOT_REPORTED')
       OR passport_status NOT IN ('AVAILABLE', 'NOT_REPORTED')
       OR driving_license_status NOT IN ('AVAILABLE', 'NOT_REPORTED')
       OR pan_card_status NOT IN ('AVAILABLE', 'NOT_REPORTED')
       OR aadhaar_card_status NOT IN ('AVAILABLE', 'NOT_REPORTED')
    UNION ALL
    SELECT 'readiness incorrectly VERIFIED', count(*)::text, '0', (count(*) = 0)
    FROM public.career_readiness
    WHERE resume_status = 'VERIFIED' OR linkedin_status = 'VERIFIED' OR passport_status = 'VERIFIED'
       OR driving_license_status = 'VERIFIED' OR pan_card_status = 'VERIFIED' OR aadhaar_card_status = 'VERIFIED'
       OR verified_by IS NOT NULL OR verified_at IS NOT NULL
    UNION ALL
    SELECT 'readiness populated raw json count', count(*)::text, '43', (count(*) = 43)
    FROM public.career_readiness WHERE student_reported_raw IS NOT NULL AND student_reported_raw != '{}'::jsonb

    -- 8. Existing Portal Tables Untouched
    UNION ALL
    SELECT 'existing subjects table count', count(*)::text, '1', (count(*) = 1) FROM public.subjects
    UNION ALL
    SELECT 'existing notes table count', count(*)::text, '0', (count(*) = 0) FROM public.notes

    -- 9. Row-Level Security Enabled on all MENTOR OS Tables
    UNION ALL
    SELECT 'tables with RLS enabled count', count(*)::text, '22', (count(*) = 22)
    FROM pg_tables t
    JOIN pg_class c ON c.relname = t.tablename
    WHERE t.schemaname = 'public'
      AND c.relrowsecurity = true
      AND t.tablename IN (
          'cohorts', 'career_roles', 'skills', 'students', 'student_identities_audit',
          'student_profiles', 'student_career_goals', 'skill_assessments', 'career_readiness',
          'sessions', 'milestones', 'session_milestones', 'internships', 'achievements',
          'groups', 'group_members', 'student_documents', 'milestone_resources',
          'ai_recommendations', 'audit_logs', 'resources', 'milestone_status_history'
      )
)
SELECT 
    check_item,
    expected,
    actual,
    CASE WHEN pass THEN 'PASS' ELSE 'FAIL' END AS result
FROM checks;
