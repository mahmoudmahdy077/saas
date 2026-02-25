-- MedLog Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create auth schema for Gotrue
CREATE SCHEMA IF NOT EXISTS auth;

-- Grant auth schema permissions
GRANT USAGE ON SCHEMA auth TO anon, authenticated, service_role;
GRANT ALL ON SCHEMA auth TO anon, authenticated, service_role;

-- Create anon role for PostgREST
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN;
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN;
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role NOLOGIN;
  END IF;
END
$$;

-- Grant schema usage
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

-- Grant table permissions
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('resident', 'consultant', 'program_director', 'institution_admin', 'super_admin')) DEFAULT 'resident',
  specialty_id UUID,
  institution_id UUID,
  notification_settings JSONB DEFAULT '{"reminder_enabled": true, "reminder_time": "21:00", "vacation_mode": false, "skip_weekends": false}',
  timezone TEXT DEFAULT 'UTC',
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_logged_date DATE,
  streak_freeze_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Institutions table
CREATE TABLE public.institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  admin_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Specialties table
CREATE TABLE public.specialties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Templates table
CREATE TABLE public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('universal', 'specialty', 'institution')),
  owner_id UUID,
  fields JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cases table
CREATE TABLE public.cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  specialty_id UUID REFERENCES public.specialties(id) ON DELETE SET NULL,
  template_id UUID REFERENCES public.templates(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  procedure_type TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  role TEXT NOT NULL CHECK (role IN ('primary', 'assistant', 'observer')),
  patient_demographics JSONB DEFAULT '{"age": 0, "gender": "prefer-not-to-say"}',
  diagnosis TEXT,
  complications TEXT[] DEFAULT '{}',
  notes TEXT,
  custom_fields JSONB DEFAULT '{}',
  ai_summary TEXT,
  verification_status TEXT CHECK (verification_status IN ('self', 'consultant_verified', 'pd_approved')) DEFAULT 'self',
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Share links table
CREATE TABLE public.share_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('time_limited', 'permanent', 'password_protected')),
  expires_at TIMESTAMP WITH TIME ZONE,
  password_hash TEXT,
  permissions TEXT NOT NULL CHECK (permissions IN ('view', 'edit', 'export')),
  access_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invites table
CREATE TABLE public.invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('resident', 'consultant', 'program_director')),
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports table
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_director_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL CHECK (type IN ('monthly', 'annual')),
  period TEXT NOT NULL,
  case_count INTEGER DEFAULT 0,
  ai_insights TEXT,
  grades JSONB DEFAULT '{}',
  pd_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('reminder', 'streak', 'achievement', 'gap_alert', 'verification')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_profiles_institution ON public.profiles(institution_id);
CREATE INDEX IF NOT EXISTS idx_profiles_specialty ON public.profiles(specialty_id);
CREATE INDEX IF NOT EXISTS idx_cases_user ON public.cases(user_id);
CREATE INDEX IF NOT EXISTS idx_cases_specialty ON public.cases(specialty_id);
CREATE INDEX IF NOT EXISTS idx_cases_date ON public.cases(date);
CREATE INDEX IF NOT EXISTS idx_share_links_token ON public.share_links(token);
CREATE INDEX IF NOT EXISTS idx_invites_token ON public.invites(token);
CREATE INDEX IF NOT EXISTS idx_reports_resident ON public.reports(resident_id);

-- RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.share_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Institution staff can view resident profiles" ON public.profiles
  FOR SELECT USING (
    (SELECT institution_id FROM public.profiles WHERE id = auth.uid()) = profiles.institution_id
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('program_director', 'institution_admin')
  );

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Institutions policies
CREATE POLICY "Institution members can view institution" ON public.institutions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND institution_id = public.institutions.id
    )
  );

CREATE POLICY "Only institution admins can update institution" ON public.institutions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND institution_id = public.institutions.id AND role = 'institution_admin'
    )
  );

-- Cases policies
CREATE POLICY "Users can view own cases" ON public.cases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authorized verifiers can view cases" ON public.cases
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.institution_id = (SELECT p2.institution_id FROM public.profiles p2 WHERE p2.id = public.cases.user_id)
      AND p.role IN ('program_director', 'consultant')
    )
  );

CREATE POLICY "Users can insert own cases" ON public.cases
  FOR INSERT WITH CHECK (
    auth.uid() = user_id 
    AND (verification_status = 'self' OR verification_status IS NULL)
  );

CREATE POLICY "Users can update own unverified cases" ON public.cases
  FOR UPDATE USING (
    auth.uid() = user_id 
    AND verification_status = 'self'
  );

CREATE POLICY "Verifiers can update verification status" ON public.cases
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.institution_id = (SELECT p2.institution_id FROM public.profiles p2 WHERE p2.id = public.cases.user_id)
      AND p.role IN ('program_director', 'consultant')
    )
  )
  WITH CHECK (
    auth.uid() != user_id
  );

CREATE POLICY "Users can delete own unverified cases" ON public.cases
  FOR DELETE USING (auth.uid() = user_id AND verification_status = 'self');

-- Specialties policies
CREATE POLICY "Anyone can view specialties" ON public.specialties
  FOR SELECT USING (true);

-- Templates policies
CREATE POLICY "Anyone can view templates" ON public.templates
  FOR SELECT USING (true);

-- Invites policies
CREATE POLICY "Users can view own invites" ON public.invites
  FOR SELECT USING (auth.uid() = sender_id);

CREATE POLICY "Users can create invites" ON public.invites
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Share links policies
CREATE POLICY "Users can view own share links" ON public.share_links
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create share links" ON public.share_links
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Reports policies
CREATE POLICY "Users can view own reports" ON public.reports
  FOR SELECT USING (auth.uid() = resident_id);

