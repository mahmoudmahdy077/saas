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
  logo_url TEXT,
  primary_color TEXT DEFAULT '#2563eb',
  secondary_color TEXT DEFAULT '#64748b',
  accent_color TEXT DEFAULT '#10b981',
  custom_css TEXT,
  custom_domain TEXT,
  white_label_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SAML Configuration
CREATE TABLE IF NOT EXISTS public.saml_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  idp_entity_id TEXT,
  idp_sso_url TEXT,
  idp_certificate TEXT,
  sp_entity_id TEXT,
  acs_url TEXT,
  name_id_format TEXT DEFAULT 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
  enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API Keys
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key TEXT UNIQUE NOT NULL,
  can_read BOOLEAN DEFAULT true,
  can_write BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_api_keys_key ON public.api_keys(key);
CREATE INDEX idx_api_keys_user ON public.api_keys(user_id);

-- Webhooks
CREATE TABLE IF NOT EXISTS public.webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  events JSONB NOT NULL DEFAULT '[]',
  secret TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Portfolios
CREATE TABLE IF NOT EXISTS public.portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT false,
  share_token TEXT UNIQUE,
  title TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Portfolio Publications/Conferences
CREATE TABLE IF NOT EXISTS public.portfolio_publications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('publication', 'presentation', 'award', 'research')),
  journal TEXT,
  date DATE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reference Letters
CREATE TABLE IF NOT EXISTS public.reference_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'declined')),
  letter_content TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- OAuth Applications
CREATE TABLE IF NOT EXISTS public.oauth_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  client_id TEXT UNIQUE NOT NULL,
  client_secret TEXT NOT NULL,
  redirect_uris JSONB NOT NULL DEFAULT '[]',
  scopes JSONB NOT NULL DEFAULT '["read"]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- OAuth Authorization Codes
CREATE TABLE IF NOT EXISTS public.oauth_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  client_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  redirect_uri TEXT NOT NULL,
  scope TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- OAuth Access Tokens
CREATE TABLE IF NOT EXISTS public.oauth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  access_token TEXT UNIQUE NOT NULL,
  refresh_token TEXT UNIQUE,
  scope TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Custom Dashboards
