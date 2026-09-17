-- ==========================================================================
-- MENTOR OS — STEP 2A SEED: DETERMINISTIC BASELINE INGESTION ONLY
-- Generated At: 2026-09-15T15:09:04.319216
-- Scope: cohorts, career_roles, skills, students, student_identities_audit,
--        student_profiles, student_career_goals, skill_assessments, career_readiness
-- EXCLUDED: sessions, milestones, internships, achievements, groups
-- ==========================================================================

BEGIN;

-- --------------------------------------------------------------------------
-- 1. Primary Cohort
-- --------------------------------------------------------------------------
INSERT INTO public.cohorts (code, name, programme, academic_year, current_year_of_study, section)
VALUES ('AERO-2025-28', 'B.Sc. Aeronautical Science Batch 2025–2028', 'B.Sc. Aeronautical Science', '2025 - 2026', '2nd Year', 'A')
ON CONFLICT (code) DO UPDATE SET academic_year = EXCLUDED.academic_year;

-- --------------------------------------------------------------------------
-- 2. Career Roles Taxonomy (8 Roles)
-- --------------------------------------------------------------------------
INSERT INTO public.career_roles (slug, title, short_title, category, prerequisites)
VALUES ('pilot-cpl', 'Pilot — CPL/ATPL track', 'Pilot', 'Flight Operations', ARRAY['Class 1 Medical', 'Strong Physics & Maths', 'DGCA CPL Ground Papers']::text[])
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, short_title = EXCLUDED.short_title, category = EXCLUDED.category, prerequisites = EXCLUDED.prerequisites;
INSERT INTO public.career_roles (slug, title, short_title, category, prerequisites)
VALUES ('atc', 'Air Traffic Controller (ATC)', 'ATC', 'Operations', ARRAY['Air Traffic Procedures', 'ICAO English', 'High Situational Awareness']::text[])
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, short_title = EXCLUDED.short_title, category = EXCLUDED.category, prerequisites = EXCLUDED.prerequisites;
INSERT INTO public.career_roles (slug, title, short_title, category, prerequisites)
VALUES ('ame', 'Aircraft Maintenance Engineer (AME)', 'AME', 'Technical', ARRAY['AME Licence Path', 'Systems Knowledge', 'Attention to Detail']::text[])
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, short_title = EXCLUDED.short_title, category = EXCLUDED.category, prerequisites = EXCLUDED.prerequisites;
INSERT INTO public.career_roles (slug, title, short_title, category, prerequisites)
VALUES ('avionics', 'Avionics Engineer', 'Avionics', 'Engineering', ARRAY['Electronics Fundamentals', 'Troubleshooting', 'Instrumentation']::text[])
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, short_title = EXCLUDED.short_title, category = EXCLUDED.category, prerequisites = EXCLUDED.prerequisites;
INSERT INTO public.career_roles (slug, title, short_title, category, prerequisites)
VALUES ('dispatcher', 'Flight Dispatcher', 'Dispatcher', 'Operations', ARRAY['Flight Planning', 'Load & Balance', 'DGCA Dispatcher Licence']::text[])
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, short_title = EXCLUDED.short_title, category = EXCLUDED.category, prerequisites = EXCLUDED.prerequisites;
INSERT INTO public.career_roles (slug, title, short_title, category, prerequisites)
VALUES ('ground-ops', 'Ground Operations & Dispatch', 'Ground Ops', 'Ground Operations', ARRAY['Airport Operations', 'Turnaround Coordination']::text[])
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, short_title = EXCLUDED.short_title, category = EXCLUDED.category, prerequisites = EXCLUDED.prerequisites;
INSERT INTO public.career_roles (slug, title, short_title, category, prerequisites)
VALUES ('airport-ops', 'Airport Operations', 'Airport Ops', 'Management', ARRAY['Passenger Handling', 'Security Compliance']::text[])
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, short_title = EXCLUDED.short_title, category = EXCLUDED.category, prerequisites = EXCLUDED.prerequisites;
INSERT INTO public.career_roles (slug, title, short_title, category, prerequisites)
VALUES ('uav-drone', 'Drone / UAV Operations', 'Drone Ops', 'UAV / Emerging Tech', ARRAY['DGCA Drone Pilot Certificate', 'Electronics Basics']::text[])
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, short_title = EXCLUDED.short_title, category = EXCLUDED.category, prerequisites = EXCLUDED.prerequisites;

-- --------------------------------------------------------------------------
-- 3. Universal Skills Taxonomy (10 Skills)
-- --------------------------------------------------------------------------
INSERT INTO public.skills (slug, name, category, is_universal)
VALUES ('communication', 'Communication Skills', 'Core Behavioral', true)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, category = EXCLUDED.category;
INSERT INTO public.skills (slug, name, category, is_universal)
VALUES ('english', 'English Speaking', 'Core Behavioral', true)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, category = EXCLUDED.category;
INSERT INTO public.skills (slug, name, category, is_universal)
VALUES ('leadership', 'Leadership', 'Core Behavioral', true)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, category = EXCLUDED.category;
INSERT INTO public.skills (slug, name, category, is_universal)
VALUES ('teamwork', 'Teamwork', 'Core Behavioral', true)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, category = EXCLUDED.category;
INSERT INTO public.skills (slug, name, category, is_universal)
VALUES ('problem-solving', 'Problem Solving', 'Cognitive', true)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, category = EXCLUDED.category;
INSERT INTO public.skills (slug, name, category, is_universal)
VALUES ('computer-skills', 'Computer Skills', 'Technical', true)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, category = EXCLUDED.category;
INSERT INTO public.skills (slug, name, category, is_universal)
VALUES ('public-speaking', 'Public Speaking', 'Interpersonal', true)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, category = EXCLUDED.category;
INSERT INTO public.skills (slug, name, category, is_universal)
VALUES ('confidence', 'Confidence', 'Personal Demeanor', true)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, category = EXCLUDED.category;
INSERT INTO public.skills (slug, name, category, is_universal)
VALUES ('time-management', 'Time Management', 'Discipline', true)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, category = EXCLUDED.category;
INSERT INTO public.skills (slug, name, category, is_universal)
VALUES ('discipline', 'Discipline', 'Core Behavioral', true)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, category = EXCLUDED.category;

-- --------------------------------------------------------------------------
-- 4. Canonical Students (43 Cadets)
-- --------------------------------------------------------------------------
INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone, email)
VALUES (
    '25153101', 1, 'Abinaya S',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '8072876279', 'abirithu435@gmail.com'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, email = EXCLUDED.email;
INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone, email)
VALUES (
    '25153102', 2, 'Adhitya K',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '9933265007', 'ka681246@gmail.com'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, email = EXCLUDED.email;
INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone, email)
VALUES (
    '25153103', 3, 'Akshaya G',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '7708513049', 'akshayagobalakrishnan565@gmail.com'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, email = EXCLUDED.email;
INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone, email)
VALUES (
    '25153104', 4, 'Albert Jana J',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '6385048665', 'albertjana46@gmail.com'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, email = EXCLUDED.email;
INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone, email)
VALUES (
    '25153105', 5, 'Anjana M V',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '8590581370', 'anjanavinu.06@gmail.com'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, email = EXCLUDED.email;
INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone, email)
VALUES (
    '25153107', 6, 'Bhakthi G Nichani',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '7498681254', 'bhakthignichani14@gmail.com'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, email = EXCLUDED.email;
INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone, email)
VALUES (
    '25153109', 7, 'Durga M',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '8778483677', 'durgamuni0704@gmail.com'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, email = EXCLUDED.email;
INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone, email)
VALUES (
    '25153110', 8, 'Fakrudin T Dharwad',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '8792664302', 'fakrudintd888@gmail.com'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, email = EXCLUDED.email;
INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone, email)
VALUES (
    '25153111', 9, 'Fasna V Shihab',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '9778742751', 'fasnavshihab02@gmail.com'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, email = EXCLUDED.email;
INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone, email)
VALUES (
    '25153112', 10, 'Gayathri G',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '9080700557', 'gayatrisundar310@gmail.com'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, email = EXCLUDED.email;
INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone, email)
VALUES (
    '25153113', 11, 'Gokul Liwa S',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '8903766167', 'gokulliwas@gmail.com'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, email = EXCLUDED.email;
INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone, email)
VALUES (
    '25153114', 12, 'Gungun Tamboli',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '7999117247', 'gunguntamboli@gmail.com'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, email = EXCLUDED.email;
INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone, email)
VALUES (
    '25153115', 13, 'Hana Fathima K M',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '9037461476', 'hanaahfathima@gmail.com'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, email = EXCLUDED.email;
INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone, email)
VALUES (
    '25153116', 14, 'Jeevan Nisanth K',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '9790796655', 'gkkjgeetha@gmail.com'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, email = EXCLUDED.email;
INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone, email)
VALUES (
    '25153117', 15, 'Joyel Felix H',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '9385577978', 'joyelfelix27jh@gmail.com'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, email = EXCLUDED.email;
INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone, email)
VALUES (
    '25153118', 16, 'Kanishka S',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '9342796598', 'kanishkak741@gmail.com'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, email = EXCLUDED.email;
INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone, email)
VALUES (
    '25153119', 17, 'Kevin Francis C R',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '9500676947', 'kevinrox1204@gmail.com'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, email = EXCLUDED.email;
INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone, email)
VALUES (
    '25153120', 18, 'Mathumitha M',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '7200490407', 'mathumithamichealraj@gmail.com'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, email = EXCLUDED.email;
INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone, email)
VALUES (
    '25153121', 19, 'Mithunesh S',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '7092670206', 'mithunesh4050@gmail.com'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, email = EXCLUDED.email;
INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone, email)
VALUES (
    '25153122', 20, 'Mohamed Samee J',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '8838407130', 'mohamedsameechennai@gmail.com'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, email = EXCLUDED.email;
INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone, email)
VALUES (
    '25153123', 21, 'M Roshni',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '9025896571', 'mroshnigomathi@gmail.com'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, email = EXCLUDED.email;
INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone, email)
VALUES (
    '25153124', 22, 'Munafarsharif S',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '7358201099', 'munafarsharif@gmail.com'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, email = EXCLUDED.email;
INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone, email)
VALUES (
    '25153125', 23, 'Nithin R',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '9342532240', 'nithinramesh628@gmail.com'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, email = EXCLUDED.email;
INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone, email)
VALUES (
    '25153126', 24, 'Nivin M',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '9344836769', 'nivima44@gmail.com'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, email = EXCLUDED.email;
INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone, email)
VALUES (
    '25153127', 25, 'Rakesh S',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '9360065409', 'kannanrakesh2007@gmail.com'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, email = EXCLUDED.email;
INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone, email)
VALUES (
    '25153128', 26, 'Raksha Nivasini',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '7845789191', 'rakshanivasini0108@gmail.com'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, email = EXCLUDED.email;
INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone, email)
VALUES (
    '25153129', 27, 'Rino M Reji',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '9846723677', 'rinomathewreji@gmail.com'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, email = EXCLUDED.email;
INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone, email)
VALUES (
    '25153130', 28, 'Roshan Jerald',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '9902053328', 'oraoraorastarplatinumlol@gmail.com'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, email = EXCLUDED.email;
INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone, email)
VALUES (
    '25153131', 29, 'Saisaran S',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '7397305143', 'satk64978@gmail.com'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, email = EXCLUDED.email;
INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone, email)
VALUES (
    '25153132', 30, 'Sai Vishnu A',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '7338785729', 'vishnusaran1234567@gmail.com'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, email = EXCLUDED.email;
INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone, email)
VALUES (
    '25153133', 31, 'S Manasseh Paul',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '9390586304', 'smanassehpaul@gmail.com'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, email = EXCLUDED.email;
INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone, email)
VALUES (
    '25153134', 32, 'Sradha Manoj',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '8304905130', 'sradhamanoj14@gmail.com'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, email = EXCLUDED.email;
INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone, email)
VALUES (
    '25153135', 33, 'Syed Ahamed M N',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '7092525845', 'mnsyedahamed@gmail.com'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, email = EXCLUDED.email;
INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone, email)
VALUES (
    '25153136', 34, 'Venkatesan S',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '7200024383', 'venkatesanofficialiaf@gmail.com'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, email = EXCLUDED.email;
INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone, email)
VALUES (
    '25153137', 35, 'Vijay S',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '8088622672', 'vijay9353.ash@gmail.com'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, email = EXCLUDED.email;
INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone, email)
VALUES (
    '25153138', 36, 'Vuppu Bhavasri',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '7981936455', 'bhavasriroyal0@gmail.com'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, email = EXCLUDED.email;
INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone, email)
VALUES (
    '25153139', 37, 'Yeswanthsiva R',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '8939211275', 'yeswanthsiva971@gmail.com'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, email = EXCLUDED.email;
INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone, email)
VALUES (
    '25153140', 38, 'Lena Fatahima Basheer',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '7510882066', 'lenabasheer1@gmail.com'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, email = EXCLUDED.email;
INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone, email)
VALUES (
    '25153141', 39, 'Mohammed Faizudeen S',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '8838977579', 'smohammedfaizudeen@gmail.com'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, email = EXCLUDED.email;
INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone, email)
VALUES (
    '25153142', 40, 'Nishaanth S U',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '9345441709', 'nishaanthsu@gmail.com'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, email = EXCLUDED.email;
INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone, email)
VALUES (
    '25153143', 41, 'Sabarinathan R',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '9025741421', 'sabarilakshnaravi@gmail.com'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, email = EXCLUDED.email;
INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone, email)
VALUES (
    '25153144', 42, 'Dibyajyothi Suman Barman',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '9832617362', 'barmansushanta1966@gmail.com'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, email = EXCLUDED.email;
INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone, email)
VALUES (
    '23153145', 43, 'Mohanned',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '8589868801', 'mohannedkottappuram757@gmail.com'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, email = EXCLUDED.email;

-- --------------------------------------------------------------------------
-- 5. Student Identity Reconciliation Audit (43 Records)
-- --------------------------------------------------------------------------
INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153101'),
    'EXCEL_ALL_STUDENTS', 'Abinaya S', '25153101', '8072876279', '25153101',
    'EXACT_MATCH', 'Exact registration number match against canonical roster'
);
INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153102'),
    'EXCEL_ALL_STUDENTS', 'Adhitya. K', '25153102', '9933265007', '25153102',
    'EXACT_MATCH', 'Exact registration number match against canonical roster'
);
INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153103'),
    'EXCEL_ALL_STUDENTS', 'Akshaya.G', '25153103', '7708513049', '25153103',
    'EXACT_MATCH', 'Exact registration number match against canonical roster'
);
INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153104'),
    'EXCEL_ALL_STUDENTS', 'Albert jana J', '25153104', '6385048665', '25153104',
    'EXACT_MATCH', 'Exact registration number match against canonical roster'
);
INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153105'),
    'EXCEL_ALL_STUDENTS', 'Anjana  M V', '253105', '8590581370', '25153105',
    'TYPO_CORRECTED', 'Missing 15 prefix; matched name Anjana M V and phone'
);
INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153107'),
    'EXCEL_ALL_STUDENTS', 'Bhakthi G Nichani', '25153107', '8695111915', '25153107',
    'EXACT_MATCH', 'Exact registration number match against canonical roster'
);
INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153119'),
    'EXCEL_ALL_STUDENTS', 'C R Kevin Francis', '25153107', '9500676947', '25153119',
    'DUPLICATE_RESOLVED', 'C R Kevin Francis entered 25153107 in error; remapped to official 25153119'
);
INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153144'),
    'EXCEL_ALL_STUDENTS', 'Dibyajyoti Suman Barman', '25153144', '9832617362', '25153144',
    'EXACT_MATCH', 'Exact registration number match against canonical roster'
);
INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153110'),
    'EXCEL_ALL_STUDENTS', 'Fakrudin T Dharwad', '25153110', '8792664302', '25153110',
    'EXACT_MATCH', 'Exact registration number match against canonical roster'
);
INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153111'),
    'EXCEL_ALL_STUDENTS', 'FASNA V SHIHAB', '25153111', '9778742751', '25153111',
    'EXACT_MATCH', 'Exact registration number match against canonical roster'
);
INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153112'),
    'EXCEL_ALL_STUDENTS', 'G Gayathri', '25153112', '9080700557', '25153112',
    'EXACT_MATCH', 'Exact registration number match against canonical roster'
);
INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153113'),
    'EXCEL_ALL_STUDENTS', 'Gokul liwa S', '25153113', '8903766167', '25153113',
    'EXACT_MATCH', 'Exact registration number match against canonical roster'
);
INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153114'),
    'EXCEL_ALL_STUDENTS', 'Gungun Tamboli', '25153114', '7999117247', '25153114',
    'EXACT_MATCH', 'Exact registration number match against canonical roster'
);
INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153115'),
    'EXCEL_ALL_STUDENTS', 'Hana fathima K. M', '25153115', '9037461476', '25153115',
    'EXACT_MATCH', 'Exact registration number match against canonical roster'
);
INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153116'),
    'EXCEL_ALL_STUDENTS', 'JEEVAN NISANTH K', '25153116', '9790796655', '25153116',
    'EXACT_MATCH', 'Exact registration number match against canonical roster'
);
INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153117'),
    'EXCEL_ALL_STUDENTS', 'JOYEL Felix.H', '25153117', '9385577978', '25153117',
    'EXACT_MATCH', 'Exact registration number match against canonical roster'
);
INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153118'),
    'EXCEL_ALL_STUDENTS', 'KANISHKA S', '25153118', '9342796598', '25153118',
    'EXACT_MATCH', 'Exact registration number match against canonical roster'
);
INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153140'),
    'EXCEL_ALL_STUDENTS', 'LENA FATAHIMA BASHEER', '25153140', '7510882066', '25153140',
    'EXACT_MATCH', 'Exact registration number match against canonical roster'
);
INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153109'),
    'EXCEL_ALL_STUDENTS', 'M Durga', '25153109', '8778484677', '25153109',
    'EXACT_MATCH', 'Exact registration number match against canonical roster'
);
INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153123'),
    'EXCEL_ALL_STUDENTS', 'M. Roshni', '25153123', '9035896571', '25153123',
    'EXACT_MATCH', 'Exact registration number match against canonical roster'
);
INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153120'),
    'EXCEL_ALL_STUDENTS', 'Mathumitha M', '25153120', '7200490407', '25153120',
    'EXACT_MATCH', 'Exact registration number match against canonical roster'
);
INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153121'),
    'EXCEL_ALL_STUDENTS', 'Mithunesh S', '25153121', '7092670206', '25153121',
    'EXACT_MATCH', 'Exact registration number match against canonical roster'
);
INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153122'),
    'EXCEL_ALL_STUDENTS', 'MOHAMED SAMEE J', '25153122', '8838407130', '25153122',
    'EXACT_MATCH', 'Exact registration number match against canonical roster'
);
INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153141'),
    'EXCEL_ALL_STUDENTS', 'Mohammed Faizudeen S', '25153141', '8838977579', '25153141',
    'EXACT_MATCH', 'Exact registration number match against canonical roster'
);
INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '23153145'),
    'EXCEL_ALL_STUDENTS', 'Mohanned', '25153145', '8589868801', '23153145',
    'TYPO_CORRECTED', 'Student typed 25 batch instead of official 23 batch reg no'
);
INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153124'),
    'EXCEL_ALL_STUDENTS', 'MUNAFARSHARIF S', '25153124', '7358201099', '25153124',
    'EXACT_MATCH', 'Exact registration number match against canonical roster'
);
INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153142'),
    'EXCEL_ALL_STUDENTS', 'Nishaanth S U', '25153143', '9345441709', '25153142',
    'DUPLICATE_RESOLVED', 'Nishaanth S U entered 25153143 in error; remapped to official 25153142'
);
INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153125'),
    'EXCEL_ALL_STUDENTS', 'NITHIN R', '25153125', '9342532240', '25153125',
    'EXACT_MATCH', 'Exact registration number match against canonical roster'
);
INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153126'),
    'EXCEL_ALL_STUDENTS', 'NIVIN M', '25153126', '9344836769', '25153126',
    'EXACT_MATCH', 'Exact registration number match against canonical roster'
);
INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153139'),
    'EXCEL_ALL_STUDENTS', 'R yeswanthsiva', '25153139', '8939211275', '25153139',
    'EXACT_MATCH', 'Exact registration number match against canonical roster'
);
INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153143'),
    'EXCEL_ALL_STUDENTS', 'R.Sabarinathan', '25153143', '9025741421', '25153143',
    'EXACT_MATCH', 'Exact registration number match against canonical roster'
);
INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153127'),
    'EXCEL_ALL_STUDENTS', 'Rakesh S', '25153127', '9360065409', '25153127',
    'EXACT_MATCH', 'Exact registration number match against canonical roster'
);
INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153128'),
    'EXCEL_ALL_STUDENTS', 'Raksha Nivasini M', '253128', '7845789192', '25153128',
    'TYPO_CORRECTED', 'Missing 15 prefix; matched name Raksha Nivasini and phone'
);
INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153129'),
    'EXCEL_ALL_STUDENTS', 'RINO M REJI', '25153129', '9846723677', '25153129',
    'EXACT_MATCH', 'Exact registration number match against canonical roster'
);
INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153130'),
    'EXCEL_ALL_STUDENTS', 'Roshan Jerald', '25153130', '9902053328', '25153130',
    'EXACT_MATCH', 'Exact registration number match against canonical roster'
);
INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153133'),
    'EXCEL_ALL_STUDENTS', 'S.Manasseh Paul', '25153133', '9390586304', '25153133',
    'EXACT_MATCH', 'Exact registration number match against canonical roster'
);
INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153132'),
    'EXCEL_ALL_STUDENTS', 'Sai Vishnu A', '25153132', '7338785729', '25153132',
    'EXACT_MATCH', 'Exact registration number match against canonical roster'
);
INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153131'),
    'EXCEL_ALL_STUDENTS', 'SAISARAN S', '25153131', '7397305143', '25153131',
    'EXACT_MATCH', 'Exact registration number match against canonical roster'
);
INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153134'),
    'EXCEL_ALL_STUDENTS', 'Sradha Manoj', '25153134', '8304905130', '25153134',
    'EXACT_MATCH', 'Exact registration number match against canonical roster'
);
INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153135'),
    'EXCEL_ALL_STUDENTS', 'Syed Ahamed M N', '25153135', '7092525845', '25153135',
    'EXACT_MATCH', 'Exact registration number match against canonical roster'
);
INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153136'),
    'EXCEL_ALL_STUDENTS', 'Venkatesan S', '25153136', '7200024383', '25153136',
    'EXACT_MATCH', 'Exact registration number match against canonical roster'
);
INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153137'),
    'EXCEL_ALL_STUDENTS', 'VIJAY S', '25143137', '8088622672', '25153137',
    'TYPO_CORRECTED', 'Digit typo 14 instead of 15; matched name Vijay S'
);
INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153138'),
    'EXCEL_ALL_STUDENTS', 'VUPPU BHAVASRI', '25153138', '7981936455', '25153138',
    'EXACT_MATCH', 'Exact registration number match against canonical roster'
);

-- --------------------------------------------------------------------------
-- 6. Student Profiles (43 Intake Records, Provenance: STUDENT_REPORTED)
-- --------------------------------------------------------------------------
INSERT INTO public.student_profiles (
    student_id, gender, dob, blood_group, parent_phone, emergency_contact_number, emergency_contact_relation,
    father_name, father_occupation, mother_name, mother_occupation, family_income_band, sslc_score, hsc_score,
    why_aviation, inspired_by, dream_organizations, after_graduation_plan, five_year_vision, languages,
    technical_expertise, sports, hobbies, clubs_of_interest, learning_styles, preferred_communication,
    medical_conditions, allergies, fitness_routine, biggest_challenge, mentor_help_needed, dgca_status, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153101'),
    'Female', '2006-11-17', 'A+', '8680090096', '8680090155', 'Malini R - Mother',
    'Srinivasan PV', 'Accountant', 'Malini R', 'Free lancer', 'Rs. 5,00,000 - Rs. 10,00,000', '83.6', '80',
    'Passion', 'Social media', ARRAY['AAI']::text[], 'ATC', 'ATC', ARRAY['Tamil', 'English']::text[],
    '', '{}'::text[], ARRAY['ATC']::text[], ARRAY['Entrepreneurship Club']::text[], ARRAY['Practical', 'Classroom']::text[], ARRAY['WhatsApp', 'Face-to-Face']::text[],
    '', '', '', 'Balancing academics,personal lifeand future goals is my biggest challenge', 'Mentor should interact with students', '', 'STUDENT_REPORTED'
)
ON CONFLICT (student_id) DO UPDATE SET
    gender = EXCLUDED.gender, dob = EXCLUDED.dob, blood_group = EXCLUDED.blood_group,
    parent_phone = EXCLUDED.parent_phone, emergency_contact_number = EXCLUDED.emergency_contact_number,
    emergency_contact_relation = EXCLUDED.emergency_contact_relation, father_name = EXCLUDED.father_name,
    father_occupation = EXCLUDED.father_occupation, mother_name = EXCLUDED.mother_name, mother_occupation = EXCLUDED.mother_occupation,
    family_income_band = EXCLUDED.family_income_band, sslc_score = EXCLUDED.sslc_score, hsc_score = EXCLUDED.hsc_score,
    why_aviation = EXCLUDED.why_aviation, inspired_by = EXCLUDED.inspired_by, dream_organizations = EXCLUDED.dream_organizations,
    after_graduation_plan = EXCLUDED.after_graduation_plan, five_year_vision = EXCLUDED.five_year_vision, languages = EXCLUDED.languages,
    technical_expertise = EXCLUDED.technical_expertise, sports = EXCLUDED.sports, hobbies = EXCLUDED.hobbies,
    clubs_of_interest = EXCLUDED.clubs_of_interest, learning_styles = EXCLUDED.learning_styles,
    preferred_communication = EXCLUDED.preferred_communication, medical_conditions = EXCLUDED.medical_conditions,
    allergies = EXCLUDED.allergies, fitness_routine = EXCLUDED.fitness_routine, biggest_challenge = EXCLUDED.biggest_challenge,
    mentor_help_needed = EXCLUDED.mentor_help_needed, dgca_status = EXCLUDED.dgca_status;
