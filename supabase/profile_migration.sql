-- Run once AFTER your existing supabase/schema.sql.
-- Each row is private to its owning Supabase Auth user.

create table if not exists public.roadmap_checks (
  user_id uuid not null references auth.users(id) on delete cascade,
  diagnosis text not null check (diagnosis in ('cbs', 'ftd', 'msa', 'psp')),
  step_index integer not null check (step_index >= 0),
  item_index integer not null check (item_index >= 0),
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, diagnosis, step_index, item_index)
);

create table if not exists public.saved_resources (
  user_id uuid not null references auth.users(id) on delete cascade,
  diagnosis text not null check (diagnosis in ('cbs', 'ftd', 'msa', 'psp')),
  step_index integer not null check (step_index >= 0),
  item_index integer not null check (item_index >= 0),
  category text not null,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, diagnosis, step_index, item_index, listing_id)
);

create index if not exists saved_resources_listing_idx on public.saved_resources(listing_id);
alter table public.roadmap_checks enable row level security;
alter table public.saved_resources enable row level security;

create policy "read own checks" on public.roadmap_checks
  for select to authenticated using (user_id = (select auth.uid()));
create policy "insert own checks" on public.roadmap_checks
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "update own checks" on public.roadmap_checks
  for update to authenticated using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy "delete own checks" on public.roadmap_checks
  for delete to authenticated using (user_id = (select auth.uid()));

create policy "read own resources" on public.saved_resources
  for select to authenticated using (user_id = (select auth.uid()));
create policy "insert own resources" on public.saved_resources
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "delete own resources" on public.saved_resources
  for delete to authenticated using (user_id = (select auth.uid()));
