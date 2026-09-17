-- ==========================================================================
-- MENTOR OS — STEP 2B POST-INGESTION VERIFICATION SCRIPT (READ-ONLY)
-- Run this in Supabase SQL Editor to verify all Step 2B requirements.
-- ==========================================================================

WITH checks AS (
    -- 1. Step 2B Table Counts
    SELECT 'sessions count' AS check_item, count(*)::text AS actual, '14' AS expected, (count(*) = 14) AS pass FROM public.sessions
    UNION ALL
    SELECT 'milestones count', count(*)::text, '16', (count(*) = 16) FROM public.milestones
    UNION ALL
    SELECT 'session_milestones count', count(*)::text, '0', (count(*) = 0) FROM public.session_milestones
    UNION ALL
    SELECT 'internships count', count(*)::text, '0', (count(*) = 0) FROM public.internships
    UNION ALL
    SELECT 'achievements count', count(*)::text, '0', (count(*) = 0) FROM public.achievements
    UNION ALL
    SELECT 'groups count', count(*)::text, '0', (count(*) = 0) FROM public.groups
    UNION ALL
    SELECT 'group_members count', count(*)::text, '0', (count(*) = 0) FROM public.group_members
    UNION ALL
    SELECT 'student_documents count', count(*)::text, '0', (count(*) = 0) FROM public.student_documents
    UNION ALL
    SELECT 'milestone_resources count', count(*)::text, '0', (count(*) = 0) FROM public.milestone_resources
    UNION ALL
    SELECT 'ai_recommendations count', count(*)::text, '0', (count(*) = 0) FROM public.ai_recommendations
    UNION ALL
    SELECT 'audit_logs count', count(*)::text, '0', (count(*) = 0) FROM public.audit_logs

    -- 2. FK & Orphan Checks for Step 2B
    UNION ALL
    SELECT 'orphan sessions (unlinked student)', count(*)::text, '0', (count(*) = 0)
    FROM public.sessions sess LEFT JOIN public.students s ON sess.student_id = s.id WHERE s.id IS NULL
    UNION ALL
    SELECT 'orphan milestones (unlinked student)', count(*)::text, '0', (count(*) = 0)
    FROM public.milestones m LEFT JOIN public.students s ON m.student_id = s.id WHERE s.id IS NULL
    UNION ALL
    SELECT 'sessions pointing to canonical students', count(DISTINCT sess.student_id)::text, '14', (count(DISTINCT sess.student_id) = 14)
    FROM public.sessions sess JOIN public.students s ON sess.student_id = s.id
    UNION ALL
    SELECT 'milestones pointing to canonical students', count(DISTINCT m.student_id)::text, '13', (count(DISTINCT m.student_id) = 13)
    FROM public.milestones m JOIN public.students s ON m.student_id = s.id

    -- 3. Milestone Status & Provenance Integrity
    UNION ALL
    SELECT 'milestones with ACTIVE status', count(*)::text, '16', (count(*) = 16)
    FROM public.milestones WHERE status = 'ACTIVE'
    UNION ALL
    SELECT 'milestones prematurely COMPLETED', count(*)::text, '0', (count(*) = 0)
    FROM public.milestones WHERE status = 'COMPLETED'
    UNION ALL
    SELECT 'milestones provenance HISTORICAL_PROFILE', count(*)::text, '16', (count(*) = 16)
    FROM public.milestones WHERE provenance = 'HISTORICAL_PROFILE'
    UNION ALL
    SELECT 'sessions provenance MENTOR_ENTERED', count(*)::text, '14', (count(*) = 14)
    FROM public.sessions WHERE provenance = 'MENTOR_ENTERED'

    -- 4. Step 2A Baseline Immutability
    UNION ALL
    SELECT 'Step 2A: students count', count(*)::text, '43', (count(*) = 43) FROM public.students
    UNION ALL
    SELECT 'Step 2A: student_identities_audit count', count(*)::text, '43', (count(*) = 43) FROM public.student_identities_audit
    UNION ALL
    SELECT 'Step 2A: student_profiles count', count(*)::text, '43', (count(*) = 43) FROM public.student_profiles
    UNION ALL
    SELECT 'Step 2A: student_career_goals count', count(*)::text, '39', (count(*) = 39) FROM public.student_career_goals
    UNION ALL
    SELECT 'Step 2A: skill_assessments count', count(*)::text, '430', (count(*) = 430) FROM public.skill_assessments
    UNION ALL
    SELECT 'Step 2A: career_readiness count', count(*)::text, '43', (count(*) = 43) FROM public.career_readiness
    UNION ALL
    SELECT 'Step 2A: cohorts count', count(*)::text, '1', (count(*) = 1) FROM public.cohorts
    UNION ALL
    SELECT 'Step 2A: career_roles count', count(*)::text, '8', (count(*) = 8) FROM public.career_roles
    UNION ALL
    SELECT 'Step 2A: skills count', count(*)::text, '10', (count(*) = 10) FROM public.skills

    -- 5. Existing Portal Tables Untouched
    UNION ALL
    SELECT 'existing subjects count', count(*)::text, '1', (count(*) = 1) FROM public.subjects
    UNION ALL
    SELECT 'existing notes count', count(*)::text, '0', (count(*) = 0) FROM public.notes
)
SELECT 
    check_item,
    expected,
    actual,
    CASE WHEN pass THEN 'PASS' ELSE 'FAIL' END AS result
FROM checks;