INSERT INTO public.student_profiles (
    student_id, gender, dob, blood_group, parent_phone, emergency_contact_number, emergency_contact_relation,
    father_name, father_occupation, mother_name, mother_occupation, family_income_band, sslc_score, hsc_score,
    why_aviation, inspired_by, dream_organizations, after_graduation_plan, five_year_vision, languages,
    technical_expertise, sports, hobbies, clubs_of_interest, learning_styles, preferred_communication,
    medical_conditions, allergies, fitness_routine, biggest_challenge, mentor_help_needed, dgca_status, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153102'),
    'Male', '2006-03-09', 'O+', '8972266792', '9933209500', 'Kannadasan - Father',
    'Kannadasan', 'Business man', 'K. Sudha', 'Nursing officer', 'Rs. 2,00,000 - Rs. 5,00,000', '60%', '60%',
    'Parents forced me', 'No one', ARRAY['No']::text[], 'Start doing job in any field I get', 'I don''t have any idea', ARRAY['Tamil', 'hindi and English']::text[],
    'Nope', ARRAY['Badminton', 'Kabaddi and a little bit of boxing']::text[], ARRAY['Fishing']::text[], ARRAY['Airline Operations Club']::text[], ARRAY['Classroom']::text[], ARRAY['Phone', 'Face-to-Face']::text[],
    'Nope', 'Nope', 'Nope', 'Sleep', 'In speaking English', 'Nope', 'STUDENT_REPORTED'
)
ON CONFLICT (student_id) DO UPDATE SET
    gender = EXCLUDED.gender, dob = EXCLUDED.dob, blood_group = EXCLUDED.blood_group,
    parent_phone = EXCLUDED.parent_phone, emergency_contact_number = EXCLUDED.emergency_contact_number,
    emergency_contact_relation = EXCLUDED.emergency_contact_relation, father_name = EXCLUDED.father_name,
    father_occupation = EXCLUDED.father_occupation, mother_name = EXCLUDED.mother_name, mother_occupation = EXCLUDED.mother_occupation,
    family_income_band = EXCLUDED.family_income_band, sslc_score = EXCLUDED.sslc_score, hsc_score = EXCLUDED.hsc_score,
    why_aviation = EXCLUDED.why_aviation, inspired_by = EXCLUDED.inspired_by, dream_organizations = EXCLUDED.dream_organizations,
    after_graduation_plan = EXCLUDED.after_graduation_plan, five_year_vision = EXCLUDED.five_year_vision, languages = EXCLUDED.languages,
    technical_expertise = EXCLUDED.technical_expertise, sports = EXCLUDED.sports, hobbies = EXCLUDED.hobbies,
    clubs_of_interest = EXCLUDED.clubs_of_interest, learning_styles = EXCLUDED.learning_styles,
    preferred_communication = EXCLUDED.preferred_communication, medical_conditions = EXCLUDED.medical_conditions,
    allergies = EXCLUDED.allergies, fitness_routine = EXCLUDED.fitness_routine, biggest_challenge = EXCLUDED.biggest_challenge,
    mentor_help_needed = EXCLUDED.mentor_help_needed, dgca_status = EXCLUDED.dgca_status;
INSERT INTO public.student_profiles (
    student_id, gender, dob, blood_group, parent_phone, emergency_contact_number, emergency_contact_relation,
    father_name, father_occupation, mother_name, mother_occupation, family_income_band, sslc_score, hsc_score,
    why_aviation, inspired_by, dream_organizations, after_graduation_plan, five_year_vision, languages,
    technical_expertise, sports, hobbies, clubs_of_interest, learning_styles, preferred_communication,
    medical_conditions, allergies, fitness_routine, biggest_challenge, mentor_help_needed, dgca_status, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153103'),
    'Female', '2007-08-10', 'B+', '9952098145', '9952098145', '',
    'S Gopalakrishnan', 'Teacher', 'Padmavathi', 'Poetess', 'Rs. 5,00,000 - Rs. 10,00,000', '70%', '80%',
    'Passion', 'By movie', ARRAY['Emirates']::text[], 'Commercial pilot', 'Commercial pilot', ARRAY['Tamil', 'English', 'hindi']::text[],
    'AutoCAD', ARRAY['Badminton']::text[], ARRAY['Reading']::text[], ARRAY['Pilot Club', 'AI & Robotics Club', 'Research Club']::text[], ARRAY['Practical', 'Classroom', 'Simulator']::text[], ARRAY['Phone']::text[],
    '', '', '', 'Thinking and fear', 'Good', '', 'STUDENT_REPORTED'
)
ON CONFLICT (student_id) DO UPDATE SET
    gender = EXCLUDED.gender, dob = EXCLUDED.dob, blood_group = EXCLUDED.blood_group,
    parent_phone = EXCLUDED.parent_phone, emergency_contact_number = EXCLUDED.emergency_contact_number,
    emergency_contact_relation = EXCLUDED.emergency_contact_relation, father_name = EXCLUDED.father_name,
    father_occupation = EXCLUDED.father_occupation, mother_name = EXCLUDED.mother_name, mother_occupation = EXCLUDED.mother_occupation,
    family_income_band = EXCLUDED.family_income_band, sslc_score = EXCLUDED.sslc_score, hsc_score = EXCLUDED.hsc_score,
    why_aviation = EXCLUDED.why_aviation, inspired_by = EXCLUDED.inspired_by, dream_organizations = EXCLUDED.dream_organizations,
    after_graduation_plan = EXCLUDED.after_graduation_plan, five_year_vision = EXCLUDED.five_year_vision, languages = EXCLUDED.languages,
    technical_expertise = EXCLUDED.technical_expertise, sports = EXCLUDED.sports, hobbies = EXCLUDED.hobbies,
    clubs_of_interest = EXCLUDED.clubs_of_interest, learning_styles = EXCLUDED.learning_styles,
    preferred_communication = EXCLUDED.preferred_communication, medical_conditions = EXCLUDED.medical_conditions,
    allergies = EXCLUDED.allergies, fitness_routine = EXCLUDED.fitness_routine, biggest_challenge = EXCLUDED.biggest_challenge,
    mentor_help_needed = EXCLUDED.mentor_help_needed, dgca_status = EXCLUDED.dgca_status;
INSERT INTO public.student_profiles (
    student_id, gender, dob, blood_group, parent_phone, emergency_contact_number, emergency_contact_relation,
    father_name, father_occupation, mother_name, mother_occupation, family_income_band, sslc_score, hsc_score,
    why_aviation, inspired_by, dream_organizations, after_graduation_plan, five_year_vision, languages,
    technical_expertise, sports, hobbies, clubs_of_interest, learning_styles, preferred_communication,
    medical_conditions, allergies, fitness_routine, biggest_challenge, mentor_help_needed, dgca_status, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153104'),
    'Male', '2007-11-23', 'B+', '9715909230', '9715909230', '00966545116038',
    'Jeya chandran T', 'Mason', 'Vasantha V', 'house wife', 'Prefer not to say', '8.4', '8.5',
    'For tuning my passion into real', 'My confidence to upcome without any person support', ARRAY['Air india indigo hindhustan aaai dgca boieng']::text[], 'Flight disphacher', 'Flight disphacher', ARRAY['Tamil english malayalam french hindi']::text[],
    'Editor', ARRAY['Hockey cricket basketball kabbadi']::text[], ARRAY['Proffesion of flight disphacher']::text[], ARRAY['Pilot Club', 'Aero Maintenance Club', 'Airline Operations Club', 'ATC Club', 'Entrepreneurship Club', 'Social Media Club', 'Research']::text[], ARRAY['Simulator']::text[], ARRAY['Email']::text[],
    'No im good', 'No', 'Ya gym weight lifting', 'To overcomes the faults and update my carrer plans', 'Very friendly and encouraging', 'Cleared', 'STUDENT_REPORTED'
)
ON CONFLICT (student_id) DO UPDATE SET
    gender = EXCLUDED.gender, dob = EXCLUDED.dob, blood_group = EXCLUDED.blood_group,
    parent_phone = EXCLUDED.parent_phone, emergency_contact_number = EXCLUDED.emergency_contact_number,
    emergency_contact_relation = EXCLUDED.emergency_contact_relation, father_name = EXCLUDED.father_name,
    father_occupation = EXCLUDED.father_occupation, mother_name = EXCLUDED.mother_name, mother_occupation = EXCLUDED.mother_occupation,
    family_income_band = EXCLUDED.family_income_band, sslc_score = EXCLUDED.sslc_score, hsc_score = EXCLUDED.hsc_score,
    why_aviation = EXCLUDED.why_aviation, inspired_by = EXCLUDED.inspired_by, dream_organizations = EXCLUDED.dream_organizations,
    after_graduation_plan = EXCLUDED.after_graduation_plan, five_year_vision = EXCLUDED.five_year_vision, languages = EXCLUDED.languages,
    technical_expertise = EXCLUDED.technical_expertise, sports = EXCLUDED.sports, hobbies = EXCLUDED.hobbies,
    clubs_of_interest = EXCLUDED.clubs_of_interest, learning_styles = EXCLUDED.learning_styles,
    preferred_communication = EXCLUDED.preferred_communication, medical_conditions = EXCLUDED.medical_conditions,
    allergies = EXCLUDED.allergies, fitness_routine = EXCLUDED.fitness_routine, biggest_challenge = EXCLUDED.biggest_challenge,
    mentor_help_needed = EXCLUDED.mentor_help_needed, dgca_status = EXCLUDED.dgca_status;
INSERT INTO public.student_profiles (
    student_id, gender, dob, blood_group, parent_phone, emergency_contact_number, emergency_contact_relation,
    father_name, father_occupation, mother_name, mother_occupation, family_income_band, sslc_score, hsc_score,
    why_aviation, inspired_by, dream_organizations, after_graduation_plan, five_year_vision, languages,
    technical_expertise, sports, hobbies, clubs_of_interest, learning_styles, preferred_communication,
    medical_conditions, allergies, fitness_routine, biggest_challenge, mentor_help_needed, dgca_status, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153105'),
    'Female', '2006-12-02', 'B+', '9995301555', '9995301555', 'Vineeth kumar M V - father',
    'Vineeth kumar M V', '10th', 'Jeffy', 'BA', 'Below Rs. 2,00,000', '60%', '70%',
    'To become ATC', 'a Film', ARRAY['Emirates']::text[], 'ATC', 'ATC', ARRAY['English', 'Malayalam', 'tamil']::text[],
    '', '{}'::text[], ARRAY['Dance']::text[], ARRAY['Pilot Club', 'Airline Operations Club', 'ATC Club', 'Social Media Club']::text[], ARRAY['Classroom', 'Simulator']::text[], ARRAY['Phone']::text[],
    '', '', '', 'Money', 'With motivation', 'Nine', 'STUDENT_REPORTED'
)
ON CONFLICT (student_id) DO UPDATE SET
    gender = EXCLUDED.gender, dob = EXCLUDED.dob, blood_group = EXCLUDED.blood_group,
    parent_phone = EXCLUDED.parent_phone, emergency_contact_number = EXCLUDED.emergency_contact_number,
    emergency_contact_relation = EXCLUDED.emergency_contact_relation, father_name = EXCLUDED.father_name,
    father_occupation = EXCLUDED.father_occupation, mother_name = EXCLUDED.mother_name, mother_occupation = EXCLUDED.mother_occupation,
    family_income_band = EXCLUDED.family_income_band, sslc_score = EXCLUDED.sslc_score, hsc_score = EXCLUDED.hsc_score,
    why_aviation = EXCLUDED.why_aviation, inspired_by = EXCLUDED.inspired_by, dream_organizations = EXCLUDED.dream_organizations,
    after_graduation_plan = EXCLUDED.after_graduation_plan, five_year_vision = EXCLUDED.five_year_vision, languages = EXCLUDED.languages,
    technical_expertise = EXCLUDED.technical_expertise, sports = EXCLUDED.sports, hobbies = EXCLUDED.hobbies,
    clubs_of_interest = EXCLUDED.clubs_of_interest, learning_styles = EXCLUDED.learning_styles,
    preferred_communication = EXCLUDED.preferred_communication, medical_conditions = EXCLUDED.medical_conditions,
    allergies = EXCLUDED.allergies, fitness_routine = EXCLUDED.fitness_routine, biggest_challenge = EXCLUDED.biggest_challenge,
    mentor_help_needed = EXCLUDED.mentor_help_needed, dgca_status = EXCLUDED.dgca_status;
INSERT INTO public.student_profiles (
    student_id, gender, dob, blood_group, parent_phone, emergency_contact_number, emergency_contact_relation,
    father_name, father_occupation, mother_name, mother_occupation, family_income_band, sslc_score, hsc_score,
    why_aviation, inspired_by, dream_organizations, after_graduation_plan, five_year_vision, languages,
    technical_expertise, sports, hobbies, clubs_of_interest, learning_styles, preferred_communication,
    medical_conditions, allergies, fitness_routine, biggest_challenge, mentor_help_needed, dgca_status, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153107'),
    'Female', '2007-10-19', 'O+', '9884295032', '9884295032', 'Girish Nichani - Father',
    'Girish H Nichani', 'Business', 'Viridhi G Nichani', 'House wife', 'Rs. 2,00,000 - Rs. 5,00,000', '69%', '83%',
    'Interest in aircrafts and skies', 'Seeing aircrafts flying inspired me to fly one day', ARRAY['No such organisation']::text[], 'Flight dispatcher / ATC', 'Working in an airline company or as an ATC', ARRAY['Tamil', 'English', 'Hindi', 'Sindhi', 'Punjabi']::text[],
    '', ARRAY['Badminton']::text[], ARRAY['Cooking', 'reading books', 'badminton', 'cycling']::text[], ARRAY['Pilot Club', 'Airline Operations Club', 'ATC Club', 'AI & Robotics Club', 'Entrepreneurship Club', 'Research Club']::text[], ARRAY['Classroom', 'Simulator', 'Group Learning', 'Project Based']::text[], ARRAY['WhatsApp', 'Phone', 'Face-to-Face']::text[],
    '', '', '', 'Financial challenges', 'Motivation, guiding for correct career plan', '', 'STUDENT_REPORTED'
)
ON CONFLICT (student_id) DO UPDATE SET
    gender = EXCLUDED.gender, dob = EXCLUDED.dob, blood_group = EXCLUDED.blood_group,
    parent_phone = EXCLUDED.parent_phone, emergency_contact_number = EXCLUDED.emergency_contact_number,
    emergency_contact_relation = EXCLUDED.emergency_contact_relation, father_name = EXCLUDED.father_name,
    father_occupation = EXCLUDED.father_occupation, mother_name = EXCLUDED.mother_name, mother_occupation = EXCLUDED.mother_occupation,
    family_income_band = EXCLUDED.family_income_band, sslc_score = EXCLUDED.sslc_score, hsc_score = EXCLUDED.hsc_score,
    why_aviation = EXCLUDED.why_aviation, inspired_by = EXCLUDED.inspired_by, dream_organizations = EXCLUDED.dream_organizations,
    after_graduation_plan = EXCLUDED.after_graduation_plan, five_year_vision = EXCLUDED.five_year_vision, languages = EXCLUDED.languages,
    technical_expertise = EXCLUDED.technical_expertise, sports = EXCLUDED.sports, hobbies = EXCLUDED.hobbies,
    clubs_of_interest = EXCLUDED.clubs_of_interest, learning_styles = EXCLUDED.learning_styles,
    preferred_communication = EXCLUDED.preferred_communication, medical_conditions = EXCLUDED.medical_conditions,
    allergies = EXCLUDED.allergies, fitness_routine = EXCLUDED.fitness_routine, biggest_challenge = EXCLUDED.biggest_challenge,
    mentor_help_needed = EXCLUDED.mentor_help_needed, dgca_status = EXCLUDED.dgca_status;
INSERT INTO public.student_profiles (
    student_id, gender, dob, blood_group, parent_phone, emergency_contact_number, emergency_contact_relation,
    father_name, father_occupation, mother_name, mother_occupation, family_income_band, sslc_score, hsc_score,
    why_aviation, inspired_by, dream_organizations, after_graduation_plan, five_year_vision, languages,
    technical_expertise, sports, hobbies, clubs_of_interest, learning_styles, preferred_communication,
    medical_conditions, allergies, fitness_routine, biggest_challenge, mentor_help_needed, dgca_status, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153109'),
    'Female', '2007-09-28', 'B+', '8056553583', '7339658877', 'Selvi-Mother',
    'Munikrishnan', 'Driver', 'Selvi', 'Teacher', 'Below Rs. 2,00,000', '85.8', '74',
    'I am interested in aircraft and aviation technology etc.', 'Ratan tata', ARRAY['Emirates']::text[], 'ATC officer', 'ATC officer', ARRAY['Tamil', 'English']::text[],
    'MS Excel,AutoCAD', ARRAY['Throwball']::text[], ARRAY['Craft work']::text[], ARRAY['Aero Maintenance Club', 'Airline Operations Club', 'ATC Club', 'Research Club']::text[], ARRAY['Practical', 'Classroom', 'Simulator', 'Project Based']::text[], ARRAY['WhatsApp', 'Phone']::text[],
    '', '', '', 'Fear and thinking', 'Good', '', 'STUDENT_REPORTED'
)
ON CONFLICT (student_id) DO UPDATE SET
    gender = EXCLUDED.gender, dob = EXCLUDED.dob, blood_group = EXCLUDED.blood_group,
    parent_phone = EXCLUDED.parent_phone, emergency_contact_number = EXCLUDED.emergency_contact_number,
    emergency_contact_relation = EXCLUDED.emergency_contact_relation, father_name = EXCLUDED.father_name,
    father_occupation = EXCLUDED.father_occupation, mother_name = EXCLUDED.mother_name, mother_occupation = EXCLUDED.mother_occupation,
    family_income_band = EXCLUDED.family_income_band, sslc_score = EXCLUDED.sslc_score, hsc_score = EXCLUDED.hsc_score,
    why_aviation = EXCLUDED.why_aviation, inspired_by = EXCLUDED.inspired_by, dream_organizations = EXCLUDED.dream_organizations,
    after_graduation_plan = EXCLUDED.after_graduation_plan, five_year_vision = EXCLUDED.five_year_vision, languages = EXCLUDED.languages,
    technical_expertise = EXCLUDED.technical_expertise, sports = EXCLUDED.sports, hobbies = EXCLUDED.hobbies,
    clubs_of_interest = EXCLUDED.clubs_of_interest, learning_styles = EXCLUDED.learning_styles,
    preferred_communication = EXCLUDED.preferred_communication, medical_conditions = EXCLUDED.medical_conditions,
    allergies = EXCLUDED.allergies, fitness_routine = EXCLUDED.fitness_routine, biggest_challenge = EXCLUDED.biggest_challenge,
    mentor_help_needed = EXCLUDED.mentor_help_needed, dgca_status = EXCLUDED.dgca_status;
INSERT INTO public.student_profiles (
    student_id, gender, dob, blood_group, parent_phone, emergency_contact_number, emergency_contact_relation,
    father_name, father_occupation, mother_name, mother_occupation, family_income_band, sslc_score, hsc_score,
    why_aviation, inspired_by, dream_organizations, after_graduation_plan, five_year_vision, languages,
    technical_expertise, sports, hobbies, clubs_of_interest, learning_styles, preferred_communication,
    medical_conditions, allergies, fitness_routine, biggest_challenge, mentor_help_needed, dgca_status, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153110'),
    'Male', '2007-03-18', 'O+', '9449964302', '9449964302', '6362777423 - Mother',
    'Tajudin F Dharwad', 'Government Officer in Karnataka', 'Salima M D', 'Teacher', 'Rs. 5,00,000 - Rs. 10,00,000', '90.56%', '87.83%',
    'I am passionate about Flying ever since my childhood and eventually want to end up myself being in the Cockpit as the Pilot Flying.Since my childhood,I have trained myself to be disciplined over every work that I do and wherever I am at.Also,I love to carry the responsibilities that always falls ahe', 'No one was specifically an inspiration for me.But,there was one of my senior during my 11th and 12th,who grew my interest into Aviation and guided me at the times whenever I wanted any information abo', ARRAY['Emirates', 'Lufthansa', 'Qatar.']::text[], 'I would certainly be preparing myself to become a Flight Dispatcher.', 'I will be doing Flight Dispatching for about 3-4 years and then,transition to being a Commercial Pilot as per my plan.', ARRAY['Hindi', 'English', 'Kannada.']::text[],
    'None.', ARRAY['None.']::text[], '{}'::text[], ARRAY['Pilot Club', 'Airline Operations Club', 'Social Media Club']::text[], ARRAY['Practical', 'Classroom', 'Simulator', 'Group Learning']::text[], ARRAY['WhatsApp', 'Phone', 'Face-to-Face']::text[],
    'DNS(Deviated Nasal Septum).', 'NONE.', 'NONE.', 'Funds/Investment.', 'A mentor can help me with the time management,boost my confidence in public speaking including questioning, arguing in a debate,help me to improve in group discussions and also,solo interviews, and mo', 'NONE.', 'STUDENT_REPORTED'
)
ON CONFLICT (student_id) DO UPDATE SET
    gender = EXCLUDED.gender, dob = EXCLUDED.dob, blood_group = EXCLUDED.blood_group,
    parent_phone = EXCLUDED.parent_phone, emergency_contact_number = EXCLUDED.emergency_contact_number,
    emergency_contact_relation = EXCLUDED.emergency_contact_relation, father_name = EXCLUDED.father_name,
    father_occupation = EXCLUDED.father_occupation, mother_name = EXCLUDED.mother_name, mother_occupation = EXCLUDED.mother_occupation,
    family_income_band = EXCLUDED.family_income_band, sslc_score = EXCLUDED.sslc_score, hsc_score = EXCLUDED.hsc_score,
    why_aviation = EXCLUDED.why_aviation, inspired_by = EXCLUDED.inspired_by, dream_organizations = EXCLUDED.dream_organizations,
    after_graduation_plan = EXCLUDED.after_graduation_plan, five_year_vision = EXCLUDED.five_year_vision, languages = EXCLUDED.languages,
    technical_expertise = EXCLUDED.technical_expertise, sports = EXCLUDED.sports, hobbies = EXCLUDED.hobbies,
    clubs_of_interest = EXCLUDED.clubs_of_interest, learning_styles = EXCLUDED.learning_styles,
    preferred_communication = EXCLUDED.preferred_communication, medical_conditions = EXCLUDED.medical_conditions,
    allergies = EXCLUDED.allergies, fitness_routine = EXCLUDED.fitness_routine, biggest_challenge = EXCLUDED.biggest_challenge,
    mentor_help_needed = EXCLUDED.mentor_help_needed, dgca_status = EXCLUDED.dgca_status;
INSERT INTO public.student_profiles (
    student_id, gender, dob, blood_group, parent_phone, emergency_contact_number, emergency_contact_relation,
    father_name, father_occupation, mother_name, mother_occupation, family_income_band, sslc_score, hsc_score,
    why_aviation, inspired_by, dream_organizations, after_graduation_plan, five_year_vision, languages,
    technical_expertise, sports, hobbies, clubs_of_interest, learning_styles, preferred_communication,
    medical_conditions, allergies, fitness_routine, biggest_challenge, mentor_help_needed, dgca_status, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153111'),
    'Female', '2007-06-02', 'B+', '7736182904', '7558989964', 'SINIYA M S- MOTHER',
    'SHIHAB V A', '', 'SINIYA M S', 'INSURANCE COORDINATOR', 'Below Rs. 2,00,000', '96%', '86%',
    'To become a Pilot', 'A FILM', ARRAY['EMIRATES']::text[], 'TO BECOME A PILOT', 'COMMERCIAL PILOT', ARRAY['ENGLISH', 'MALAYALAM', 'TAMIL']::text[],
    'EDITING', '{}'::text[], ARRAY['DRAWING']::text[], ARRAY['Pilot Club', 'Aero Maintenance Club', 'Airline Operations Club']::text[], ARRAY['Practical', 'Classroom', 'Simulator']::text[], ARRAY['Face-to-Face']::text[],
    '', '', '', 'MONEY', 'BY MOTIVATING', '', 'STUDENT_REPORTED'
)
ON CONFLICT (student_id) DO UPDATE SET
    gender = EXCLUDED.gender, dob = EXCLUDED.dob, blood_group = EXCLUDED.blood_group,
    parent_phone = EXCLUDED.parent_phone, emergency_contact_number = EXCLUDED.emergency_contact_number,
    emergency_contact_relation = EXCLUDED.emergency_contact_relation, father_name = EXCLUDED.father_name,
    father_occupation = EXCLUDED.father_occupation, mother_name = EXCLUDED.mother_name, mother_occupation = EXCLUDED.mother_occupation,
    family_income_band = EXCLUDED.family_income_band, sslc_score = EXCLUDED.sslc_score, hsc_score = EXCLUDED.hsc_score,
    why_aviation = EXCLUDED.why_aviation, inspired_by = EXCLUDED.inspired_by, dream_organizations = EXCLUDED.dream_organizations,
    after_graduation_plan = EXCLUDED.after_graduation_plan, five_year_vision = EXCLUDED.five_year_vision, languages = EXCLUDED.languages,
    technical_expertise = EXCLUDED.technical_expertise, sports = EXCLUDED.sports, hobbies = EXCLUDED.hobbies,
    clubs_of_interest = EXCLUDED.clubs_of_interest, learning_styles = EXCLUDED.learning_styles,
    preferred_communication = EXCLUDED.preferred_communication, medical_conditions = EXCLUDED.medical_conditions,
    allergies = EXCLUDED.allergies, fitness_routine = EXCLUDED.fitness_routine, biggest_challenge = EXCLUDED.biggest_challenge,
    mentor_help_needed = EXCLUDED.mentor_help_needed, dgca_status = EXCLUDED.dgca_status;
INSERT INTO public.student_profiles (
    student_id, gender, dob, blood_group, parent_phone, emergency_contact_number, emergency_contact_relation,
    father_name, father_occupation, mother_name, mother_occupation, family_income_band, sslc_score, hsc_score,
    why_aviation, inspired_by, dream_organizations, after_graduation_plan, five_year_vision, languages,
    technical_expertise, sports, hobbies, clubs_of_interest, learning_styles, preferred_communication,
    medical_conditions, allergies, fitness_routine, biggest_challenge, mentor_help_needed, dgca_status, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153112'),
    'Female', '2006-10-03', 'B+', '9092235349', '9092235349', 'Gnana Sundara Pandian-Father',
    'Gnana Sundara Pandian S', 'Quality Control Manager', 'Vigneshwari J', 'Teacher', 'Below Rs. 2,00,000', '92.4%', '86.2%',
    'Aviation is my passion', 'Abdul kalam', ARRAY['Emirates']::text[], 'Giving exams for atc', 'Air Traffic Control Officer', ARRAY['Tamil', 'English']::text[],
    'AutoCAD', ARRAY['Handball']::text[], ARRAY['Reading books']::text[], ARRAY['Aero Maintenance Club', 'ATC Club', 'Coding Club', 'Research Club']::text[], ARRAY['Practical', 'Classroom', 'Simulator', 'Project Based']::text[], ARRAY['WhatsApp', 'Face-to-Face']::text[],
    '', '', '', 'Fear and thinking', 'Good', '', 'STUDENT_REPORTED'
)
ON CONFLICT (student_id) DO UPDATE SET
    gender = EXCLUDED.gender, dob = EXCLUDED.dob, blood_group = EXCLUDED.blood_group,
    parent_phone = EXCLUDED.parent_phone, emergency_contact_number = EXCLUDED.emergency_contact_number,
    emergency_contact_relation = EXCLUDED.emergency_contact_relation, father_name = EXCLUDED.father_name,
    father_occupation = EXCLUDED.father_occupation, mother_name = EXCLUDED.mother_name, mother_occupation = EXCLUDED.mother_occupation,
    family_income_band = EXCLUDED.family_income_band, sslc_score = EXCLUDED.sslc_score, hsc_score = EXCLUDED.hsc_score,
    why_aviation = EXCLUDED.why_aviation, inspired_by = EXCLUDED.inspired_by, dream_organizations = EXCLUDED.dream_organizations,
    after_graduation_plan = EXCLUDED.after_graduation_plan, five_year_vision = EXCLUDED.five_year_vision, languages = EXCLUDED.languages,
    technical_expertise = EXCLUDED.technical_expertise, sports = EXCLUDED.sports, hobbies = EXCLUDED.hobbies,
    clubs_of_interest = EXCLUDED.clubs_of_interest, learning_styles = EXCLUDED.learning_styles,
    preferred_communication = EXCLUDED.preferred_communication, medical_conditions = EXCLUDED.medical_conditions,
    allergies = EXCLUDED.allergies, fitness_routine = EXCLUDED.fitness_routine, biggest_challenge = EXCLUDED.biggest_challenge,
    mentor_help_needed = EXCLUDED.mentor_help_needed, dgca_status = EXCLUDED.dgca_status;
