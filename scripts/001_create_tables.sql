-- E-Learning Platform Database Schema
-- This script creates all necessary tables for the platform

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- PROFILES TABLE (extends auth.users)
-- ============================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'student' check (role in ('admin', 'student')),
  is_approved boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- Profiles policies
create policy "profiles_select_own" on public.profiles 
  for select using (auth.uid() = id);

create policy "profiles_select_admin" on public.profiles 
  for select using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "profiles_update_own" on public.profiles 
  for update using (auth.uid() = id);

create policy "profiles_update_admin" on public.profiles 
  for update using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================
-- SUBJECTS TABLE
-- ============================================
create table if not exists public.subjects (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  thumbnail_url text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.subjects enable row level security;

-- Everyone can view active subjects (but access is controlled separately)
create policy "subjects_select_all" on public.subjects 
  for select using (true);

-- Only admin can insert/update/delete
create policy "subjects_insert_admin" on public.subjects 
  for insert with check (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "subjects_update_admin" on public.subjects 
  for update using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "subjects_delete_admin" on public.subjects 
  for delete using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================
-- STUDENT SUBJECT ACCESS TABLE
-- ============================================
create table if not exists public.student_subject_access (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  granted_at timestamptz default now(),
  expires_at timestamptz,
  unique(student_id, subject_id)
);

alter table public.student_subject_access enable row level security;

-- Students can view their own access
create policy "access_select_own" on public.student_subject_access 
  for select using (auth.uid() = student_id);

-- Admin can view and manage all access
create policy "access_select_admin" on public.student_subject_access 
  for select using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "access_insert_admin" on public.student_subject_access 
  for insert with check (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "access_delete_admin" on public.student_subject_access 
  for delete using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================
-- VIDEOS TABLE
-- ============================================
create table if not exists public.videos (
  id uuid primary key default uuid_generate_v4(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  title text not null,
  description text,
  video_type text not null check (video_type in ('youtube', 'uploaded', 'zoom')),
  video_url text not null,
  thumbnail_url text,
  duration_minutes integer,
  sort_order integer default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.videos enable row level security;

-- Students with subject access can view videos
create policy "videos_select_with_access" on public.videos 
  for select using (
    exists (
      select 1 from public.student_subject_access 
      where student_id = auth.uid() and subject_id = videos.subject_id
    )
    or exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admin can manage videos
create policy "videos_insert_admin" on public.videos 
  for insert with check (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "videos_update_admin" on public.videos 
  for update using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "videos_delete_admin" on public.videos 
  for delete using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================
-- QUIZZES TABLE
-- ============================================
create table if not exists public.quizzes (
  id uuid primary key default uuid_generate_v4(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  title text not null,
  description text,
  time_limit_minutes integer not null default 30,
  total_marks integer not null default 100,
  pass_marks integer not null default 50,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.quizzes enable row level security;

-- Students with subject access can view quizzes
create policy "quizzes_select_with_access" on public.quizzes 
  for select using (
    exists (
      select 1 from public.student_subject_access 
      where student_id = auth.uid() and subject_id = quizzes.subject_id
    )
    or exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admin can manage quizzes
create policy "quizzes_insert_admin" on public.quizzes 
  for insert with check (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "quizzes_update_admin" on public.quizzes 
  for update using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "quizzes_delete_admin" on public.quizzes 
  for delete using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================
-- QUIZ QUESTIONS TABLE
-- ============================================
create table if not exists public.quiz_questions (
  id uuid primary key default uuid_generate_v4(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  question_text text not null,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  correct_answer text not null check (correct_answer in ('A', 'B', 'C', 'D')),
  marks integer not null default 1,
  sort_order integer default 0,
  created_at timestamptz default now()
);

alter table public.quiz_questions enable row level security;

-- Students with subject access can view questions (during quiz attempt)
create policy "questions_select_with_access" on public.quiz_questions 
  for select using (
    exists (
      select 1 from public.quizzes q
      join public.student_subject_access sa on sa.subject_id = q.subject_id
      where q.id = quiz_questions.quiz_id and sa.student_id = auth.uid()
    )
    or exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admin can manage questions
create policy "questions_insert_admin" on public.quiz_questions 
  for insert with check (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "questions_update_admin" on public.quiz_questions 
  for update using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "questions_delete_admin" on public.quiz_questions 
  for delete using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================
-- QUIZ ATTEMPTS TABLE
-- ============================================
create table if not exists public.quiz_attempts (
  id uuid primary key default uuid_generate_v4(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  started_at timestamptz default now(),
  submitted_at timestamptz,
  score integer,
  total_marks integer,
  passed boolean,
  answers jsonb default '{}',
  status text not null default 'in_progress' check (status in ('in_progress', 'submitted', 'timed_out'))
);

alter table public.quiz_attempts enable row level security;

-- Students can view their own attempts
create policy "attempts_select_own" on public.quiz_attempts 
  for select using (auth.uid() = student_id);

-- Admin can view all attempts
create policy "attempts_select_admin" on public.quiz_attempts 
  for select using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

-- Students can insert their own attempts
create policy "attempts_insert_own" on public.quiz_attempts 
  for insert with check (auth.uid() = student_id);

-- Students can update their own in-progress attempts
create policy "attempts_update_own" on public.quiz_attempts 
  for update using (auth.uid() = student_id and status = 'in_progress');

-- ============================================
-- FEE SETTINGS TABLE
-- ============================================
create table if not exists public.fee_settings (
  id uuid primary key default uuid_generate_v4(),
  monthly_fee numeric(10,2) not null,
  currency text default 'USD',
  bank_name text,
  account_number text,
  account_name text,
  additional_info text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.fee_settings enable row level security;

-- Everyone can view active fee settings
create policy "fee_settings_select_all" on public.fee_settings 
  for select using (is_active = true);

-- Admin can manage fee settings
create policy "fee_settings_insert_admin" on public.fee_settings 
  for insert with check (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "fee_settings_update_admin" on public.fee_settings 
  for update using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================
-- PAYMENTS TABLE
-- ============================================
create table if not exists public.payments (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(10,2) not null,
  payment_month text not null,
  payment_year integer not null,
  receipt_url text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_notes text,
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

alter table public.payments enable row level security;

-- Students can view their own payments
create policy "payments_select_own" on public.payments 
  for select using (auth.uid() = student_id);

-- Admin can view all payments
create policy "payments_select_admin" on public.payments 
  for select using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

-- Students can insert their own payments
create policy "payments_insert_own" on public.payments 
  for insert with check (auth.uid() = student_id);

-- Admin can update payments
create policy "payments_update_admin" on public.payments 
  for update using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================
-- MESSAGES TABLE
-- ============================================
create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

alter table public.messages enable row level security;

-- Users can view their own messages (sent or received)
create policy "messages_select_own" on public.messages 
  for select using (auth.uid() = sender_id or auth.uid() = receiver_id);

-- Users can insert messages
create policy "messages_insert_own" on public.messages 
  for insert with check (auth.uid() = sender_id);

-- Users can update their received messages (mark as read)
create policy "messages_update_own" on public.messages 
  for update using (auth.uid() = receiver_id);

-- ============================================
-- TRIGGER FOR AUTO-CREATING PROFILE
-- ============================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', null),
    coalesce(new.raw_user_meta_data ->> 'role', 'student')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_student_subject_access_student on public.student_subject_access(student_id);
create index if not exists idx_student_subject_access_subject on public.student_subject_access(subject_id);
create index if not exists idx_videos_subject on public.videos(subject_id);
create index if not exists idx_quizzes_subject on public.quizzes(subject_id);
create index if not exists idx_quiz_questions_quiz on public.quiz_questions(quiz_id);
create index if not exists idx_quiz_attempts_student on public.quiz_attempts(student_id);
create index if not exists idx_quiz_attempts_quiz on public.quiz_attempts(quiz_id);
create index if not exists idx_payments_student on public.payments(student_id);
create index if not exists idx_payments_status on public.payments(status);
create index if not exists idx_messages_sender on public.messages(sender_id);
create index if not exists idx_messages_receiver on public.messages(receiver_id);
