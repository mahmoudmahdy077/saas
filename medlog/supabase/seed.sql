-- Seed Demo Accounts
-- Note: Roles and schemas are already created/migrated.

-- 1. Create a default Institution
INSERT INTO public.institutions (id, name)
VALUES ('00000000-0000-0000-0000-000000000001', 'MedLog Demo University Hospital')
ON CONFLICT (id) DO NOTHING;

-- 2. Create demo users using signup API (password: medlog2024)
-- This ensures all required fields are properly set

-- 3. Profiles
INSERT INTO public.profiles (id, email, full_name, role, institution_id) VALUES 
  ('00000000-0000-0000-0000-000000000005', 'superadmin@medlog.demo', 'System Super Admin', 'super_admin', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000010', 'admin@medlog.demo', 'Dr. Admin User', 'institution_admin', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000020', 'pd@medlog.demo', 'Dr. Program Director', 'program_director', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000030', 'resident@medlog.demo', 'Dr. Medical Resident', 'resident', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000040', 'consultant@medlog.demo', 'Dr. Senior Consultant', 'consultant', '00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- 4. Update Specialties and Streaks
DO $$ 
BEGIN
    UPDATE public.profiles 
    SET specialty_id = (SELECT id FROM public.specialties WHERE name = 'General Surgery' LIMIT 1) 
    WHERE email IN ('pd@medlog.demo', 'resident@medlog.demo');
END $$;

-- 5. Fix auth.users role (must be 'authenticated', not empty string)
UPDATE auth.users SET role = 'authenticated' WHERE role = '';
