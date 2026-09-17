-- ==========================================================================
-- MENTOR OS: Phase 2 Seed & Data Ingestion (Generated)
-- Generated on: 2026-09-15T14:32:20.624000
-- ==========================================================================

BEGIN;

-- 1. Primary Cohort

INSERT INTO public.cohorts (code, name, programme, academic_year, current_year_of_study, section)
VALUES ('AERO-2025-28', 'B.Sc. Aeronautical Science Batch 2025–2028', 'B.Sc. Aeronautical Science', '2025 - 2026', '2nd Year', 'A')
ON CONFLICT (code) DO UPDATE SET academic_year = EXCLUDED.academic_year;

-- 2. Career Roles Taxonomy

INSERT INTO public.career_roles (slug, title, short_title, category, prerequisites)
VALUES ('pilot-cpl', 'Pilot — CPL/ATPL track', 'Pilot', 'Flight Operations', '{"Class 1 Medical","Strong Physics & Maths","DGCA CPL Ground Papers"}')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.career_roles (slug, title, short_title, category, prerequisites)
VALUES ('atc', 'Air Traffic Controller (ATC)', 'ATC', 'Operations', '{"Air Traffic Procedures","ICAO English","High Situational Awareness"}')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.career_roles (slug, title, short_title, category, prerequisites)
VALUES ('ame', 'Aircraft Maintenance Engineer (AME)', 'AME', 'Technical', '{"AME Licence Path","Systems Knowledge","Attention to Detail"}')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.career_roles (slug, title, short_title, category, prerequisites)
VALUES ('avionics', 'Avionics Engineer', 'Avionics', 'Engineering', '{"Electronics Fundamentals","Troubleshooting","Instrumentation"}')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.career_roles (slug, title, short_title, category, prerequisites)
VALUES ('dispatcher', 'Flight Dispatcher', 'Dispatcher', 'Operations', '{"Flight Planning","Load & Balance","DGCA Dispatcher Licence"}')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.career_roles (slug, title, short_title, category, prerequisites)
VALUES ('ground-ops', 'Ground Operations & Dispatch', 'Ground Ops', 'Ground Operations', '{"Airport Operations","Turnaround Coordination"}')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.career_roles (slug, title, short_title, category, prerequisites)
VALUES ('airport-ops', 'Airport Operations', 'Airport Ops', 'Management', '{"Passenger Handling","Security Compliance"}')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.career_roles (slug, title, short_title, category, prerequisites)
VALUES ('uav-drone', 'Drone / UAV Operations', 'Drone Ops', 'UAV / Emerging Tech', '{"DGCA Drone Pilot Certificate","Electronics Basics"}')
ON CONFLICT (slug) DO NOTHING;

-- 3. Universal Skills Taxonomy

INSERT INTO public.skills (slug, name, category)
VALUES ('communication', 'Communication Skills', 'Core Behavioral')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.skills (slug, name, category)
VALUES ('english', 'English Speaking', 'Core Behavioral')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.skills (slug, name, category)
VALUES ('leadership', 'Leadership', 'Core Behavioral')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.skills (slug, name, category)
VALUES ('teamwork', 'Teamwork', 'Core Behavioral')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.skills (slug, name, category)
VALUES ('problem-solving', 'Problem Solving', 'Cognitive')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.skills (slug, name, category)
VALUES ('computer-skills', 'Computer Skills', 'Technical')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.skills (slug, name, category)
VALUES ('public-speaking', 'Public Speaking', 'Interpersonal')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.skills (slug, name, category)
VALUES ('confidence', 'Confidence', 'Personal Demeanor')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.skills (slug, name, category)
VALUES ('time-management', 'Time Management', 'Discipline')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.skills (slug, name, category)
VALUES ('discipline', 'Discipline', 'Core Behavioral')
ON CONFLICT (slug) DO NOTHING;

-- 4. Canonical Students & Identities Audit

INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone)
VALUES (
    '25153101', 1, 'Abinaya S',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '8072876279'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone;

INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone)
VALUES (
    '25153102', 2, 'Adhitya K',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '9933265007'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone;

INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone)
VALUES (
    '25153103', 3, 'Akshaya G',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '7708513049'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone;

INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone)
VALUES (
    '25153104', 4, 'Albert Jana J',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '6385048665'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone;

INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone)
VALUES (
    '25153105', 5, 'Anjana M V',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '8590581370'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone;

INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone)
VALUES (
    '25153107', 6, 'Bhakthi G Nichani',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '7498681254'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone;

INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone)
VALUES (
    '25153109', 7, 'Durga M',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '8778483677'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone;

INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone)
VALUES (
    '25153110', 8, 'Fakrudin T Dharwad',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '8792664302'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone;

INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone)
VALUES (
    '25153111', 9, 'Fasna V Shihab',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '9778742751'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone;

INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone)
VALUES (
    '25153112', 10, 'Gayathri G',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '9080700557'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone;

INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone)
VALUES (
    '25153113', 11, 'Gokul Liwa S',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '8903766167'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone;

INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone)
VALUES (
    '25153114', 12, 'Gungun Tamboli',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '7999117247'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone;

INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone)
VALUES (
    '25153115', 13, 'Hana Fathima K M',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '9037461476'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone;

INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone)
VALUES (
    '25153116', 14, 'Jeevan Nisanth K',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '9790796655'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone;

INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone)
VALUES (
    '25153117', 15, 'Joyel Felix H',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '9385577978'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone;

INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone)
VALUES (
    '25153118', 16, 'Kanishka S',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '9342796598'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone;

INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone)
VALUES (
    '25153119', 17, 'Kevin Francis C R',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '9500676947'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone;

INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone)
VALUES (
    '25153120', 18, 'Mathumitha M',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '7200490407'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone;

INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone)
VALUES (
    '25153121', 19, 'Mithunesh S',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '7092670206'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone;

INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone)
VALUES (
    '25153122', 20, 'Mohamed Samee J',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '8838407130'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone;

INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone)
VALUES (
    '25153123', 21, 'M Roshni',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '9025896571'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone;

INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone)
VALUES (
    '25153124', 22, 'Munafarsharif S',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '7358201099'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone;

INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone)
VALUES (
    '25153125', 23, 'Nithin R',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '9342532240'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone;

INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone)
VALUES (
    '25153126', 24, 'Nivin M',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '9344836769'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone;

INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone)
VALUES (
    '25153127', 25, 'Rakesh S',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '9360065409'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone;

INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone)
VALUES (
    '25153128', 26, 'Raksha Nivasini',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '7845789191'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone;

INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone)
VALUES (
    '25153129', 27, 'Rino M Reji',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '9846723677'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone;

INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone)
VALUES (
    '25153130', 28, 'Roshan Jerald',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '9902053328'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone;

INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone)
VALUES (
    '25153131', 29, 'Saisaran S',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '7397305143'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone;

INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone)
VALUES (
    '25153132', 30, 'Sai Vishnu A',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '7338785729'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone;

INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone)
VALUES (
    '25153133', 31, 'S Manasseh Paul',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '9390586304'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone;

INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone)
VALUES (
    '25153134', 32, 'Sradha Manoj',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '8304905130'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone;

INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone)
VALUES (
    '25153135', 33, 'Syed Ahamed M N',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '7092525845'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone;

INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone)
VALUES (
    '25153136', 34, 'Venkatesan S',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '7200024383'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone;

INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone)
VALUES (
    '25153137', 35, 'Vijay S',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '8088622672'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone;

INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone)
VALUES (
    '25153138', 36, 'Vuppu Bhavasri',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '7981936455'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone;

INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone)
VALUES (
    '25153139', 37, 'Yeswanthsiva R',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '8939211275'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone;

INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone)
VALUES (
    '25153140', 38, 'Lena Fatahima Basheer',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '7510882066'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone;

INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone)
VALUES (
    '25153141', 39, 'Mohammed Faizudeen S',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '8838977579'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone;

INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone)
VALUES (
    '25153142', 40, 'Nishaanth S U',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '9345441709'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone;

INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone)
VALUES (
    '25153143', 41, 'Sabarinathan R',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '9025741421'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone;

INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone)
VALUES (
    '25153144', 42, 'Dibyajyothi Suman Barman',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '9832617362'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone;

INSERT INTO public.students (reg_no, sno, full_name, cohort_id, phone)
VALUES (
    '23153145', 43, 'Mohanned',
    (SELECT id FROM public.cohorts WHERE code = 'AERO-2025-28'),
    '8589868801'
)
ON CONFLICT (reg_no) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone;

-- 5. Student Profiles, Initial Baseline Skills & Readiness from Excel

INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153101'),
    'EXCEL_ALL_STUDENTS', 'Abinaya S', '25153101', '8072876279', '25153101',
    'EXACT_MATCH', 'Exact registration number match'
);

