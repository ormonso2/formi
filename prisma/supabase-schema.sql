-- FORMi - Supabase Schema SQL
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/nkdpsxofmyzysyvdqufg/sql/new
-- Supabase Auth handles users/accounts/sessions/verificationtokens automatically.

-- profiles table (extends auth.users with plan info)
CREATE TABLE IF NOT EXISTS "profiles" (
    "id" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    "name" TEXT,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- Enable RLS on profiles
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile" ON "profiles" FOR SELECT USING (auth.uid()::uuid = id);
CREATE POLICY "Users can update own profile" ON "profiles" FOR UPDATE USING (auth.uid()::uuid = id);
CREATE POLICY "Users can insert own profile" ON "profiles" FOR INSERT WITH CHECK (auth.uid()::uuid = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, plan)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'free'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- subscriptions table (Stripe)
CREATE TABLE IF NOT EXISTS "subscriptions" (
    "id" TEXT NOT NULL,
    "user_id" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    "stripe_customer_id" TEXT,
    "stripe_subscription_id" TEXT,
    "stripe_price_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'inactive',
    "plan" TEXT NOT NULL DEFAULT 'free',
    "current_period_start" TIMESTAMP(3),
    "current_period_end" TIMESTAMP(3),
    "cancel_at_period_end" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "subscriptions" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own subscriptions" ON "subscriptions" FOR SELECT USING (auth.uid()::uuid = user_id);

-- conversions table (tracking monthly usage)
CREATE TABLE IF NOT EXISTS "conversions" (
    "id" TEXT NOT NULL,
    "user_id" UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    "job_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "file_type" TEXT,
    "file_size_bytes" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "year_month" TEXT NOT NULL,
    CONSTRAINT "conversions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "conversions_user_id_year_month_idx" ON "conversions"("user_id", "year_month");
CREATE INDEX IF NOT EXISTS "conversions_created_at_idx" ON "conversions"("created_at");

ALTER TABLE "conversions" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own conversions" ON "conversions" FOR SELECT USING (auth.uid()::uuid = user_id);

-- enterprise_leads table
CREATE TABLE IF NOT EXISTS "enterprise_leads" (
    "id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "contact_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "employees" TEXT,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "enterprise_leads_pkey" PRIMARY KEY ("id")
);

-- student_verifications table
CREATE TABLE IF NOT EXISTS "student_verifications" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "school_name" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "verification_token" TEXT UNIQUE,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "approved_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "token_expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "student_verifications_pkey" PRIMARY KEY ("id")
);

-- Storage bucket for conversion files
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES ('conversions', 'conversions', false, false, 104857600, null)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Storage RLS policies: users can only access their own job files
CREATE POLICY "Users can upload own conversion files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'conversions' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can read own conversion files"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'conversions' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Service role can manage conversion files"
  ON storage.objects FOR ALL TO service_role
  USING (bucket_id = 'conversions')
  WITH CHECK (bucket_id = 'conversions');

-- Grant service role access to all tables (for API routes using service role key)
GRANT ALL ON "profiles" TO service_role;
GRANT ALL ON "subscriptions" TO service_role;
GRANT ALL ON "conversions" TO service_role;
GRANT ALL ON "enterprise_leads" TO service_role;
GRANT ALL ON "student_verifications" TO service_role;
GRANT ALL ON "profiles" TO authenticated;
GRANT SELECT, INSERT, UPDATE ON "subscriptions" TO authenticated;
GRANT SELECT, INSERT ON "conversions" TO authenticated;
