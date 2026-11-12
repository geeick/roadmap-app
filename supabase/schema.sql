create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  diagnosis text check (diagnosis in ('cbs', 'ftd', 'msa', 'psp')),
  role text not null default 'patient' check (role in ('patient', 'provider'))
);

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid default auth.uid() references auth.users on delete set null,
  category text not null,
  name text not null,
  fields jsonb not null default '[]',
  tags text[] not null default '{}',
  phone text,
  video_url text,
  url text,
  dx text[],
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

create index listings_category_idx on public.listings (category);

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, diagnosis, role)
  values (
    new.id,
    new.raw_user_meta_data ->> 'diagnosis',
    case when new.raw_user_meta_data ->> 'role' = 'provider' then 'provider' else 'patient' end
  );
  return new;
end $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.listings enable row level security;

create policy "read own profile" on public.profiles
  for select to authenticated using (id = auth.uid());
create policy "update own profile" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "read approved or own listings" on public.listings
  for select to authenticated using (approved or owner_id = auth.uid());
create policy "providers add listings" on public.listings
  for insert to authenticated
  with check (
    owner_id = auth.uid()
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'provider')
  );
create policy "owners edit listings" on public.listings
  for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "owners delete listings" on public.listings
  for delete to authenticated using (owner_id = auth.uid());

revoke update on public.profiles from authenticated;
grant update (diagnosis) on public.profiles to authenticated;

revoke insert, update on public.listings from authenticated;
grant insert (category, name, fields, tags, phone, video_url, url, dx) on public.listings to authenticated;
grant update (category, name, fields, tags, phone, video_url, url, dx) on public.listings to authenticated;
