-- Add fee column to subjects table
ALTER TABLE public.subjects ADD COLUMN IF NOT EXISTS fee numeric DEFAULT 0;

-- Ensure the name column exists and is used
-- The name column was added in a previous migration

-- Fix the admin RLS policies to use user_metadata instead of profiles table
-- This avoids the infinite recursion issue

-- Drop and recreate subjects policies
DROP POLICY IF EXISTS "subjects_insert_admin" ON public.subjects;
DROP POLICY IF EXISTS "subjects_update_admin" ON public.subjects;
DROP POLICY IF EXISTS "subjects_delete_admin" ON public.subjects;

CREATE POLICY "subjects_insert_admin" ON public.subjects
  FOR INSERT WITH CHECK (
    (SELECT (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  );

CREATE POLICY "subjects_update_admin" ON public.subjects
  FOR UPDATE USING (
    (SELECT (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  );

CREATE POLICY "subjects_delete_admin" ON public.subjects
  FOR DELETE USING (
    (SELECT (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  );

-- Fix quizzes policies
DROP POLICY IF EXISTS "quizzes_insert_admin" ON public.quizzes;
DROP POLICY IF EXISTS "quizzes_update_admin" ON public.quizzes;
DROP POLICY IF EXISTS "quizzes_delete_admin" ON public.quizzes;

CREATE POLICY "quizzes_insert_admin" ON public.quizzes
  FOR INSERT WITH CHECK (
    (SELECT (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  );

CREATE POLICY "quizzes_update_admin" ON public.quizzes
  FOR UPDATE USING (
    (SELECT (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  );

CREATE POLICY "quizzes_delete_admin" ON public.quizzes
  FOR DELETE USING (
    (SELECT (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  );

-- Fix videos policies
DROP POLICY IF EXISTS "videos_insert_admin" ON public.videos;
DROP POLICY IF EXISTS "videos_update_admin" ON public.videos;
DROP POLICY IF EXISTS "videos_delete_admin" ON public.videos;

CREATE POLICY "videos_insert_admin" ON public.videos
  FOR INSERT WITH CHECK (
    (SELECT (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  );

CREATE POLICY "videos_update_admin" ON public.videos
  FOR UPDATE USING (
    (SELECT (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  );

CREATE POLICY "videos_delete_admin" ON public.videos
  FOR DELETE USING (
    (SELECT (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  );

-- Fix quiz_questions policies
DROP POLICY IF EXISTS "questions_insert_admin" ON public.quiz_questions;
DROP POLICY IF EXISTS "questions_update_admin" ON public.quiz_questions;
DROP POLICY IF EXISTS "questions_delete_admin" ON public.quiz_questions;

CREATE POLICY "questions_insert_admin" ON public.quiz_questions
  FOR INSERT WITH CHECK (
    (SELECT (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  );

CREATE POLICY "questions_update_admin" ON public.quiz_questions
  FOR UPDATE USING (
    (SELECT (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  );

CREATE POLICY "questions_delete_admin" ON public.quiz_questions
  FOR DELETE USING (
    (SELECT (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  );

-- Fix fee_settings policies
DROP POLICY IF EXISTS "fee_settings_insert_admin" ON public.fee_settings;
DROP POLICY IF EXISTS "fee_settings_update_admin" ON public.fee_settings;

CREATE POLICY "fee_settings_insert_admin" ON public.fee_settings
  FOR INSERT WITH CHECK (
    (SELECT (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  );

CREATE POLICY "fee_settings_update_admin" ON public.fee_settings
  FOR UPDATE USING (
    (SELECT (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  );

-- Fix payments policies for admin
DROP POLICY IF EXISTS "payments_select_admin" ON public.payments;
DROP POLICY IF EXISTS "payments_update_admin" ON public.payments;

CREATE POLICY "payments_select_admin" ON public.payments
  FOR SELECT USING (
    (SELECT (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  );

CREATE POLICY "payments_update_admin" ON public.payments
  FOR UPDATE USING (
    (SELECT (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  );

-- Fix student_subject_access policies for admin
DROP POLICY IF EXISTS "access_select_admin" ON public.student_subject_access;
DROP POLICY IF EXISTS "access_insert_admin" ON public.student_subject_access;
DROP POLICY IF EXISTS "access_delete_admin" ON public.student_subject_access;

CREATE POLICY "access_select_admin" ON public.student_subject_access
  FOR SELECT USING (
    (SELECT (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  );

CREATE POLICY "access_insert_admin" ON public.student_subject_access
  FOR INSERT WITH CHECK (
    (SELECT (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  );

CREATE POLICY "access_delete_admin" ON public.student_subject_access
  FOR DELETE USING (
    (SELECT (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  );

-- Fix messages policies for admin
DROP POLICY IF EXISTS "messages_select_admin" ON public.messages;

CREATE POLICY "messages_select_admin" ON public.messages
  FOR SELECT USING (
    (SELECT (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  );