INSERT INTO public.student_profiles (
    student_id, gender, dob, blood_group, parent_phone, emergency_contact_number, emergency_contact_relation,
    father_name, father_occupation, mother_name, mother_occupation, family_income_band, sslc_score, hsc_score,
    why_aviation, inspired_by, dream_organizations, after_graduation_plan, five_year_vision, languages,
    technical_expertise, sports, hobbies, clubs_of_interest, learning_styles, preferred_communication,
    medical_conditions, allergies, fitness_routine, biggest_challenge, mentor_help_needed, dgca_status, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153113'),
    'Male', '2007-10-20', 'B+', '9444278467', '8825469850', 'Sudha Rani - mother',
    'Sathish B', 'Buisness', 'Sudha Rani S', 'Teacher', 'Rs. 2,00,000 - Rs. 5,00,000', '86%', '86%',
    'Passion', 'Social media', ARRAY['AAI']::text[], 'ATC exam preparation', 'ATC', ARRAY['Tamil', 'English']::text[],
    '', ARRAY['Hand ball']::text[], ARRAY['ATC']::text[], ARRAY['ATC Club']::text[], ARRAY['Practical']::text[], ARRAY['WhatsApp']::text[],
    '', '', '', 'Communication', 'Leading us', '', 'STUDENT_REPORTED'
)
ON CONFLICT (student_id) DO UPDATE SET
    gender = EXCLUDED.gender, dob = EXCLUDED.dob, blood_group = EXCLUDED.blood_group,
    parent_phone = EXCLUDED.parent_phone, emergency_contact_number = EXCLUDED.emergency_contact_number,
    emergency_contact_relation = EXCLUDED.emergency_contact_relation, father_name = EXCLUDED.father_name,
    father_occupation = EXCLUDED.father_occupation, mother_name = EXCLUDED.mother_name, mother_occupation = EXCLUDED.mother_occupation,
    family_income_band = EXCLUDED.family_income_band, sslc_score = EXCLUDED.sslc_score, hsc_score = EXCLUDED.hsc_score,
    why_aviation = EXCLUDED.why_aviation, inspired_by = EXCLUDED.inspired_by, dream_organizations = EXCLUDED.dream_organizations,
    after_graduation_plan = EXCLUDED.after_graduation_plan, five_year_vision = EXCLUDED.five_year_vision, languages = EXCLUDED.languages,
    technical_expertise = EXCLUDED.technical_expertise, sports = EXCLUDED.sports, hobbies = EXCLUDED.hobbies,
    clubs_of_interest = EXCLUDED.clubs_of_interest, learning_styles = EXCLUDED.learning_styles,
    preferred_communication = EXCLUDED.preferred_communication, medical_conditions = EXCLUDED.medical_conditions,
    allergies = EXCLUDED.allergies, fitness_routine = EXCLUDED.fitness_routine, biggest_challenge = EXCLUDED.biggest_challenge,
    mentor_help_needed = EXCLUDED.mentor_help_needed, dgca_status = EXCLUDED.dgca_status;
INSERT INTO public.student_profiles (
    student_id, gender, dob, blood_group, parent_phone, emergency_contact_number, emergency_contact_relation,
    father_name, father_occupation, mother_name, mother_occupation, family_income_band, sslc_score, hsc_score,
    why_aviation, inspired_by, dream_organizations, after_graduation_plan, five_year_vision, languages,
    technical_expertise, sports, hobbies, clubs_of_interest, learning_styles, preferred_communication,
    medical_conditions, allergies, fitness_routine, biggest_challenge, mentor_help_needed, dgca_status, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153114'),
    'Female', '2006-03-26', 'A+', '9827174212', '9827174212', 'Rajkumar Tamboli- Father',
    'Rajkumar Tamboli', 'Businessman', 'Manju Tamboli', 'Businesswoman', 'Rs. 2,00,000 - Rs. 5,00,000', '82%', '62.5%',
    'It''s my passion', 'My first flight', ARRAY['Indigo', 'emirates']::text[], 'Flight training', 'A commercial pilot', ARRAY['Hindi', 'english', 'french']::text[],
    'Fusion, ms office, Canva, photoshop', ARRAY['Karate', 'throw ball', 'badminton', 'carrom']::text[], ARRAY['Painting', 'dancing', 'foodie', 'learning about aviation']::text[], ARRAY['Pilot Club', 'Aero Maintenance Club', 'Airline Operations Club', 'ATC Club', 'Entrepreneurship Club', 'Social Media Club', 'Research']::text[], ARRAY['Practical', 'Classroom', 'Simulator', 'Group Learning', 'Online', 'Pro']::text[], ARRAY['WhatsApp', 'Phone', 'Face-to-Face']::text[],
    '', '', '', '', 'Guide me in studies, internships and making me job ready', '', 'STUDENT_REPORTED'
)
ON CONFLICT (student_id) DO UPDATE SET
    gender = EXCLUDED.gender, dob = EXCLUDED.dob, blood_group = EXCLUDED.blood_group,
    parent_phone = EXCLUDED.parent_phone, emergency_contact_number = EXCLUDED.emergency_contact_number,
    emergency_contact_relation = EXCLUDED.emergency_contact_relation, father_name = EXCLUDED.father_name,
    father_occupation = EXCLUDED.father_occupation, mother_name = EXCLUDED.mother_name, mother_occupation = EXCLUDED.mother_occupation,
    family_income_band = EXCLUDED.family_income_band, sslc_score = EXCLUDED.sslc_score, hsc_score = EXCLUDED.hsc_score,
    why_aviation = EXCLUDED.why_aviation, inspired_by = EXCLUDED.inspired_by, dream_organizations = EXCLUDED.dream_organizations,
    after_graduation_plan = EXCLUDED.after_graduation_plan, five_year_vision = EXCLUDED.five_year_vision, languages = EXCLUDED.languages,
    technical_expertise = EXCLUDED.technical_expertise, sports = EXCLUDED.sports, hobbies = EXCLUDED.hobbies,
    clubs_of_interest = EXCLUDED.clubs_of_interest, learning_styles = EXCLUDED.learning_styles,
    preferred_communication = EXCLUDED.preferred_communication, medical_conditions = EXCLUDED.medical_conditions,
    allergies = EXCLUDED.allergies, fitness_routine = EXCLUDED.fitness_routine, biggest_challenge = EXCLUDED.biggest_challenge,
    mentor_help_needed = EXCLUDED.mentor_help_needed, dgca_status = EXCLUDED.dgca_status;
INSERT INTO public.student_profiles (
    student_id, gender, dob, blood_group, parent_phone, emergency_contact_number, emergency_contact_relation,
    father_name, father_occupation, mother_name, mother_occupation, family_income_band, sslc_score, hsc_score,
    why_aviation, inspired_by, dream_organizations, after_graduation_plan, five_year_vision, languages,
    technical_expertise, sports, hobbies, clubs_of_interest, learning_styles, preferred_communication,
    medical_conditions, allergies, fitness_routine, biggest_challenge, mentor_help_needed, dgca_status, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153115'),
    'Female', '2006-07-19', 'B+', '9847228278', '9847228278', 'Sabitha- Mother',
    'Muhammed shereef', 'Bussiness', 'Sabitha', 'Sbthkareem@gmail.com', 'Below Rs. 2,00,000', '100%', '100%',
    'To become ATC', 'a film', ARRAY['Emirates', 'AAI', 'DGCA', 'indigo']::text[], 'ATC', 'ATC', ARRAY['Malayalam', 'english']::text[],
    '', '{}'::text[], ARRAY['Nill']::text[], ARRAY['Airline Operations Club', 'ATC Club', 'Social Media Club']::text[], ARRAY['Practical', 'Classroom', 'Simulator', 'Group Learning', 'Project Bas']::text[], ARRAY['Phone']::text[],
    '', '', '', 'Money', 'By motivation', '', 'STUDENT_REPORTED'
)
ON CONFLICT (student_id) DO UPDATE SET
    gender = EXCLUDED.gender, dob = EXCLUDED.dob, blood_group = EXCLUDED.blood_group,
    parent_phone = EXCLUDED.parent_phone, emergency_contact_number = EXCLUDED.emergency_contact_number,
    emergency_contact_relation = EXCLUDED.emergency_contact_relation, father_name = EXCLUDED.father_name,
    father_occupation = EXCLUDED.father_occupation, mother_name = EXCLUDED.mother_name, mother_occupation = EXCLUDED.mother_occupation,
    family_income_band = EXCLUDED.family_income_band, sslc_score = EXCLUDED.sslc_score, hsc_score = EXCLUDED.hsc_score,
    why_aviation = EXCLUDED.why_aviation, inspired_by = EXCLUDED.inspired_by, dream_organizations = EXCLUDED.dream_organizations,
    after_graduation_plan = EXCLUDED.after_graduation_plan, five_year_vision = EXCLUDED.five_year_vision, languages = EXCLUDED.languages,
    technical_expertise = EXCLUDED.technical_expertise, sports = EXCLUDED.sports, hobbies = EXCLUDED.hobbies,
    clubs_of_interest = EXCLUDED.clubs_of_interest, learning_styles = EXCLUDED.learning_styles,
    preferred_communication = EXCLUDED.preferred_communication, medical_conditions = EXCLUDED.medical_conditions,
    allergies = EXCLUDED.allergies, fitness_routine = EXCLUDED.fitness_routine, biggest_challenge = EXCLUDED.biggest_challenge,
    mentor_help_needed = EXCLUDED.mentor_help_needed, dgca_status = EXCLUDED.dgca_status;
INSERT INTO public.student_profiles (
    student_id, gender, dob, blood_group, parent_phone, emergency_contact_number, emergency_contact_relation,
    father_name, father_occupation, mother_name, mother_occupation, family_income_band, sslc_score, hsc_score,
    why_aviation, inspired_by, dream_organizations, after_graduation_plan, five_year_vision, languages,
    technical_expertise, sports, hobbies, clubs_of_interest, learning_styles, preferred_communication,
    medical_conditions, allergies, fitness_routine, biggest_challenge, mentor_help_needed, dgca_status, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153116'),
    'Male', '2008-03-04', 'A+', '9952913747', '9790796655', 'Geetha- mother',
    'Kumar M', 'Painter', 'Geetha K', 'House wife', 'Below Rs. 2,00,000', '74.2%', '78%',
    'Aviation is driven by a passion for exploration and human achievement. It connects the world by turning vast oceans and continents into brief, scenic journeys. Choosing a career in this field means embracing a dynamic environment built on advanced technology, precision, and teamwork. While the train', 'Wright brothers , the film (Sully 2016)', ARRAY['Emirates', 'AAI', 'Boeing']::text[], 'Preparation of ATC examinations.', '"In five years, I plan to have successfully completed all facility ratings and earned my full operational certification as a Certified Professional Controller (CPC). I want to master high-density sector management and maintain a flawless safety record. My goal is to build deep situational awareness ', ARRAY['Tamil', 'English.']::text[],
    'MS Excel, MS Word, MS Powerpoint, Programming, AutoCAD, Photoshop.', '{}'::text[], '{}'::text[], ARRAY['ATC Club', 'Entrepreneurship Club']::text[], ARRAY['Practical', 'Classroom', 'Simulator']::text[], ARRAY['WhatsApp', 'Phone', 'Face-to-Face']::text[],
    '', '', '', 'Language barrier, self confidence, crowd fear.', 'I am aspiring to become an Air Traffic Controller, which requires exceptional communication and calm decision-making. Currently, my biggest hurdles are developing strong communication skills and overc', '', 'STUDENT_REPORTED'
)
ON CONFLICT (student_id) DO UPDATE SET
    gender = EXCLUDED.gender, dob = EXCLUDED.dob, blood_group = EXCLUDED.blood_group,
    parent_phone = EXCLUDED.parent_phone, emergency_contact_number = EXCLUDED.emergency_contact_number,
    emergency_contact_relation = EXCLUDED.emergency_contact_relation, father_name = EXCLUDED.father_name,
    father_occupation = EXCLUDED.father_occupation, mother_name = EXCLUDED.mother_name, mother_occupation = EXCLUDED.mother_occupation,
    family_income_band = EXCLUDED.family_income_band, sslc_score = EXCLUDED.sslc_score, hsc_score = EXCLUDED.hsc_score,
    why_aviation = EXCLUDED.why_aviation, inspired_by = EXCLUDED.inspired_by, dream_organizations = EXCLUDED.dream_organizations,
    after_graduation_plan = EXCLUDED.after_graduation_plan, five_year_vision = EXCLUDED.five_year_vision, languages = EXCLUDED.languages,
    technical_expertise = EXCLUDED.technical_expertise, sports = EXCLUDED.sports, hobbies = EXCLUDED.hobbies,
    clubs_of_interest = EXCLUDED.clubs_of_interest, learning_styles = EXCLUDED.learning_styles,
    preferred_communication = EXCLUDED.preferred_communication, medical_conditions = EXCLUDED.medical_conditions,
    allergies = EXCLUDED.allergies, fitness_routine = EXCLUDED.fitness_routine, biggest_challenge = EXCLUDED.biggest_challenge,
    mentor_help_needed = EXCLUDED.mentor_help_needed, dgca_status = EXCLUDED.dgca_status;
INSERT INTO public.student_profiles (
    student_id, gender, dob, blood_group, parent_phone, emergency_contact_number, emergency_contact_relation,
    father_name, father_occupation, mother_name, mother_occupation, family_income_band, sslc_score, hsc_score,
    why_aviation, inspired_by, dream_organizations, after_graduation_plan, five_year_vision, languages,
    technical_expertise, sports, hobbies, clubs_of_interest, learning_styles, preferred_communication,
    medical_conditions, allergies, fitness_routine, biggest_challenge, mentor_help_needed, dgca_status, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153117'),
    'Male', '2008-04-27', 'A+', '8608871978', '9600340090', 'Jansi rani - Mother',
    'HENRY ARUL DOSS .P', 'Revenue officer', 'JANSI RANI.V', 'Teacher', 'Rs. 2,00,000 - Rs. 5,00,000', '85%', '80%',
    'My dream is to become a pilot', 'A social media influencer inspired me to become a pilot', ARRAY['AAI']::text[], 'I want to prepare for my ATC entrance exams', 'To become an ATC officer at Coimbatore airport', ARRAY['தமிழ்', 'ENGLISH']::text[],
    '', ARRAY['Badminton']::text[], ARRAY['Cooking', 'watching movies and skating']::text[], ARRAY['Pilot Club', 'ATC Club']::text[], ARRAY['Practical', 'Classroom', 'Simulator']::text[], ARRAY['WhatsApp', 'Face-to-Face']::text[],
    '', '', '', '', 'Mentor should come to class frequently and ask students about the classes whether they understood it or there should be changes in tutor''s teaching method and help them to understand the concept', '', 'STUDENT_REPORTED'
)
ON CONFLICT (student_id) DO UPDATE SET
    gender = EXCLUDED.gender, dob = EXCLUDED.dob, blood_group = EXCLUDED.blood_group,
    parent_phone = EXCLUDED.parent_phone, emergency_contact_number = EXCLUDED.emergency_contact_number,
    emergency_contact_relation = EXCLUDED.emergency_contact_relation, father_name = EXCLUDED.father_name,
    father_occupation = EXCLUDED.father_occupation, mother_name = EXCLUDED.mother_name, mother_occupation = EXCLUDED.mother_occupation,
    family_income_band = EXCLUDED.family_income_band, sslc_score = EXCLUDED.sslc_score, hsc_score = EXCLUDED.hsc_score,
    why_aviation = EXCLUDED.why_aviation, inspired_by = EXCLUDED.inspired_by, dream_organizations = EXCLUDED.dream_organizations,
    after_graduation_plan = EXCLUDED.after_graduation_plan, five_year_vision = EXCLUDED.five_year_vision, languages = EXCLUDED.languages,
    technical_expertise = EXCLUDED.technical_expertise, sports = EXCLUDED.sports, hobbies = EXCLUDED.hobbies,
    clubs_of_interest = EXCLUDED.clubs_of_interest, learning_styles = EXCLUDED.learning_styles,
    preferred_communication = EXCLUDED.preferred_communication, medical_conditions = EXCLUDED.medical_conditions,
    allergies = EXCLUDED.allergies, fitness_routine = EXCLUDED.fitness_routine, biggest_challenge = EXCLUDED.biggest_challenge,
    mentor_help_needed = EXCLUDED.mentor_help_needed, dgca_status = EXCLUDED.dgca_status;
INSERT INTO public.student_profiles (
    student_id, gender, dob, blood_group, parent_phone, emergency_contact_number, emergency_contact_relation,
    father_name, father_occupation, mother_name, mother_occupation, family_income_band, sslc_score, hsc_score,
    why_aviation, inspired_by, dream_organizations, after_graduation_plan, five_year_vision, languages,
    technical_expertise, sports, hobbies, clubs_of_interest, learning_styles, preferred_communication,
    medical_conditions, allergies, fitness_routine, biggest_challenge, mentor_help_needed, dgca_status, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153118'),
    'Female', '2007-08-28', 'O+', '8973454199', '8778661798', 'Sangeetha-Mother',
    'Santhosh kumar', 'Ex-BSF', 'Sangeetha', 'Housewife', 'Prefer not to say', '95%', '86%',
    'Dream', 'No one', ARRAY['Emirates']::text[], 'ATC', 'I don''t know', ARRAY['Tamil', 'English']::text[],
    '', ARRAY['Hockey']::text[], '{}'::text[], ARRAY['ATC Club']::text[], ARRAY['Practical', 'Simulator', 'Project Based']::text[], ARRAY['WhatsApp', 'Phone', 'Face-to-Face']::text[],
    '', '', '', 'Fear', 'Motivation', '', 'STUDENT_REPORTED'
)
ON CONFLICT (student_id) DO UPDATE SET
    gender = EXCLUDED.gender, dob = EXCLUDED.dob, blood_group = EXCLUDED.blood_group,
    parent_phone = EXCLUDED.parent_phone, emergency_contact_number = EXCLUDED.emergency_contact_number,
    emergency_contact_relation = EXCLUDED.emergency_contact_relation, father_name = EXCLUDED.father_name,
    father_occupation = EXCLUDED.father_occupation, mother_name = EXCLUDED.mother_name, mother_occupation = EXCLUDED.mother_occupation,
    family_income_band = EXCLUDED.family_income_band, sslc_score = EXCLUDED.sslc_score, hsc_score = EXCLUDED.hsc_score,
    why_aviation = EXCLUDED.why_aviation, inspired_by = EXCLUDED.inspired_by, dream_organizations = EXCLUDED.dream_organizations,
    after_graduation_plan = EXCLUDED.after_graduation_plan, five_year_vision = EXCLUDED.five_year_vision, languages = EXCLUDED.languages,
    technical_expertise = EXCLUDED.technical_expertise, sports = EXCLUDED.sports, hobbies = EXCLUDED.hobbies,
    clubs_of_interest = EXCLUDED.clubs_of_interest, learning_styles = EXCLUDED.learning_styles,
    preferred_communication = EXCLUDED.preferred_communication, medical_conditions = EXCLUDED.medical_conditions,
    allergies = EXCLUDED.allergies, fitness_routine = EXCLUDED.fitness_routine, biggest_challenge = EXCLUDED.biggest_challenge,
    mentor_help_needed = EXCLUDED.mentor_help_needed, dgca_status = EXCLUDED.dgca_status;
INSERT INTO public.student_profiles (
    student_id, gender, dob, blood_group, parent_phone, emergency_contact_number, emergency_contact_relation,
    father_name, father_occupation, mother_name, mother_occupation, family_income_band, sslc_score, hsc_score,
    why_aviation, inspired_by, dream_organizations, after_graduation_plan, five_year_vision, languages,
    technical_expertise, sports, hobbies, clubs_of_interest, learning_styles, preferred_communication,
    medical_conditions, allergies, fitness_routine, biggest_challenge, mentor_help_needed, dgca_status, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153119'),
    'Male', '2007-12-12', 'B+', '9962083779', '9962083779', 'Robert - Father',
    'Charles Robert Kenneth', 'Professor', 'R.C Thivyarathi', 'Professor', 'Rs. 10,00,000 - Rs. 20,00,000', '68%', '81%',
    'For global travel and strong career', 'Films - Runway 34 ; operation valentine', ARRAY['Emirates']::text[], 'To clear ATC exams as well as RTR exams', 'Junior executive officer', ARRAY['Tamil', 'English']::text[],
    '', ARRAY['Badminton']::text[], ARRAY['Cooking']::text[], ARRAY['ATC Club']::text[], ARRAY['Practical', 'Classroom', 'Group Learning']::text[], ARRAY['Phone', 'Face-to-Face']::text[],
    '', 'Dust allergy', '', 'Speaking skills', 'Help me improve my speaking skills', '', 'STUDENT_REPORTED'
)
ON CONFLICT (student_id) DO UPDATE SET
    gender = EXCLUDED.gender, dob = EXCLUDED.dob, blood_group = EXCLUDED.blood_group,
    parent_phone = EXCLUDED.parent_phone, emergency_contact_number = EXCLUDED.emergency_contact_number,
    emergency_contact_relation = EXCLUDED.emergency_contact_relation, father_name = EXCLUDED.father_name,
    father_occupation = EXCLUDED.father_occupation, mother_name = EXCLUDED.mother_name, mother_occupation = EXCLUDED.mother_occupation,
    family_income_band = EXCLUDED.family_income_band, sslc_score = EXCLUDED.sslc_score, hsc_score = EXCLUDED.hsc_score,
    why_aviation = EXCLUDED.why_aviation, inspired_by = EXCLUDED.inspired_by, dream_organizations = EXCLUDED.dream_organizations,
    after_graduation_plan = EXCLUDED.after_graduation_plan, five_year_vision = EXCLUDED.five_year_vision, languages = EXCLUDED.languages,
    technical_expertise = EXCLUDED.technical_expertise, sports = EXCLUDED.sports, hobbies = EXCLUDED.hobbies,
    clubs_of_interest = EXCLUDED.clubs_of_interest, learning_styles = EXCLUDED.learning_styles,
    preferred_communication = EXCLUDED.preferred_communication, medical_conditions = EXCLUDED.medical_conditions,
    allergies = EXCLUDED.allergies, fitness_routine = EXCLUDED.fitness_routine, biggest_challenge = EXCLUDED.biggest_challenge,
    mentor_help_needed = EXCLUDED.mentor_help_needed, dgca_status = EXCLUDED.dgca_status;
INSERT INTO public.student_profiles (
    student_id, gender, dob, blood_group, parent_phone, emergency_contact_number, emergency_contact_relation,
    father_name, father_occupation, mother_name, mother_occupation, family_income_band, sslc_score, hsc_score,
    why_aviation, inspired_by, dream_organizations, after_graduation_plan, five_year_vision, languages,
    technical_expertise, sports, hobbies, clubs_of_interest, learning_styles, preferred_communication,
    medical_conditions, allergies, fitness_routine, biggest_challenge, mentor_help_needed, dgca_status, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153120'),
    'Female', '2008-04-16', 'O+', '9840863113', '9840863113', 'Michealraj- Father',
    'Michealraj A', 'Business', 'Rosline saratha M', 'House wife', 'Prefer not to say', '75%', '87%',
    'I want to become a pilot and also because of the diverse job options.', 'A family member', ARRAY['Lufthansa']::text[], 'Pilot', 'Pilot', ARRAY['Tamil', 'English']::text[],
    '', '{}'::text[], ARRAY['Sketching and reading']::text[], ARRAY['Pilot Club', 'Airline Operations Club', 'ATC Club']::text[], ARRAY['Practical', 'Classroom', 'Simulator']::text[], ARRAY['WhatsApp', 'Email', 'Phone', 'Face-to-Face']::text[],
    '', '', '', 'Stage fear', 'To guide me with internship and to guide me to get a job and real industry experience', 'Meteorology', 'STUDENT_REPORTED'
)
ON CONFLICT (student_id) DO UPDATE SET
    gender = EXCLUDED.gender, dob = EXCLUDED.dob, blood_group = EXCLUDED.blood_group,
    parent_phone = EXCLUDED.parent_phone, emergency_contact_number = EXCLUDED.emergency_contact_number,
    emergency_contact_relation = EXCLUDED.emergency_contact_relation, father_name = EXCLUDED.father_name,
    father_occupation = EXCLUDED.father_occupation, mother_name = EXCLUDED.mother_name, mother_occupation = EXCLUDED.mother_occupation,
    family_income_band = EXCLUDED.family_income_band, sslc_score = EXCLUDED.sslc_score, hsc_score = EXCLUDED.hsc_score,
    why_aviation = EXCLUDED.why_aviation, inspired_by = EXCLUDED.inspired_by, dream_organizations = EXCLUDED.dream_organizations,
    after_graduation_plan = EXCLUDED.after_graduation_plan, five_year_vision = EXCLUDED.five_year_vision, languages = EXCLUDED.languages,
    technical_expertise = EXCLUDED.technical_expertise, sports = EXCLUDED.sports, hobbies = EXCLUDED.hobbies,
    clubs_of_interest = EXCLUDED.clubs_of_interest, learning_styles = EXCLUDED.learning_styles,
    preferred_communication = EXCLUDED.preferred_communication, medical_conditions = EXCLUDED.medical_conditions,
    allergies = EXCLUDED.allergies, fitness_routine = EXCLUDED.fitness_routine, biggest_challenge = EXCLUDED.biggest_challenge,
    mentor_help_needed = EXCLUDED.mentor_help_needed, dgca_status = EXCLUDED.dgca_status;
