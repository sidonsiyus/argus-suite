-- ==========================================================================
-- MENTOR OS — STEP 2B SEED: HISTORICAL MENTOR ACTIVITY ONLY
-- Generated At: 2026-09-15T16:26:57.594961
-- Scope: public.sessions (14), public.milestones (16)
-- EXCLUDED / EMPTY: session_milestones (0), internships (0), achievements (0),
--                    groups (0), group_members (0), student_documents (0),
--                    milestone_resources (0), ai_recommendations (0), audit_logs (0)
-- ==========================================================================

BEGIN;

-- --------------------------------------------------------------------------
-- 1. Resolve Mentor ID for Foreign Key Constraint
-- --------------------------------------------------------------------------
DO $$
DECLARE
    v_mentor_id UUID;
BEGIN
    SELECT id INTO v_mentor_id FROM auth.users ORDER BY created_at ASC LIMIT 1;
    IF v_mentor_id IS NULL THEN
        -- Create a faculty mentor user if none exists in auth.users
        INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password,
            email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
            created_at, updated_at, confirmation_token, recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            'd0000000-0000-0000-0000-000000000001',
            'authenticated', 'authenticated', 'faculty.mentor@vistas.ac.in',
            '$2a$10$dummyencryptedpasswordforseedonlyxxxxxxxxxxxxxxxxxxxxxxxxxx',
            now(), '{"provider":"email","providers":["email"]}',
            '{"full_name":"Faculty Mentor","role":"instructor"}',
            now(), now(), '', ''
        ) ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;

-- --------------------------------------------------------------------------
-- 2. Historical Sessions (14 Records, Provenance: MENTOR_ENTERED)
-- --------------------------------------------------------------------------
INSERT INTO public.sessions (
    student_id, mentor_id, session_date, focus_area, observations, duration_minutes, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153101'),
    (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1),
    '2026-07-28', 'General Mentoring', 'Need to work on time management, discussed Career Goals', 30, 'MENTOR_ENTERED'
);
INSERT INTO public.sessions (
    student_id, mentor_id, session_date, focus_area, observations, duration_minutes, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153102'),
    (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1),
    '2026-07-28', 'Improve attendance', 'Discussed on internship, needs to improve attendance and regain focus', 30, 'MENTOR_ENTERED'
);
INSERT INTO public.sessions (
    student_id, mentor_id, session_date, focus_area, observations, duration_minutes, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153103'),
    (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1),
    '2026-07-28', 'Need to improve attendance', 'Discussed on joining for CPL', 30, 'MENTOR_ENTERED'
);
INSERT INTO public.sessions (
    student_id, mentor_id, session_date, focus_area, observations, duration_minutes, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153104'),
    (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1),
    '2026-07-28', 'Confident Communication', 'Discussed on earlier grooming incident, wants to become a flight dispatcher', 30, 'MENTOR_ENTERED'
);
INSERT INTO public.sessions (
    student_id, mentor_id, session_date, focus_area, observations, duration_minutes, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153105'),
    (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1),
    '2026-07-28', 'ATC knowledge', 'Discussed on internship and grades', 30, 'MENTOR_ENTERED'
);
INSERT INTO public.sessions (
    student_id, mentor_id, session_date, focus_area, observations, duration_minutes, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153107'),
    (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1),
    '2026-07-28', 'Clear Career Goal', 'Discussed on career goals, changed goal from PILOT to FLIGHT DISPATCHER', 30, 'MENTOR_ENTERED'
);
INSERT INTO public.sessions (
    student_id, mentor_id, session_date, focus_area, observations, duration_minutes, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153109'),
    (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1),
    '2026-07-28', 'ATC knowledge', 'Discussed about ATC prep', 30, 'MENTOR_ENTERED'
);
INSERT INTO public.sessions (
    student_id, mentor_id, session_date, focus_area, observations, duration_minutes, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153110'),
    (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1),
    '2026-08-06', 'Regulation', 'Discussed on his career goals and the next plan of action', 30, 'MENTOR_ENTERED'
);
INSERT INTO public.sessions (
    student_id, mentor_id, session_date, focus_area, observations, duration_minutes, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153111'),
    (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1),
    '2026-08-06', 'Problem solving', 'Discussed on career goals and road to CPL', 30, 'MENTOR_ENTERED'
);
INSERT INTO public.sessions (
    student_id, mentor_id, session_date, focus_area, observations, duration_minutes, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153112'),
    (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1),
    '2026-08-06', 'Communication', 'Discussed about career goals and ambition', 30, 'MENTOR_ENTERED'
);
INSERT INTO public.sessions (
    student_id, mentor_id, session_date, focus_area, observations, duration_minutes, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153113'),
    (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1),
    '2026-08-06', 'Communication', 'Discussed on areas where he is struggling', 30, 'MENTOR_ENTERED'
);
INSERT INTO public.sessions (
    student_id, mentor_id, session_date, focus_area, observations, duration_minutes, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153114'),
    (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1),
    '2026-08-06', 'Certifications', 'Very good in academics, discussed on her low attendance and encouraged to improve', 30, 'MENTOR_ENTERED'
);
INSERT INTO public.sessions (
    student_id, mentor_id, session_date, focus_area, observations, duration_minutes, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153115'),
    (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1),
    '2026-08-19', 'Work on her english', 'Suggested her to watch movies without subtitles to improve her english', 30, 'MENTOR_ENTERED'
);
INSERT INTO public.sessions (
    student_id, mentor_id, session_date, focus_area, observations, duration_minutes, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153116'),
    (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1),
    '2026-08-19', 'Told to work on sim brief', 'Language barrier, communication support needed.', 30, 'MENTOR_ENTERED'
);
-- Total Sessions Seeded: 14

