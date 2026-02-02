-- Fix infinite recursion in profiles RLS policies
-- The issue is that policies check the profiles table recursively

-- Drop existing problematic policies
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_select_admin" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_update_admin" on public.profiles;

-- Create a function to check if user is admin (uses auth.jwt() to avoid recursion)
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select coalesce(
    (select role = 'admin' from public.profiles where id = auth.uid()),
    false
  );
$$;

-- Create new non-recursive policies for profiles
-- Allow anyone to select their own profile
create policy "profiles_select_own" on public.profiles 
  for select using (auth.uid() = id);

-- Allow admin to select all profiles (using auth.jwt() metadata to check admin status)
create policy "profiles_select_admin" on public.profiles 
  for select using (
    (select raw_user_meta_data->>'role' from auth.users where id = auth.uid()) = 'admin'
  );

-- Allow users to update their own profile
create policy "profiles_update_own" on public.profiles 
  for update using (auth.uid() = id)
  with check (auth.uid() = id);

-- Allow admin to update all profiles
create policy "profiles_update_admin" on public.profiles 
  for update using (
    (select raw_user_meta_data->>'role' from auth.users where id = auth.uid()) = 'admin'
  );

-- Allow insert during signup (handled by trigger with security definer)
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- Add name column as alias for title in subjects for compatibility
alter table public.subjects add column if not exists name text;

-- Update name from title if null
update public.subjects set name = title where name is null;

-- Add passing_score as alias for pass_marks in quizzes for compatibility  
alter table public.quizzes add column if not exists passing_score integer;

-- Update passing_score from pass_marks if null
update public.quizzes set passing_score = pass_marks where passing_score is null;

-- Create trigger to keep name in sync with title
create or replace function public.sync_subject_name()
returns trigger
language plpgsql
as $$
begin
  if TG_OP = 'INSERT' or NEW.title is distinct from OLD.title then
    NEW.name := NEW.title;
  end if;
  return NEW;
end;
$$;

drop trigger if exists sync_subject_name_trigger on public.subjects;
create trigger sync_subject_name_trigger
  before insert or update on public.subjects
  for each row
  execute function public.sync_subject_name();

-- Create trigger to keep passing_score in sync with pass_marks
create or replace function public.sync_quiz_passing_score()
returns trigger
language plpgsql
as $$
begin
  if TG_OP = 'INSERT' or NEW.pass_marks is distinct from OLD.pass_marks then
    NEW.passing_score := NEW.pass_marks;
  end if;
  return NEW;
end;
$$;

drop trigger if exists sync_quiz_passing_score_trigger on public.quizzes;
create trigger sync_quiz_passing_score_trigger
  before insert or update on public.quizzes
  for each row
  execute function public.sync_quiz_passing_score();