INSERT INTO public.career_readiness (student_id, resume_status, linkedin_status, passport_status, driving_license_status, pan_card_status, aadhaar_card_status)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153101'),
    'NOT_REPORTED', 'NOT_REPORTED', 'AVAILABLE', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE'
)
ON CONFLICT (student_id) DO NOTHING;

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153101'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153101'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153101'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153101'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153101'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153101'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153101'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153101'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153101'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153101'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153102'),
    'EXCEL_ALL_STUDENTS', 'Adhitya. K', '25153102', '9933265007', '25153102',
    'EXACT_MATCH', 'Exact registration number match'
);

INSERT INTO public.career_readiness (student_id, resume_status, linkedin_status, passport_status, driving_license_status, pan_card_status, aadhaar_card_status)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153102'),
    'NOT_REPORTED', 'AVAILABLE', 'NOT_REPORTED', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE'
)
ON CONFLICT (student_id) DO NOTHING;

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153102'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153102'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153102'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153102'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153102'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153102'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153102'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    1, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153102'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153102'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153102'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153103'),
    'EXCEL_ALL_STUDENTS', 'Akshaya.G', '25153103', '7708513049', '25153103',
    'EXACT_MATCH', 'Exact registration number match'
);

INSERT INTO public.career_readiness (student_id, resume_status, linkedin_status, passport_status, driving_license_status, pan_card_status, aadhaar_card_status)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153103'),
    'NOT_REPORTED', 'AVAILABLE', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE'
)
ON CONFLICT (student_id) DO NOTHING;

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153103'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153103'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153103'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153103'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153103'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153103'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153103'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153103'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153103'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153103'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153104'),
    'EXCEL_ALL_STUDENTS', 'Albert jana J', '25153104', '6385048665', '25153104',
    'EXACT_MATCH', 'Exact registration number match'
);

INSERT INTO public.career_readiness (student_id, resume_status, linkedin_status, passport_status, driving_license_status, pan_card_status, aadhaar_card_status)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153104'),
    'AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE'
)
ON CONFLICT (student_id) DO NOTHING;

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153104'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153104'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153104'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153104'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153104'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153104'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153104'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153104'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153104'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153104'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153105'),
    'EXCEL_ALL_STUDENTS', 'Anjana  M V', '253105', '8590581370', '25153105',
    'TYPO_CORRECTED', 'Missing ''15'' prefix; matched name Anjana M V and phone'
);

INSERT INTO public.career_readiness (student_id, resume_status, linkedin_status, passport_status, driving_license_status, pan_card_status, aadhaar_card_status)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153105'),
    'AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE'
)
ON CONFLICT (student_id) DO NOTHING;

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153105'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153105'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153105'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153105'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153105'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153105'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153105'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153105'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153105'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153105'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153107'),
    'EXCEL_ALL_STUDENTS', 'Bhakthi G Nichani', '25153107', '8695111915', '25153107',
    'EXACT_MATCH', 'Exact registration number match'
);

INSERT INTO public.career_readiness (student_id, resume_status, linkedin_status, passport_status, driving_license_status, pan_card_status, aadhaar_card_status)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153107'),
    'NOT_REPORTED', 'AVAILABLE', 'NOT_REPORTED', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE'
)
ON CONFLICT (student_id) DO NOTHING;

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153107'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153107'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153107'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153107'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153107'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153107'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153107'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153107'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153107'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153107'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153119'),
    'EXCEL_ALL_STUDENTS', 'C R Kevin Francis', '25153107', '9500676947', '25153119',
    'DUPLICATE_RESOLVED', 'C R Kevin Francis entered 25153107 in error; remapped to official 25153119'
);

INSERT INTO public.career_readiness (student_id, resume_status, linkedin_status, passport_status, driving_license_status, pan_card_status, aadhaar_card_status)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153119'),
    'NOT_REPORTED', 'AVAILABLE', 'NOT_REPORTED', 'AVAILABLE', 'NOT_REPORTED', 'AVAILABLE'
)
ON CONFLICT (student_id) DO NOTHING;

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153119'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153119'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153119'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153119'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153119'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153119'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153119'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153119'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153119'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153119'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153144'),
    'EXCEL_ALL_STUDENTS', 'Dibyajyoti Suman Barman', '25153144', '9832617362', '25153144',
    'EXACT_MATCH', 'Exact registration number match'
);

INSERT INTO public.career_readiness (student_id, resume_status, linkedin_status, passport_status, driving_license_status, pan_card_status, aadhaar_card_status)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153144'),
    'NOT_REPORTED', 'NOT_REPORTED', 'NOT_REPORTED', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE'
)
ON CONFLICT (student_id) DO NOTHING;

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153144'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153144'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153144'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153144'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153144'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153144'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153144'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153144'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153144'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153144'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153110'),
    'EXCEL_ALL_STUDENTS', 'Fakrudin T Dharwad', '25153110', '8792664302', '25153110',
    'EXACT_MATCH', 'Exact registration number match'
);

