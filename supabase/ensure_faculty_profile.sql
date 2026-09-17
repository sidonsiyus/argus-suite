-- ==========================================================================
-- MENTOR OS: Ensure Faculty Profile for Test Account
-- Idempotent upsert ensuring sidonsiyus@gmail.com has instructor role
-- ==========================================================================

INSERT INTO public.profiles (id, full_name, role)
SELECT id, 'Faculty Mentor', 'instructor'
FROM auth.users
WHERE email = 'sidonsiyus@gmail.com'
ON CONFLICT (id) DO UPDATE
SET role = 'instructor';

-- Verification
SELECT 
    p.id AS profile_id,
    u.email,
    p.role,
    (p.role = 'instructor') AS is_instructor,
    (p.role IN ('instructor', 'admin')) AS passes_is_faculty
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'sidonsiyus@gmail.com';
