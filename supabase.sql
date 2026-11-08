-- Run this in Supabase Dashboard > SQL Editor.
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.songs (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 120),
  artist text not null check (char_length(artist) between 1 and 120),
  platform text not null check (platform in ('youtube','spotify','soundcloud')),
  url text not null,
  cover_url text,
  release_date date,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
alter table public.songs enable row level security;

-- Public visitors can only see published songs.
create policy "Anyone can read published songs"
on public.songs for select
using (published = true);

-- Admins can read their own admin row. Admin membership must be inserted by
-- the project owner through the SQL editor; public users cannot self-promote.
create policy "Admins can read own admin row"
on public.admin_users for select to authenticated
using (user_id = auth.uid());

-- Only IDs explicitly added to admin_users may manage songs.
create policy "Admins can manage songs"
on public.songs for all to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()))
with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

-- Do not create an INSERT/UPDATE/DELETE policy for admin_users.