INSERT INTO public.career_readiness (student_id, resume_status, linkedin_status, passport_status, driving_license_status, pan_card_status, aadhaar_card_status)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153110'),
    'NOT_REPORTED', 'AVAILABLE', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE'
)
ON CONFLICT (student_id) DO NOTHING;

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153110'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153110'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153110'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153110'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153110'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153110'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153110'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153110'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153110'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153110'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153111'),
    'EXCEL_ALL_STUDENTS', 'FASNA V SHIHAB', '25153111', '9778742751', '25153111',
    'EXACT_MATCH', 'Exact registration number match'
);

INSERT INTO public.career_readiness (student_id, resume_status, linkedin_status, passport_status, driving_license_status, pan_card_status, aadhaar_card_status)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153111'),
    'AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE'
)
ON CONFLICT (student_id) DO NOTHING;

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153111'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153111'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153111'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153111'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153111'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153111'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153111'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153111'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153111'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153111'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153112'),
    'EXCEL_ALL_STUDENTS', 'G Gayathri', '25153112', '9080700557', '25153112',
    'EXACT_MATCH', 'Exact registration number match'
);

INSERT INTO public.career_readiness (student_id, resume_status, linkedin_status, passport_status, driving_license_status, pan_card_status, aadhaar_card_status)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153112'),
    'NOT_REPORTED', 'AVAILABLE', 'NOT_REPORTED', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE'
)
ON CONFLICT (student_id) DO NOTHING;

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153112'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153112'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153112'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153112'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153112'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153112'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153112'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153112'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153112'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153112'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153113'),
    'EXCEL_ALL_STUDENTS', 'Gokul liwa S', '25153113', '8903766167', '25153113',
    'EXACT_MATCH', 'Exact registration number match'
);

INSERT INTO public.career_readiness (student_id, resume_status, linkedin_status, passport_status, driving_license_status, pan_card_status, aadhaar_card_status)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153113'),
    'NOT_REPORTED', 'NOT_REPORTED', 'NOT_REPORTED', 'AVAILABLE', 'NOT_REPORTED', 'AVAILABLE'
)
ON CONFLICT (student_id) DO NOTHING;

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153113'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153113'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153113'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153113'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153113'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153113'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153113'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153113'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153113'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153113'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153114'),
    'EXCEL_ALL_STUDENTS', 'Gungun Tamboli', '25153114', '7999117247', '25153114',
    'EXACT_MATCH', 'Exact registration number match'
);

INSERT INTO public.career_readiness (student_id, resume_status, linkedin_status, passport_status, driving_license_status, pan_card_status, aadhaar_card_status)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153114'),
    'AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE'
)
ON CONFLICT (student_id) DO NOTHING;

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153114'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153114'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153114'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153114'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153114'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153114'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153114'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153114'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153114'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153114'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153115'),
    'EXCEL_ALL_STUDENTS', 'Hana fathima K. M', '25153115', '9037461476', '25153115',
    'EXACT_MATCH', 'Exact registration number match'
);

INSERT INTO public.career_readiness (student_id, resume_status, linkedin_status, passport_status, driving_license_status, pan_card_status, aadhaar_card_status)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153115'),
    'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE'
)
ON CONFLICT (student_id) DO NOTHING;

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153115'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153115'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153115'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153115'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    1, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153115'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    1, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153115'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    1, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153115'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    1, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153115'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153115'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153115'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153116'),
    'EXCEL_ALL_STUDENTS', 'JEEVAN NISANTH K', '25153116', '9790796655', '25153116',
    'EXACT_MATCH', 'Exact registration number match'
);

INSERT INTO public.career_readiness (student_id, resume_status, linkedin_status, passport_status, driving_license_status, pan_card_status, aadhaar_card_status)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153116'),
    'AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE'
)
ON CONFLICT (student_id) DO NOTHING;

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153116'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153116'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153116'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153116'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153116'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153116'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153116'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153116'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153116'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153116'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153117'),
    'EXCEL_ALL_STUDENTS', 'JOYEL Felix.H', '25153117', '9385577978', '25153117',
    'EXACT_MATCH', 'Exact registration number match'
);

INSERT INTO public.career_readiness (student_id, resume_status, linkedin_status, passport_status, driving_license_status, pan_card_status, aadhaar_card_status)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153117'),
    'NOT_REPORTED', 'NOT_REPORTED', 'NOT_REPORTED', 'NOT_REPORTED', 'NOT_REPORTED', 'AVAILABLE'
)
ON CONFLICT (student_id) DO NOTHING;

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153117'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153117'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153117'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153117'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153117'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153117'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153117'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153117'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153117'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153117'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153118'),
    'EXCEL_ALL_STUDENTS', 'KANISHKA S', '25153118', '9342796598', '25153118',
    'EXACT_MATCH', 'Exact registration number match'
);

INSERT INTO public.career_readiness (student_id, resume_status, linkedin_status, passport_status, driving_license_status, pan_card_status, aadhaar_card_status)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153118'),
    'NOT_REPORTED', 'NOT_REPORTED', 'AVAILABLE', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE'
)
ON CONFLICT (student_id) DO NOTHING;

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153118'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153118'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153118'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153118'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153118'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153118'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153118'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153118'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153118'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153118'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153140'),
    'EXCEL_ALL_STUDENTS', 'LENA FATAHIMA BASHEER', '25153140', '7510882066', '25153140',
    'EXACT_MATCH', 'Exact registration number match'
);

INSERT INTO public.career_readiness (student_id, resume_status, linkedin_status, passport_status, driving_license_status, pan_card_status, aadhaar_card_status)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153140'),
    'NOT_REPORTED', 'NOT_REPORTED', 'AVAILABLE', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE'
)
ON CONFLICT (student_id) DO NOTHING;

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153140'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153140'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153140'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    1, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153140'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153140'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    1, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153140'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    1, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153140'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    1, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153140'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153140'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153140'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153109'),
    'EXCEL_ALL_STUDENTS', 'M Durga', '25153109', '8778484677', '25153109',
    'EXACT_MATCH', 'Exact registration number match'
);

INSERT INTO public.career_readiness (student_id, resume_status, linkedin_status, passport_status, driving_license_status, pan_card_status, aadhaar_card_status)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153109'),
    'NOT_REPORTED', 'AVAILABLE', 'NOT_REPORTED', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE'
)
ON CONFLICT (student_id) DO NOTHING;

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153109'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153109'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153109'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153109'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153109'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153109'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153109'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153109'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153109'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153109'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153123'),
    'EXCEL_ALL_STUDENTS', 'M. Roshni', '25153123', '9035896571', '25153123',
    'EXACT_MATCH', 'Exact registration number match'
);