INSERT INTO public.student_profiles (
    student_id, gender, dob, blood_group, parent_phone, emergency_contact_number, emergency_contact_relation,
    father_name, father_occupation, mother_name, mother_occupation, family_income_band, sslc_score, hsc_score,
    why_aviation, inspired_by, dream_organizations, after_graduation_plan, five_year_vision, languages,
    technical_expertise, sports, hobbies, clubs_of_interest, learning_styles, preferred_communication,
    medical_conditions, allergies, fitness_routine, biggest_challenge, mentor_help_needed, dgca_status, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153121'),
    'Male', '2007-11-04', 'A+', '9842133206', '9842133206', 'Singaravelan - Father',
    'Singaravelan S', 'Business', 'Chitra S', 'House Wife', 'Rs. 10,00,000 - Rs. 20,00,000', '89.2', '83.3',
    'A ambition to become a pilot', 'An event and space launches', ARRAY['Emirates', 'Singapore Airlines']::text[], 'Pursuing flying', 'Pilot', ARRAY['Tamil', 'English']::text[],
    'Python, C++', '{}'::text[], ARRAY['Reading books']::text[], ARRAY['Pilot Club']::text[], ARRAY['Practical', 'Classroom', 'Simulator']::text[], ARRAY['WhatsApp', 'Phone', 'Face-to-Face']::text[],
    '', '', '', 'Financial status', 'Drafting a perfect financial plan and career path', '', 'STUDENT_REPORTED'
)
ON CONFLICT (student_id) DO UPDATE SET
    gender = EXCLUDED.gender, dob = EXCLUDED.dob, blood_group = EXCLUDED.blood_group,
    parent_phone = EXCLUDED.parent_phone, emergency_contact_number = EXCLUDED.emergency_contact_number,
    emergency_contact_relation = EXCLUDED.emergency_contact_relation, father_name = EXCLUDED.father_name,
    father_occupation = EXCLUDED.father_occupation, mother_name = EXCLUDED.mother_name, mother_occupation = EXCLUDED.mother_occupation,
    family_income_band = EXCLUDED.family_income_band, sslc_score = EXCLUDED.sslc_score, hsc_score = EXCLUDED.hsc_score,
    why_aviation = EXCLUDED.why_aviation, inspired_by = EXCLUDED.inspired_by, dream_organizations = EXCLUDED.dream_organizations,
    after_graduation_plan = EXCLUDED.after_graduation_plan, five_year_vision = EXCLUDED.five_year_vision, languages = EXCLUDED.languages,
    technical_expertise = EXCLUDED.technical_expertise, sports = EXCLUDED.sports, hobbies = EXCLUDED.hobbies,
    clubs_of_interest = EXCLUDED.clubs_of_interest, learning_styles = EXCLUDED.learning_styles,
    preferred_communication = EXCLUDED.preferred_communication, medical_conditions = EXCLUDED.medical_conditions,
    allergies = EXCLUDED.allergies, fitness_routine = EXCLUDED.fitness_routine, biggest_challenge = EXCLUDED.biggest_challenge,
    mentor_help_needed = EXCLUDED.mentor_help_needed, dgca_status = EXCLUDED.dgca_status;
INSERT INTO public.student_profiles (
    student_id, gender, dob, blood_group, parent_phone, emergency_contact_number, emergency_contact_relation,
    father_name, father_occupation, mother_name, mother_occupation, family_income_band, sslc_score, hsc_score,
    why_aviation, inspired_by, dream_organizations, after_graduation_plan, five_year_vision, languages,
    technical_expertise, sports, hobbies, clubs_of_interest, learning_styles, preferred_communication,
    medical_conditions, allergies, fitness_routine, biggest_challenge, mentor_help_needed, dgca_status, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153122'),
    'Male', '2008-04-18', 'O+', '8122855336', '9841410241', 'KATHIJA A - Mother',
    'JAMAL MOHAMED J', '', 'KATHIJA A', '', 'Rs. 10,00,000 - Rs. 20,00,000', '67.4%', '67.83%',
    'To pursue my pilot career', 'Aircraft', ARRAY['Emirates and Singapore airlines']::text[], 'Flying', 'As a commercial pilot', ARRAY['Tamil', 'Hindi', 'English', 'Malayalam']::text[],
    '', ARRAY['CRICKET']::text[], ARRAY['Batminton and Reading books']::text[], ARRAY['Pilot Club']::text[], ARRAY['Practical', 'Classroom', 'Simulator', 'Group Learning']::text[], ARRAY['WhatsApp', 'Phone', 'Face-to-Face']::text[],
    '', '', '', 'Time', 'Everything is alright', 'Aviation Meteorology', 'STUDENT_REPORTED'
)
ON CONFLICT (student_id) DO UPDATE SET
    gender = EXCLUDED.gender, dob = EXCLUDED.dob, blood_group = EXCLUDED.blood_group,
    parent_phone = EXCLUDED.parent_phone, emergency_contact_number = EXCLUDED.emergency_contact_number,
    emergency_contact_relation = EXCLUDED.emergency_contact_relation, father_name = EXCLUDED.father_name,
    father_occupation = EXCLUDED.father_occupation, mother_name = EXCLUDED.mother_name, mother_occupation = EXCLUDED.mother_occupation,
    family_income_band = EXCLUDED.family_income_band, sslc_score = EXCLUDED.sslc_score, hsc_score = EXCLUDED.hsc_score,
    why_aviation = EXCLUDED.why_aviation, inspired_by = EXCLUDED.inspired_by, dream_organizations = EXCLUDED.dream_organizations,
    after_graduation_plan = EXCLUDED.after_graduation_plan, five_year_vision = EXCLUDED.five_year_vision, languages = EXCLUDED.languages,
    technical_expertise = EXCLUDED.technical_expertise, sports = EXCLUDED.sports, hobbies = EXCLUDED.hobbies,
    clubs_of_interest = EXCLUDED.clubs_of_interest, learning_styles = EXCLUDED.learning_styles,
    preferred_communication = EXCLUDED.preferred_communication, medical_conditions = EXCLUDED.medical_conditions,
    allergies = EXCLUDED.allergies, fitness_routine = EXCLUDED.fitness_routine, biggest_challenge = EXCLUDED.biggest_challenge,
    mentor_help_needed = EXCLUDED.mentor_help_needed, dgca_status = EXCLUDED.dgca_status;
INSERT INTO public.student_profiles (
    student_id, gender, dob, blood_group, parent_phone, emergency_contact_number, emergency_contact_relation,
    father_name, father_occupation, mother_name, mother_occupation, family_income_band, sslc_score, hsc_score,
    why_aviation, inspired_by, dream_organizations, after_graduation_plan, five_year_vision, languages,
    technical_expertise, sports, hobbies, clubs_of_interest, learning_styles, preferred_communication,
    medical_conditions, allergies, fitness_routine, biggest_challenge, mentor_help_needed, dgca_status, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153123'),
    'Female', '2007-12-06', 'B+', '8903689497', '8903689497', 'Mohanraj Father',
    'M. Mohanraj', 'Lic Agent', 'M. Gomathi', 'Teacher', 'Below Rs. 2,00,000', '69. 8', '73. 4',
    'I chose aviation because it is one of the few fields that completely redefines our perspective on time, distance, and borders. While most industries operate within established boundaries, aviation is entirely about expanding them and making a massive world feel connected.', 'No', ARRAY['AAI']::text[], 'Coaching class', 'Junior Executive in AAI', ARRAY['English', 'Hindi', 'Tamil', 'French']::text[],
    '', ARRAY['Basketball player']::text[], ARRAY['Playing chess researching on mysterious case study']::text[], ARRAY['ATC Club', 'Entrepreneurship Club']::text[], ARRAY['Classroom', 'Group Learning', 'Project Based']::text[], ARRAY['Face-to-Face']::text[],
    '', '', '', 'Balancing academic studies with career preparation. Managing a full course load while trying to find internships and build a portfolio can feel overwhelming', 'By sharing your career story. I want to learn what a typical workday looks like in your role and what skills matter most when starting out', '', 'STUDENT_REPORTED'
)
ON CONFLICT (student_id) DO UPDATE SET
    gender = EXCLUDED.gender, dob = EXCLUDED.dob, blood_group = EXCLUDED.blood_group,
    parent_phone = EXCLUDED.parent_phone, emergency_contact_number = EXCLUDED.emergency_contact_number,
    emergency_contact_relation = EXCLUDED.emergency_contact_relation, father_name = EXCLUDED.father_name,
    father_occupation = EXCLUDED.father_occupation, mother_name = EXCLUDED.mother_name, mother_occupation = EXCLUDED.mother_occupation,
    family_income_band = EXCLUDED.family_income_band, sslc_score = EXCLUDED.sslc_score, hsc_score = EXCLUDED.hsc_score,
    why_aviation = EXCLUDED.why_aviation, inspired_by = EXCLUDED.inspired_by, dream_organizations = EXCLUDED.dream_organizations,
    after_graduation_plan = EXCLUDED.after_graduation_plan, five_year_vision = EXCLUDED.five_year_vision, languages = EXCLUDED.languages,
    technical_expertise = EXCLUDED.technical_expertise, sports = EXCLUDED.sports, hobbies = EXCLUDED.hobbies,
    clubs_of_interest = EXCLUDED.clubs_of_interest, learning_styles = EXCLUDED.learning_styles,
    preferred_communication = EXCLUDED.preferred_communication, medical_conditions = EXCLUDED.medical_conditions,
    allergies = EXCLUDED.allergies, fitness_routine = EXCLUDED.fitness_routine, biggest_challenge = EXCLUDED.biggest_challenge,
    mentor_help_needed = EXCLUDED.mentor_help_needed, dgca_status = EXCLUDED.dgca_status;
INSERT INTO public.student_profiles (
    student_id, gender, dob, blood_group, parent_phone, emergency_contact_number, emergency_contact_relation,
    father_name, father_occupation, mother_name, mother_occupation, family_income_band, sslc_score, hsc_score,
    why_aviation, inspired_by, dream_organizations, after_graduation_plan, five_year_vision, languages,
    technical_expertise, sports, hobbies, clubs_of_interest, learning_styles, preferred_communication,
    medical_conditions, allergies, fitness_routine, biggest_challenge, mentor_help_needed, dgca_status, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153124'),
    'Male', '2008-08-01', 'A+', '9487760676', '9487760676', 'Julekabee-Gaurdian',
    'SHAMSUDHIN Y', 'Farmer', 'DILSHAT S', 'Tailor', 'Below Rs. 2,00,000', '86.2%', '86.16%',
    'I choose Aviation field to learn new things and develop skills', 'A person', ARRAY['AAI']::text[], 'ATC', 'After five years i want to be an  ATC offier', ARRAY['Tamil', 'English', 'Urdu']::text[],
    '', ARRAY['Chess', 'Volleyball', 'Cricket', 'badminton']::text[], ARRAY['Drawing']::text[], ARRAY['ATC Club']::text[], ARRAY['Practical', 'Classroom', 'Simulator', 'Group Learning', 'Online', 'Pro']::text[], ARRAY['WhatsApp', 'Email', 'Face-to-Face']::text[],
    'Hyperhidrosis', 'Dust allergy', '', 'Economy', 'By giving carrier guidance, supporting in subject', '', 'STUDENT_REPORTED'
)
ON CONFLICT (student_id) DO UPDATE SET
    gender = EXCLUDED.gender, dob = EXCLUDED.dob, blood_group = EXCLUDED.blood_group,
    parent_phone = EXCLUDED.parent_phone, emergency_contact_number = EXCLUDED.emergency_contact_number,
    emergency_contact_relation = EXCLUDED.emergency_contact_relation, father_name = EXCLUDED.father_name,
    father_occupation = EXCLUDED.father_occupation, mother_name = EXCLUDED.mother_name, mother_occupation = EXCLUDED.mother_occupation,
    family_income_band = EXCLUDED.family_income_band, sslc_score = EXCLUDED.sslc_score, hsc_score = EXCLUDED.hsc_score,
    why_aviation = EXCLUDED.why_aviation, inspired_by = EXCLUDED.inspired_by, dream_organizations = EXCLUDED.dream_organizations,
    after_graduation_plan = EXCLUDED.after_graduation_plan, five_year_vision = EXCLUDED.five_year_vision, languages = EXCLUDED.languages,
    technical_expertise = EXCLUDED.technical_expertise, sports = EXCLUDED.sports, hobbies = EXCLUDED.hobbies,
    clubs_of_interest = EXCLUDED.clubs_of_interest, learning_styles = EXCLUDED.learning_styles,
    preferred_communication = EXCLUDED.preferred_communication, medical_conditions = EXCLUDED.medical_conditions,
    allergies = EXCLUDED.allergies, fitness_routine = EXCLUDED.fitness_routine, biggest_challenge = EXCLUDED.biggest_challenge,
    mentor_help_needed = EXCLUDED.mentor_help_needed, dgca_status = EXCLUDED.dgca_status;
INSERT INTO public.student_profiles (
    student_id, gender, dob, blood_group, parent_phone, emergency_contact_number, emergency_contact_relation,
    father_name, father_occupation, mother_name, mother_occupation, family_income_band, sslc_score, hsc_score,
    why_aviation, inspired_by, dream_organizations, after_graduation_plan, five_year_vision, languages,
    technical_expertise, sports, hobbies, clubs_of_interest, learning_styles, preferred_communication,
    medical_conditions, allergies, fitness_routine, biggest_challenge, mentor_help_needed, dgca_status, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153125'),
    'Male', '2007-06-27', 'B+', '9750939432', '9750939431', 'Revathi-Mother',
    'RAMESH.C', 'Business', 'REVATHI.R', 'House wife', 'Rs. 2,00,000 - Rs. 5,00,000', '70.4%', '73.8%',
    'My Ambition is to become a pilot so I have chosen this profession', 'I used to watch aircraft flying and pilots who wear those uniforms which made me to inspire', ARRAY['Emirates']::text[], 'I would will to complete my dgca papers and move on for a flying school', 'In any country which I should decide', ARRAY['Tamil', 'Kannada', 'English']::text[],
    '', ARRAY['Cricket', 'shuttle']::text[], ARRAY['Watch movies', 'hangout with friends and learn the current affairs of India and abroad']::text[], ARRAY['Pilot Club', 'Airline Operations Club', 'Research Club']::text[], ARRAY['Practical', 'Simulator', 'Group Learning']::text[], ARRAY['WhatsApp', 'Face-to-Face']::text[],
    '', '', '', 'Clearing all the dgca exam papers', 'Sit beside me and guide me through the areas were I mean to lag', '', 'STUDENT_REPORTED'
)
ON CONFLICT (student_id) DO UPDATE SET
    gender = EXCLUDED.gender, dob = EXCLUDED.dob, blood_group = EXCLUDED.blood_group,
    parent_phone = EXCLUDED.parent_phone, emergency_contact_number = EXCLUDED.emergency_contact_number,
    emergency_contact_relation = EXCLUDED.emergency_contact_relation, father_name = EXCLUDED.father_name,
    father_occupation = EXCLUDED.father_occupation, mother_name = EXCLUDED.mother_name, mother_occupation = EXCLUDED.mother_occupation,
    family_income_band = EXCLUDED.family_income_band, sslc_score = EXCLUDED.sslc_score, hsc_score = EXCLUDED.hsc_score,
    why_aviation = EXCLUDED.why_aviation, inspired_by = EXCLUDED.inspired_by, dream_organizations = EXCLUDED.dream_organizations,
    after_graduation_plan = EXCLUDED.after_graduation_plan, five_year_vision = EXCLUDED.five_year_vision, languages = EXCLUDED.languages,
    technical_expertise = EXCLUDED.technical_expertise, sports = EXCLUDED.sports, hobbies = EXCLUDED.hobbies,
    clubs_of_interest = EXCLUDED.clubs_of_interest, learning_styles = EXCLUDED.learning_styles,
    preferred_communication = EXCLUDED.preferred_communication, medical_conditions = EXCLUDED.medical_conditions,
    allergies = EXCLUDED.allergies, fitness_routine = EXCLUDED.fitness_routine, biggest_challenge = EXCLUDED.biggest_challenge,
    mentor_help_needed = EXCLUDED.mentor_help_needed, dgca_status = EXCLUDED.dgca_status;
INSERT INTO public.student_profiles (
    student_id, gender, dob, blood_group, parent_phone, emergency_contact_number, emergency_contact_relation,
    father_name, father_occupation, mother_name, mother_occupation, family_income_band, sslc_score, hsc_score,
    why_aviation, inspired_by, dream_organizations, after_graduation_plan, five_year_vision, languages,
    technical_expertise, sports, hobbies, clubs_of_interest, learning_styles, preferred_communication,
    medical_conditions, allergies, fitness_routine, biggest_challenge, mentor_help_needed, dgca_status, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153126'),
    'Male', '2007-09-04', 'B+', '9443170657', '8122541657', '6381776798 - brother',
    'Maria nesan M', 'Driver', 'Vimala M', 'House wife', 'Below Rs. 2,00,000', '82.2 %', '83.17%',
    'I chose aviation because of my passion for flying and my interest in modern aircraft technology.', 'I was inspired by watching airplanes from a young age and wanting to know how they work.', ARRAY['Emirates', 'Indigo', 'AAI']::text[], 'In my first year after graduation, I want to secure an entry-level position in my field where I can apply my academic knowledge, learn from experienced professionals, and build a strong professional foundation.', 'In five years, I see myself stepping into a leadership role where I can manage projects and mentor others. I want to deeply master my current skill set while taking on more strategic responsibilities within the company.', ARRAY['Tamil', 'english']::text[],
    '', ARRAY['Football', 'Kabaddi']::text[], ARRAY['Reading books', 'Listening to music', 'playing football']::text[], ARRAY['ATC Club', 'Social Media Club', 'Research Club']::text[], ARRAY['Practical', 'Classroom', 'Simulator']::text[], ARRAY['Phone', 'Face-to-Face']::text[],
    '', '', '', 'Understanding complex aviation regulations and finding entry-level industry opportunities.', 'By sharing real-world industry insights and guiding me on career networking.', '', 'STUDENT_REPORTED'
)
ON CONFLICT (student_id) DO UPDATE SET
    gender = EXCLUDED.gender, dob = EXCLUDED.dob, blood_group = EXCLUDED.blood_group,
    parent_phone = EXCLUDED.parent_phone, emergency_contact_number = EXCLUDED.emergency_contact_number,
    emergency_contact_relation = EXCLUDED.emergency_contact_relation, father_name = EXCLUDED.father_name,
    father_occupation = EXCLUDED.father_occupation, mother_name = EXCLUDED.mother_name, mother_occupation = EXCLUDED.mother_occupation,
    family_income_band = EXCLUDED.family_income_band, sslc_score = EXCLUDED.sslc_score, hsc_score = EXCLUDED.hsc_score,
    why_aviation = EXCLUDED.why_aviation, inspired_by = EXCLUDED.inspired_by, dream_organizations = EXCLUDED.dream_organizations,
    after_graduation_plan = EXCLUDED.after_graduation_plan, five_year_vision = EXCLUDED.five_year_vision, languages = EXCLUDED.languages,
    technical_expertise = EXCLUDED.technical_expertise, sports = EXCLUDED.sports, hobbies = EXCLUDED.hobbies,
    clubs_of_interest = EXCLUDED.clubs_of_interest, learning_styles = EXCLUDED.learning_styles,
    preferred_communication = EXCLUDED.preferred_communication, medical_conditions = EXCLUDED.medical_conditions,
    allergies = EXCLUDED.allergies, fitness_routine = EXCLUDED.fitness_routine, biggest_challenge = EXCLUDED.biggest_challenge,
    mentor_help_needed = EXCLUDED.mentor_help_needed, dgca_status = EXCLUDED.dgca_status;
INSERT INTO public.student_profiles (
    student_id, gender, dob, blood_group, parent_phone, emergency_contact_number, emergency_contact_relation,
    father_name, father_occupation, mother_name, mother_occupation, family_income_band, sslc_score, hsc_score,
    why_aviation, inspired_by, dream_organizations, after_graduation_plan, five_year_vision, languages,
    technical_expertise, sports, hobbies, clubs_of_interest, learning_styles, preferred_communication,
    medical_conditions, allergies, fitness_routine, biggest_challenge, mentor_help_needed, dgca_status, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153127'),
    'Male', '2007-07-21', 'B+', '9790093016', '9790093016', 'Suresh Kannan-Father',
    'Suresh kannan', 'Business', 'Uma devi', 'House wife', 'Prefer not to say', '82%', '72.50%',
    'I liked it', 'Family member', ARRAY['Indigo']::text[], 'Pilot training', 'Pilot', ARRAY['Tamil', 'English', 'telugu']::text[],
    'Python', ARRAY['Kabbadi']::text[], ARRAY['Cooking']::text[], ARRAY['Pilot Club']::text[], ARRAY['Practical', 'Classroom', 'Simulator']::text[], ARRAY['WhatsApp', 'Phone', 'Face-to-Face']::text[],
    '', '', '', 'Communication', 'Good', '', 'STUDENT_REPORTED'
)
ON CONFLICT (student_id) DO UPDATE SET
    gender = EXCLUDED.gender, dob = EXCLUDED.dob, blood_group = EXCLUDED.blood_group,
    parent_phone = EXCLUDED.parent_phone, emergency_contact_number = EXCLUDED.emergency_contact_number,
    emergency_contact_relation = EXCLUDED.emergency_contact_relation, father_name = EXCLUDED.father_name,
    father_occupation = EXCLUDED.father_occupation, mother_name = EXCLUDED.mother_name, mother_occupation = EXCLUDED.mother_occupation,
    family_income_band = EXCLUDED.family_income_band, sslc_score = EXCLUDED.sslc_score, hsc_score = EXCLUDED.hsc_score,
    why_aviation = EXCLUDED.why_aviation, inspired_by = EXCLUDED.inspired_by, dream_organizations = EXCLUDED.dream_organizations,
    after_graduation_plan = EXCLUDED.after_graduation_plan, five_year_vision = EXCLUDED.five_year_vision, languages = EXCLUDED.languages,
    technical_expertise = EXCLUDED.technical_expertise, sports = EXCLUDED.sports, hobbies = EXCLUDED.hobbies,
    clubs_of_interest = EXCLUDED.clubs_of_interest, learning_styles = EXCLUDED.learning_styles,
    preferred_communication = EXCLUDED.preferred_communication, medical_conditions = EXCLUDED.medical_conditions,
    allergies = EXCLUDED.allergies, fitness_routine = EXCLUDED.fitness_routine, biggest_challenge = EXCLUDED.biggest_challenge,
    mentor_help_needed = EXCLUDED.mentor_help_needed, dgca_status = EXCLUDED.dgca_status;
INSERT INTO public.student_profiles (
    student_id, gender, dob, blood_group, parent_phone, emergency_contact_number, emergency_contact_relation,
    father_name, father_occupation, mother_name, mother_occupation, family_income_band, sslc_score, hsc_score,
    why_aviation, inspired_by, dream_organizations, after_graduation_plan, five_year_vision, languages,
    technical_expertise, sports, hobbies, clubs_of_interest, learning_styles, preferred_communication,
    medical_conditions, allergies, fitness_routine, biggest_challenge, mentor_help_needed, dgca_status, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153128'),
    'Female', '2007-08-01', 'A+', '7845779192', '7845779192', 'Sakthi Rubini - Mother',
    'Manju venkadanathan.V.H', 'Bank manger', 'Sakthi Rubini .S', 'Executive producer', 'Prefer not to say', '88', '78',
    'Passion', 'Family member', ARRAY['Emirates']::text[], 'Commercial pilot', 'In cockpit as a captain', ARRAY['Tamil', 'English', 'Hindi', 'Telugu', 'French']::text[],
    '', ARRAY['Athletics', 'Football', 'Khokho']::text[], ARRAY['Drawing', 'Dancing']::text[], ARRAY['Pilot Club', 'Entrepreneurship Club', 'Social Media Club', 'Research Club']::text[], ARRAY['Practical', 'Simulator', 'Group Learning', 'Project Based']::text[], ARRAY['WhatsApp', 'Email', 'Face-to-Face']::text[],
    '', '', '', 'Flow of information', 'Guidance', '', 'STUDENT_REPORTED'
)
ON CONFLICT (student_id) DO UPDATE SET
    gender = EXCLUDED.gender, dob = EXCLUDED.dob, blood_group = EXCLUDED.blood_group,
    parent_phone = EXCLUDED.parent_phone, emergency_contact_number = EXCLUDED.emergency_contact_number,
    emergency_contact_relation = EXCLUDED.emergency_contact_relation, father_name = EXCLUDED.father_name,
    father_occupation = EXCLUDED.father_occupation, mother_name = EXCLUDED.mother_name, mother_occupation = EXCLUDED.mother_occupation,
    family_income_band = EXCLUDED.family_income_band, sslc_score = EXCLUDED.sslc_score, hsc_score = EXCLUDED.hsc_score,
    why_aviation = EXCLUDED.why_aviation, inspired_by = EXCLUDED.inspired_by, dream_organizations = EXCLUDED.dream_organizations,
    after_graduation_plan = EXCLUDED.after_graduation_plan, five_year_vision = EXCLUDED.five_year_vision, languages = EXCLUDED.languages,
    technical_expertise = EXCLUDED.technical_expertise, sports = EXCLUDED.sports, hobbies = EXCLUDED.hobbies,
    clubs_of_interest = EXCLUDED.clubs_of_interest, learning_styles = EXCLUDED.learning_styles,
    preferred_communication = EXCLUDED.preferred_communication, medical_conditions = EXCLUDED.medical_conditions,
    allergies = EXCLUDED.allergies, fitness_routine = EXCLUDED.fitness_routine, biggest_challenge = EXCLUDED.biggest_challenge,
    mentor_help_needed = EXCLUDED.mentor_help_needed, dgca_status = EXCLUDED.dgca_status;
INSERT INTO public.student_profiles (
    student_id, gender, dob, blood_group, parent_phone, emergency_contact_number, emergency_contact_relation,
    father_name, father_occupation, mother_name, mother_occupation, family_income_band, sslc_score, hsc_score,
    why_aviation, inspired_by, dream_organizations, after_graduation_plan, five_year_vision, languages,
    technical_expertise, sports, hobbies, clubs_of_interest, learning_styles, preferred_communication,
    medical_conditions, allergies, fitness_routine, biggest_challenge, mentor_help_needed, dgca_status, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153129'),
    'Male', '2006-10-12', 'O+', '9495114423', '9495114423', 'Reji M Thankachan - Uncle',
    'OM Reji', 'Mechanical Engineer', 'Suja Reji', '', 'Rs. 10,00,000 - Rs. 20,00,000', '91.80%', '76.60%',
    'Indian Airforce', 'Squadron Leader Ajay Ahuja VC', ARRAY['Indian Airforce']::text[], 'Join Air Force Academy', 'Clear AFCAT CDS/AFCAT - Clear my interviews and medicals - Join the Academy - Give the best - Join Golden Arrows', ARRAY['English', 'Hindi', 'Malayalam', 'German', 'French .']::text[],
    'MS Excel , Editing', ARRAY['Roller Hockey', 'Boxing', 'Taekwondo']::text[], ARRAY['Reading', 'Running .']::text[], ARRAY['Social Media Club']::text[], ARRAY['Practical', 'Classroom', 'Simulator']::text[], ARRAY['WhatsApp', 'Face-to-Face']::text[],
    '', 'Dust mites', '', 'Consistency', 'Keep me academically accountable , Notice changes in you,', '', 'STUDENT_REPORTED'
)
ON CONFLICT (student_id) DO UPDATE SET
    gender = EXCLUDED.gender, dob = EXCLUDED.dob, blood_group = EXCLUDED.blood_group,
    parent_phone = EXCLUDED.parent_phone, emergency_contact_number = EXCLUDED.emergency_contact_number,
    emergency_contact_relation = EXCLUDED.emergency_contact_relation, father_name = EXCLUDED.father_name,
    father_occupation = EXCLUDED.father_occupation, mother_name = EXCLUDED.mother_name, mother_occupation = EXCLUDED.mother_occupation,
    family_income_band = EXCLUDED.family_income_band, sslc_score = EXCLUDED.sslc_score, hsc_score = EXCLUDED.hsc_score,
    why_aviation = EXCLUDED.why_aviation, inspired_by = EXCLUDED.inspired_by, dream_organizations = EXCLUDED.dream_organizations,
    after_graduation_plan = EXCLUDED.after_graduation_plan, five_year_vision = EXCLUDED.five_year_vision, languages = EXCLUDED.languages,
    technical_expertise = EXCLUDED.technical_expertise, sports = EXCLUDED.sports, hobbies = EXCLUDED.hobbies,
    clubs_of_interest = EXCLUDED.clubs_of_interest, learning_styles = EXCLUDED.learning_styles,
    preferred_communication = EXCLUDED.preferred_communication, medical_conditions = EXCLUDED.medical_conditions,
    allergies = EXCLUDED.allergies, fitness_routine = EXCLUDED.fitness_routine, biggest_challenge = EXCLUDED.biggest_challenge,
    mentor_help_needed = EXCLUDED.mentor_help_needed, dgca_status = EXCLUDED.dgca_status;