-- --------------------------------------------------------------------------
-- 3. Historical Milestones / POAs (16 Records across 13 Cadets)
-- --------------------------------------------------------------------------
INSERT INTO public.milestones (
    student_id, title, category, priority, status, completion_percentage,
    success_criteria, target_date, is_ai_suggested, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153101'),
    'Research and practice ATC mock simulations to improve Communication skills', 'Action Plan', 'MEDIUM', 'ACTIVE', 0,
    'Fulfill agreed action step verified by mentor', NULL, true, 'HISTORICAL_PROFILE'
);
INSERT INTO public.milestones (
    student_id, title, category, priority, status, completion_percentage,
    success_criteria, target_date, is_ai_suggested, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153102'),
    'Attend all classes for the next 4 weeks to improve attendance consistency', 'Action Plan', 'MEDIUM', 'ACTIVE', 0,
    'Fulfill agreed action step verified by mentor', NULL, true, 'HISTORICAL_PROFILE'
);
INSERT INTO public.milestones (
    student_id, title, category, priority, status, completion_percentage,
    success_criteria, target_date, is_ai_suggested, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153103'),
    'Set aside dedicated time for self-study and review of aeronautical science materials', 'Action Plan', 'MEDIUM', 'ACTIVE', 0,
    'Fulfill agreed action step verified by mentor', NULL, true, 'HISTORICAL_PROFILE'
);
INSERT INTO public.milestones (
    student_id, title, category, priority, status, completion_percentage,
    success_criteria, target_date, is_ai_suggested, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153104'),
    'Research and list required certifications for a flight dispatcher in India', 'Action Plan', 'MEDIUM', 'ACTIVE', 0,
    'Fulfill agreed action step verified by mentor', NULL, true, 'HISTORICAL_PROFILE'
);
INSERT INTO public.milestones (
    student_id, title, category, priority, status, completion_percentage,
    success_criteria, target_date, is_ai_suggested, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153105'),
    'Research and join online forums for air traffic controllers to improve general awareness', 'Action Plan', 'MEDIUM', 'ACTIVE', 0,
    'Fulfill agreed action step verified by mentor', NULL, true, 'HISTORICAL_PROFILE'
);
INSERT INTO public.milestones (
    student_id, title, category, priority, status, completion_percentage,
    success_criteria, target_date, is_ai_suggested, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153107'),
    'Join a study group to increase technical depth and stay organized', 'Action Plan', 'MEDIUM', 'ACTIVE', 0,
    'Fulfill agreed action step verified by mentor', NULL, true, 'HISTORICAL_PROFILE'
);
INSERT INTO public.milestones (
    student_id, title, category, priority, status, completion_percentage,
    success_criteria, target_date, is_ai_suggested, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153109'),
    'Research and create a list of air traffic control procedures to study', 'Action Plan', 'MEDIUM', 'ACTIVE', 0,
    'Fulfill agreed action step verified by mentor', NULL, true, 'HISTORICAL_PROFILE'
);
INSERT INTO public.milestones (
    student_id, title, category, priority, status, completion_percentage,
    success_criteria, target_date, is_ai_suggested, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153110'),
    'Research and create a list of key DGCA regulations', 'Action Plan', 'MEDIUM', 'ACTIVE', 0,
    'Fulfill agreed action step verified by mentor', NULL, true, 'HISTORICAL_PROFILE'
);
INSERT INTO public.milestones (
    student_id, title, category, priority, status, completion_percentage,
    success_criteria, target_date, is_ai_suggested, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153111'),
    'Enroll in a decision-making and situational awareness workshop', 'Action Plan', 'MEDIUM', 'ACTIVE', 0,
    'Fulfill agreed action step verified by mentor', NULL, true, 'HISTORICAL_PROFILE'
);
INSERT INTO public.milestones (
    student_id, title, category, priority, status, completion_percentage,
    success_criteria, target_date, is_ai_suggested, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153111'),
    'Meet with a licensed pilot for career guidance and mentorship', 'Action Plan', 'MEDIUM', 'ACTIVE', 0,
    'Fulfill agreed action step verified by mentor', NULL, true, 'HISTORICAL_PROFILE'
);
INSERT INTO public.milestones (
    student_id, title, category, priority, status, completion_percentage,
    success_criteria, target_date, is_ai_suggested, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153112'),
    'Attend communication skills workshop', 'Action Plan', 'MEDIUM', 'ACTIVE', 0,
    'Fulfill agreed action step verified by mentor', NULL, true, 'HISTORICAL_PROFILE'
);
INSERT INTO public.milestones (
    student_id, title, category, priority, status, completion_percentage,
    success_criteria, target_date, is_ai_suggested, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153113'),
    'Schedule a meeting with the mentor to review progress and set new goals', 'Action Plan', 'MEDIUM', 'ACTIVE', 0,
    'Fulfill agreed action step verified by mentor', NULL, true, 'HISTORICAL_PROFILE'
);
INSERT INTO public.milestones (
    student_id, title, category, priority, status, completion_percentage,
    success_criteria, target_date, is_ai_suggested, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153114'),
    'Enroll in an online course for aircraft systems and weather', 'Action Plan', 'MEDIUM', 'ACTIVE', 0,
    'Fulfill agreed action step verified by mentor', NULL, true, 'HISTORICAL_PROFILE'
);
INSERT INTO public.milestones (
    student_id, title, category, priority, status, completion_percentage,
    success_criteria, target_date, is_ai_suggested, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153114'),
    'Meet with a licensed pilot for career guidance and advice', 'Action Plan', 'MEDIUM', 'ACTIVE', 0,
    'Fulfill agreed action step verified by mentor', NULL, true, 'HISTORICAL_PROFILE'
);
INSERT INTO public.milestones (
    student_id, title, category, priority, status, completion_percentage,
    success_criteria, target_date, is_ai_suggested, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153115'),
    'Enroll in an aviation English course (e.g., ICAO English)', 'Action Plan', 'MEDIUM', 'ACTIVE', 0,
    'Fulfill agreed action step verified by mentor', NULL, true, 'HISTORICAL_PROFILE'
);
INSERT INTO public.milestones (
    student_id, title, category, priority, status, completion_percentage,
    success_criteria, target_date, is_ai_suggested, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153115'),
    'Create a weekly study timetable to allocate fixed slots for English, simulation, and soft‑skill practice', 'Action Plan', 'MEDIUM', 'ACTIVE', 0,
    'Fulfill agreed action step verified by mentor', NULL, true, 'HISTORICAL_PROFILE'
);
-- Total Milestones Seeded: 16

COMMIT;