INSERT INTO public.career_readiness (student_id, resume_status, linkedin_status, passport_status, driving_license_status, pan_card_status, aadhaar_card_status)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153123'),
    'NOT_REPORTED', 'NOT_REPORTED', 'AVAILABLE', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE'
)
ON CONFLICT (student_id) DO NOTHING;

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153123'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153123'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153123'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153123'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153123'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153123'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    1, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153123'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153123'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153123'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153123'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153120'),
    'EXCEL_ALL_STUDENTS', 'Mathumitha M', '25153120', '7200490407', '25153120',
    'EXACT_MATCH', 'Exact registration number match'
);

INSERT INTO public.career_readiness (student_id, resume_status, linkedin_status, passport_status, driving_license_status, pan_card_status, aadhaar_card_status)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153120'),
    'NOT_REPORTED', 'NOT_REPORTED', 'AVAILABLE', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE'
)
ON CONFLICT (student_id) DO NOTHING;

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153120'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153120'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153120'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153120'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153120'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153120'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153120'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153120'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153120'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153120'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153121'),
    'EXCEL_ALL_STUDENTS', 'Mithunesh S', '25153121', '7092670206', '25153121',
    'EXACT_MATCH', 'Exact registration number match'
);

INSERT INTO public.career_readiness (student_id, resume_status, linkedin_status, passport_status, driving_license_status, pan_card_status, aadhaar_card_status)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153121'),
    'NOT_REPORTED', 'AVAILABLE', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE'
)
ON CONFLICT (student_id) DO NOTHING;

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153121'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153121'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153121'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153121'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153121'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153121'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153121'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153121'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153121'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153121'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153122'),
    'EXCEL_ALL_STUDENTS', 'MOHAMED SAMEE J', '25153122', '8838407130', '25153122',
    'EXACT_MATCH', 'Exact registration number match'
);

INSERT INTO public.career_readiness (student_id, resume_status, linkedin_status, passport_status, driving_license_status, pan_card_status, aadhaar_card_status)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153122'),
    'AVAILABLE', 'NOT_REPORTED', 'AVAILABLE', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE'
)
ON CONFLICT (student_id) DO NOTHING;

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153122'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153122'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153122'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153122'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153122'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153122'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153122'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153122'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153122'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153122'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153141'),
    'EXCEL_ALL_STUDENTS', 'Mohammed Faizudeen S', '25153141', '8838977579', '25153141',
    'EXACT_MATCH', 'Exact registration number match'
);

INSERT INTO public.career_readiness (student_id, resume_status, linkedin_status, passport_status, driving_license_status, pan_card_status, aadhaar_card_status)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153141'),
    'NOT_REPORTED', 'AVAILABLE', 'NOT_REPORTED', 'NOT_REPORTED', 'NOT_REPORTED', 'AVAILABLE'
)
ON CONFLICT (student_id) DO NOTHING;

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153141'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153141'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153141'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153141'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153141'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153141'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153141'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153141'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153141'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153141'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '23153145'),
    'EXCEL_ALL_STUDENTS', 'Mohanned', '25153145', '8589868801', '23153145',
    'TYPO_CORRECTED', 'Student typed 25 batch instead of official 23 batch reg no'
);

INSERT INTO public.career_readiness (student_id, resume_status, linkedin_status, passport_status, driving_license_status, pan_card_status, aadhaar_card_status)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '23153145'),
    'AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE'
)
ON CONFLICT (student_id) DO NOTHING;

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '23153145'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '23153145'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '23153145'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    1, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '23153145'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '23153145'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '23153145'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '23153145'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    1, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '23153145'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '23153145'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    1, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '23153145'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153124'),
    'EXCEL_ALL_STUDENTS', 'MUNAFARSHARIF S', '25153124', '7358201099', '25153124',
    'EXACT_MATCH', 'Exact registration number match'
);

INSERT INTO public.career_readiness (student_id, resume_status, linkedin_status, passport_status, driving_license_status, pan_card_status, aadhaar_card_status)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153124'),
    'NOT_REPORTED', 'AVAILABLE', 'NOT_REPORTED', 'NOT_REPORTED', 'NOT_REPORTED', 'AVAILABLE'
)
ON CONFLICT (student_id) DO NOTHING;

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153124'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153124'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153124'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153124'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153124'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153124'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153124'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153124'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153124'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153124'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153142'),
    'EXCEL_ALL_STUDENTS', 'Nishaanth S U', '25153143', '9345441709', '25153142',
    'DUPLICATE_RESOLVED', 'Nishaanth S U entered 25153143 in error; remapped to official 25153142'
);

INSERT INTO public.career_readiness (student_id, resume_status, linkedin_status, passport_status, driving_license_status, pan_card_status, aadhaar_card_status)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153142'),
    'AVAILABLE', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE'
)
ON CONFLICT (student_id) DO NOTHING;

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153142'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153142'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153142'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153142'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153142'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153142'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153142'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153142'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153142'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153142'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153125'),
    'EXCEL_ALL_STUDENTS', 'NITHIN R', '25153125', '9342532240', '25153125',
    'EXACT_MATCH', 'Exact registration number match'
);

INSERT INTO public.career_readiness (student_id, resume_status, linkedin_status, passport_status, driving_license_status, pan_card_status, aadhaar_card_status)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153125'),
    'NOT_REPORTED', 'AVAILABLE', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE'
)
ON CONFLICT (student_id) DO NOTHING;

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153125'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153125'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153125'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153125'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153125'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153125'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153125'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153125'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153125'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153125'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153126'),
    'EXCEL_ALL_STUDENTS', 'NIVIN M', '25153126', '9344836769', '25153126',
    'EXACT_MATCH', 'Exact registration number match'
);

INSERT INTO public.career_readiness (student_id, resume_status, linkedin_status, passport_status, driving_license_status, pan_card_status, aadhaar_card_status)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153126'),
    'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE'
)
ON CONFLICT (student_id) DO NOTHING;

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153126'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153126'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153126'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153126'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153126'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153126'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153126'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153126'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153126'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153126'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153139'),
    'EXCEL_ALL_STUDENTS', 'R yeswanthsiva', '25153139', '8939211275', '25153139',
    'EXACT_MATCH', 'Exact registration number match'
);

INSERT INTO public.career_readiness (student_id, resume_status, linkedin_status, passport_status, driving_license_status, pan_card_status, aadhaar_card_status)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153139'),
    'NOT_REPORTED', 'AVAILABLE', 'NOT_REPORTED', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE'
)
ON CONFLICT (student_id) DO NOTHING;

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153139'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153139'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153139'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153139'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153139'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153139'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153139'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153139'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153139'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153139'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153143'),
    'EXCEL_ALL_STUDENTS', 'R.Sabarinathan', '25153143', '9025741421', '25153143',
    'EXACT_MATCH', 'Exact registration number match'
);