CREATE POLICY "PDs can view department reports" ON public.reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.institution_id = (SELECT p2.institution_id FROM public.profiles p2 WHERE p2.id = public.reports.resident_id)
      AND p.role = 'program_director'
    )
  );

CREATE POLICY "PDs can manage reports" ON public.reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.institution_id = (SELECT p2.institution_id FROM public.profiles p2 WHERE p2.id = public.reports.resident_id)
      AND p.role = 'program_director'
    )
  );

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Trigger for verification safety
CREATE OR REPLACE FUNCTION public.validate_case_verification()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent self-verification
  if NEW.verification_status != 'self' AND NEW.user_id = auth.uid() THEN
    RAISE EXCEPTION 'Users cannot verify their own cases';
  END IF;
  
  -- Set verified_by and verified_at automatically
  IF NEW.verification_status != OLD.verification_status AND NEW.verification_status IN ('consultant_verified', 'pd_approved') THEN
    NEW.verified_by := auth.uid();
    NEW.verified_at := NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_case_verification_update
  BEFORE UPDATE ON public.cases
  FOR EACH ROW
  WHEN (OLD.verification_status IS DISTINCT FROM NEW.verification_status)
  EXECUTE FUNCTION public.validate_case_verification();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'resident')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant auth schema usage
GRANT USAGE ON SCHEMA auth TO anon;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO service_role;

GRANT SELECT ON ALL TABLES IN SCHEMA auth TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA auth TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA auth TO service_role;

-- Insert universal template
INSERT INTO public.templates (name, type, fields)
VALUES (
  'Universal Medical Case Template',
  'universal',
  '[
    {"name": "date", "label": "Date", "type": "date", "required": true},
    {"name": "procedure_type", "label": "Procedure Type", "type": "text", "required": true},
    {"name": "category", "label": "Category", "type": "select", "required": true, "options": ["General Surgery", "Orthopedics", "Internal Medicine", "Pediatrics", "Other"]},
    {"name": "role", "label": "Role", "type": "select", "required": true, "options": ["Primary", "Assistant", "Observer"]},
    {"name": "diagnosis", "label": "Diagnosis", "type": "text", "required": false},
    {"name": "complications", "label": "Complications", "type": "multiselect", "required": false, "options": ["None", "Bleeding", "Infection", "Other"]},
    {"name": "notes", "label": "Notes", "type": "text", "required": false}
  ]'
);

-- Insert default specialties
INSERT INTO public.specialties (name, description) VALUES
('General Surgery', 'General surgical procedures'),
('Orthopedics', 'Orthopedic surgery and musculoskeletal procedures'),
('Internal Medicine', 'Internal medicine cases and procedures'),
('Pediatrics', 'Pediatric cases'),
('Obstetrics & Gynecology', 'OB/GYN procedures'),
('Psychiatry', 'Psychiatric cases'),
('Radiology', 'Radiology studies and procedures'),
('Anesthesiology', 'Anesthesia cases'),
('Emergency Medicine', 'Emergency department cases'),
('Cardiology', 'Cardiac procedures'),
('Neurology', 'Neurological procedures'),
('Other', 'Other specialties');

-- ============================================
-- SUPER ADMIN TABLES
-- ============================================

-- Website Settings
CREATE TABLE public.website_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- AI Providers Configuration
CREATE TABLE public.ai_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (name IN ('openai', 'openrouter', 'ollama')),
  api_key TEXT,
  api_url TEXT,
  model TEXT DEFAULT 'gpt-3.5-turbo',
  is_active BOOLEAN DEFAULT false,
  is_default BOOLEAN DEFAULT false,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Bans
CREATE TABLE public.user_bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT,
  banned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  banned_until TIMESTAMP WITH TIME ZONE,
  banned_by UUID REFERENCES auth.users(id),
  is_permanent BOOLEAN DEFAULT false
);

-- System Notifications (bulk notifications from admin)
CREATE TABLE public.system_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'alert', 'maintenance')),
  target_roles TEXT[] DEFAULT ARRAY['resident'],
  target_users UUID[] DEFAULT NULL,
  target_institutions UUID[] DEFAULT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE
);

-- Payment/Subscription Settings
CREATE TABLE public.payment_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL CHECK (provider IN ('stripe')),
  stripe_secret_key TEXT,
  stripe_webhook_secret TEXT,
  stripe_price_ids JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT false,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Institution Subscription Limits
CREATE TABLE public.institution_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'basic', 'pro', 'enterprise')),
  max_residents INTEGER DEFAULT 5,
  max_cases_per_resident INTEGER DEFAULT 100,
  ai_features_enabled BOOLEAN DEFAULT false,
  custom_branding BOOLEAN DEFAULT false,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT DEFAULT 'active',
  current_period_start DATE,
  current_period_end DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default website settings
INSERT INTO public.website_settings (key, value, description) VALUES
('site_name', '"MedLog"', 'Website name'),
('site_title', '"Surgical & Medical Case E-Logbook"', 'Website title'),
('site_logo', 'null', 'Website logo URL'),
('site_favicon', 'null', 'Website favicon URL'),
('ai_enabled', 'true', 'Enable AI features'),
('maintenance_mode', 'false', 'Enable maintenance mode'),
('allow_registration', 'true', 'Allow new user registrations');

-- Insert default AI provider (disabled)
INSERT INTO public.ai_providers (name, is_active, is_default, model) VALUES
('openai', false, false, 'gpt-3.5-turbo'),
('openrouter', false, false, 'openai/gpt-3.5-turbo'),
('ollama', false, false, 'llama2');

-- Insert default payment settings
INSERT INTO public.payment_settings (provider, is_active) VALUES
('stripe', false);