CREATE TABLE IF NOT EXISTS public.dashboard_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  widgets JSONB NOT NULL DEFAULT '[]',
  layout JSONB NOT NULL DEFAULT '[]',
  is_default BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
  type TEXT NOT NULL CHECK (type IN ('reminder', 'streak', 'achievement', 'gap_alert', 'verification', 'milestone', 'subscription', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification Preferences
CREATE TABLE public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT true,
  reminder_enabled BOOLEAN DEFAULT true,
  streak_alerts BOOLEAN DEFAULT true,
  gap_alerts BOOLEAN DEFAULT true,
  verification_reminders BOOLEAN DEFAULT true,
  milestone_alerts BOOLEAN DEFAULT true,
  subscription_alerts BOOLEAN DEFAULT true,
  digest_frequency TEXT DEFAULT 'daily' CHECK (digest_frequency IN ('immediate', 'daily', 'weekly')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email Queue for scheduled emails
CREATE TABLE public.email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Institution staff can view resident profiles" ON public.profiles
  FOR SELECT USING (
    get_auth_institution() = profiles.institution_id
    AND get_auth_role() IN ('program_director', 'institution_admin')
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

-- Notification Preferences policies
CREATE POLICY "Users can manage own notification preferences" ON public.notification_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Email Queue policies
CREATE POLICY "Users can view own email queue" ON public.email_queue
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can manage email queue" ON public.email_queue
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

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

-- AI Usage Tracking
CREATE TABLE public.ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  model TEXT,
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  cost_usd DECIMAL(10,6) DEFAULT 0,
  latency_ms INTEGER,
  action_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ai_usage_user_id ON public.ai_usage(user_id);
CREATE INDEX idx_ai_usage_institution_id ON public.ai_usage(institution_id);
CREATE INDEX idx_ai_usage_created_at ON public.ai_usage(created_at DESC);

-- AI Rate Limits
CREATE TABLE public.ai_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  daily_limit INTEGER DEFAULT 100,
  monthly_limit INTEGER DEFAULT 1000,
  current_daily_usage INTEGER DEFAULT 0,
  current_monthly_usage INTEGER DEFAULT 0,
  last_reset_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
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

-- Stripe Subscriptions (mirrors Stripe data)
CREATE TABLE public.stripe_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active',
  plan_name TEXT DEFAULT 'free',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
  stripe_invoice_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT,
  amount DECIMAL(10,2),
  currency TEXT DEFAULT 'usd',
  status TEXT DEFAULT 'pending',
  paid_at TIMESTAMP WITH TIME ZONE,
  invoice_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_institution_id ON public.audit_logs(institution_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);

-- ACGME Case Minimums
CREATE TABLE public.case_minimums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  subcategory TEXT,
  minimum_required INTEGER NOT NULL,
  description TEXT,
  accreditation_type TEXT DEFAULT 'general_surgery',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ACGME Milestones
CREATE TABLE public.milestone_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_number INTEGER NOT NULL,
  competency_area TEXT NOT NULL,
  level1_description TEXT,
  level2_description TEXT,
  level3_description TEXT,
  level4_description TEXT,
  level5_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resident Milestone Assessments
CREATE TABLE public.milestone_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_id UUID NOT NULL REFERENCES public.milestone_definitions(id) ON DELETE CASCADE,
  assessor_id UUID REFERENCES auth.users(id),
  level INTEGER CHECK (level BETWEEN 1 AND 5),
  assessment_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ACGME Compliance Reports Cache
CREATE TABLE public.acgme_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL CHECK (report_type IN ('case_volume', 'minimums', 'resident_summary', 'milestone')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  data JSONB NOT NULL,
  generated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Report Schedules
CREATE TABLE public.report_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL CHECK (report_type IN ('case_volume', 'minimums', 'resident_summary', 'milestone')),
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly')),
  recipients JSONB NOT NULL DEFAULT '[]',
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for ACGME tables
ALTER TABLE public.case_minimums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestone_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestone_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acgme_reports ENABLE ROW LEVEL SECURITY;

-- Case Minimums: Everyone can view
CREATE POLICY "Anyone can view case minimums" ON public.case_minimums
  FOR SELECT USING (true);

-- Milestone Definitions: Everyone can view
CREATE POLICY "Anyone can view milestone definitions" ON public.milestone_definitions
  FOR SELECT USING (true);

-- Milestone Assessments: Resident and PD can view/manage
CREATE POLICY "Resident and PD can manage milestone assessments" ON public.milestone_assessments
  FOR ALL USING (
    auth.uid() = resident_id
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('program_director', 'institution_admin')
    )
  );

-- ACGME Reports: PD and admins can manage
CREATE POLICY "PD and admins can manage ACGME reports" ON public.acgme_reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() 
      AND p.institution_id = acgme_reports.institution_id
      AND p.role IN ('program_director', 'institution_admin')
    )
  );

-- RLS for Stripe tables
ALTER TABLE public.stripe_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Institution members can view subscriptions" ON public.stripe_subscriptions
  FOR SELECT USING (
    institution_id IS NOT NULL AND institution_id IN (
      SELECT institution_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Institution members can view invoices" ON public.invoices
  FOR SELECT USING (
    institution_id IS NOT NULL AND institution_id IN (
      SELECT institution_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Institution admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (
    institution_id IN (
      SELECT institution_id FROM public.profiles WHERE id = auth.uid() AND role IN ('program_director', 'institution_admin')
    )
  );

CREATE POLICY "Users can view own audit logs" ON public.audit_logs
  FOR SELECT USING (
    user_id = auth.uid()
  );

-- Report Schedules RLS
ALTER TABLE public.report_schedules ENABLE ROW LEVEL SECURITY;

-- RLS for AI tables
ALTER TABLE public.ai_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_rate_limits ENABLE ROW LEVEL SECURITY;

-- AI Providers: Only super admins can manage
CREATE POLICY "Super admin can manage ai providers" ON public.ai_providers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  );

-- AI Usage: Users can view own, PDs can view institution
CREATE POLICY "Users can view own AI usage" ON public.ai_usage
  FOR SELECT USING (
    user_id = auth.uid()
    OR institution_id IN (
      SELECT institution_id FROM public.profiles WHERE id = auth.uid() AND role IN ('program_director', 'institution_admin')
    )
  );

CREATE POLICY "Users can insert own AI usage" ON public.ai_usage
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
  );

-- AI Rate Limits: Institution admins can manage
CREATE POLICY "Institution admins can manage AI rate limits" ON public.ai_rate_limits
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() 
      AND p.institution_id = ai_rate_limits.institution_id
      AND p.role IN ('program_director', 'institution_admin')
    )
  );

CREATE POLICY "PD and admins can manage report schedules" ON public.report_schedules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() 
      AND p.institution_id = report_schedules.institution_id
      AND p.role IN ('program_director', 'institution_admin')
    )
  );