INSERT INTO public.career_readiness (student_id, resume_status, linkedin_status, passport_status, driving_license_status, pan_card_status, aadhaar_card_status)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153143'),
    'AVAILABLE', 'AVAILABLE', 'NOT_REPORTED', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE'
)
ON CONFLICT (student_id) DO NOTHING;

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153143'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153143'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153143'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153143'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153143'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153143'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153143'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153143'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153143'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153143'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153127'),
    'EXCEL_ALL_STUDENTS', 'Rakesh S', '25153127', '9360065409', '25153127',
    'EXACT_MATCH', 'Exact registration number match'
);

INSERT INTO public.career_readiness (student_id, resume_status, linkedin_status, passport_status, driving_license_status, pan_card_status, aadhaar_card_status)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153127'),
    'NOT_REPORTED', 'AVAILABLE', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE'
)
ON CONFLICT (student_id) DO NOTHING;

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153127'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153127'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153127'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153127'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153127'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153127'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153127'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153127'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153127'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153127'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153128'),
    'EXCEL_ALL_STUDENTS', 'Raksha Nivasini M', '253128', '7845789192', '25153128',
    'TYPO_CORRECTED', 'Missing ''15'' prefix; matched name Raksha Nivasini and phone'
);

INSERT INTO public.career_readiness (student_id, resume_status, linkedin_status, passport_status, driving_license_status, pan_card_status, aadhaar_card_status)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153128'),
    'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE'
)
ON CONFLICT (student_id) DO NOTHING;

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153128'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153128'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153128'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153128'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153128'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153128'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153128'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153128'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153128'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153128'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153129'),
    'EXCEL_ALL_STUDENTS', 'RINO M REJI', '25153129', '9846723677', '25153129',
    'EXACT_MATCH', 'Exact registration number match'
);

INSERT INTO public.career_readiness (student_id, resume_status, linkedin_status, passport_status, driving_license_status, pan_card_status, aadhaar_card_status)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153129'),
    'AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE'
)
ON CONFLICT (student_id) DO NOTHING;

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153129'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153129'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153129'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153129'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153129'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153129'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    1, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153129'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153129'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153129'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153129'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153130'),
    'EXCEL_ALL_STUDENTS', 'Roshan Jerald', '25153130', '9902053328', '25153130',
    'EXACT_MATCH', 'Exact registration number match'
);

INSERT INTO public.career_readiness (student_id, resume_status, linkedin_status, passport_status, driving_license_status, pan_card_status, aadhaar_card_status)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153130'),
    'NOT_REPORTED', 'NOT_REPORTED', 'AVAILABLE', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE'
)
ON CONFLICT (student_id) DO NOTHING;

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153130'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153130'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153130'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153130'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153130'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153130'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153130'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153130'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153130'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153130'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153133'),
    'EXCEL_ALL_STUDENTS', 'S.Manasseh Paul', '25153133', '9390586304', '25153133',
    'EXACT_MATCH', 'Exact registration number match'
);

INSERT INTO public.career_readiness (student_id, resume_status, linkedin_status, passport_status, driving_license_status, pan_card_status, aadhaar_card_status)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153133'),
    'NOT_REPORTED', 'NOT_REPORTED', 'NOT_REPORTED', 'NOT_REPORTED', 'NOT_REPORTED', 'AVAILABLE'
)
ON CONFLICT (student_id) DO NOTHING;

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153133'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153133'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153133'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153133'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153133'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153133'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153133'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153133'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153133'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153133'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153132'),
    'EXCEL_ALL_STUDENTS', 'Sai Vishnu A', '25153132', '7338785729', '25153132',
    'EXACT_MATCH', 'Exact registration number match'
);

INSERT INTO public.career_readiness (student_id, resume_status, linkedin_status, passport_status, driving_license_status, pan_card_status, aadhaar_card_status)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153132'),
    'NOT_REPORTED', 'NOT_REPORTED', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE'
)
ON CONFLICT (student_id) DO NOTHING;

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153132'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153132'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153132'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153132'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153132'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153132'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153132'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153132'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153132'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153132'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153131'),
    'EXCEL_ALL_STUDENTS', 'SAISARAN S', '25153131', '7397305143', '25153131',
    'EXACT_MATCH', 'Exact registration number match'
);

INSERT INTO public.career_readiness (student_id, resume_status, linkedin_status, passport_status, driving_license_status, pan_card_status, aadhaar_card_status)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153131'),
    'NOT_REPORTED', 'AVAILABLE', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE'
)
ON CONFLICT (student_id) DO NOTHING;

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153131'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153131'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153131'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153131'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153131'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153131'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153131'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    1, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153131'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153131'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153131'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153134'),
    'EXCEL_ALL_STUDENTS', 'Sradha Manoj', '25153134', '8304905130', '25153134',
    'EXACT_MATCH', 'Exact registration number match'
);

INSERT INTO public.career_readiness (student_id, resume_status, linkedin_status, passport_status, driving_license_status, pan_card_status, aadhaar_card_status)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153134'),
    'NOT_REPORTED', 'NOT_REPORTED', 'AVAILABLE', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE'
)
ON CONFLICT (student_id) DO NOTHING;

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153134'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153134'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153134'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153134'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153134'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153134'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153134'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153134'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153134'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153134'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153135'),
    'EXCEL_ALL_STUDENTS', 'Syed Ahamed M N', '25153135', '7092525845', '25153135',
    'EXACT_MATCH', 'Exact registration number match'
);

INSERT INTO public.career_readiness (student_id, resume_status, linkedin_status, passport_status, driving_license_status, pan_card_status, aadhaar_card_status)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153135'),
    'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE'
)
ON CONFLICT (student_id) DO NOTHING;

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153135'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153135'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153135'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153135'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153135'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153135'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153135'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153135'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153135'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153135'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153136'),
    'EXCEL_ALL_STUDENTS', 'Venkatesan S', '25153136', '7200024383', '25153136',
    'EXACT_MATCH', 'Exact registration number match'
);

INSERT INTO public.career_readiness (student_id, resume_status, linkedin_status, passport_status, driving_license_status, pan_card_status, aadhaar_card_status)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153136'),
    'NOT_REPORTED', 'AVAILABLE', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE'
)
ON CONFLICT (student_id) DO NOTHING;

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153136'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153136'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153136'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153136'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153136'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153136'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153136'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153136'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153136'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153136'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153137'),
    'EXCEL_ALL_STUDENTS', 'VIJAY S', '25143137', '8088622672', '25153137',
    'TYPO_CORRECTED', 'Digit typo ''14'' instead of ''15''; matched name Vijay S'
);

INSERT INTO public.career_readiness (student_id, resume_status, linkedin_status, passport_status, driving_license_status, pan_card_status, aadhaar_card_status)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153137'),
    'NOT_REPORTED', 'NOT_REPORTED', 'NOT_REPORTED', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE'
)
ON CONFLICT (student_id) DO NOTHING;

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153137'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153137'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153137'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153137'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153137'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153137'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153137'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153137'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153137'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153137'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    5, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.student_identities_audit (student_id, source_dataset, raw_name, raw_reg_no, raw_phone, canonical_reg_no, resolution_status, resolution_rationale)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153138'),
    'EXCEL_ALL_STUDENTS', 'VUPPU BHAVASRI', '25153138', '7981936455', '25153138',
    'EXACT_MATCH', 'Exact registration number match'
);

