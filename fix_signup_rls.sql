-- Quick fix for signup RLS issue
-- Run this in your Supabase SQL editor if you're getting RLS errors during signup

-- Add INSERT policy for users table (if it doesn't exist)
DROP POLICY IF EXISTS "Users can insert own user record" ON users;
CREATE POLICY "Users can insert own user record"
    ON users FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Add INSERT policy for profiles table (if it doesn't exist)
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