INSERT INTO public.student_profiles (
    student_id, gender, dob, blood_group, parent_phone, emergency_contact_number, emergency_contact_relation,
    father_name, father_occupation, mother_name, mother_occupation, family_income_band, sslc_score, hsc_score,
    why_aviation, inspired_by, dream_organizations, after_graduation_plan, five_year_vision, languages,
    technical_expertise, sports, hobbies, clubs_of_interest, learning_styles, preferred_communication,
    medical_conditions, allergies, fitness_routine, biggest_challenge, mentor_help_needed, dgca_status, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153130'),
    'Male', '2007-02-25', 'O+', '9884176971', '9986413328', 'K Sri Nagalakshmi - Mother',
    'Claude C', 'IT Director', 'K Sri Nagalakshmi', 'IT Director', 'Prefer not to say', '81.2%', '75%',
    'Because of my passion in the subject, my dream of becoming a pilot some day drove me to choose this course. Coupled with my father''s insight on the subject from his days as a MET department employee at VOMM and VOBG in the 1990''s', 'Air Crash Investigation Documentaries.', ARRAY['Emirates', 'ICAO', 'Singapore Airlines']::text[], 'Try and get a Masters degree at an esteemed University outside of India, maybe
 to Embry-Riddle or Purdue', 'Finishing up my Masters and stepping into the training space so that I may become a commercial pilot.', ARRAY['English', 'Tamil', 'Hindi', 'Kannada / Limited French', 'Telugu']::text[],
    '', '{}'::text[], ARRAY['History', 'Politics', 'Music', 'Singing']::text[], ARRAY['Pilot Club', 'Airline Operations Club']::text[], ARRAY['Practical', 'Classroom', 'Simulator', 'Group Learning']::text[], ARRAY['WhatsApp', 'Face-to-Face']::text[],
    'Slight power in left eye (-1.75), lactose intolerance', 'Freshwater Fish', 'Overweight???', 'My scores, I''d need a GPA of 8 or higher for a chance at Embry or Purdue', 'I think I''d like assistance exam-wise, i want to aim as high as possible score-wise', '', 'STUDENT_REPORTED'
)
ON CONFLICT (student_id) DO UPDATE SET
    gender = EXCLUDED.gender, dob = EXCLUDED.dob, blood_group = EXCLUDED.blood_group,
    parent_phone = EXCLUDED.parent_phone, emergency_contact_number = EXCLUDED.emergency_contact_number,
    emergency_contact_relation = EXCLUDED.emergency_contact_relation, father_name = EXCLUDED.father_name,
    father_occupation = EXCLUDED.father_occupation, mother_name = EXCLUDED.mother_name, mother_occupation = EXCLUDED.mother_occupation,
    family_income_band = EXCLUDED.family_income_band, sslc_score = EXCLUDED.sslc_score, hsc_score = EXCLUDED.hsc_score,
    why_aviation = EXCLUDED.why_aviation, inspired_by = EXCLUDED.inspired_by, dream_organizations = EXCLUDED.dream_organizations,
    after_graduation_plan = EXCLUDED.after_graduation_plan, five_year_vision = EXCLUDED.five_year_vision, languages = EXCLUDED.languages,
    technical_expertise = EXCLUDED.technical_expertise, sports = EXCLUDED.sports, hobbies = EXCLUDED.hobbies,
    clubs_of_interest = EXCLUDED.clubs_of_interest, learning_styles = EXCLUDED.learning_styles,
    preferred_communication = EXCLUDED.preferred_communication, medical_conditions = EXCLUDED.medical_conditions,
    allergies = EXCLUDED.allergies, fitness_routine = EXCLUDED.fitness_routine, biggest_challenge = EXCLUDED.biggest_challenge,
    mentor_help_needed = EXCLUDED.mentor_help_needed, dgca_status = EXCLUDED.dgca_status;
INSERT INTO public.student_profiles (
    student_id, gender, dob, blood_group, parent_phone, emergency_contact_number, emergency_contact_relation,
    father_name, father_occupation, mother_name, mother_occupation, family_income_band, sslc_score, hsc_score,
    why_aviation, inspired_by, dream_organizations, after_graduation_plan, five_year_vision, languages,
    technical_expertise, sports, hobbies, clubs_of_interest, learning_styles, preferred_communication,
    medical_conditions, allergies, fitness_routine, biggest_challenge, mentor_help_needed, dgca_status, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153131'),
    'Male', '2007-09-08', 'B+', '9789763664', '9789763664', 'Rekha - Mother',
    'Soundhar rajan', 'driver', 'Rekha', 'Revenue supervisor', 'Rs. 5,00,000 - Rs. 10,00,000', '85.8', '80.6',
    'Passion', 'A film', ARRAY['AAI']::text[], 'To prepare for ATC exam', 'To become an ATC', ARRAY['Tamil', 'Malayalam', 'English']::text[],
    'MS EXCEL', '{}'::text[], ARRAY['Travelling']::text[], ARRAY['ATC Club']::text[], ARRAY['Practical', 'Classroom', 'Simulator', 'Project Based']::text[], ARRAY['WhatsApp', 'Email']::text[],
    '', 'yes', '', 'Understanding topics from depth', 'Nothing', '', 'STUDENT_REPORTED'
)
ON CONFLICT (student_id) DO UPDATE SET
    gender = EXCLUDED.gender, dob = EXCLUDED.dob, blood_group = EXCLUDED.blood_group,
    parent_phone = EXCLUDED.parent_phone, emergency_contact_number = EXCLUDED.emergency_contact_number,
    emergency_contact_relation = EXCLUDED.emergency_contact_relation, father_name = EXCLUDED.father_name,
    father_occupation = EXCLUDED.father_occupation, mother_name = EXCLUDED.mother_name, mother_occupation = EXCLUDED.mother_occupation,
    family_income_band = EXCLUDED.family_income_band, sslc_score = EXCLUDED.sslc_score, hsc_score = EXCLUDED.hsc_score,
    why_aviation = EXCLUDED.why_aviation, inspired_by = EXCLUDED.inspired_by, dream_organizations = EXCLUDED.dream_organizations,
    after_graduation_plan = EXCLUDED.after_graduation_plan, five_year_vision = EXCLUDED.five_year_vision, languages = EXCLUDED.languages,
    technical_expertise = EXCLUDED.technical_expertise, sports = EXCLUDED.sports, hobbies = EXCLUDED.hobbies,
    clubs_of_interest = EXCLUDED.clubs_of_interest, learning_styles = EXCLUDED.learning_styles,
    preferred_communication = EXCLUDED.preferred_communication, medical_conditions = EXCLUDED.medical_conditions,
    allergies = EXCLUDED.allergies, fitness_routine = EXCLUDED.fitness_routine, biggest_challenge = EXCLUDED.biggest_challenge,
    mentor_help_needed = EXCLUDED.mentor_help_needed, dgca_status = EXCLUDED.dgca_status;
INSERT INTO public.student_profiles (
    student_id, gender, dob, blood_group, parent_phone, emergency_contact_number, emergency_contact_relation,
    father_name, father_occupation, mother_name, mother_occupation, family_income_band, sslc_score, hsc_score,
    why_aviation, inspired_by, dream_organizations, after_graduation_plan, five_year_vision, languages,
    technical_expertise, sports, hobbies, clubs_of_interest, learning_styles, preferred_communication,
    medical_conditions, allergies, fitness_routine, biggest_challenge, mentor_help_needed, dgca_status, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153132'),
    'Male', '2007-11-15', 'O+', '8778124816', '7338785729', 'Arumugam father',
    'Arumugam R', 'Buisiness', 'Nithya A', 'House wife', 'Rs. 2,00,000 - Rs. 5,00,000', '83%', '78%',
    'Interest in aviation', 'Apj Abdul kalam', ARRAY['Emirates']::text[], 'Atc or pilot', 'Pilot', ARRAY['Tamil english']::text[],
    '', ARRAY['Cricket']::text[], ARRAY['Cricket']::text[], ARRAY['Pilot Club', 'Aero Maintenance Club', 'Airline Operations Club', 'Social Media Club']::text[], ARRAY['Practical', 'Classroom', 'Simulator', 'Group Learning', 'Online', 'Pro']::text[], ARRAY['WhatsApp', 'Phone', 'Face-to-Face']::text[],
    'Good', 'No', '', 'Communication', 'In communication', '', 'STUDENT_REPORTED'
)
ON CONFLICT (student_id) DO UPDATE SET
    gender = EXCLUDED.gender, dob = EXCLUDED.dob, blood_group = EXCLUDED.blood_group,
    parent_phone = EXCLUDED.parent_phone, emergency_contact_number = EXCLUDED.emergency_contact_number,
    emergency_contact_relation = EXCLUDED.emergency_contact_relation, father_name = EXCLUDED.father_name,
    father_occupation = EXCLUDED.father_occupation, mother_name = EXCLUDED.mother_name, mother_occupation = EXCLUDED.mother_occupation,
    family_income_band = EXCLUDED.family_income_band, sslc_score = EXCLUDED.sslc_score, hsc_score = EXCLUDED.hsc_score,
    why_aviation = EXCLUDED.why_aviation, inspired_by = EXCLUDED.inspired_by, dream_organizations = EXCLUDED.dream_organizations,
    after_graduation_plan = EXCLUDED.after_graduation_plan, five_year_vision = EXCLUDED.five_year_vision, languages = EXCLUDED.languages,
    technical_expertise = EXCLUDED.technical_expertise, sports = EXCLUDED.sports, hobbies = EXCLUDED.hobbies,
    clubs_of_interest = EXCLUDED.clubs_of_interest, learning_styles = EXCLUDED.learning_styles,
    preferred_communication = EXCLUDED.preferred_communication, medical_conditions = EXCLUDED.medical_conditions,
    allergies = EXCLUDED.allergies, fitness_routine = EXCLUDED.fitness_routine, biggest_challenge = EXCLUDED.biggest_challenge,
    mentor_help_needed = EXCLUDED.mentor_help_needed, dgca_status = EXCLUDED.dgca_status;
INSERT INTO public.student_profiles (
    student_id, gender, dob, blood_group, parent_phone, emergency_contact_number, emergency_contact_relation,
    father_name, father_occupation, mother_name, mother_occupation, family_income_band, sslc_score, hsc_score,
    why_aviation, inspired_by, dream_organizations, after_graduation_plan, five_year_vision, languages,
    technical_expertise, sports, hobbies, clubs_of_interest, learning_styles, preferred_communication,
    medical_conditions, allergies, fitness_routine, biggest_challenge, mentor_help_needed, dgca_status, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153133'),
    'Male', '2006-10-25', 'O+', '9676904233', '9676904233', 'Sudhakaran - Father',
    'R.Sudhakaran', 'Loco pilot', 'S.Ester Rani', 'Docter', 'Below Rs. 2,00,000', '361', '550',
    'It’s my hobby', 'A family member', ARRAY['Indigo']::text[], 'Good job', 'In Phillippines', ARRAY['Tamil', 'English', 'Telugu', 'Kannada', 'Hindi', 'Urdu']::text[],
    '', ARRAY['Football', 'cricket', 'volleyball', 'snooker.']::text[], ARRAY['Dancing', 'spending time with friends']::text[], ARRAY['ATC Club']::text[], ARRAY['Practical', 'Classroom', 'Simulator']::text[], ARRAY['WhatsApp', 'Email', 'Phone', 'Face-to-Face']::text[],
    '', '', '', 'Positive mind set', 'Thinking positive', '', 'STUDENT_REPORTED'
)
ON CONFLICT (student_id) DO UPDATE SET
    gender = EXCLUDED.gender, dob = EXCLUDED.dob, blood_group = EXCLUDED.blood_group,
    parent_phone = EXCLUDED.parent_phone, emergency_contact_number = EXCLUDED.emergency_contact_number,
    emergency_contact_relation = EXCLUDED.emergency_contact_relation, father_name = EXCLUDED.father_name,
    father_occupation = EXCLUDED.father_occupation, mother_name = EXCLUDED.mother_name, mother_occupation = EXCLUDED.mother_occupation,
    family_income_band = EXCLUDED.family_income_band, sslc_score = EXCLUDED.sslc_score, hsc_score = EXCLUDED.hsc_score,
    why_aviation = EXCLUDED.why_aviation, inspired_by = EXCLUDED.inspired_by, dream_organizations = EXCLUDED.dream_organizations,
    after_graduation_plan = EXCLUDED.after_graduation_plan, five_year_vision = EXCLUDED.five_year_vision, languages = EXCLUDED.languages,
    technical_expertise = EXCLUDED.technical_expertise, sports = EXCLUDED.sports, hobbies = EXCLUDED.hobbies,
    clubs_of_interest = EXCLUDED.clubs_of_interest, learning_styles = EXCLUDED.learning_styles,
    preferred_communication = EXCLUDED.preferred_communication, medical_conditions = EXCLUDED.medical_conditions,
    allergies = EXCLUDED.allergies, fitness_routine = EXCLUDED.fitness_routine, biggest_challenge = EXCLUDED.biggest_challenge,
    mentor_help_needed = EXCLUDED.mentor_help_needed, dgca_status = EXCLUDED.dgca_status;
INSERT INTO public.student_profiles (
    student_id, gender, dob, blood_group, parent_phone, emergency_contact_number, emergency_contact_relation,
    father_name, father_occupation, mother_name, mother_occupation, family_income_band, sslc_score, hsc_score,
    why_aviation, inspired_by, dream_organizations, after_graduation_plan, five_year_vision, languages,
    technical_expertise, sports, hobbies, clubs_of_interest, learning_styles, preferred_communication,
    medical_conditions, allergies, fitness_routine, biggest_challenge, mentor_help_needed, dgca_status, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153134'),
    'Female', '2007-09-14', 'B+', '8848449418', '9895365130', 'Salini c s - Mother',
    'Manoj Kumar B', 'Driver', 'Salini c s', 'Private firm', 'Rs. 2,00,000 - Rs. 5,00,000', '89%', '81%',
    'I choose aviation because that is my dream from my childhood and I am so passionate and eager to learn things in aviation', 'A film', ARRAY['Emirates']::text[], 'Work towards my dream job', 'Get a secured job in aviation (Flight dispatcher)', ARRAY['Malayalam', 'english']::text[],
    '', '{}'::text[], ARRAY['Dancing', 'sleeping']::text[], ARRAY['Pilot Club', 'ATC Club']::text[], ARRAY['Practical', 'Classroom', 'Group Learning']::text[], ARRAY['WhatsApp', 'Phone', 'Face-to-Face']::text[],
    'Migraine', '', '', 'Money', 'Guide me to be punctual and how to mange time to avoid procrastination', '', 'STUDENT_REPORTED'
)
ON CONFLICT (student_id) DO UPDATE SET
    gender = EXCLUDED.gender, dob = EXCLUDED.dob, blood_group = EXCLUDED.blood_group,
    parent_phone = EXCLUDED.parent_phone, emergency_contact_number = EXCLUDED.emergency_contact_number,
    emergency_contact_relation = EXCLUDED.emergency_contact_relation, father_name = EXCLUDED.father_name,
    father_occupation = EXCLUDED.father_occupation, mother_name = EXCLUDED.mother_name, mother_occupation = EXCLUDED.mother_occupation,
    family_income_band = EXCLUDED.family_income_band, sslc_score = EXCLUDED.sslc_score, hsc_score = EXCLUDED.hsc_score,
    why_aviation = EXCLUDED.why_aviation, inspired_by = EXCLUDED.inspired_by, dream_organizations = EXCLUDED.dream_organizations,
    after_graduation_plan = EXCLUDED.after_graduation_plan, five_year_vision = EXCLUDED.five_year_vision, languages = EXCLUDED.languages,
    technical_expertise = EXCLUDED.technical_expertise, sports = EXCLUDED.sports, hobbies = EXCLUDED.hobbies,
    clubs_of_interest = EXCLUDED.clubs_of_interest, learning_styles = EXCLUDED.learning_styles,
    preferred_communication = EXCLUDED.preferred_communication, medical_conditions = EXCLUDED.medical_conditions,
    allergies = EXCLUDED.allergies, fitness_routine = EXCLUDED.fitness_routine, biggest_challenge = EXCLUDED.biggest_challenge,
    mentor_help_needed = EXCLUDED.mentor_help_needed, dgca_status = EXCLUDED.dgca_status;
INSERT INTO public.student_profiles (
    student_id, gender, dob, blood_group, parent_phone, emergency_contact_number, emergency_contact_relation,
    father_name, father_occupation, mother_name, mother_occupation, family_income_band, sslc_score, hsc_score,
    why_aviation, inspired_by, dream_organizations, after_graduation_plan, five_year_vision, languages,
    technical_expertise, sports, hobbies, clubs_of_interest, learning_styles, preferred_communication,
    medical_conditions, allergies, fitness_routine, biggest_challenge, mentor_help_needed, dgca_status, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153135'),
    'Male', '2006-01-19', 'O-', '7845540490', '7845540490', 'Father',
    'Mohamed Noohu S A', 'Business', 'Fairoz Begum H', 'House wife', 'Prefer not to say', '75.2', '88.17',
    'Childhood dream', 'Love to fly', ARRAY['Emirates']::text[], 'Pursuing CPL', 'Emirates pilot', ARRAY['Tamil', 'English', 'Arabic']::text[],
    '', ARRAY['Football']::text[], ARRAY['Bike riding']::text[], ARRAY['Pilot Club', 'Airline Operations Club']::text[], ARRAY['Practical', 'Group Learning']::text[], ARRAY['WhatsApp', 'Face-to-Face']::text[],
    '', '', '', 'English', 'Basic guidence in communication', '', 'STUDENT_REPORTED'
)
ON CONFLICT (student_id) DO UPDATE SET
    gender = EXCLUDED.gender, dob = EXCLUDED.dob, blood_group = EXCLUDED.blood_group,
    parent_phone = EXCLUDED.parent_phone, emergency_contact_number = EXCLUDED.emergency_contact_number,
    emergency_contact_relation = EXCLUDED.emergency_contact_relation, father_name = EXCLUDED.father_name,
    father_occupation = EXCLUDED.father_occupation, mother_name = EXCLUDED.mother_name, mother_occupation = EXCLUDED.mother_occupation,
    family_income_band = EXCLUDED.family_income_band, sslc_score = EXCLUDED.sslc_score, hsc_score = EXCLUDED.hsc_score,
    why_aviation = EXCLUDED.why_aviation, inspired_by = EXCLUDED.inspired_by, dream_organizations = EXCLUDED.dream_organizations,
    after_graduation_plan = EXCLUDED.after_graduation_plan, five_year_vision = EXCLUDED.five_year_vision, languages = EXCLUDED.languages,
    technical_expertise = EXCLUDED.technical_expertise, sports = EXCLUDED.sports, hobbies = EXCLUDED.hobbies,
    clubs_of_interest = EXCLUDED.clubs_of_interest, learning_styles = EXCLUDED.learning_styles,
    preferred_communication = EXCLUDED.preferred_communication, medical_conditions = EXCLUDED.medical_conditions,
    allergies = EXCLUDED.allergies, fitness_routine = EXCLUDED.fitness_routine, biggest_challenge = EXCLUDED.biggest_challenge,
    mentor_help_needed = EXCLUDED.mentor_help_needed, dgca_status = EXCLUDED.dgca_status;
INSERT INTO public.student_profiles (
    student_id, gender, dob, blood_group, parent_phone, emergency_contact_number, emergency_contact_relation,
    father_name, father_occupation, mother_name, mother_occupation, family_income_band, sslc_score, hsc_score,
    why_aviation, inspired_by, dream_organizations, after_graduation_plan, five_year_vision, languages,
    technical_expertise, sports, hobbies, clubs_of_interest, learning_styles, preferred_communication,
    medical_conditions, allergies, fitness_routine, biggest_challenge, mentor_help_needed, dgca_status, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153136'),
    'Male', '2006-12-20', 'A+', '', '9710465950', 'Mother',
    'Sivakumar k', 'Daily labour worker', 'Sulochana', 'Maid', 'Below Rs. 2,00,000', '76%', '75%',
    'I don''t wanna work like others like choosing  engineering , I have got my cutoff 160, and I wanna explore the world of aviation and in entire blood line I am the one entering this Aviation field , I love to fly - soo I became drone pilot  and my love towards aviation helped to join', 'Vladimir putin, Russian president, MK.Stalin', ARRAY['INDIAN AIR FORCE']::text[], 'AFCAT , currently work as a Drone pilot  in RPTO', 'INDIAN AIR FORCE', ARRAY['Tamil', 'English', 'French']::text[],
    'Fusion 360, linux operating system', ARRAY['Shot put', 'karate']::text[], ARRAY['Playing chess', 'exploring new things and places']::text[], ARRAY['Entrepreneurship Club', 'Social Media Club']::text[], ARRAY['Practical', 'Group Learning']::text[], ARRAY['Face-to-Face']::text[],
    '', '', '', 'Money ! 💯', 'To be supportive', 'Drone paper cleared', 'STUDENT_REPORTED'
)
ON CONFLICT (student_id) DO UPDATE SET
    gender = EXCLUDED.gender, dob = EXCLUDED.dob, blood_group = EXCLUDED.blood_group,
    parent_phone = EXCLUDED.parent_phone, emergency_contact_number = EXCLUDED.emergency_contact_number,
    emergency_contact_relation = EXCLUDED.emergency_contact_relation, father_name = EXCLUDED.father_name,
    father_occupation = EXCLUDED.father_occupation, mother_name = EXCLUDED.mother_name, mother_occupation = EXCLUDED.mother_occupation,
    family_income_band = EXCLUDED.family_income_band, sslc_score = EXCLUDED.sslc_score, hsc_score = EXCLUDED.hsc_score,
    why_aviation = EXCLUDED.why_aviation, inspired_by = EXCLUDED.inspired_by, dream_organizations = EXCLUDED.dream_organizations,
    after_graduation_plan = EXCLUDED.after_graduation_plan, five_year_vision = EXCLUDED.five_year_vision, languages = EXCLUDED.languages,
    technical_expertise = EXCLUDED.technical_expertise, sports = EXCLUDED.sports, hobbies = EXCLUDED.hobbies,
    clubs_of_interest = EXCLUDED.clubs_of_interest, learning_styles = EXCLUDED.learning_styles,
    preferred_communication = EXCLUDED.preferred_communication, medical_conditions = EXCLUDED.medical_conditions,
    allergies = EXCLUDED.allergies, fitness_routine = EXCLUDED.fitness_routine, biggest_challenge = EXCLUDED.biggest_challenge,
    mentor_help_needed = EXCLUDED.mentor_help_needed, dgca_status = EXCLUDED.dgca_status;
INSERT INTO public.student_profiles (
    student_id, gender, dob, blood_group, parent_phone, emergency_contact_number, emergency_contact_relation,
    father_name, father_occupation, mother_name, mother_occupation, family_income_band, sslc_score, hsc_score,
    why_aviation, inspired_by, dream_organizations, after_graduation_plan, five_year_vision, languages,
    technical_expertise, sports, hobbies, clubs_of_interest, learning_styles, preferred_communication,
    medical_conditions, allergies, fitness_routine, biggest_challenge, mentor_help_needed, dgca_status, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153137'),
    'Male', '2007-02-25', 'B+', '9448009403', '7411867176', '9972548994',
    'Shankar P', 'Borewell contractor', 'Kala Vathi S', '', 'Rs. 5,00,000 - Rs. 10,00,000', '77.4', '74.1',
    'Interest in aircraft', 'Movies', ARRAY['Emirates']::text[], 'Joining airforce', 'Fighter pilot', ARRAY['English', 'tamil', 'telugu', 'kannada']::text[],
    '', '{}'::text[], '{}'::text[], ARRAY['Pilot Club']::text[], ARRAY['Practical']::text[], ARRAY['WhatsApp', 'Email', 'Phone', 'Face-to-Face']::text[],
    '', '', '', 'Perfection', 'Basic mentoring procedure', '', 'STUDENT_REPORTED'
)
ON CONFLICT (student_id) DO UPDATE SET
    gender = EXCLUDED.gender, dob = EXCLUDED.dob, blood_group = EXCLUDED.blood_group,
    parent_phone = EXCLUDED.parent_phone, emergency_contact_number = EXCLUDED.emergency_contact_number,
    emergency_contact_relation = EXCLUDED.emergency_contact_relation, father_name = EXCLUDED.father_name,
    father_occupation = EXCLUDED.father_occupation, mother_name = EXCLUDED.mother_name, mother_occupation = EXCLUDED.mother_occupation,
    family_income_band = EXCLUDED.family_income_band, sslc_score = EXCLUDED.sslc_score, hsc_score = EXCLUDED.hsc_score,
    why_aviation = EXCLUDED.why_aviation, inspired_by = EXCLUDED.inspired_by, dream_organizations = EXCLUDED.dream_organizations,
    after_graduation_plan = EXCLUDED.after_graduation_plan, five_year_vision = EXCLUDED.five_year_vision, languages = EXCLUDED.languages,
    technical_expertise = EXCLUDED.technical_expertise, sports = EXCLUDED.sports, hobbies = EXCLUDED.hobbies,
    clubs_of_interest = EXCLUDED.clubs_of_interest, learning_styles = EXCLUDED.learning_styles,
    preferred_communication = EXCLUDED.preferred_communication, medical_conditions = EXCLUDED.medical_conditions,
    allergies = EXCLUDED.allergies, fitness_routine = EXCLUDED.fitness_routine, biggest_challenge = EXCLUDED.biggest_challenge,
    mentor_help_needed = EXCLUDED.mentor_help_needed, dgca_status = EXCLUDED.dgca_status;
