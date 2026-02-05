-- Quiz Re-attempt Requests Table
-- This table tracks student requests to re-attempt quizzes

create table if not exists public.quiz_re_attempts (
  id uuid primary key default uuid_generate_v4(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  request_reason text,
  admin_notes text,
  requested_at timestamptz default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id),
  expires_at timestamptz, -- when the approval expires (optional)
  unique(quiz_id, student_id, status) -- one pending request per quiz per student
);

alter table public.quiz_re_attempts enable row level security;

-- Students can view their own re-attempt requests
create policy "re_attempts_select_own" on public.quiz_re_attempts 
  for select using (auth.uid() = student_id);

-- Admin can view all re-attempt requests
create policy "re_attempts_select_admin" on public.quiz_re_attempts 
  for select using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

-- Students can insert their own requests
create policy "re_attempts_insert_own" on public.quiz_re_attempts 
  for insert with check (auth.uid() = student_id);

-- Admin can update requests (approve/reject)
create policy "re_attempts_update_admin" on public.quiz_re_attempts 
  for update using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admin can delete requests
create policy "re_attempts_delete_admin" on public.quiz_re_attempts 
  for delete using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

-- Index for performance
create index if not exists idx_quiz_re_attempts_quiz on public.quiz_re_attempts(quiz_id);
create index if not exists idx_quiz_re_attempts_student on public.quiz_re_attempts(student_id);
create index if not exists idx_quiz_re_attempts_status on public.quiz_re_attempts(status);