-- RLS for api_keys (already enabled above)
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own api keys" ON public.api_keys
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own api keys" ON public.api_keys
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own api keys" ON public.api_keys
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own api keys" ON public.api_keys
  FOR DELETE USING (user_id = auth.uid());

-- RLS for webhooks (already enabled above)
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "PD and admins can manage webhooks" ON public.webhooks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() 
      AND p.institution_id = webhooks.institution_id
      AND p.role IN ('program_director', 'institution_admin')
    )
  );

-- RLS for portfolios
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own portfolio" ON public.portfolios
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own portfolio" ON public.portfolios
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own portfolio" ON public.portfolios
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own portfolio" ON public.portfolios
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Anyone can view public portfolios" ON public.portfolios
  FOR SELECT USING (is_public = true);

-- RLS for oauth_applications
ALTER TABLE public.oauth_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage oauth apps" ON public.oauth_applications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() 
      AND p.institution_id = oauth_applications.institution_id
      AND p.role IN ('program_director', 'institution_admin')
    )
  );

-- RLS for oauth_codes
ALTER TABLE public.oauth_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own oauth codes" ON public.oauth_codes
  FOR ALL USING (user_id = auth.uid());

-- RLS for oauth_tokens
ALTER TABLE public.oauth_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own oauth tokens" ON public.oauth_tokens
  FOR ALL USING (user_id = auth.uid());

-- RLS for reference_requests
ALTER TABLE public.reference_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reference requests" ON public.reference_requests
  FOR SELECT USING (requester_id = auth.uid() OR reference_id = auth.uid());

CREATE POLICY "Users can create reference requests" ON public.reference_requests
  FOR INSERT WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Users can update own reference requests" ON public.reference_requests
  FOR UPDATE USING (requester_id = auth.uid() OR reference_id = auth.uid());

-- RLS for dashboard_configs
ALTER TABLE public.dashboard_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Institution members can view dashboards" ON public.dashboard_configs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() 
      AND p.institution_id = dashboard_configs.institution_id
    )
  );

CREATE POLICY "PD and admins can manage dashboards" ON public.dashboard_configs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() 
      AND p.institution_id = dashboard_configs.institution_id
      AND p.role IN ('program_director', 'institution_admin')
    )
  );

-- RLS for user_bans
ALTER TABLE public.user_bans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view user bans" ON public.user_bans
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() 
      AND p.role IN ('program_director', 'institution_admin', 'super_admin')
    )
  );

CREATE POLICY "Super admins can manage user bans" ON public.user_bans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() 
      AND p.role = 'super_admin'
    )
  );

-- RLS for system_notifications
ALTER TABLE public.system_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view system notifications" ON public.system_notifications
  FOR SELECT USING (
    target_roles IS NULL OR 
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() 
      AND p.role = ANY(target_roles)
    )
  );

CREATE POLICY "Super admins can manage system notifications" ON public.system_notifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() 
      AND p.role = 'super_admin'
    )
  );

-- RLS for payment_settings
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view payment settings" ON public.payment_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() 
      AND p.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can manage payment settings" ON public.payment_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() 
      AND p.role = 'super_admin'
    )
  );

-- RLS for institution_subscriptions
ALTER TABLE public.institution_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Institution members can view subscription" ON public.institution_subscriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() 
      AND p.institution_id = institution_subscriptions.institution_id
    )
  );

CREATE POLICY "Institution admins can manage subscription" ON public.institution_subscriptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() 
      AND p.institution_id = institution_subscriptions.institution_id
      AND p.role IN ('program_director', 'institution_admin')
    )
  );

-- RLS for integrations
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view integrations" ON public.integrations
  FOR SELECT USING (true);

-- RLS for integration_configs
ALTER TABLE public.integration_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Institution members can view integration configs" ON public.integration_configs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() 
      AND p.institution_id = integration_configs.institution_id
    )
  );

CREATE POLICY "Institution admins can manage integration configs" ON public.integration_configs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() 
      AND p.institution_id = integration_configs.institution_id
      AND p.role IN ('program_director', 'institution_admin')
    )
  );

-- RLS for saml_configurations
ALTER TABLE public.saml_configurations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Institution admins can manage SAML" ON public.saml_configurations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() 
      AND p.institution_id = saml_configurations.institution_id
      AND p.role IN ('program_director', 'institution_admin')
    )
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