INSERT INTO public.student_profiles (
    student_id, gender, dob, blood_group, parent_phone, emergency_contact_number, emergency_contact_relation,
    father_name, father_occupation, mother_name, mother_occupation, family_income_band, sslc_score, hsc_score,
    why_aviation, inspired_by, dream_organizations, after_graduation_plan, five_year_vision, languages,
    technical_expertise, sports, hobbies, clubs_of_interest, learning_styles, preferred_communication,
    medical_conditions, allergies, fitness_routine, biggest_challenge, mentor_help_needed, dgca_status, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153138'),
    'Female', '2008-08-12', 'O+', '8639544767', '8639544767', 'Sister',
    'VUPPU GURUNATH', 'Private bus conductor', 'V Uma maheswari', 'Lady gurd', 'Below Rs. 2,00,000', '86.90%', '94',
    'It''s a challenge', 'APJ abdul kalam', ARRAY['Emirates', 'DGCA']::text[], 'Commercial pilot or IAF officer', 'Cpl or IAF', ARRAY['Tamil', 'telugu', 'english']::text[],
    '', ARRAY['Karate', 'yoga']::text[], ARRAY['Karate']::text[], ARRAY['Pilot Club', 'ATC Club']::text[], ARRAY['Practical']::text[], ARRAY['WhatsApp']::text[],
    '', '', '', 'Family problems', '', '', 'STUDENT_REPORTED'
)
ON CONFLICT (student_id) DO UPDATE SET
    gender = EXCLUDED.gender, dob = EXCLUDED.dob, blood_group = EXCLUDED.blood_group,
    parent_phone = EXCLUDED.parent_phone, emergency_contact_number = EXCLUDED.emergency_contact_number,
    emergency_contact_relation = EXCLUDED.emergency_contact_relation, father_name = EXCLUDED.father_name,
    father_occupation = EXCLUDED.father_occupation, mother_name = EXCLUDED.mother_name, mother_occupation = EXCLUDED.mother_occupation,
    family_income_band = EXCLUDED.family_income_band, sslc_score = EXCLUDED.sslc_score, hsc_score = EXCLUDED.hsc_score,
    why_aviation = EXCLUDED.why_aviation, inspired_by = EXCLUDED.inspired_by, dream_organizations = EXCLUDED.dream_organizations,
    after_graduation_plan = EXCLUDED.after_graduation_plan, five_year_vision = EXCLUDED.five_year_vision, languages = EXCLUDED.languages,
    technical_expertise = EXCLUDED.technical_expertise, sports = EXCLUDED.sports, hobbies = EXCLUDED.hobbies,
    clubs_of_interest = EXCLUDED.clubs_of_interest, learning_styles = EXCLUDED.learning_styles,
    preferred_communication = EXCLUDED.preferred_communication, medical_conditions = EXCLUDED.medical_conditions,
    allergies = EXCLUDED.allergies, fitness_routine = EXCLUDED.fitness_routine, biggest_challenge = EXCLUDED.biggest_challenge,
    mentor_help_needed = EXCLUDED.mentor_help_needed, dgca_status = EXCLUDED.dgca_status;
INSERT INTO public.student_profiles (
    student_id, gender, dob, blood_group, parent_phone, emergency_contact_number, emergency_contact_relation,
    father_name, father_occupation, mother_name, mother_occupation, family_income_band, sslc_score, hsc_score,
    why_aviation, inspired_by, dream_organizations, after_graduation_plan, five_year_vision, languages,
    technical_expertise, sports, hobbies, clubs_of_interest, learning_styles, preferred_communication,
    medical_conditions, allergies, fitness_routine, biggest_challenge, mentor_help_needed, dgca_status, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153139'),
    'Male', '2008-06-18', 'B+', '9080614843', '8012019993', 'mother',
    'S Ravichandran', 'plant operator', 'R shanthi', 'tailor', 'Below Rs. 2,00,000', '92', '80.02%',
    'i want to choose a different career so is took aviation', '', ARRAY['Emirates']::text[], 'govt exams', '', ARRAY['tamil', 'english', 'hindi']::text[],
    '', '{}'::text[], '{}'::text[], ARRAY['Airline Operations Club', 'Entrepreneurship Club']::text[], ARRAY['Practical', 'Classroom', 'Group Learning']::text[], ARRAY['WhatsApp', 'Phone', 'Face-to-Face']::text[],
    '', '', '', 'money', 'n/a', 'no', 'STUDENT_REPORTED'
)
ON CONFLICT (student_id) DO UPDATE SET
    gender = EXCLUDED.gender, dob = EXCLUDED.dob, blood_group = EXCLUDED.blood_group,
    parent_phone = EXCLUDED.parent_phone, emergency_contact_number = EXCLUDED.emergency_contact_number,
    emergency_contact_relation = EXCLUDED.emergency_contact_relation, father_name = EXCLUDED.father_name,
    father_occupation = EXCLUDED.father_occupation, mother_name = EXCLUDED.mother_name, mother_occupation = EXCLUDED.mother_occupation,
    family_income_band = EXCLUDED.family_income_band, sslc_score = EXCLUDED.sslc_score, hsc_score = EXCLUDED.hsc_score,
    why_aviation = EXCLUDED.why_aviation, inspired_by = EXCLUDED.inspired_by, dream_organizations = EXCLUDED.dream_organizations,
    after_graduation_plan = EXCLUDED.after_graduation_plan, five_year_vision = EXCLUDED.five_year_vision, languages = EXCLUDED.languages,
    technical_expertise = EXCLUDED.technical_expertise, sports = EXCLUDED.sports, hobbies = EXCLUDED.hobbies,
    clubs_of_interest = EXCLUDED.clubs_of_interest, learning_styles = EXCLUDED.learning_styles,
    preferred_communication = EXCLUDED.preferred_communication, medical_conditions = EXCLUDED.medical_conditions,
    allergies = EXCLUDED.allergies, fitness_routine = EXCLUDED.fitness_routine, biggest_challenge = EXCLUDED.biggest_challenge,
    mentor_help_needed = EXCLUDED.mentor_help_needed, dgca_status = EXCLUDED.dgca_status;
INSERT INTO public.student_profiles (
    student_id, gender, dob, blood_group, parent_phone, emergency_contact_number, emergency_contact_relation,
    father_name, father_occupation, mother_name, mother_occupation, family_income_band, sslc_score, hsc_score,
    why_aviation, inspired_by, dream_organizations, after_graduation_plan, five_year_vision, languages,
    technical_expertise, sports, hobbies, clubs_of_interest, learning_styles, preferred_communication,
    medical_conditions, allergies, fitness_routine, biggest_challenge, mentor_help_needed, dgca_status, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153140'),
    'Female', '2006-12-19', 'B+', '8606898494', '8607898494', 'Deena fathima - Sister',
    'MUHAMMED BASHEER', 'Sales', 'SHABINA BASHEER', 'Staff nurse', 'Rs. 2,00,000 - Rs. 5,00,000', '87.4%', '86%',
    'Interested', 'person', ARRAY['Emirates']::text[], 'Aviation related job', 'Airport', ARRAY['English', 'Malayalam', 'Tamil']::text[],
    '', ARRAY['Badminton']::text[], ARRAY['Dance']::text[], ARRAY['Pilot Club', 'Airline Operations Club', 'Social Media Club']::text[], ARRAY['Practical', 'Simulator', 'Online']::text[], ARRAY['Face-to-Face']::text[],
    '', '', '', 'Money', 'Guiding', '', 'STUDENT_REPORTED'
)
ON CONFLICT (student_id) DO UPDATE SET
    gender = EXCLUDED.gender, dob = EXCLUDED.dob, blood_group = EXCLUDED.blood_group,
    parent_phone = EXCLUDED.parent_phone, emergency_contact_number = EXCLUDED.emergency_contact_number,
    emergency_contact_relation = EXCLUDED.emergency_contact_relation, father_name = EXCLUDED.father_name,
    father_occupation = EXCLUDED.father_occupation, mother_name = EXCLUDED.mother_name, mother_occupation = EXCLUDED.mother_occupation,
    family_income_band = EXCLUDED.family_income_band, sslc_score = EXCLUDED.sslc_score, hsc_score = EXCLUDED.hsc_score,
    why_aviation = EXCLUDED.why_aviation, inspired_by = EXCLUDED.inspired_by, dream_organizations = EXCLUDED.dream_organizations,
    after_graduation_plan = EXCLUDED.after_graduation_plan, five_year_vision = EXCLUDED.five_year_vision, languages = EXCLUDED.languages,
    technical_expertise = EXCLUDED.technical_expertise, sports = EXCLUDED.sports, hobbies = EXCLUDED.hobbies,
    clubs_of_interest = EXCLUDED.clubs_of_interest, learning_styles = EXCLUDED.learning_styles,
    preferred_communication = EXCLUDED.preferred_communication, medical_conditions = EXCLUDED.medical_conditions,
    allergies = EXCLUDED.allergies, fitness_routine = EXCLUDED.fitness_routine, biggest_challenge = EXCLUDED.biggest_challenge,
    mentor_help_needed = EXCLUDED.mentor_help_needed, dgca_status = EXCLUDED.dgca_status;
INSERT INTO public.student_profiles (
    student_id, gender, dob, blood_group, parent_phone, emergency_contact_number, emergency_contact_relation,
    father_name, father_occupation, mother_name, mother_occupation, family_income_band, sslc_score, hsc_score,
    why_aviation, inspired_by, dream_organizations, after_graduation_plan, five_year_vision, languages,
    technical_expertise, sports, hobbies, clubs_of_interest, learning_styles, preferred_communication,
    medical_conditions, allergies, fitness_routine, biggest_challenge, mentor_help_needed, dgca_status, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153141'),
    'Male', '2007-07-02', 'O+', '9940286374', '9940286374', 'Shamsudeen - Father',
    'Shamsudeen S.A', 'Priest In Mosque', 'Anish Fathima A', 'Home Maker', 'Rs. 2,00,000 - Rs. 5,00,000', '88%', '88%',
    'I chose aviation because I am interested in the coordination and precision involved in managing aircraft operations. My interest in Air Traffic Control and drone operations has motivated me to learn about navigation, communication, and airspace management. Studying B.Sc. Aeronautical Science is help', 'Dr. A.P.J. Abdul Kalam has been a major inspiration in my aviation journey. His work in aerospace and his dedication to science, discipline, and national development motivated me to choose a technical', ARRAY['Airports Authority of India (AAI)', 'ISRO', 'and DGCA']::text[], 'After graduation, I want to prepare for and apply to Air Traffic Control (ATC) recruitment and gain practical experience in aviation operations. I also want to continue developing my skills in drone operations and aviation communication systems.', 'Within five years, I aim to build a stable career in the aviation industry, preferably in Air Traffic Control or aviation operations, while also developing expertise in DGCA-approved drone operations. I want to become a technically skilled aviation professional who contributes to safe and efficient ', ARRAY['Tamil And English']::text[],
    'Python, C, C++, HTML, object-oriented programming (OOP) concepts', '{}'::text[], ARRAY['Singing', 'flute practice', 'writing Tamil poetry']::text[], ARRAY['ATC Club']::text[], ARRAY['Practical', 'Classroom', 'Online']::text[], ARRAY['WhatsApp', 'Email', 'Face-to-Face']::text[],
    '', '', '', 'My biggest challenge is finding the right guidance, exposure, and opportunities to build a strong career path in aviation, especially in Air Traffic Control and related operational fields.', 'I would like guidance on building a clear roadmap for a career in Air Traffic Control and aviation operations. I would also appreciate support in improving my technical skills, communication skills, i', 'No', 'STUDENT_REPORTED'
)
ON CONFLICT (student_id) DO UPDATE SET
    gender = EXCLUDED.gender, dob = EXCLUDED.dob, blood_group = EXCLUDED.blood_group,
    parent_phone = EXCLUDED.parent_phone, emergency_contact_number = EXCLUDED.emergency_contact_number,
    emergency_contact_relation = EXCLUDED.emergency_contact_relation, father_name = EXCLUDED.father_name,
    father_occupation = EXCLUDED.father_occupation, mother_name = EXCLUDED.mother_name, mother_occupation = EXCLUDED.mother_occupation,
    family_income_band = EXCLUDED.family_income_band, sslc_score = EXCLUDED.sslc_score, hsc_score = EXCLUDED.hsc_score,
    why_aviation = EXCLUDED.why_aviation, inspired_by = EXCLUDED.inspired_by, dream_organizations = EXCLUDED.dream_organizations,
    after_graduation_plan = EXCLUDED.after_graduation_plan, five_year_vision = EXCLUDED.five_year_vision, languages = EXCLUDED.languages,
    technical_expertise = EXCLUDED.technical_expertise, sports = EXCLUDED.sports, hobbies = EXCLUDED.hobbies,
    clubs_of_interest = EXCLUDED.clubs_of_interest, learning_styles = EXCLUDED.learning_styles,
    preferred_communication = EXCLUDED.preferred_communication, medical_conditions = EXCLUDED.medical_conditions,
    allergies = EXCLUDED.allergies, fitness_routine = EXCLUDED.fitness_routine, biggest_challenge = EXCLUDED.biggest_challenge,
    mentor_help_needed = EXCLUDED.mentor_help_needed, dgca_status = EXCLUDED.dgca_status;
INSERT INTO public.student_profiles (
    student_id, gender, dob, blood_group, parent_phone, emergency_contact_number, emergency_contact_relation,
    father_name, father_occupation, mother_name, mother_occupation, family_income_band, sslc_score, hsc_score,
    why_aviation, inspired_by, dream_organizations, after_graduation_plan, five_year_vision, languages,
    technical_expertise, sports, hobbies, clubs_of_interest, learning_styles, preferred_communication,
    medical_conditions, allergies, fitness_routine, biggest_challenge, mentor_help_needed, dgca_status, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153142'),
    'Male', '2008-01-05', 'O+', '9841959003', '9841959003', 'Suresh kumar- Father',
    'Suresh Kumar.M', 'Software Manager', 'Uma.D', 'Teacher', 'Above Rs. 20,00,000', '61.5 percent', '74percent',
    'I want to become a commercial pilot', 'A journey by flight inspired me and made me want to learn about flights and pilot it', ARRAY['Indigo', 'Emirates', 'Qatar airways', 'Singapore airlines', 'British Airways', 'Lufthansa']::text[], 'Airline interviews and get selected into an airline', 'In a cockpit, as an commercial pilot', ARRAY['Tamil', 'english', 'hindi and french']::text[],
    'Ms Excel', ARRAY['Cricket and badminton']::text[], ARRAY['Drawing and painting']::text[], ARRAY['Pilot Club']::text[], ARRAY['Practical', 'Simulator']::text[], ARRAY['WhatsApp', 'Email', 'Phone', 'Face-to-Face']::text[],
    '', '', '', 'I''ve yet to gain experience of flying an aircraft, and time and money is the challenge I''m facing, as im going for flying school. So I need to make use of it correctly and become a CPL holder', 'My mentor can help me by informing what''s happening here at vels when I''m out in the flying school, he can guide me and Inform me about necessary process, so that I can get both my CPL and my degree s', 'Aviation Meteorology, Air Navigation, Air regulations, Techn', 'STUDENT_REPORTED'
)
ON CONFLICT (student_id) DO UPDATE SET
    gender = EXCLUDED.gender, dob = EXCLUDED.dob, blood_group = EXCLUDED.blood_group,
    parent_phone = EXCLUDED.parent_phone, emergency_contact_number = EXCLUDED.emergency_contact_number,
    emergency_contact_relation = EXCLUDED.emergency_contact_relation, father_name = EXCLUDED.father_name,
    father_occupation = EXCLUDED.father_occupation, mother_name = EXCLUDED.mother_name, mother_occupation = EXCLUDED.mother_occupation,
    family_income_band = EXCLUDED.family_income_band, sslc_score = EXCLUDED.sslc_score, hsc_score = EXCLUDED.hsc_score,
    why_aviation = EXCLUDED.why_aviation, inspired_by = EXCLUDED.inspired_by, dream_organizations = EXCLUDED.dream_organizations,
    after_graduation_plan = EXCLUDED.after_graduation_plan, five_year_vision = EXCLUDED.five_year_vision, languages = EXCLUDED.languages,
    technical_expertise = EXCLUDED.technical_expertise, sports = EXCLUDED.sports, hobbies = EXCLUDED.hobbies,
    clubs_of_interest = EXCLUDED.clubs_of_interest, learning_styles = EXCLUDED.learning_styles,
    preferred_communication = EXCLUDED.preferred_communication, medical_conditions = EXCLUDED.medical_conditions,
    allergies = EXCLUDED.allergies, fitness_routine = EXCLUDED.fitness_routine, biggest_challenge = EXCLUDED.biggest_challenge,
    mentor_help_needed = EXCLUDED.mentor_help_needed, dgca_status = EXCLUDED.dgca_status;
INSERT INTO public.student_profiles (
    student_id, gender, dob, blood_group, parent_phone, emergency_contact_number, emergency_contact_relation,
    father_name, father_occupation, mother_name, mother_occupation, family_income_band, sslc_score, hsc_score,
    why_aviation, inspired_by, dream_organizations, after_graduation_plan, five_year_vision, languages,
    technical_expertise, sports, hobbies, clubs_of_interest, learning_styles, preferred_communication,
    medical_conditions, allergies, fitness_routine, biggest_challenge, mentor_help_needed, dgca_status, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153143'),
    'Male', '2008-04-06', 'O+', '9445169918', '9445169918', '6383999873',
    'S.Ravichandran', 'Software engineer', 'R.Shenbagavalli', 'House wife', 'Below Rs. 2,00,000', '68.8%', '74.16%',
    'I chose aviation because I’ve always been fascinated by aircraft and the responsibility of flying. I like the combination of technology, discipline, decision-making, and continuous learning that comes with being a pilot. I also want a career where I can challenge myself, travel, and keep improving. ', 'My father is my biggest inspiration. I have seen his hard work and his never-give-up attitude in life. Whenever I face difficulties, I remember how he keeps moving forward without giving up. His minds', ARRAY['IndiGo', 'then Emirates']::text[], 'My goal is to complete my CPL and DGCA requirements and start my career as a professional pilot. In the first year after graduation, I want to gain flying experience, build my confidence and skills, and work towards securing my first pilot job, ideally as a Commercial Pilot or Flight Instructor.', 'Within five years, I aim to be an experienced commercial pilot, flying for a reputed airline and continuously developing my skills and qualifications.', ARRAY['Tamil', 'English']::text[],
    'MS ; Excel, Powerpoint, Word', '{}'::text[], ARRAY['Reading', 'workout']::text[], ARRAY['Pilot Club', 'Entrepreneurship Club', 'Social Media Club', 'Research Club']::text[], ARRAY['Practical', 'Classroom', 'Simulator', 'Group Learning', 'Project Bas']::text[], ARRAY['WhatsApp', 'Phone', 'Face-to-Face']::text[],
    '', '', '', 'The main challenge is managing the financial requirements and completing all the necessary training and qualifications.', 'Guidance on career planning, flight training, DGCA requirements, and building the skills needed to become a professional pilot.', '1 paper cleared ( Meteorology )', 'STUDENT_REPORTED'
)
ON CONFLICT (student_id) DO UPDATE SET
    gender = EXCLUDED.gender, dob = EXCLUDED.dob, blood_group = EXCLUDED.blood_group,
    parent_phone = EXCLUDED.parent_phone, emergency_contact_number = EXCLUDED.emergency_contact_number,
    emergency_contact_relation = EXCLUDED.emergency_contact_relation, father_name = EXCLUDED.father_name,
    father_occupation = EXCLUDED.father_occupation, mother_name = EXCLUDED.mother_name, mother_occupation = EXCLUDED.mother_occupation,
    family_income_band = EXCLUDED.family_income_band, sslc_score = EXCLUDED.sslc_score, hsc_score = EXCLUDED.hsc_score,
    why_aviation = EXCLUDED.why_aviation, inspired_by = EXCLUDED.inspired_by, dream_organizations = EXCLUDED.dream_organizations,
    after_graduation_plan = EXCLUDED.after_graduation_plan, five_year_vision = EXCLUDED.five_year_vision, languages = EXCLUDED.languages,
    technical_expertise = EXCLUDED.technical_expertise, sports = EXCLUDED.sports, hobbies = EXCLUDED.hobbies,
    clubs_of_interest = EXCLUDED.clubs_of_interest, learning_styles = EXCLUDED.learning_styles,
    preferred_communication = EXCLUDED.preferred_communication, medical_conditions = EXCLUDED.medical_conditions,
    allergies = EXCLUDED.allergies, fitness_routine = EXCLUDED.fitness_routine, biggest_challenge = EXCLUDED.biggest_challenge,
    mentor_help_needed = EXCLUDED.mentor_help_needed, dgca_status = EXCLUDED.dgca_status;
INSERT INTO public.student_profiles (
    student_id, gender, dob, blood_group, parent_phone, emergency_contact_number, emergency_contact_relation,
    father_name, father_occupation, mother_name, mother_occupation, family_income_band, sslc_score, hsc_score,
    why_aviation, inspired_by, dream_organizations, after_graduation_plan, five_year_vision, languages,
    technical_expertise, sports, hobbies, clubs_of_interest, learning_styles, preferred_communication,
    medical_conditions, allergies, fitness_routine, biggest_challenge, mentor_help_needed, dgca_status, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153144'),
    'Male', '2007-09-27', 'O+', '9832617362', '9342468773', 'Father',
    'Sushanta Barman', 'Retired teacher', 'Gita Barman', 'Teacher', 'Prefer not to say', '86%', '78',
    'Aspired to become a pilot', 'Being able to be fly around and be free', ARRAY['Emirates']::text[], 'Prepare for higher studies and get experience', '5 years from now on id want to find what i truely want and make significant progress in it', ARRAY['Hindi', 'English', 'Bengali', 'German learning', 'Japanese']::text[],
    'Ms all softwares,  autocad', '{}'::text[], '{}'::text[], ARRAY['Aero Maintenance Club', 'ATC Club', 'Entrepreneurship Club', 'Social Media Club', 'Research Club']::text[], ARRAY['Practical', 'Simulator', 'Project Based']::text[], ARRAY['WhatsApp', 'Phone', 'Face-to-Face']::text[],
    '', 'Seafood', '', 'Dont have a particular goal as of now', 'Be more understanding and informative so that we can atleast figure out the good and bad of diffrent carriers', '', 'STUDENT_REPORTED'
)
ON CONFLICT (student_id) DO UPDATE SET
    gender = EXCLUDED.gender, dob = EXCLUDED.dob, blood_group = EXCLUDED.blood_group,
    parent_phone = EXCLUDED.parent_phone, emergency_contact_number = EXCLUDED.emergency_contact_number,
    emergency_contact_relation = EXCLUDED.emergency_contact_relation, father_name = EXCLUDED.father_name,
    father_occupation = EXCLUDED.father_occupation, mother_name = EXCLUDED.mother_name, mother_occupation = EXCLUDED.mother_occupation,
    family_income_band = EXCLUDED.family_income_band, sslc_score = EXCLUDED.sslc_score, hsc_score = EXCLUDED.hsc_score,
    why_aviation = EXCLUDED.why_aviation, inspired_by = EXCLUDED.inspired_by, dream_organizations = EXCLUDED.dream_organizations,
    after_graduation_plan = EXCLUDED.after_graduation_plan, five_year_vision = EXCLUDED.five_year_vision, languages = EXCLUDED.languages,
    technical_expertise = EXCLUDED.technical_expertise, sports = EXCLUDED.sports, hobbies = EXCLUDED.hobbies,
    clubs_of_interest = EXCLUDED.clubs_of_interest, learning_styles = EXCLUDED.learning_styles,
    preferred_communication = EXCLUDED.preferred_communication, medical_conditions = EXCLUDED.medical_conditions,
    allergies = EXCLUDED.allergies, fitness_routine = EXCLUDED.fitness_routine, biggest_challenge = EXCLUDED.biggest_challenge,
    mentor_help_needed = EXCLUDED.mentor_help_needed, dgca_status = EXCLUDED.dgca_status;
INSERT INTO public.student_profiles (
    student_id, gender, dob, blood_group, parent_phone, emergency_contact_number, emergency_contact_relation,
    father_name, father_occupation, mother_name, mother_occupation, family_income_band, sslc_score, hsc_score,
    why_aviation, inspired_by, dream_organizations, after_graduation_plan, five_year_vision, languages,
    technical_expertise, sports, hobbies, clubs_of_interest, learning_styles, preferred_communication,
    medical_conditions, allergies, fitness_routine, biggest_challenge, mentor_help_needed, dgca_status, provenance
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '23153145'),
    'Male', '2006-03-29', 'O+', '7356568890', '9048114570', 'Asharaf - Father',
    'Asharaf', 'Driver', 'Sameena', 'Housewife', 'Below Rs. 2,00,000', '54.5', '71.5',
    'Advertisement', 'Parents', ARRAY['Indigo', 'Riyadh international airport']::text[], 'Still didn’t decided yet', 'Any job in aviation industry', ARRAY['English', 'Arabic', 'Malayalam', 'Tamil(beginner)']::text[],
    'Ms Office , Capcut , Lightroom , Pixellab', ARRAY['Football']::text[], ARRAY['Video editting']::text[], ARRAY['Airline Operations Club', 'ATC Club', 'AI & Robotics Club', 'Social Media Club']::text[], ARRAY['Practical', 'Simulator', 'Project Based']::text[], ARRAY['WhatsApp', 'Email', 'Phone', 'Face-to-Face']::text[],
    '', 'Dust', '', 'Studies', 'I need time for studies and everything 
I can’t complete the classworks in given deadlines 
I need more time', '', 'STUDENT_REPORTED'
)
ON CONFLICT (student_id) DO UPDATE SET
    gender = EXCLUDED.gender, dob = EXCLUDED.dob, blood_group = EXCLUDED.blood_group,
    parent_phone = EXCLUDED.parent_phone, emergency_contact_number = EXCLUDED.emergency_contact_number,
    emergency_contact_relation = EXCLUDED.emergency_contact_relation, father_name = EXCLUDED.father_name,
    father_occupation = EXCLUDED.father_occupation, mother_name = EXCLUDED.mother_name, mother_occupation = EXCLUDED.mother_occupation,
    family_income_band = EXCLUDED.family_income_band, sslc_score = EXCLUDED.sslc_score, hsc_score = EXCLUDED.hsc_score,
    why_aviation = EXCLUDED.why_aviation, inspired_by = EXCLUDED.inspired_by, dream_organizations = EXCLUDED.dream_organizations,
    after_graduation_plan = EXCLUDED.after_graduation_plan, five_year_vision = EXCLUDED.five_year_vision, languages = EXCLUDED.languages,
    technical_expertise = EXCLUDED.technical_expertise, sports = EXCLUDED.sports, hobbies = EXCLUDED.hobbies,
    clubs_of_interest = EXCLUDED.clubs_of_interest, learning_styles = EXCLUDED.learning_styles,
    preferred_communication = EXCLUDED.preferred_communication, medical_conditions = EXCLUDED.medical_conditions,
    allergies = EXCLUDED.allergies, fitness_routine = EXCLUDED.fitness_routine, biggest_challenge = EXCLUDED.biggest_challenge,
    mentor_help_needed = EXCLUDED.mentor_help_needed, dgca_status = EXCLUDED.dgca_status;

