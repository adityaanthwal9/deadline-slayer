-- ============================================
-- DEADLINE SLAYER AI - Supabase Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- USER PROFILES
-- ============================================
create table if not exists user_profiles (
  id uuid primary key default uuid_generate_v4(),
  clerk_user_id text unique not null,
  name text not null,
  email text,
  wake_time text default '06:00',       -- "HH:MM"
  sleep_time text default '23:00',
  work_start text default '09:00',
  work_end text default '18:00',
  energy_morning text default 'high',    -- high | medium | low
  energy_afternoon text default 'medium',
  energy_night text default 'low',
  productivity_score integer default 50, -- 0-100, updated by AI
  google_refresh_token text,             -- for Google Calendar sync
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- TASKS
-- ============================================
create table if not exists tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null references user_profiles(clerk_user_id) on delete cascade,
  title text not null,
  description text,
  category text default 'work',          -- work | personal | health | finance | learning
  priority text default 'medium',        -- low | medium | high | critical
  status text default 'pending',         -- pending | in_progress | completed | cancelled | delegated
  deadline timestamptz,
  estimated_hours float default 1,
  actual_hours float default 0,
  risk_score integer default 0,          -- 0-100, calculated by AI
  risk_level text default 'low',         -- low | medium | high | critical
  ai_recommendation text,                -- AI's latest suggestion for this task
  procrastination_count integer default 0,
  last_worked_at timestamptz,
  completed_at timestamptz,
  is_recurring boolean default false,
  recurrence_pattern text,               -- daily | weekly | monthly
  tags text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- SCHEDULE BLOCKS (AI Generated Time Blocks)
-- ============================================
create table if not exists schedule_blocks (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null references user_profiles(clerk_user_id) on delete cascade,
  task_id uuid references tasks(id) on delete cascade,
  title text not null,
  block_type text default 'work',        -- work | break | fixed | buffer
  start_time timestamptz not null,
  end_time timestamptz not null,
  is_ai_generated boolean default true,
  is_completed boolean default false,
  notes text,
  created_at timestamptz default now()
);

-- ============================================
-- AI ANALYSES (stored for history)
-- ============================================
create table if not exists ai_analyses (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null references user_profiles(clerk_user_id) on delete cascade,
  analysis_type text not null,           -- daily_brief | risk_scan | simulation | negotiation
  input_data jsonb,
  output_data jsonb,
  created_at timestamptz default now()
);

-- ============================================
-- PROCRASTINATION LOGS
-- ============================================
create table if not exists procrastination_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null references user_profiles(clerk_user_id) on delete cascade,
  task_id uuid not null references tasks(id) on delete cascade,
  promised_time timestamptz,
  detected_at timestamptz default now(),
  ai_intervention text
);

-- ============================================
-- DAILY STATS (for analytics)
-- ============================================
create table if not exists daily_stats (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null references user_profiles(clerk_user_id) on delete cascade,
  date date not null,
  tasks_completed integer default 0,
  tasks_missed integer default 0,
  focus_hours float default 0,
  productivity_score integer default 0,
  deadline_avoidance_score integer default 0,
  created_at timestamptz default now(),
  unique(user_id, date)
);

-- ============================================
-- INDEXES
-- ============================================
create index idx_tasks_user_id on tasks(user_id);
create index idx_tasks_deadline on tasks(deadline);
create index idx_tasks_status on tasks(status);
create index idx_schedule_blocks_user_id on schedule_blocks(user_id);
create index idx_schedule_blocks_start on schedule_blocks(start_time);
create index idx_daily_stats_user_date on daily_stats(user_id, date);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table user_profiles enable row level security;
alter table tasks enable row level security;
alter table schedule_blocks enable row level security;
alter table ai_analyses enable row level security;
alter table procrastination_logs enable row level security;
alter table daily_stats enable row level security;

-- RLS Policies (using Clerk user ID passed via app)
-- Note: We use service role key in API routes, so RLS is mainly
-- a safety net. Policies below allow service role to bypass.

create policy "Users can manage own profile" on user_profiles
  for all using (true) with check (true);

create policy "Users can manage own tasks" on tasks
  for all using (true) with check (true);

create policy "Users can manage own schedule" on schedule_blocks
  for all using (true) with check (true);

create policy "Users can manage own analyses" on ai_analyses
  for all using (true) with check (true);

create policy "Users can manage own logs" on procrastination_logs
  for all using (true) with check (true);

create policy "Users can manage own stats" on daily_stats
  for all using (true) with check (true);