-- Insert ACGME Case Minimums (General Surgery - 19 categories)
INSERT INTO public.case_minimums (category, minimum_required, description) VALUES
('Cardiothoracic', 40, 'Major cases involving heart and lungs'),
('Vascular', 40, 'Major vascular procedures'),
('Colorectal', 30, 'Colorectal surgery procedures'),
('Hernia', 40, 'Inguinal, femoral, and abdominal hernias'),
('Laparoscopic', 75, 'Minimally invasive procedures'),
('Endocrine', 10, 'Thyroid, parathyroid, adrenal'),
('Breast', 25, 'Breast surgery procedures'),
('Skin and Soft Tissue', 25, 'Skin, soft tissue, and melanoma'),
('Trauma', 35, 'Emergency trauma procedures'),
('Burns', 10, 'Burn treatment procedures'),
('Pediatric', 20, 'Pediatric surgery procedures'),
('Surgical Oncology', 25, 'Oncologic surgical procedures'),
('Gastrointestinal', 50, 'GI tract procedures'),
('Hepatobiliary', 20, 'Liver, gallbladder, pancreas'),
('Renal', 15, 'Kidney and urinary tract'),
('Obstetrics', 10, 'Obstetric surgical procedures'),
('Gynecologic', 10, 'Gynecologic surgical procedures'),
('Basic Laparoscopic', 50, 'Basic laparoscopic skills'),
('Open Abdominal', 60, 'Open abdominal procedures');

-- Insert ACGME Milestones (14 Competency Areas)
INSERT INTO public.milestone_definitions (milestone_number, competency_area, level1_description, level2_description, level3_description, level4_description, level5_description) VALUES
(1, 'Patient Care', 'Incomplete history and physical', 'Complete history and physical', 'Develops care plans', 'Independently manages patients', 'Exemplary patient care'),
(2, 'Medical Knowledge', 'Limited medical knowledge', 'Basic medical knowledge', 'Applies knowledge to patient care', 'Advanced knowledge application', 'Expert medical knowledge'),
(3, 'Practice-Based Learning', 'Unable to identify learning needs', 'Identifies learning needs', 'Uses evidence-based practice', 'Leads quality improvement', 'Creates new knowledge'),
(4, 'Interpersonal Skills', 'Difficult to communicate', 'Basic communication', 'Effective communication', 'Excellent communicator', 'Master communicator'),
(5, 'Professionalism', 'Unprofessional behavior', 'Minimal professionalism', 'Professional behavior', 'Role model for professionalism', 'Leads professionalism'),
(6, 'Systems-Based Practice', 'Unaware of healthcare systems', 'Basic systems knowledge', 'Navigates systems effectively', 'Optimizes system use', 'Health system leader'),
(7, 'Technical Skills', 'Unable to perform procedures', 'Basic technical skills', 'Competent procedures', 'Independent procedures', 'Expert technical skills'),
(8, 'Leadership', 'No leadership skills', 'Emerging leadership', 'Effective leader', 'Strong leader', 'Exceptional leader'),
(9, 'Scholarly Activity', 'No scholarly activity', 'Minimal scholarly activity', 'Active in scholarly work', 'Produces scholarly work', 'National reputation'),
(10, 'Teaching', 'Unable to teach', 'Basic teaching', 'Effective teacher', 'Excellent teacher', 'Master teacher'),
(11, 'Research', 'No research experience', 'Participates in research', 'Conducts research', 'Independent research', 'Research leader'),
(12, 'Quality Improvement', 'No QI experience', 'Participates in QI', 'Leads QI projects', 'Sustained QI work', 'QI expert'),
(13, 'Patient Safety', 'Unaware of safety', 'Basic safety knowledge', 'Implements safety', 'Leads safety initiatives', 'Safety expert'),
(14, 'Professional Development', 'No development plan', 'Has development plan', 'Active development', 'Exceeds expectations', 'Career leader');

-- Integration Marketplace tables
CREATE TABLE IF NOT EXISTS public.integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  category TEXT NOT NULL CHECK (category IN ('erp', 'lms', 'hris', 'calendar', 'messaging', 'analytics', 'storage', 'other')),
  provider TEXT NOT NULL,
  website_url TEXT,
  documentation_url TEXT,
  api_base_url TEXT,
  auth_type TEXT NOT NULL CHECK (auth_type IN ('oauth2', 'apikey', 'basic', 'custom')),
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  pricing_model TEXT CHECK (pricing_model IN ('free', 'paid', 'subscription')),
  monthly_cost DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.integration_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
  integration_id UUID REFERENCES public.integrations(id) ON DELETE CASCADE,
  config JSONB NOT NULL DEFAULT '{}',
  auth_credentials JSONB,
  is_active BOOLEAN DEFAULT false,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(institution_id, integration_id)
);