-- --------------------------------------------------------------------------
-- 7. Student Career Goals (39 Historical Records, Provenance: HISTORICAL_PROFILE)
-- --------------------------------------------------------------------------
INSERT INTO public.student_career_goals (student_id, career_role_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153101'),
    (SELECT id FROM public.career_roles WHERE title = 'Air Traffic Controller (ATC)' LIMIT 1),
    'Air Traffic Controller (ATC)', true, 'HISTORICAL_PROFILE'
);
INSERT INTO public.student_career_goals (student_id, career_role_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153102'),
    (SELECT id FROM public.career_roles WHERE title = 'Airport Operations' LIMIT 1),
    'Airport Operations', true, 'HISTORICAL_PROFILE'
);
INSERT INTO public.student_career_goals (student_id, career_role_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153103'),
    (SELECT id FROM public.career_roles WHERE title = 'Pilot — CPL/ATPL track' LIMIT 1),
    'Pilot — CPL/ATPL track', true, 'HISTORICAL_PROFILE'
);
INSERT INTO public.student_career_goals (student_id, career_role_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153104'),
    (SELECT id FROM public.career_roles WHERE title = 'Flight Dispatcher' LIMIT 1),
    'Flight Dispatcher', true, 'HISTORICAL_PROFILE'
);
INSERT INTO public.student_career_goals (student_id, career_role_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153105'),
    (SELECT id FROM public.career_roles WHERE title = 'Air Traffic Controller (ATC)' LIMIT 1),
    'Air Traffic Controller (ATC)', true, 'HISTORICAL_PROFILE'
);
INSERT INTO public.student_career_goals (student_id, career_role_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153107'),
    (SELECT id FROM public.career_roles WHERE title = 'Flight Dispatcher' LIMIT 1),
    'Flight Dispatcher', true, 'HISTORICAL_PROFILE'
);
INSERT INTO public.student_career_goals (student_id, career_role_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153109'),
    (SELECT id FROM public.career_roles WHERE title = 'Air Traffic Controller (ATC)' LIMIT 1),
    'Air Traffic Controller (ATC)', true, 'HISTORICAL_PROFILE'
);
INSERT INTO public.student_career_goals (student_id, career_role_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153110'),
    (SELECT id FROM public.career_roles WHERE title = 'Flight Dispatcher' LIMIT 1),
    'Flight Dispatcher', true, 'HISTORICAL_PROFILE'
);
INSERT INTO public.student_career_goals (student_id, career_role_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153111'),
    (SELECT id FROM public.career_roles WHERE title = 'Pilot — CPL/ATPL track' LIMIT 1),
    'Pilot — CPL/ATPL track', true, 'HISTORICAL_PROFILE'
);
INSERT INTO public.student_career_goals (student_id, career_role_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153112'),
    (SELECT id FROM public.career_roles WHERE title = 'Air Traffic Controller (ATC)' LIMIT 1),
    'Air Traffic Controller (ATC)', true, 'HISTORICAL_PROFILE'
);
INSERT INTO public.student_career_goals (student_id, career_role_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153113'),
    (SELECT id FROM public.career_roles WHERE title = 'Pilot — CPL/ATPL track' LIMIT 1),
    'Pilot — CPL/ATPL track', true, 'HISTORICAL_PROFILE'
);
INSERT INTO public.student_career_goals (student_id, career_role_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153114'),
    (SELECT id FROM public.career_roles WHERE title = 'Pilot — CPL/ATPL track' LIMIT 1),
    'Pilot — CPL/ATPL track', true, 'HISTORICAL_PROFILE'
);
INSERT INTO public.student_career_goals (student_id, career_role_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153115'),
    (SELECT id FROM public.career_roles WHERE title = 'Air Traffic Controller (ATC)' LIMIT 1),
    'Air Traffic Controller (ATC)', true, 'HISTORICAL_PROFILE'
);
INSERT INTO public.student_career_goals (student_id, career_role_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153116'),
    (SELECT id FROM public.career_roles WHERE title = 'Air Traffic Controller (ATC)' LIMIT 1),
    'Air Traffic Controller (ATC)', true, 'HISTORICAL_PROFILE'
);
INSERT INTO public.student_career_goals (student_id, career_role_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153117'),
    (SELECT id FROM public.career_roles WHERE title = 'Air Traffic Controller (ATC)' LIMIT 1),
    'Air Traffic Controller (ATC)', true, 'HISTORICAL_PROFILE'
);
INSERT INTO public.student_career_goals (student_id, career_role_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153118'),
    (SELECT id FROM public.career_roles WHERE title = 'Air Traffic Controller (ATC)' LIMIT 1),
    'Air Traffic Controller (ATC)', true, 'HISTORICAL_PROFILE'
);
INSERT INTO public.student_career_goals (student_id, career_role_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153119'),
    (SELECT id FROM public.career_roles WHERE title = 'Air Traffic Controller (ATC)' LIMIT 1),
    'Air Traffic Controller (ATC)', true, 'HISTORICAL_PROFILE'
);
INSERT INTO public.student_career_goals (student_id, career_role_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153120'),
    (SELECT id FROM public.career_roles WHERE title = 'Pilot — CPL/ATPL track' LIMIT 1),
    'Pilot — CPL/ATPL track', true, 'HISTORICAL_PROFILE'
);
INSERT INTO public.student_career_goals (student_id, career_role_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153121'),
    (SELECT id FROM public.career_roles WHERE title = 'Pilot — CPL/ATPL track' LIMIT 1),
    'Pilot — CPL/ATPL track', true, 'HISTORICAL_PROFILE'
);
INSERT INTO public.student_career_goals (student_id, career_role_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153122'),
    (SELECT id FROM public.career_roles WHERE title = 'Pilot — CPL/ATPL track' LIMIT 1),
    'Pilot — CPL/ATPL track', true, 'HISTORICAL_PROFILE'
);
INSERT INTO public.student_career_goals (student_id, career_role_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153123'),
    (SELECT id FROM public.career_roles WHERE title = 'Air Traffic Controller (ATC)' LIMIT 1),
    'Air Traffic Controller (ATC)', true, 'HISTORICAL_PROFILE'
);
INSERT INTO public.student_career_goals (student_id, career_role_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153124'),
    (SELECT id FROM public.career_roles WHERE title = 'Air Traffic Controller (ATC)' LIMIT 1),
    'Air Traffic Controller (ATC)', true, 'HISTORICAL_PROFILE'
);
INSERT INTO public.student_career_goals (student_id, career_role_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153125'),
    (SELECT id FROM public.career_roles WHERE title = 'Pilot — CPL/ATPL track' LIMIT 1),
    'Pilot — CPL/ATPL track', true, 'HISTORICAL_PROFILE'
);
INSERT INTO public.student_career_goals (student_id, career_role_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153126'),
    (SELECT id FROM public.career_roles WHERE title = 'Air Traffic Controller (ATC)' LIMIT 1),
    'Air Traffic Controller (ATC)', true, 'HISTORICAL_PROFILE'
);
INSERT INTO public.student_career_goals (student_id, career_role_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153127'),
    (SELECT id FROM public.career_roles WHERE title = 'Pilot — CPL/ATPL track' LIMIT 1),
    'Pilot — CPL/ATPL track', true, 'HISTORICAL_PROFILE'
);
INSERT INTO public.student_career_goals (student_id, career_role_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153128'),
    (SELECT id FROM public.career_roles WHERE title = 'Pilot — CPL/ATPL track' LIMIT 1),
    'Pilot — CPL/ATPL track', true, 'HISTORICAL_PROFILE'
);
INSERT INTO public.student_career_goals (student_id, career_role_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153130'),
    (SELECT id FROM public.career_roles WHERE title = 'Pilot — CPL/ATPL track' LIMIT 1),
    'Pilot — CPL/ATPL track', true, 'HISTORICAL_PROFILE'
);
INSERT INTO public.student_career_goals (student_id, career_role_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153131'),
    (SELECT id FROM public.career_roles WHERE title = 'Air Traffic Controller (ATC)' LIMIT 1),
    'Air Traffic Controller (ATC)', true, 'HISTORICAL_PROFILE'
);
INSERT INTO public.student_career_goals (student_id, career_role_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153132'),
    (SELECT id FROM public.career_roles WHERE title = 'Air Traffic Controller (ATC)' LIMIT 1),
    'Air Traffic Controller (ATC)', true, 'HISTORICAL_PROFILE'
);
INSERT INTO public.student_career_goals (student_id, career_role_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153133'),
    (SELECT id FROM public.career_roles WHERE title = 'Air Traffic Controller (ATC)' LIMIT 1),
    'Air Traffic Controller (ATC)', true, 'HISTORICAL_PROFILE'
);
INSERT INTO public.student_career_goals (student_id, career_role_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153134'),
    (SELECT id FROM public.career_roles WHERE title = 'Pilot — CPL/ATPL track' LIMIT 1),
    'Pilot — CPL/ATPL track', true, 'HISTORICAL_PROFILE'
);
INSERT INTO public.student_career_goals (student_id, career_role_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153135'),
    (SELECT id FROM public.career_roles WHERE title = 'Pilot — CPL/ATPL track' LIMIT 1),
    'Pilot — CPL/ATPL track', true, 'HISTORICAL_PROFILE'
);
INSERT INTO public.student_career_goals (student_id, career_role_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153137'),
    (SELECT id FROM public.career_roles WHERE title = 'Ground Operations & Dispatch' LIMIT 1),
    'Ground Operations & Dispatch', true, 'HISTORICAL_PROFILE'
);
INSERT INTO public.student_career_goals (student_id, career_role_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153138'),
    (SELECT id FROM public.career_roles WHERE title = 'Pilot — CPL/ATPL track' LIMIT 1),
    'Pilot — CPL/ATPL track', true, 'HISTORICAL_PROFILE'
);
INSERT INTO public.student_career_goals (student_id, career_role_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153139'),
    (SELECT id FROM public.career_roles WHERE title = 'Ground Operations & Dispatch' LIMIT 1),
    'Ground Operations & Dispatch', true, 'HISTORICAL_PROFILE'
);
INSERT INTO public.student_career_goals (student_id, career_role_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153140'),
    (SELECT id FROM public.career_roles WHERE title = 'Pilot — CPL/ATPL track' LIMIT 1),
    'Pilot — CPL/ATPL track', true, 'HISTORICAL_PROFILE'
);
INSERT INTO public.student_career_goals (student_id, career_role_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153141'),
    (SELECT id FROM public.career_roles WHERE title = 'Air Traffic Controller (ATC)' LIMIT 1),
    'Air Traffic Controller (ATC)', true, 'HISTORICAL_PROFILE'
);
INSERT INTO public.student_career_goals (student_id, career_role_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153142'),
    (SELECT id FROM public.career_roles WHERE title = 'Pilot — CPL/ATPL track' LIMIT 1),
    'Pilot — CPL/ATPL track', true, 'HISTORICAL_PROFILE'
);
INSERT INTO public.student_career_goals (student_id, career_role_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153143'),
    (SELECT id FROM public.career_roles WHERE title = 'Pilot — CPL/ATPL track' LIMIT 1),
    'Pilot — CPL/ATPL track', true, 'HISTORICAL_PROFILE'
);
-- Seeded 39 Career Goals

-- --------------------------------------------------------------------------
-- 8. Universal Skill Assessments (430 Records, Provenance: STUDENT_REPORTED)
-- --------------------------------------------------------------------------
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153101'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153101'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153101'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153101'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153101'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153101'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153101'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153101'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153101'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153101'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153102'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153102'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153102'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153102'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153102'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153102'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153102'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    1, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153102'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153102'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153102'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153103'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153103'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153103'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153103'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153103'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153103'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153103'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153103'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153103'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153103'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153104'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153104'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153104'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153104'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153104'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153104'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153104'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153104'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153104'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153104'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153105'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153105'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153105'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153105'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153105'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153105'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153105'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153105'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153105'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153105'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153107'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153107'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153107'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153107'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153107'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153107'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153107'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153107'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153107'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153107'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153109'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153109'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153109'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153109'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153109'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153109'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153109'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153109'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153109'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153109'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153110'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153110'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153110'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153110'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153110'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153110'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153110'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153110'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153110'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153110'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153111'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153111'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153111'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153111'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153111'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153111'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153111'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153111'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153111'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153111'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153112'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153112'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153112'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153112'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153112'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153112'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153112'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153112'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153112'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153112'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153113'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153113'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153113'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153113'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153113'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153113'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153113'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153113'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153113'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153113'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153114'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153114'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153114'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153114'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153114'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153114'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153114'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153114'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153114'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153114'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153115'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153115'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153115'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153115'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    1, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153115'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    1, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153115'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    1, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153115'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    1, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153115'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153115'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153115'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153116'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153116'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153116'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153116'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153116'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153116'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153116'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153116'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153116'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153116'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153117'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153117'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153117'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153117'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153117'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153117'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153117'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153117'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153117'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153117'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153118'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153118'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153118'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153118'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153118'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153118'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153118'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153118'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153118'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153118'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153119'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153119'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153119'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153119'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153119'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153119'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153119'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153119'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153119'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153119'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153120'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153120'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153120'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153120'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153120'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153120'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153120'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153120'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153120'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153120'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153121'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153121'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153121'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153121'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153121'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153121'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153121'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153121'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153121'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153121'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153122'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153122'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153122'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153122'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153122'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153122'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153122'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153122'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153122'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153122'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153123'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153123'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153123'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153123'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153123'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153123'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    1, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153123'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153123'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153123'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153123'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153124'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153124'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153124'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153124'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153124'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153124'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153124'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153124'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153124'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153124'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153125'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153125'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153125'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153125'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153125'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153125'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153125'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153125'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153125'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153125'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153126'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153126'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153126'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153126'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153126'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153126'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153126'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153126'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153126'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153126'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153127'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153127'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153127'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153127'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153127'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153127'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153127'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153127'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153127'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153127'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153128'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153128'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153128'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153128'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153128'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153128'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153128'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153128'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153128'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153128'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153129'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153129'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153129'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153129'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153129'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153129'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    1, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153129'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153129'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153129'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153129'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153130'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153130'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153130'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153130'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153130'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153130'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153130'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153130'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153130'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153130'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153131'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153131'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153131'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153131'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153131'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153131'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153131'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    1, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153131'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153131'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153131'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153132'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153132'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153132'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153132'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153132'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153132'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153132'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153132'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153132'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153132'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153133'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153133'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153133'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153133'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153133'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153133'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153133'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153133'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153133'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153133'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153134'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153134'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153134'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153134'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153134'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153134'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153134'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153134'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153134'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153134'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153135'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153135'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153135'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153135'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153135'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153135'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153135'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153135'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153135'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153135'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153136'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153136'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153136'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153136'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153136'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153136'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153136'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153136'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153136'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153136'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153137'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153137'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153137'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153137'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153137'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153137'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153137'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153137'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153137'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153137'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153138'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153138'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153138'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153138'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153138'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153138'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153138'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153138'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153138'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153138'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153139'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153139'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153139'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153139'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153139'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153139'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153139'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153139'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153139'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153139'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153140'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153140'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153140'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    1, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153140'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153140'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    1, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153140'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    1, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153140'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    1, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153140'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153140'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153140'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153141'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153141'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153141'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153141'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153141'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153141'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153141'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153141'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153141'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153141'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153142'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153142'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153142'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153142'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153142'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153142'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153142'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153142'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153142'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153142'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153143'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153143'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153143'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153143'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153143'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153143'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153143'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153143'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153143'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153143'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153144'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153144'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153144'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153144'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153144'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153144'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153144'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153144'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153144'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153144'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '23153145'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '23153145'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '23153145'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    1, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '23153145'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '23153145'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '23153145'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '23153145'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    1, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '23153145'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '23153145'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    1, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '23153145'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student intake questionnaire', 'STUDENT_REPORTED'
);
-- Seeded 430 Skill Assessments

-- --------------------------------------------------------------------------
-- 9. Career Readiness (43 Records, Tri-State: AVAILABLE / NOT_REPORTED)
-- --------------------------------------------------------------------------
INSERT INTO public.career_readiness (
    student_id, resume_status, linkedin_status, passport_status, driving_license_status,
    pan_card_status, aadhaar_card_status, student_reported_raw
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153101'),
    'NOT_REPORTED', 'NOT_REPORTED', 'AVAILABLE', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE',
    '{"resume": "No", "linkedin": "No", "passport": "Yes", "driving_license": "No", "pan_card": "Yes", "aadhaar_card": "Yes"}'::jsonb
)
ON CONFLICT (student_id) DO UPDATE SET
    resume_status = EXCLUDED.resume_status,
    linkedin_status = EXCLUDED.linkedin_status,
    passport_status = EXCLUDED.passport_status,
    driving_license_status = EXCLUDED.driving_license_status,
    pan_card_status = EXCLUDED.pan_card_status,
    aadhaar_card_status = EXCLUDED.aadhaar_card_status,
    student_reported_raw = EXCLUDED.student_reported_raw;
INSERT INTO public.career_readiness (
    student_id, resume_status, linkedin_status, passport_status, driving_license_status,
    pan_card_status, aadhaar_card_status, student_reported_raw
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153102'),
    'NOT_REPORTED', 'AVAILABLE', 'NOT_REPORTED', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE',
    '{"resume": "No", "linkedin": "Yes", "passport": "No", "driving_license": "No", "pan_card": "Yes", "aadhaar_card": "Yes"}'::jsonb
)
ON CONFLICT (student_id) DO UPDATE SET
    resume_status = EXCLUDED.resume_status,
    linkedin_status = EXCLUDED.linkedin_status,
    passport_status = EXCLUDED.passport_status,
    driving_license_status = EXCLUDED.driving_license_status,
    pan_card_status = EXCLUDED.pan_card_status,
    aadhaar_card_status = EXCLUDED.aadhaar_card_status,
    student_reported_raw = EXCLUDED.student_reported_raw;
INSERT INTO public.career_readiness (
    student_id, resume_status, linkedin_status, passport_status, driving_license_status,
    pan_card_status, aadhaar_card_status, student_reported_raw
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153103'),
    'NOT_REPORTED', 'AVAILABLE', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE',
    '{"resume": "No", "linkedin": "Yes", "passport": "No", "driving_license": "Yes", "pan_card": "Yes", "aadhaar_card": "Yes"}'::jsonb
)
ON CONFLICT (student_id) DO UPDATE SET
    resume_status = EXCLUDED.resume_status,
    linkedin_status = EXCLUDED.linkedin_status,
    passport_status = EXCLUDED.passport_status,
    driving_license_status = EXCLUDED.driving_license_status,
    pan_card_status = EXCLUDED.pan_card_status,
    aadhaar_card_status = EXCLUDED.aadhaar_card_status,
    student_reported_raw = EXCLUDED.student_reported_raw;
INSERT INTO public.career_readiness (
    student_id, resume_status, linkedin_status, passport_status, driving_license_status,
    pan_card_status, aadhaar_card_status, student_reported_raw
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153104'),
    'AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE',
    '{"resume": "Yes", "linkedin": "Yes", "passport": "Yes", "driving_license": "Yes", "pan_card": "Yes", "aadhaar_card": "Yes"}'::jsonb
)
ON CONFLICT (student_id) DO UPDATE SET
    resume_status = EXCLUDED.resume_status,
    linkedin_status = EXCLUDED.linkedin_status,
    passport_status = EXCLUDED.passport_status,
    driving_license_status = EXCLUDED.driving_license_status,
    pan_card_status = EXCLUDED.pan_card_status,
    aadhaar_card_status = EXCLUDED.aadhaar_card_status,
    student_reported_raw = EXCLUDED.student_reported_raw;
INSERT INTO public.career_readiness (
    student_id, resume_status, linkedin_status, passport_status, driving_license_status,
    pan_card_status, aadhaar_card_status, student_reported_raw
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153105'),
    'AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE',
    '{"resume": "Yes", "linkedin": "Yes", "passport": "Yes", "driving_license": "Yes", "pan_card": "Yes", "aadhaar_card": "Yes"}'::jsonb
)
ON CONFLICT (student_id) DO UPDATE SET
    resume_status = EXCLUDED.resume_status,
    linkedin_status = EXCLUDED.linkedin_status,
    passport_status = EXCLUDED.passport_status,
    driving_license_status = EXCLUDED.driving_license_status,
    pan_card_status = EXCLUDED.pan_card_status,
    aadhaar_card_status = EXCLUDED.aadhaar_card_status,
    student_reported_raw = EXCLUDED.student_reported_raw;
INSERT INTO public.career_readiness (
    student_id, resume_status, linkedin_status, passport_status, driving_license_status,
    pan_card_status, aadhaar_card_status, student_reported_raw
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153107'),
    'NOT_REPORTED', 'AVAILABLE', 'NOT_REPORTED', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE',
    '{"resume": "No", "linkedin": "Yes", "passport": "No", "driving_license": "No", "pan_card": "Yes", "aadhaar_card": "Yes"}'::jsonb
)
ON CONFLICT (student_id) DO UPDATE SET
    resume_status = EXCLUDED.resume_status,
    linkedin_status = EXCLUDED.linkedin_status,
    passport_status = EXCLUDED.passport_status,
    driving_license_status = EXCLUDED.driving_license_status,
    pan_card_status = EXCLUDED.pan_card_status,
    aadhaar_card_status = EXCLUDED.aadhaar_card_status,
    student_reported_raw = EXCLUDED.student_reported_raw;
INSERT INTO public.career_readiness (
    student_id, resume_status, linkedin_status, passport_status, driving_license_status,
    pan_card_status, aadhaar_card_status, student_reported_raw
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153109'),
    'NOT_REPORTED', 'AVAILABLE', 'NOT_REPORTED', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE',
    '{"resume": "No", "linkedin": "Yes", "passport": "No", "driving_license": "No", "pan_card": "Yes", "aadhaar_card": "Yes"}'::jsonb
)
ON CONFLICT (student_id) DO UPDATE SET
    resume_status = EXCLUDED.resume_status,
    linkedin_status = EXCLUDED.linkedin_status,
    passport_status = EXCLUDED.passport_status,
    driving_license_status = EXCLUDED.driving_license_status,
    pan_card_status = EXCLUDED.pan_card_status,
    aadhaar_card_status = EXCLUDED.aadhaar_card_status,
    student_reported_raw = EXCLUDED.student_reported_raw;
INSERT INTO public.career_readiness (
    student_id, resume_status, linkedin_status, passport_status, driving_license_status,
    pan_card_status, aadhaar_card_status, student_reported_raw
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153110'),
    'NOT_REPORTED', 'AVAILABLE', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE',
    '{"resume": "No", "linkedin": "Yes", "passport": "No", "driving_license": "Yes", "pan_card": "Yes", "aadhaar_card": "Yes"}'::jsonb
)
ON CONFLICT (student_id) DO UPDATE SET
    resume_status = EXCLUDED.resume_status,
    linkedin_status = EXCLUDED.linkedin_status,
    passport_status = EXCLUDED.passport_status,
    driving_license_status = EXCLUDED.driving_license_status,
    pan_card_status = EXCLUDED.pan_card_status,
    aadhaar_card_status = EXCLUDED.aadhaar_card_status,
    student_reported_raw = EXCLUDED.student_reported_raw;
INSERT INTO public.career_readiness (
    student_id, resume_status, linkedin_status, passport_status, driving_license_status,
    pan_card_status, aadhaar_card_status, student_reported_raw
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153111'),
    'AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE',
    '{"resume": "Yes", "linkedin": "Yes", "passport": "Yes", "driving_license": "No", "pan_card": "Yes", "aadhaar_card": "Yes"}'::jsonb
)
ON CONFLICT (student_id) DO UPDATE SET
    resume_status = EXCLUDED.resume_status,
    linkedin_status = EXCLUDED.linkedin_status,
    passport_status = EXCLUDED.passport_status,
    driving_license_status = EXCLUDED.driving_license_status,
    pan_card_status = EXCLUDED.pan_card_status,
    aadhaar_card_status = EXCLUDED.aadhaar_card_status,
    student_reported_raw = EXCLUDED.student_reported_raw;
INSERT INTO public.career_readiness (
    student_id, resume_status, linkedin_status, passport_status, driving_license_status,
    pan_card_status, aadhaar_card_status, student_reported_raw
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153112'),
    'NOT_REPORTED', 'AVAILABLE', 'NOT_REPORTED', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE',
    '{"resume": "No", "linkedin": "Yes", "passport": "No", "driving_license": "No", "pan_card": "Yes", "aadhaar_card": "Yes"}'::jsonb
)
ON CONFLICT (student_id) DO UPDATE SET
    resume_status = EXCLUDED.resume_status,
    linkedin_status = EXCLUDED.linkedin_status,
    passport_status = EXCLUDED.passport_status,
    driving_license_status = EXCLUDED.driving_license_status,
    pan_card_status = EXCLUDED.pan_card_status,
    aadhaar_card_status = EXCLUDED.aadhaar_card_status,
    student_reported_raw = EXCLUDED.student_reported_raw;
INSERT INTO public.career_readiness (
    student_id, resume_status, linkedin_status, passport_status, driving_license_status,
    pan_card_status, aadhaar_card_status, student_reported_raw
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153113'),
    'NOT_REPORTED', 'NOT_REPORTED', 'NOT_REPORTED', 'AVAILABLE', 'NOT_REPORTED', 'AVAILABLE',
    '{"resume": "No", "linkedin": "No", "passport": "No", "driving_license": "Yes", "pan_card": "No", "aadhaar_card": "Yes"}'::jsonb
)
ON CONFLICT (student_id) DO UPDATE SET
    resume_status = EXCLUDED.resume_status,
    linkedin_status = EXCLUDED.linkedin_status,
    passport_status = EXCLUDED.passport_status,
    driving_license_status = EXCLUDED.driving_license_status,
    pan_card_status = EXCLUDED.pan_card_status,
    aadhaar_card_status = EXCLUDED.aadhaar_card_status,
    student_reported_raw = EXCLUDED.student_reported_raw;
INSERT INTO public.career_readiness (
    student_id, resume_status, linkedin_status, passport_status, driving_license_status,
    pan_card_status, aadhaar_card_status, student_reported_raw
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153114'),
    'AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE',
    '{"resume": "Yes", "linkedin": "Yes", "passport": "Yes", "driving_license": "Yes", "pan_card": "Yes", "aadhaar_card": "Yes"}'::jsonb
)
ON CONFLICT (student_id) DO UPDATE SET
    resume_status = EXCLUDED.resume_status,
    linkedin_status = EXCLUDED.linkedin_status,
    passport_status = EXCLUDED.passport_status,
    driving_license_status = EXCLUDED.driving_license_status,
    pan_card_status = EXCLUDED.pan_card_status,
    aadhaar_card_status = EXCLUDED.aadhaar_card_status,
    student_reported_raw = EXCLUDED.student_reported_raw;
INSERT INTO public.career_readiness (
    student_id, resume_status, linkedin_status, passport_status, driving_license_status,
    pan_card_status, aadhaar_card_status, student_reported_raw
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153115'),
    'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE',
    '{"resume": "No", "linkedin": "Yes", "passport": "Yes", "driving_license": "Yes", "pan_card": "Yes", "aadhaar_card": "Yes"}'::jsonb
)
ON CONFLICT (student_id) DO UPDATE SET
    resume_status = EXCLUDED.resume_status,
    linkedin_status = EXCLUDED.linkedin_status,
    passport_status = EXCLUDED.passport_status,
    driving_license_status = EXCLUDED.driving_license_status,
    pan_card_status = EXCLUDED.pan_card_status,
    aadhaar_card_status = EXCLUDED.aadhaar_card_status,
    student_reported_raw = EXCLUDED.student_reported_raw;
