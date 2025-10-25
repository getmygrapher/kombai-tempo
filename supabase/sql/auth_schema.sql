-- Supabase Auth & Profiles setup
-- Run these statements in your Supabase SQL editor

-- 1) Create profiles table linked to auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  phone text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2) Enable RLS
alter table public.profiles enable row level security;

-- 3) Policies
create policy "Public read own profile"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Insert profile for authenticated user"
  on public.profiles for insert
  with check (auth.uid() = id);

-- 4) Trigger to keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

-- 5) Optional: auto-create profile on signup via edge function or client insert
-- Client can insert into profiles right after signup with id = user.id