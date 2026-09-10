-- ==============================================================================
-- Migration: Create sanitized_submissions table with Row Level Security (RLS)
-- Description: Enforces server-side sanitization architecture by restricting
--              direct client browser INSERTs and providing SELECT privileges.
-- ==============================================================================

-- 1. Create Table
CREATE TABLE IF NOT EXISTS public.sanitized_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Add Constraints & Indexes
CREATE INDEX IF NOT EXISTS idx_sanitized_submissions_email ON public.sanitized_submissions (email);
CREATE INDEX IF NOT EXISTS idx_sanitized_submissions_created_at ON public.sanitized_submissions (created_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.sanitized_submissions ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Security Policies

-- Policy 1: Allow public/anon read access for dashboard display
CREATE POLICY "Allow public read access for dashboard"
    ON public.sanitized_submissions
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Policy 2: Restrict direct INSERT access from client browsers
-- Anonymous client keys CANNOT insert directly. 
-- Only Supabase Edge Functions with service_role privileges can insert.
CREATE POLICY "Allow service role insert only"
    ON public.sanitized_submissions
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Comment for Documentation
COMMENT ON TABLE public.sanitized_submissions IS 
'Stores sanitized and validated user submissions. Direct browser insertions are blocked by RLS.';