INSERT INTO public.career_readiness (
    student_id, resume_status, linkedin_status, passport_status, driving_license_status,
    pan_card_status, aadhaar_card_status, student_reported_raw
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153116'),
    'AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE',
    '{"resume": "Yes", "linkedin": "Yes", "passport": "Yes", "driving_license": "No", "pan_card": "Yes", "aadhaar_card": "Yes"}'::jsonb
)
ON CONFLICT (student_id) DO UPDATE SET
    resume_status = EXCLUDED.resume_status,
    linkedin_status = EXCLUDED.linkedin_status,
    passport_status = EXCLUDED.passport_status,
    driving_license_status = EXCLUDED.driving_license_status,
    pan_card_status = EXCLUDED.pan_card_status,
    aadhaar_card_status = EXCLUDED.aadhaar_card_status,
    student_reported_raw = EXCLUDED.student_reported_raw;
INSERT INTO public.career_readiness (
    student_id, resume_status, linkedin_status, passport_status, driving_license_status,
    pan_card_status, aadhaar_card_status, student_reported_raw
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153117'),
    'NOT_REPORTED', 'NOT_REPORTED', 'NOT_REPORTED', 'NOT_REPORTED', 'NOT_REPORTED', 'AVAILABLE',
    '{"resume": "No", "linkedin": "No", "passport": "No", "driving_license": "No", "pan_card": "No", "aadhaar_card": "Yes"}'::jsonb
)
ON CONFLICT (student_id) DO UPDATE SET
    resume_status = EXCLUDED.resume_status,
    linkedin_status = EXCLUDED.linkedin_status,
    passport_status = EXCLUDED.passport_status,
    driving_license_status = EXCLUDED.driving_license_status,
    pan_card_status = EXCLUDED.pan_card_status,
    aadhaar_card_status = EXCLUDED.aadhaar_card_status,
    student_reported_raw = EXCLUDED.student_reported_raw;
INSERT INTO public.career_readiness (
    student_id, resume_status, linkedin_status, passport_status, driving_license_status,
    pan_card_status, aadhaar_card_status, student_reported_raw
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153118'),
    'NOT_REPORTED', 'NOT_REPORTED', 'AVAILABLE', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE',
    '{"resume": "No", "linkedin": "No", "passport": "Yes", "driving_license": "No", "pan_card": "Yes", "aadhaar_card": "Yes"}'::jsonb
)
ON CONFLICT (student_id) DO UPDATE SET
    resume_status = EXCLUDED.resume_status,
    linkedin_status = EXCLUDED.linkedin_status,
    passport_status = EXCLUDED.passport_status,
    driving_license_status = EXCLUDED.driving_license_status,
    pan_card_status = EXCLUDED.pan_card_status,
    aadhaar_card_status = EXCLUDED.aadhaar_card_status,
    student_reported_raw = EXCLUDED.student_reported_raw;
INSERT INTO public.career_readiness (
    student_id, resume_status, linkedin_status, passport_status, driving_license_status,
    pan_card_status, aadhaar_card_status, student_reported_raw
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153119'),
    'NOT_REPORTED', 'AVAILABLE', 'NOT_REPORTED', 'AVAILABLE', 'NOT_REPORTED', 'AVAILABLE',
    '{"resume": "No", "linkedin": "Yes", "passport": "No", "driving_license": "Yes", "pan_card": "No", "aadhaar_card": "Yes"}'::jsonb
)
ON CONFLICT (student_id) DO UPDATE SET
    resume_status = EXCLUDED.resume_status,
    linkedin_status = EXCLUDED.linkedin_status,
    passport_status = EXCLUDED.passport_status,
    driving_license_status = EXCLUDED.driving_license_status,
    pan_card_status = EXCLUDED.pan_card_status,
    aadhaar_card_status = EXCLUDED.aadhaar_card_status,
    student_reported_raw = EXCLUDED.student_reported_raw;
INSERT INTO public.career_readiness (
    student_id, resume_status, linkedin_status, passport_status, driving_license_status,
    pan_card_status, aadhaar_card_status, student_reported_raw
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153120'),
    'NOT_REPORTED', 'NOT_REPORTED', 'AVAILABLE', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE',
    '{"resume": "No", "linkedin": "No", "passport": "Yes", "driving_license": "No", "pan_card": "Yes", "aadhaar_card": "Yes"}'::jsonb
)
ON CONFLICT (student_id) DO UPDATE SET
    resume_status = EXCLUDED.resume_status,
    linkedin_status = EXCLUDED.linkedin_status,
    passport_status = EXCLUDED.passport_status,
    driving_license_status = EXCLUDED.driving_license_status,
    pan_card_status = EXCLUDED.pan_card_status,
    aadhaar_card_status = EXCLUDED.aadhaar_card_status,
    student_reported_raw = EXCLUDED.student_reported_raw;
INSERT INTO public.career_readiness (
    student_id, resume_status, linkedin_status, passport_status, driving_license_status,
    pan_card_status, aadhaar_card_status, student_reported_raw
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153121'),
    'NOT_REPORTED', 'AVAILABLE', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE',
    '{"resume": "No", "linkedin": "Yes", "passport": "No", "driving_license": "Yes", "pan_card": "Yes", "aadhaar_card": "Yes"}'::jsonb
)
ON CONFLICT (student_id) DO UPDATE SET
    resume_status = EXCLUDED.resume_status,
    linkedin_status = EXCLUDED.linkedin_status,
    passport_status = EXCLUDED.passport_status,
    driving_license_status = EXCLUDED.driving_license_status,
    pan_card_status = EXCLUDED.pan_card_status,
    aadhaar_card_status = EXCLUDED.aadhaar_card_status,
    student_reported_raw = EXCLUDED.student_reported_raw;
INSERT INTO public.career_readiness (
    student_id, resume_status, linkedin_status, passport_status, driving_license_status,
    pan_card_status, aadhaar_card_status, student_reported_raw
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153122'),
    'AVAILABLE', 'NOT_REPORTED', 'AVAILABLE', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE',
    '{"resume": "Yes", "linkedin": "No", "passport": "Yes", "driving_license": "No", "pan_card": "Yes", "aadhaar_card": "Yes"}'::jsonb
)
ON CONFLICT (student_id) DO UPDATE SET
    resume_status = EXCLUDED.resume_status,
    linkedin_status = EXCLUDED.linkedin_status,
    passport_status = EXCLUDED.passport_status,
    driving_license_status = EXCLUDED.driving_license_status,
    pan_card_status = EXCLUDED.pan_card_status,
    aadhaar_card_status = EXCLUDED.aadhaar_card_status,
    student_reported_raw = EXCLUDED.student_reported_raw;
INSERT INTO public.career_readiness (
    student_id, resume_status, linkedin_status, passport_status, driving_license_status,
    pan_card_status, aadhaar_card_status, student_reported_raw
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153123'),
    'NOT_REPORTED', 'NOT_REPORTED', 'AVAILABLE', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE',
    '{"resume": "No", "linkedin": "No", "passport": "Yes", "driving_license": "No", "pan_card": "Yes", "aadhaar_card": "Yes"}'::jsonb
)
ON CONFLICT (student_id) DO UPDATE SET
    resume_status = EXCLUDED.resume_status,
    linkedin_status = EXCLUDED.linkedin_status,
    passport_status = EXCLUDED.passport_status,
    driving_license_status = EXCLUDED.driving_license_status,
    pan_card_status = EXCLUDED.pan_card_status,
    aadhaar_card_status = EXCLUDED.aadhaar_card_status,
    student_reported_raw = EXCLUDED.student_reported_raw;
INSERT INTO public.career_readiness (
    student_id, resume_status, linkedin_status, passport_status, driving_license_status,
    pan_card_status, aadhaar_card_status, student_reported_raw
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153124'),
    'NOT_REPORTED', 'AVAILABLE', 'NOT_REPORTED', 'NOT_REPORTED', 'NOT_REPORTED', 'AVAILABLE',
    '{"resume": "No", "linkedin": "Yes", "passport": "No", "driving_license": "No", "pan_card": "No", "aadhaar_card": "Yes"}'::jsonb
)
ON CONFLICT (student_id) DO UPDATE SET
    resume_status = EXCLUDED.resume_status,
    linkedin_status = EXCLUDED.linkedin_status,
    passport_status = EXCLUDED.passport_status,
    driving_license_status = EXCLUDED.driving_license_status,
    pan_card_status = EXCLUDED.pan_card_status,
    aadhaar_card_status = EXCLUDED.aadhaar_card_status,
    student_reported_raw = EXCLUDED.student_reported_raw;
INSERT INTO public.career_readiness (
    student_id, resume_status, linkedin_status, passport_status, driving_license_status,
    pan_card_status, aadhaar_card_status, student_reported_raw
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153125'),
    'NOT_REPORTED', 'AVAILABLE', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE',
    '{"resume": "No", "linkedin": "Yes", "passport": "No", "driving_license": "Yes", "pan_card": "Yes", "aadhaar_card": "Yes"}'::jsonb
)
ON CONFLICT (student_id) DO UPDATE SET
    resume_status = EXCLUDED.resume_status,
    linkedin_status = EXCLUDED.linkedin_status,
    passport_status = EXCLUDED.passport_status,
    driving_license_status = EXCLUDED.driving_license_status,
    pan_card_status = EXCLUDED.pan_card_status,
    aadhaar_card_status = EXCLUDED.aadhaar_card_status,
    student_reported_raw = EXCLUDED.student_reported_raw;
INSERT INTO public.career_readiness (
    student_id, resume_status, linkedin_status, passport_status, driving_license_status,
    pan_card_status, aadhaar_card_status, student_reported_raw
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153126'),
    'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE',
    '{"resume": "No", "linkedin": "Yes", "passport": "Yes", "driving_license": "No", "pan_card": "Yes", "aadhaar_card": "Yes"}'::jsonb
)
ON CONFLICT (student_id) DO UPDATE SET
    resume_status = EXCLUDED.resume_status,
    linkedin_status = EXCLUDED.linkedin_status,
    passport_status = EXCLUDED.passport_status,
    driving_license_status = EXCLUDED.driving_license_status,
    pan_card_status = EXCLUDED.pan_card_status,
    aadhaar_card_status = EXCLUDED.aadhaar_card_status,
    student_reported_raw = EXCLUDED.student_reported_raw;
INSERT INTO public.career_readiness (
    student_id, resume_status, linkedin_status, passport_status, driving_license_status,
    pan_card_status, aadhaar_card_status, student_reported_raw
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153127'),
    'NOT_REPORTED', 'AVAILABLE', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE',
    '{"resume": "No", "linkedin": "Yes", "passport": "No", "driving_license": "Yes", "pan_card": "Yes", "aadhaar_card": "Yes"}'::jsonb
)
ON CONFLICT (student_id) DO UPDATE SET
    resume_status = EXCLUDED.resume_status,
    linkedin_status = EXCLUDED.linkedin_status,
    passport_status = EXCLUDED.passport_status,
    driving_license_status = EXCLUDED.driving_license_status,
    pan_card_status = EXCLUDED.pan_card_status,
    aadhaar_card_status = EXCLUDED.aadhaar_card_status,
    student_reported_raw = EXCLUDED.student_reported_raw;
INSERT INTO public.career_readiness (
    student_id, resume_status, linkedin_status, passport_status, driving_license_status,
    pan_card_status, aadhaar_card_status, student_reported_raw
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153128'),
    'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE',
    '{"resume": "No", "linkedin": "Yes", "passport": "Yes", "driving_license": "No", "pan_card": "Yes", "aadhaar_card": "Yes"}'::jsonb
)
ON CONFLICT (student_id) DO UPDATE SET
    resume_status = EXCLUDED.resume_status,
    linkedin_status = EXCLUDED.linkedin_status,
    passport_status = EXCLUDED.passport_status,
    driving_license_status = EXCLUDED.driving_license_status,
    pan_card_status = EXCLUDED.pan_card_status,
    aadhaar_card_status = EXCLUDED.aadhaar_card_status,
    student_reported_raw = EXCLUDED.student_reported_raw;
INSERT INTO public.career_readiness (
    student_id, resume_status, linkedin_status, passport_status, driving_license_status,
    pan_card_status, aadhaar_card_status, student_reported_raw
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153129'),
    'AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE',
    '{"resume": "Yes", "linkedin": "Yes", "passport": "Yes", "driving_license": "No", "pan_card": "Yes", "aadhaar_card": "Yes"}'::jsonb
)
ON CONFLICT (student_id) DO UPDATE SET
    resume_status = EXCLUDED.resume_status,
    linkedin_status = EXCLUDED.linkedin_status,
    passport_status = EXCLUDED.passport_status,
    driving_license_status = EXCLUDED.driving_license_status,
    pan_card_status = EXCLUDED.pan_card_status,
    aadhaar_card_status = EXCLUDED.aadhaar_card_status,
    student_reported_raw = EXCLUDED.student_reported_raw;
INSERT INTO public.career_readiness (
    student_id, resume_status, linkedin_status, passport_status, driving_license_status,
    pan_card_status, aadhaar_card_status, student_reported_raw
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153130'),
    'NOT_REPORTED', 'NOT_REPORTED', 'AVAILABLE', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE',
    '{"resume": "No", "linkedin": "No", "passport": "Yes", "driving_license": "No", "pan_card": "Yes", "aadhaar_card": "Yes"}'::jsonb
)
ON CONFLICT (student_id) DO UPDATE SET
    resume_status = EXCLUDED.resume_status,
    linkedin_status = EXCLUDED.linkedin_status,
    passport_status = EXCLUDED.passport_status,
    driving_license_status = EXCLUDED.driving_license_status,
    pan_card_status = EXCLUDED.pan_card_status,
    aadhaar_card_status = EXCLUDED.aadhaar_card_status,
    student_reported_raw = EXCLUDED.student_reported_raw;
INSERT INTO public.career_readiness (
    student_id, resume_status, linkedin_status, passport_status, driving_license_status,
    pan_card_status, aadhaar_card_status, student_reported_raw
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153131'),
    'NOT_REPORTED', 'AVAILABLE', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE',
    '{"resume": "No", "linkedin": "Yes", "passport": "No", "driving_license": "Yes", "pan_card": "Yes", "aadhaar_card": "Yes"}'::jsonb
)
ON CONFLICT (student_id) DO UPDATE SET
    resume_status = EXCLUDED.resume_status,
    linkedin_status = EXCLUDED.linkedin_status,
    passport_status = EXCLUDED.passport_status,
    driving_license_status = EXCLUDED.driving_license_status,
    pan_card_status = EXCLUDED.pan_card_status,
    aadhaar_card_status = EXCLUDED.aadhaar_card_status,
    student_reported_raw = EXCLUDED.student_reported_raw;
INSERT INTO public.career_readiness (
    student_id, resume_status, linkedin_status, passport_status, driving_license_status,
    pan_card_status, aadhaar_card_status, student_reported_raw
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153132'),
    'NOT_REPORTED', 'NOT_REPORTED', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE',
    '{"resume": "No", "linkedin": "No", "passport": "No", "driving_license": "Yes", "pan_card": "Yes", "aadhaar_card": "Yes"}'::jsonb
)
ON CONFLICT (student_id) DO UPDATE SET
    resume_status = EXCLUDED.resume_status,
    linkedin_status = EXCLUDED.linkedin_status,
    passport_status = EXCLUDED.passport_status,
    driving_license_status = EXCLUDED.driving_license_status,
    pan_card_status = EXCLUDED.pan_card_status,
    aadhaar_card_status = EXCLUDED.aadhaar_card_status,
    student_reported_raw = EXCLUDED.student_reported_raw;
INSERT INTO public.career_readiness (
    student_id, resume_status, linkedin_status, passport_status, driving_license_status,
    pan_card_status, aadhaar_card_status, student_reported_raw
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153133'),
    'NOT_REPORTED', 'NOT_REPORTED', 'NOT_REPORTED', 'NOT_REPORTED', 'NOT_REPORTED', 'AVAILABLE',
    '{"resume": "No", "linkedin": "No", "passport": "No", "driving_license": "No", "pan_card": "No", "aadhaar_card": "Yes"}'::jsonb
)
ON CONFLICT (student_id) DO UPDATE SET
    resume_status = EXCLUDED.resume_status,
    linkedin_status = EXCLUDED.linkedin_status,
    passport_status = EXCLUDED.passport_status,
    driving_license_status = EXCLUDED.driving_license_status,
    pan_card_status = EXCLUDED.pan_card_status,
    aadhaar_card_status = EXCLUDED.aadhaar_card_status,
    student_reported_raw = EXCLUDED.student_reported_raw;
INSERT INTO public.career_readiness (
    student_id, resume_status, linkedin_status, passport_status, driving_license_status,
    pan_card_status, aadhaar_card_status, student_reported_raw
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153134'),
    'NOT_REPORTED', 'NOT_REPORTED', 'AVAILABLE', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE',
    '{"resume": "No", "linkedin": "No", "passport": "Yes", "driving_license": "No", "pan_card": "Yes", "aadhaar_card": "Yes"}'::jsonb
)
ON CONFLICT (student_id) DO UPDATE SET
    resume_status = EXCLUDED.resume_status,
    linkedin_status = EXCLUDED.linkedin_status,
    passport_status = EXCLUDED.passport_status,
    driving_license_status = EXCLUDED.driving_license_status,
    pan_card_status = EXCLUDED.pan_card_status,
    aadhaar_card_status = EXCLUDED.aadhaar_card_status,
    student_reported_raw = EXCLUDED.student_reported_raw;
INSERT INTO public.career_readiness (
    student_id, resume_status, linkedin_status, passport_status, driving_license_status,
    pan_card_status, aadhaar_card_status, student_reported_raw
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153135'),
    'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE',
    '{"resume": "No", "linkedin": "Yes", "passport": "Yes", "driving_license": "Yes", "pan_card": "Yes", "aadhaar_card": "Yes"}'::jsonb
)
ON CONFLICT (student_id) DO UPDATE SET
    resume_status = EXCLUDED.resume_status,
    linkedin_status = EXCLUDED.linkedin_status,
    passport_status = EXCLUDED.passport_status,
    driving_license_status = EXCLUDED.driving_license_status,
    pan_card_status = EXCLUDED.pan_card_status,
    aadhaar_card_status = EXCLUDED.aadhaar_card_status,
    student_reported_raw = EXCLUDED.student_reported_raw;
INSERT INTO public.career_readiness (
    student_id, resume_status, linkedin_status, passport_status, driving_license_status,
    pan_card_status, aadhaar_card_status, student_reported_raw
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153136'),
    'NOT_REPORTED', 'AVAILABLE', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE',
    '{"resume": "No", "linkedin": "Yes", "passport": "No", "driving_license": "Yes", "pan_card": "Yes", "aadhaar_card": "Yes"}'::jsonb
)
ON CONFLICT (student_id) DO UPDATE SET
    resume_status = EXCLUDED.resume_status,
    linkedin_status = EXCLUDED.linkedin_status,
    passport_status = EXCLUDED.passport_status,
    driving_license_status = EXCLUDED.driving_license_status,
    pan_card_status = EXCLUDED.pan_card_status,
    aadhaar_card_status = EXCLUDED.aadhaar_card_status,
    student_reported_raw = EXCLUDED.student_reported_raw;
INSERT INTO public.career_readiness (
    student_id, resume_status, linkedin_status, passport_status, driving_license_status,
    pan_card_status, aadhaar_card_status, student_reported_raw
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153137'),
    'NOT_REPORTED', 'NOT_REPORTED', 'NOT_REPORTED', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE',
    '{"resume": "No", "linkedin": "No", "passport": "No", "driving_license": "No", "pan_card": "Yes", "aadhaar_card": "Yes"}'::jsonb
)
ON CONFLICT (student_id) DO UPDATE SET
    resume_status = EXCLUDED.resume_status,
    linkedin_status = EXCLUDED.linkedin_status,
    passport_status = EXCLUDED.passport_status,
    driving_license_status = EXCLUDED.driving_license_status,
    pan_card_status = EXCLUDED.pan_card_status,
    aadhaar_card_status = EXCLUDED.aadhaar_card_status,
    student_reported_raw = EXCLUDED.student_reported_raw;
INSERT INTO public.career_readiness (
    student_id, resume_status, linkedin_status, passport_status, driving_license_status,
    pan_card_status, aadhaar_card_status, student_reported_raw
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153138'),
    'AVAILABLE', 'AVAILABLE', 'NOT_REPORTED', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE',
    '{"resume": "Yes", "linkedin": "Yes", "passport": "No", "driving_license": "No", "pan_card": "Yes", "aadhaar_card": "Yes"}'::jsonb
)
ON CONFLICT (student_id) DO UPDATE SET
    resume_status = EXCLUDED.resume_status,
    linkedin_status = EXCLUDED.linkedin_status,
    passport_status = EXCLUDED.passport_status,
    driving_license_status = EXCLUDED.driving_license_status,
    pan_card_status = EXCLUDED.pan_card_status,
    aadhaar_card_status = EXCLUDED.aadhaar_card_status,
    student_reported_raw = EXCLUDED.student_reported_raw;
INSERT INTO public.career_readiness (
    student_id, resume_status, linkedin_status, passport_status, driving_license_status,
    pan_card_status, aadhaar_card_status, student_reported_raw
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153139'),
    'NOT_REPORTED', 'AVAILABLE', 'NOT_REPORTED', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE',
    '{"resume": "No", "linkedin": "Yes", "passport": "No", "driving_license": "No", "pan_card": "Yes", "aadhaar_card": "Yes"}'::jsonb
)
ON CONFLICT (student_id) DO UPDATE SET
    resume_status = EXCLUDED.resume_status,
    linkedin_status = EXCLUDED.linkedin_status,
    passport_status = EXCLUDED.passport_status,
    driving_license_status = EXCLUDED.driving_license_status,
    pan_card_status = EXCLUDED.pan_card_status,
    aadhaar_card_status = EXCLUDED.aadhaar_card_status,
    student_reported_raw = EXCLUDED.student_reported_raw;
INSERT INTO public.career_readiness (
    student_id, resume_status, linkedin_status, passport_status, driving_license_status,
    pan_card_status, aadhaar_card_status, student_reported_raw
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153140'),
    'NOT_REPORTED', 'NOT_REPORTED', 'AVAILABLE', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE',
    '{"resume": "No", "linkedin": "No", "passport": "Yes", "driving_license": "No", "pan_card": "Yes", "aadhaar_card": "Yes"}'::jsonb
)
ON CONFLICT (student_id) DO UPDATE SET
    resume_status = EXCLUDED.resume_status,
    linkedin_status = EXCLUDED.linkedin_status,
    passport_status = EXCLUDED.passport_status,
    driving_license_status = EXCLUDED.driving_license_status,
    pan_card_status = EXCLUDED.pan_card_status,
    aadhaar_card_status = EXCLUDED.aadhaar_card_status,
    student_reported_raw = EXCLUDED.student_reported_raw;
INSERT INTO public.career_readiness (
    student_id, resume_status, linkedin_status, passport_status, driving_license_status,
    pan_card_status, aadhaar_card_status, student_reported_raw
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153141'),
    'NOT_REPORTED', 'AVAILABLE', 'NOT_REPORTED', 'NOT_REPORTED', 'NOT_REPORTED', 'AVAILABLE',
    '{"resume": "No", "linkedin": "Yes", "passport": "No", "driving_license": "No", "pan_card": "No", "aadhaar_card": "Yes"}'::jsonb
)
ON CONFLICT (student_id) DO UPDATE SET
    resume_status = EXCLUDED.resume_status,
    linkedin_status = EXCLUDED.linkedin_status,
    passport_status = EXCLUDED.passport_status,
    driving_license_status = EXCLUDED.driving_license_status,
    pan_card_status = EXCLUDED.pan_card_status,
    aadhaar_card_status = EXCLUDED.aadhaar_card_status,
    student_reported_raw = EXCLUDED.student_reported_raw;
INSERT INTO public.career_readiness (
    student_id, resume_status, linkedin_status, passport_status, driving_license_status,
    pan_card_status, aadhaar_card_status, student_reported_raw
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153142'),
    'AVAILABLE', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE',
    '{"resume": "Yes", "linkedin": "No", "passport": "Yes", "driving_license": "Yes", "pan_card": "Yes", "aadhaar_card": "Yes"}'::jsonb
)
ON CONFLICT (student_id) DO UPDATE SET
    resume_status = EXCLUDED.resume_status,
    linkedin_status = EXCLUDED.linkedin_status,
    passport_status = EXCLUDED.passport_status,
    driving_license_status = EXCLUDED.driving_license_status,
    pan_card_status = EXCLUDED.pan_card_status,
    aadhaar_card_status = EXCLUDED.aadhaar_card_status,
    student_reported_raw = EXCLUDED.student_reported_raw;
INSERT INTO public.career_readiness (
    student_id, resume_status, linkedin_status, passport_status, driving_license_status,
    pan_card_status, aadhaar_card_status, student_reported_raw
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153143'),
    'AVAILABLE', 'AVAILABLE', 'NOT_REPORTED', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE',
    '{"resume": "Yes", "linkedin": "Yes", "passport": "No", "driving_license": "No", "pan_card": "Yes", "aadhaar_card": "Yes"}'::jsonb
)
ON CONFLICT (student_id) DO UPDATE SET
    resume_status = EXCLUDED.resume_status,
    linkedin_status = EXCLUDED.linkedin_status,
    passport_status = EXCLUDED.passport_status,
    driving_license_status = EXCLUDED.driving_license_status,
    pan_card_status = EXCLUDED.pan_card_status,
    aadhaar_card_status = EXCLUDED.aadhaar_card_status,
    student_reported_raw = EXCLUDED.student_reported_raw;
INSERT INTO public.career_readiness (
    student_id, resume_status, linkedin_status, passport_status, driving_license_status,
    pan_card_status, aadhaar_card_status, student_reported_raw
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153144'),
    'NOT_REPORTED', 'NOT_REPORTED', 'NOT_REPORTED', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE',
    '{"resume": "No", "linkedin": "No", "passport": "No", "driving_license": "No", "pan_card": "Yes", "aadhaar_card": "Yes"}'::jsonb
)
ON CONFLICT (student_id) DO UPDATE SET
    resume_status = EXCLUDED.resume_status,
    linkedin_status = EXCLUDED.linkedin_status,
    passport_status = EXCLUDED.passport_status,
    driving_license_status = EXCLUDED.driving_license_status,
    pan_card_status = EXCLUDED.pan_card_status,
    aadhaar_card_status = EXCLUDED.aadhaar_card_status,
    student_reported_raw = EXCLUDED.student_reported_raw;
INSERT INTO public.career_readiness (
    student_id, resume_status, linkedin_status, passport_status, driving_license_status,
    pan_card_status, aadhaar_card_status, student_reported_raw
) VALUES (
    (SELECT id FROM public.students WHERE reg_no = '23153145'),
    'AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE',
    '{"resume": "Yes", "linkedin": "Yes", "passport": "Yes", "driving_license": "Yes", "pan_card": "Yes", "aadhaar_card": "Yes"}'::jsonb
)
ON CONFLICT (student_id) DO UPDATE SET
    resume_status = EXCLUDED.resume_status,
    linkedin_status = EXCLUDED.linkedin_status,
    passport_status = EXCLUDED.passport_status,
    driving_license_status = EXCLUDED.driving_license_status,
    pan_card_status = EXCLUDED.pan_card_status,
    aadhaar_card_status = EXCLUDED.aadhaar_card_status,
    student_reported_raw = EXCLUDED.student_reported_raw;

COMMIT;