INSERT INTO public.career_readiness (student_id, resume_status, linkedin_status, passport_status, driving_license_status, pan_card_status, aadhaar_card_status)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153138'),
    'AVAILABLE', 'AVAILABLE', 'NOT_REPORTED', 'NOT_REPORTED', 'AVAILABLE', 'AVAILABLE'
)
ON CONFLICT (student_id) DO NOTHING;

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153138'),
    (SELECT id FROM public.skills WHERE slug = 'communication'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153138'),
    (SELECT id FROM public.skills WHERE slug = 'english'),
    3, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153138'),
    (SELECT id FROM public.skills WHERE slug = 'leadership'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153138'),
    (SELECT id FROM public.skills WHERE slug = 'teamwork'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153138'),
    (SELECT id FROM public.skills WHERE slug = 'problem-solving'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153138'),
    (SELECT id FROM public.skills WHERE slug = 'computer-skills'),
    2, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153138'),
    (SELECT id FROM public.skills WHERE slug = 'public-speaking'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153138'),
    (SELECT id FROM public.skills WHERE slug = 'confidence'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153138'),
    (SELECT id FROM public.skills WHERE slug = 'time-management'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153138'),
    (SELECT id FROM public.skills WHERE slug = 'discipline'),
    4, 'SELF_REPORTED', 'Baseline from MH Cockpit student questionnaire', 'STUDENT_REPORTED'
);

-- 6. Ingest Historical Sessions & POAs from mentor-backup-2026-08-19.json

INSERT INTO public.sessions (student_id, mentor_id, session_date, focus_area, observations, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153101'),
    (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1),
    '2026-07-28', 'General Mentoring', 'Need to work on time management, discussed Career Goals', 'MENTOR_ENTERED'
);

INSERT INTO public.milestones (student_id, title, status, success_criteria, target_date, is_ai_suggested, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153101'),
    'Research and practice ATC mock simulations to improve Communication skills', 'ACTIVE', 'Fulfill agreed action step verified by mentor', NULL,
    true, 'MENTOR_ENTERED'
);

INSERT INTO public.student_career_goals (student_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153101'),
    'Air Traffic Controller (ATC)', true, 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153101'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Strong academics', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153101'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Communication', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153101'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Confident speaker', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153101'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Quick learner', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153101'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Creativity', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153101'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Good grooming', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153101'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Hard-working', 'HISTORICAL_PROFILE'
);

INSERT INTO public.sessions (student_id, mentor_id, session_date, focus_area, observations, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153102'),
    (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1),
    '2026-07-28', 'Improve attendance', 'Discussed on internship, needs to improve attendance and regain focus', 'MENTOR_ENTERED'
);

INSERT INTO public.milestones (student_id, title, status, success_criteria, target_date, is_ai_suggested, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153102'),
    'Attend all classes for the next 4 weeks to improve attendance consistency', 'ACTIVE', 'Fulfill agreed action step verified by mentor', NULL,
    true, 'MENTOR_ENTERED'
);

INSERT INTO public.student_career_goals (student_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153102'),
    'Airport Operations', true, 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153102'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Communication', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153102'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Confident speaker', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153102'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Teamwork', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153102'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Leadership', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153102'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Multilingual', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153102'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Calm under pressure', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153102'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Initiative', 'HISTORICAL_PROFILE'
);

INSERT INTO public.sessions (student_id, mentor_id, session_date, focus_area, observations, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153103'),
    (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1),
    '2026-07-28', 'Need to improve attendance', 'Discussed on joining for CPL', 'MENTOR_ENTERED'
);

INSERT INTO public.milestones (student_id, title, status, success_criteria, target_date, is_ai_suggested, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153103'),
    'Set aside dedicated time for self-study and review of aeronautical science materials', 'ACTIVE', 'Fulfill agreed action step verified by mentor', NULL,
    true, 'MENTOR_ENTERED'
);

INSERT INTO public.student_career_goals (student_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153103'),
    'Pilot — CPL/ATPL track', true, 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153103'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Discipline', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153103'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Punctuality', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153103'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Attention to detail', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153103'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Self-motivated', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153103'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Creativity', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153103'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Calm under pressure', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153103'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Well-organised', 'HISTORICAL_PROFILE'
);

INSERT INTO public.sessions (student_id, mentor_id, session_date, focus_area, observations, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153104'),
    (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1),
    '2026-07-28', 'Confident Communication', 'Discussed on earlier grooming incident, wants to become a flight dispatcher', 'MENTOR_ENTERED'
);

INSERT INTO public.milestones (student_id, title, status, success_criteria, target_date, is_ai_suggested, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153104'),
    'Research and list required certifications for a flight dispatcher in India', 'ACTIVE', 'Fulfill agreed action step verified by mentor', NULL,
    true, 'MENTOR_ENTERED'
);

INSERT INTO public.student_career_goals (student_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153104'),
    'Flight Dispatcher', true, 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153104'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Discipline', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153104'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Punctuality', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153104'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Hard-working', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153104'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Self-motivated', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153104'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Quick learner', 'HISTORICAL_PROFILE'
);

INSERT INTO public.sessions (student_id, mentor_id, session_date, focus_area, observations, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153105'),
    (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1),
    '2026-07-28', 'ATC knowledge', 'Discussed on internship and grades', 'MENTOR_ENTERED'
);

INSERT INTO public.milestones (student_id, title, status, success_criteria, target_date, is_ai_suggested, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153105'),
    'Research and join online forums for air traffic controllers to improve general awareness', 'ACTIVE', 'Fulfill agreed action step verified by mentor', NULL,
    true, 'MENTOR_ENTERED'
);

INSERT INTO public.student_career_goals (student_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153105'),
    'Air Traffic Controller (ATC)', true, 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153105'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Strong academics', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153105'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Communication', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153105'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Confident speaker', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153105'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Teamwork', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153105'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Discipline', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153105'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Punctuality', 'HISTORICAL_PROFILE'
);

INSERT INTO public.sessions (student_id, mentor_id, session_date, focus_area, observations, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153107'),
    (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1),
    '2026-07-28', 'Clear Career Goal', 'Discussed on career goals, changed goal from PILOT to FLIGHT DISPATCHER', 'MENTOR_ENTERED'
);

INSERT INTO public.milestones (student_id, title, status, success_criteria, target_date, is_ai_suggested, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153107'),
    'Join a study group to increase technical depth and stay organized', 'ACTIVE', 'Fulfill agreed action step verified by mentor', NULL,
    true, 'MENTOR_ENTERED'
);

INSERT INTO public.student_career_goals (student_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153107'),
    'Flight Dispatcher', true, 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153107'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Strong academics', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153107'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Communication', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153107'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Confident speaker', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153107'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Discipline', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153107'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Quick learner', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153107'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Well-organised', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153107'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Good English', 'HISTORICAL_PROFILE'
);

INSERT INTO public.sessions (student_id, mentor_id, session_date, focus_area, observations, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153109'),
    (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1),
    '2026-07-28', 'ATC knowledge', 'Discussed about ATC prep', 'MENTOR_ENTERED'
);

INSERT INTO public.milestones (student_id, title, status, success_criteria, target_date, is_ai_suggested, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153109'),
    'Research and create a list of air traffic control procedures to study', 'ACTIVE', 'Fulfill agreed action step verified by mentor', NULL,
    true, 'MENTOR_ENTERED'
);

INSERT INTO public.student_career_goals (student_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153109'),
    'Air Traffic Controller (ATC)', true, 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153109'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Strong academics', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153109'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Teamwork', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153109'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Discipline', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153109'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Attention to detail', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153109'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Well-organised', 'HISTORICAL_PROFILE'
);

INSERT INTO public.sessions (student_id, mentor_id, session_date, focus_area, observations, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153110'),
    (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1),
    '2026-08-06', 'Regulation', 'Discussed on his career goals and the next plan of action', 'MENTOR_ENTERED'
);

INSERT INTO public.milestones (student_id, title, status, success_criteria, target_date, is_ai_suggested, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153110'),
    'Research and create a list of key DGCA regulations', 'ACTIVE', 'Fulfill agreed action step verified by mentor', NULL,
    true, 'MENTOR_ENTERED'
);

INSERT INTO public.student_career_goals (student_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153110'),
    'Flight Dispatcher', true, 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153110'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Strong academics', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153110'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Confident speaker', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153110'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Communication', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153110'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Teamwork', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153110'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Practical/hands-on', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153110'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Quick learner', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153110'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Good English', 'HISTORICAL_PROFILE'
);

INSERT INTO public.sessions (student_id, mentor_id, session_date, focus_area, observations, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153111'),
    (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1),
    '2026-08-06', 'Problem solving', 'Discussed on career goals and road to CPL', 'MENTOR_ENTERED'
);

INSERT INTO public.milestones (student_id, title, status, success_criteria, target_date, is_ai_suggested, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153111'),
    'Enroll in a decision-making and situational awareness workshop', 'ACTIVE', 'Fulfill agreed action step verified by mentor', NULL,
    true, 'MENTOR_ENTERED'
);

INSERT INTO public.milestones (student_id, title, status, success_criteria, target_date, is_ai_suggested, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153111'),
    'Meet with a licensed pilot for career guidance and mentorship', 'ACTIVE', 'Fulfill agreed action step verified by mentor', NULL,
    true, 'MENTOR_ENTERED'
);

INSERT INTO public.student_career_goals (student_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153111'),
    'Pilot — CPL/ATPL track', true, 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153111'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: ACADEMIC BRILLIANCE', 'HISTORICAL_PROFILE'
);

INSERT INTO public.sessions (student_id, mentor_id, session_date, focus_area, observations, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153112'),
    (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1),
    '2026-08-06', 'Communication', 'Discussed about career goals and ambition', 'MENTOR_ENTERED'
);

INSERT INTO public.milestones (student_id, title, status, success_criteria, target_date, is_ai_suggested, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153112'),
    'Attend communication skills workshop', 'ACTIVE', 'Fulfill agreed action step verified by mentor', NULL,
    true, 'MENTOR_ENTERED'
);

INSERT INTO public.student_career_goals (student_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153112'),
    'Air Traffic Controller (ATC)', true, 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153112'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Mathematics aptitude', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153112'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Strong academics', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153112'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Attention to detail', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153112'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Discipline', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153112'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Teamwork', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153112'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Calm under pressure', 'HISTORICAL_PROFILE'
);

INSERT INTO public.sessions (student_id, mentor_id, session_date, focus_area, observations, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153113'),
    (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1),
    '2026-08-06', 'Communication', 'Discussed on areas where he is struggling', 'MENTOR_ENTERED'
);

INSERT INTO public.milestones (student_id, title, status, success_criteria, target_date, is_ai_suggested, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153113'),
    'Schedule a meeting with the mentor to review progress and set new goals', 'ACTIVE', 'Fulfill agreed action step verified by mentor', NULL,
    true, 'MENTOR_ENTERED'
);

INSERT INTO public.student_career_goals (student_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153113'),
    'Pilot — CPL/ATPL track', true, 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153113'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Strong academics', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153113'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Physics aptitude', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153113'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Discipline', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153113'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Punctuality', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153113'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Quick learner', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153113'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Calm under pressure', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153113'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Good English', 'HISTORICAL_PROFILE'
);

INSERT INTO public.sessions (student_id, mentor_id, session_date, focus_area, observations, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153114'),
    (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1),
    '2026-08-06', 'Certifications', 'Very good in academics, discussed on her low attendance and encouraged to improve', 'MENTOR_ENTERED'
);

INSERT INTO public.milestones (student_id, title, status, success_criteria, target_date, is_ai_suggested, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153114'),
    'Enroll in an online course for aircraft systems and weather', 'ACTIVE', 'Fulfill agreed action step verified by mentor', NULL,
    true, 'MENTOR_ENTERED'
);

INSERT INTO public.milestones (student_id, title, status, success_criteria, target_date, is_ai_suggested, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153114'),
    'Meet with a licensed pilot for career guidance and advice', 'ACTIVE', 'Fulfill agreed action step verified by mentor', NULL,
    true, 'MENTOR_ENTERED'
);

INSERT INTO public.student_career_goals (student_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153114'),
    'Pilot — CPL/ATPL track', true, 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153114'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Strong academics', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153114'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Physics aptitude', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153114'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Mathematics aptitude', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153114'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Confident speaker', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153114'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Communication', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153114'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Self-motivated', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153114'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Quick learner', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153114'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Problem solving', 'HISTORICAL_PROFILE'
);

INSERT INTO public.sessions (student_id, mentor_id, session_date, focus_area, observations, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153115'),
    (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1),
    '2026-08-19', 'Work on her english', 'Suggested her to watch movies without subtitles to improve her english', 'MENTOR_ENTERED'
);

INSERT INTO public.milestones (student_id, title, status, success_criteria, target_date, is_ai_suggested, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153115'),
    'Enroll in an aviation English course (e.g., ICAO English)', 'ACTIVE', 'Fulfill agreed action step verified by mentor', NULL,
    true, 'MENTOR_ENTERED'
);

INSERT INTO public.milestones (student_id, title, status, success_criteria, target_date, is_ai_suggested, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153115'),
    'Create a weekly study timetable to allocate fixed slots for English, simulation, and soft‑skill practice', 'ACTIVE', 'Fulfill agreed action step verified by mentor', NULL,
    true, 'MENTOR_ENTERED'
);

INSERT INTO public.student_career_goals (student_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153115'),
    'Air Traffic Controller (ATC)', true, 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153115'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Teamwork', 'HISTORICAL_PROFILE'
);

INSERT INTO public.sessions (student_id, mentor_id, session_date, focus_area, observations, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153116'),
    (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1),
    '2026-08-19', 'Told to work on sim brief', 'Language barrier, communication support needed.', 'MENTOR_ENTERED'
);

INSERT INTO public.student_career_goals (student_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153116'),
    'Air Traffic Controller (ATC)', true, 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153116'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Good team coordination', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153116'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: conflict resolution', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153116'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: motivating peers during high-stress periods.', 'HISTORICAL_PROFILE'
);

INSERT INTO public.student_career_goals (student_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153117'),
    'Air Traffic Controller (ATC)', true, 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153117'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Observing things easily', 'HISTORICAL_PROFILE'
);

INSERT INTO public.student_career_goals (student_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153118'),
    'Air Traffic Controller (ATC)', true, 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153118'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Leadership', 'HISTORICAL_PROFILE'
);

INSERT INTO public.student_career_goals (student_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153119'),
    'Air Traffic Controller (ATC)', true, 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153119'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Class presentations', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153119'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: sports ( badminton)', 'HISTORICAL_PROFILE'
);

INSERT INTO public.student_career_goals (student_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153120'),
    'Pilot — CPL/ATPL track', true, 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153120'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Sketching', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153120'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: studying', 'HISTORICAL_PROFILE'
);

INSERT INTO public.student_career_goals (student_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153121'),
    'Pilot — CPL/ATPL track', true, 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153121'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Teamwork', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153121'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: leadership', 'HISTORICAL_PROFILE'
);

INSERT INTO public.student_career_goals (student_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153122'),
    'Pilot — CPL/ATPL track', true, 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153122'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: About Aviation', 'HISTORICAL_PROFILE'
);

INSERT INTO public.student_career_goals (student_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153123'),
    'Air Traffic Controller (ATC)', true, 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153123'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Time management', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153123'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: meeting deadlines. I am good at organizing my study schedule so that my assignments are always submitted on time', 'HISTORICAL_PROFILE'
);

INSERT INTO public.student_career_goals (student_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153124'),
    'Air Traffic Controller (ATC)', true, 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153124'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Memorizing', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153124'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Chess', 'HISTORICAL_PROFILE'
);

INSERT INTO public.student_career_goals (student_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153125'),
    'Pilot — CPL/ATPL track', true, 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153125'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Good teamworker', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153125'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: lead the team properly with good plans accordingly', 'HISTORICAL_PROFILE'
);

INSERT INTO public.student_career_goals (student_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153126'),
    'Air Traffic Controller (ATC)', true, 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153126'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Good communication skills', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153126'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: quick technical learning ability.', 'HISTORICAL_PROFILE'
);

INSERT INTO public.student_career_goals (student_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153127'),
    'Pilot — CPL/ATPL track', true, 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153127'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Social being', 'HISTORICAL_PROFILE'
);

INSERT INTO public.student_career_goals (student_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153128'),
    'Pilot — CPL/ATPL track', true, 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153128'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Communication', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153129'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Ambition', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153129'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Self awareness', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153129'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Persistence', 'HISTORICAL_PROFILE'
);

INSERT INTO public.student_career_goals (student_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153130'),
    'Pilot — CPL/ATPL track', true, 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153130'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: My knowledge of aviation', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153130'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: air crashes', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153130'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: as well as my ability to grasp info', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153130'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: reflect it in exams better.', 'HISTORICAL_PROFILE'
);

INSERT INTO public.student_career_goals (student_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153131'),
    'Air Traffic Controller (ATC)', true, 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153131'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Listening', 'HISTORICAL_PROFILE'
);

INSERT INTO public.student_career_goals (student_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153132'),
    'Air Traffic Controller (ATC)', true, 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153132'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Discipline', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153132'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: confident', 'HISTORICAL_PROFILE'
);

INSERT INTO public.student_career_goals (student_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153133'),
    'Air Traffic Controller (ATC)', true, 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153133'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Sports', 'HISTORICAL_PROFILE'
);

INSERT INTO public.student_career_goals (student_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153134'),
    'Pilot — CPL/ATPL track', true, 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153134'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: teamwork', 'HISTORICAL_PROFILE'
);

INSERT INTO public.student_career_goals (student_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153135'),
    'Pilot — CPL/ATPL track', true, 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153135'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Leadership', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153136'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Negotiation', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153136'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: open to talk with anyone', 'HISTORICAL_PROFILE'
);

INSERT INTO public.student_career_goals (student_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153137'),
    'Ground Operations & Dispatch', true, 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153137'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Self confidence', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153137'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: communication', 'HISTORICAL_PROFILE'
);

INSERT INTO public.student_career_goals (student_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153138'),
    'Pilot — CPL/ATPL track', true, 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153138'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Sports', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153138'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: convincing peoples', 'HISTORICAL_PROFILE'
);

INSERT INTO public.student_career_goals (student_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153139'),
    'Ground Operations & Dispatch', true, 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153139'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: time management', 'HISTORICAL_PROFILE'
);

INSERT INTO public.student_career_goals (student_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153140'),
    'Pilot — CPL/ATPL track', true, 'HISTORICAL_PROFILE'
);

INSERT INTO public.student_career_goals (student_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153141'),
    'Air Traffic Controller (ATC)', true, 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153141'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: I am a quick learner', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153141'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: I stay committed to the goals I set for myself. I enjoy learning about aviation', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153141'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: ATC systems', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153141'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: drone technology', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153141'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: I am willing to improve continuously through self-study', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153141'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: practical experience.', 'HISTORICAL_PROFILE'
);

INSERT INTO public.student_career_goals (student_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153142'),
    'Pilot — CPL/ATPL track', true, 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153142'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: I''m good at teamwork', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153142'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: problem solving', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153142'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: able to efficiently solve an problem', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153142'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: analyse the mistake', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153142'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: rectify it', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153142'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: not repeating it again', 'HISTORICAL_PROFILE'
);

INSERT INTO public.student_career_goals (student_id, custom_role_title, is_primary, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153143'),
    'Pilot — CPL/ATPL track', true, 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153143'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: I am good at staying disciplined', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153143'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: learning quickly', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153143'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: adapting to new situations', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153143'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: remaining focused on my goals.', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '25153144'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Still figuring it out', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '23153145'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Videography', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '23153145'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: video editing', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '23153145'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: PPT presentations', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '23153145'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Photography', 'HISTORICAL_PROFILE'
);

INSERT INTO public.skill_assessments (student_id, skill_id, rating, assessment_type, notes, provenance)
VALUES (
    (SELECT id FROM public.students WHERE reg_no = '23153145'),
    (SELECT id FROM public.skills WHERE slug = 'communication' LIMIT 1), -- attached to context
    4, 'HISTORICAL_PROFILE', 'Historical profile strength: Photo editing', 'HISTORICAL_PROFILE'
);

COMMIT;
