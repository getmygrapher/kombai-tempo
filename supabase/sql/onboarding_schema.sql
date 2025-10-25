-- Onboarding backend schema: tables, RLS policies, and RPC functions
-- Run in Supabase SQL editor. Ensures strict per-user access via RLS.

-- 1) Professional profiles linked to auth.users
create table if not exists public.professional_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  selected_category text,
  selected_type text,
  experience_level text,
  specializations text[] default '{}',
  pricing jsonb,
  equipment jsonb,
  instagram_handle text,
  portfolio_links text[] default '{}',
  -- location/meta
  city text,
  state text,
  pin_code text,
  work_radius_km integer,
  additional_locations jsonb default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.professional_profiles enable row level security;

-- Drop existing policies to avoid conflicts
drop policy if exists "Users can select own professional profile" on public.professional_profiles;
drop policy if exists "Users can upsert own professional profile" on public.professional_profiles;
drop policy if exists "Users can update own professional profile" on public.professional_profiles;

create policy "Users can select own professional profile"
  on public.professional_profiles for select
  using (auth.uid() = user_id);

create policy "Users can upsert own professional profile"
  on public.professional_profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update own professional profile"
  on public.professional_profiles for update
  using (auth.uid() = user_id);

-- keep updated_at fresh using existing trigger function
drop trigger if exists professional_profiles_set_updated_at on public.professional_profiles;
create trigger professional_profiles_set_updated_at
before update on public.professional_profiles
for each row execute procedure public.set_updated_at();

-- 2) Availability settings per user
create table if not exists public.availability_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  default_schedule jsonb,            -- e.g., { mon: [{start,end}], ... }
  lead_time text,                    -- e.g., "24h", "48h"
  advance_booking_limit text,        -- e.g., "30d"
  calendar_visibility text,          -- e.g., "public" | "private"
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.availability_settings enable row level security;

-- Drop existing policies to avoid conflicts
drop policy if exists "Users can select own availability settings" on public.availability_settings;
drop policy if exists "Users can upsert own availability settings" on public.availability_settings;
drop policy if exists "Users can update own availability settings" on public.availability_settings;

create policy "Users can select own availability settings"
  on public.availability_settings for select
  using (auth.uid() = user_id);

create policy "Users can upsert own availability settings"
  on public.availability_settings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own availability settings"
  on public.availability_settings for update
  using (auth.uid() = user_id);

drop trigger if exists availability_settings_set_updated_at on public.availability_settings;
create trigger availability_settings_set_updated_at
before update on public.availability_settings
for each row execute procedure public.set_updated_at();

-- 3) Onboarding progress tracking
create table if not exists public.onboarding_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  current_step text,
  completed_steps text[] default '{}',
  status text default 'in_progress', -- 'in_progress' | 'completed'
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.onboarding_progress enable row level security;

-- Drop existing policies to avoid conflicts
drop policy if exists "Users can select own onboarding progress" on public.onboarding_progress;
drop policy if exists "Users can insert own onboarding progress" on public.onboarding_progress;
drop policy if exists "Users can update own onboarding progress" on public.onboarding_progress;

create policy "Users can select own onboarding progress"
  on public.onboarding_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert own onboarding progress"
  on public.onboarding_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update own onboarding progress"
  on public.onboarding_progress for update
  using (auth.uid() = user_id);

drop trigger if exists onboarding_progress_set_updated_at on public.onboarding_progress;
create trigger onboarding_progress_set_updated_at
before update on public.onboarding_progress
for each row execute procedure public.set_updated_at();

-- 4) RPC: mark step complete and return enriched progress
create or replace function public.complete_onboarding_step(step text)
returns public.onboarding_progress
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  result public.onboarding_progress;
begin
  if uid is null then
    raise exception 'Unauthorized';
  end if;

  -- Upsert progress row and add step to the array if missing
  insert into public.onboarding_progress as op (user_id, current_step, completed_steps, status)
  values (uid, step, array[step], 'in_progress')
  on conflict (user_id)
  do update set
    current_step = excluded.current_step,
    completed_steps = (case when not (excluded.current_step = any(op.completed_steps))
                            then op.completed_steps || excluded.current_step
                            else op.completed_steps end),
    status = (case when step = 'REGISTRATION_COMPLETE' then 'completed' else op.status end),
    updated_at = now()
  where op.user_id = uid
  returning * into result;
  
  return result;
end;
$$;

-- 5) RPC: get current user's onboarding status
create or replace function public.get_onboarding_status()
returns public.onboarding_progress
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  result public.onboarding_progress;
begin
  if uid is null then
    raise exception 'Unauthorized';
  end if;

  select * into result from public.onboarding_progress where user_id = uid;
  return result;
end;
$$;

-- 6) Optional helper: ensure a profile row exists for the user
create or replace function public.ensure_profile_exists()
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  result public.profiles;
begin
  if uid is null then
    raise exception 'Unauthorized';
  end if;

  insert into public.profiles as p (id, created_at, updated_at)
  values (uid, now(), now())
  on conflict (id) do update set updated_at = now()
  returning * into result;

  return result;
end;
$$;