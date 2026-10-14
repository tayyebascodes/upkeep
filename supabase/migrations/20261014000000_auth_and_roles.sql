-- Upkeep: companies, properties, profiles (company + tenant users), tickets, documents.
-- Apply in the Supabase SQL editor or with `supabase db push`.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.user_role as enum ('company', 'tenant');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table if not exists public.companies (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  owner_id    uuid not null references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now()
);

create table if not exists public.properties (
  id                 uuid primary key default gen_random_uuid(),
  company_id         uuid not null references public.companies (id) on delete cascade,
  name               text not null,
  slug               text not null unique,
  address            text,
  emergency_contact  text,
  agent_voice        text not null default 'Female (Natural)',
  agent_language     text not null default 'English',
  agent_tone         text not null default 'Professional & Empathetic',
  created_at         timestamptz not null default now()
);

create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  role         public.user_role not null,
  email        text,
  full_name    text,
  phone        text,
  company_id   uuid references public.companies (id) on delete set null,
  property_id  uuid references public.properties (id) on delete set null,
  unit_number  text,
  created_at   timestamptz not null default now()
);

create table if not exists public.tickets (
  id                   uuid primary key default gen_random_uuid(),
  property_id          uuid not null references public.properties (id) on delete cascade,
  tenant_id            uuid references public.profiles (id) on delete set null,
  unit_number          text not null,
  tenant_name          text,
  tenant_phone         text,
  category             text not null default 'Other'
                       check (category in ('Plumbing','Electrical','HVAC','Appliance','Structural','Other')),
  severity             text not null default 'Medium'
                       check (severity in ('Emergency','High','Medium','Low')),
  title                text not null,
  description          text,
  status               text not null default 'Pending'
                       check (status in ('Pending','In Progress','Resolved')),
  source               text not null default 'chat'
                       check (source in ('chat','voice_call','web_call')),
  audio_recording_url  text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create table if not exists public.documents (
  id            uuid primary key default gen_random_uuid(),
  property_id   uuid not null references public.properties (id) on delete cascade,
  name          text not null,
  storage_path  text not null,
  created_at    timestamptz not null default now()
);

-- Upgrade tables from the earlier demo schema (no-ops on a fresh database).
-- Pre-existing properties keep company_id NULL, so no company can see them until claimed.
alter table public.properties add column if not exists company_id uuid references public.companies (id) on delete cascade;
alter table public.properties add column if not exists agent_voice text not null default 'Female (Natural)';
alter table public.properties add column if not exists agent_language text not null default 'English';
alter table public.properties add column if not exists agent_tone text not null default 'Professional & Empathetic';
alter table public.tickets add column if not exists tenant_id uuid references public.profiles (id) on delete set null;
alter table public.tickets add column if not exists updated_at timestamptz not null default now();

create index if not exists tickets_property_idx on public.tickets (property_id, created_at desc);
create index if not exists tickets_tenant_idx on public.tickets (tenant_id, created_at desc);
create index if not exists profiles_property_idx on public.profiles (property_id);
create index if not exists properties_company_idx on public.properties (company_id);

-- ---------------------------------------------------------------------------
-- Helpers (security definer so policies don't recurse through profiles RLS)
-- ---------------------------------------------------------------------------
create or replace function public.my_company_id()
returns uuid language sql stable security definer set search_path = public as $$
  select company_id from public.profiles where id = auth.uid() and role = 'company'
$$;

create or replace function public.my_property_id()
returns uuid language sql stable security definer set search_path = public as $$
  select property_id from public.profiles where id = auth.uid() and role = 'tenant'
$$;

create or replace function public.slugify(t text)
returns text language sql immutable as $$
  select trim(both '-' from regexp_replace(lower(coalesce(t, '')), '[^a-z0-9]+', '-', 'g'))
$$;

create or replace function public.unique_property_slug(base text)
returns text language plpgsql security definer set search_path = public as $$
declare
  root text := nullif(public.slugify(base), '');
  candidate text;
  n int := 1;
begin
  root := coalesce(root, 'property');
  candidate := root;
  while exists (select 1 from public.properties where slug = candidate) loop
    n := n + 1;
    candidate := root || '-' || n;
  end loop;
  return candidate;
end $$;

-- Public, minimal lookup for the tenant join page (/p/[slug]).
create or replace function public.get_property_by_slug(p_slug text)
returns table (id uuid, name text, slug text, address text)
language sql stable security definer set search_path = public as $$
  select p.id, p.name, p.slug, p.address from public.properties p where p.slug = p_slug
$$;

grant execute on function public.get_property_by_slug(text) to anon, authenticated;

-- Auto-fill slug on insert when the client doesn't send one.
create or replace function public.properties_set_slug()
returns trigger language plpgsql as $$
begin
  if new.slug is null or new.slug = '' then
    new.slug := public.unique_property_slug(new.name);
  end if;
  return new;
end $$;

drop trigger if exists properties_set_slug on public.properties;
create trigger properties_set_slug before insert on public.properties
  for each row execute function public.properties_set_slug();

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists tickets_touch on public.tickets;
create trigger tickets_touch before update on public.tickets
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Signup: build profile (and company + first property) from user metadata.
--   company: { role: 'company', full_name, company_name, property_name }
--   tenant:  { role: 'tenant', full_name, phone, unit_number, property_slug }
-- ---------------------------------------------------------------------------
create or replace function public.provision_user(
  p_id uuid, p_email text, p_meta jsonb
) returns void language plpgsql security definer set search_path = public as $$
declare
  meta jsonb := coalesce(p_meta, '{}'::jsonb);
  v_company uuid;
  v_property uuid;
begin
  if meta->>'role' = 'company' then
    insert into public.companies (name, owner_id)
    values (coalesce(nullif(meta->>'company_name', ''), 'My company'), p_id)
    returning id into v_company;

    insert into public.properties (company_id, name, slug)
    values (
      v_company,
      coalesce(nullif(meta->>'property_name', ''), nullif(meta->>'company_name', ''), 'My property'),
      public.unique_property_slug(coalesce(nullif(meta->>'property_name', ''), meta->>'company_name'))
    );

    insert into public.profiles (id, role, email, full_name, company_id)
    values (p_id, 'company', p_email, meta->>'full_name', v_company);

  elsif meta->>'role' = 'tenant' then
    select id into v_property from public.properties where slug = meta->>'property_slug';
    if v_property is null then
      raise exception 'UPKEEP_UNKNOWN_PROPERTY';
    end if;

    insert into public.profiles (id, role, email, full_name, phone, property_id, unit_number)
    values (p_id, 'tenant', p_email, meta->>'full_name', meta->>'phone', v_property, meta->>'unit_number');

  else
    raise exception 'UPKEEP_MISSING_ROLE';
  end if;
end $$;

revoke execute on function public.provision_user(uuid, text, jsonb) from public, anon, authenticated;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.provision_user(new.id, new.email, new.raw_user_meta_data);
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill: users who signed up before this migration ran have no profile yet.
do $$
declare u record;
begin
  for u in
    select au.id, au.email, au.raw_user_meta_data
    from auth.users au
    where not exists (select 1 from public.profiles p where p.id = au.id)
  loop
    begin
      perform public.provision_user(u.id, u.email, u.raw_user_meta_data);
    exception when others then
      raise notice 'Skipped user % (%): %', u.email, u.id, sqlerrm;
    end;
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
-- Remove any policies left from the earlier demo schema (e.g. open anon access).
do $$
declare pol record;
begin
  for pol in
    select policyname, tablename from pg_policies
    where schemaname = 'public'
      and tablename in ('companies', 'properties', 'profiles', 'tickets', 'documents', 'knowledge_chunks')
  loop
    execute format('drop policy %I on public.%I', pol.policyname, pol.tablename);
  end loop;
end $$;

alter table public.companies  enable row level security;
alter table public.properties enable row level security;
alter table public.profiles   enable row level security;
alter table public.tickets    enable row level security;
alter table public.documents  enable row level security;

do $$ begin
  alter table public.knowledge_chunks enable row level security;
exception when undefined_table then null; end $$;

-- companies
drop policy if exists "company members read company" on public.companies;
create policy "company members read company" on public.companies
  for select to authenticated using (id = public.my_company_id());

drop policy if exists "company members update company" on public.companies;
create policy "company members update company" on public.companies
  for update to authenticated using (id = public.my_company_id()) with check (id = public.my_company_id());

-- properties
drop policy if exists "company manages properties" on public.properties;
create policy "company manages properties" on public.properties
  for all to authenticated
  using (company_id = public.my_company_id())
  with check (company_id = public.my_company_id());

drop policy if exists "tenant reads own property" on public.properties;
create policy "tenant reads own property" on public.properties
  for select to authenticated using (id = public.my_property_id());

-- profiles
drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles
  for select to authenticated using (id = auth.uid());

drop policy if exists "company reads its tenants" on public.profiles;
create policy "company reads its tenants" on public.profiles
  for select to authenticated using (
    role = 'tenant'
    and property_id in (select id from public.properties where company_id = public.my_company_id())
  );

drop policy if exists "update own profile" on public.profiles;
create policy "update own profile" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- Users may only edit these columns on their own profile (not role / company / property).
revoke update on public.profiles from authenticated;
grant update (full_name, phone, unit_number) on public.profiles to authenticated;

-- tickets
drop policy if exists "tenant reads own tickets" on public.tickets;
create policy "tenant reads own tickets" on public.tickets
  for select to authenticated using (tenant_id = auth.uid());

drop policy if exists "tenant creates tickets" on public.tickets;
create policy "tenant creates tickets" on public.tickets
  for insert to authenticated with check (
    tenant_id = auth.uid() and property_id = public.my_property_id()
  );

drop policy if exists "company reads tickets" on public.tickets;
create policy "company reads tickets" on public.tickets
  for select to authenticated using (
    property_id in (select id from public.properties where company_id = public.my_company_id())
  );

drop policy if exists "company updates tickets" on public.tickets;
create policy "company updates tickets" on public.tickets
  for update to authenticated
  using (property_id in (select id from public.properties where company_id = public.my_company_id()))
  with check (property_id in (select id from public.properties where company_id = public.my_company_id()));

-- documents
drop policy if exists "company manages documents" on public.documents;
create policy "company manages documents" on public.documents
  for all to authenticated
  using (property_id in (select id from public.properties where company_id = public.my_company_id()))
  with check (property_id in (select id from public.properties where company_id = public.my_company_id()));

-- knowledge_chunks (from the earlier schema, if present)
do $$ begin
  create policy "company manages knowledge" on public.knowledge_chunks
    for all to authenticated
    using (property_id in (select id from public.properties where company_id = public.my_company_id()))
    with check (property_id in (select id from public.properties where company_id = public.my_company_id()));
exception when undefined_table then null; end $$;

-- ---------------------------------------------------------------------------
-- Storage: private "documents" bucket, files stored under <property_id>/...
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

drop policy if exists "company reads documents" on storage.objects;
create policy "company reads documents" on storage.objects
  for select to authenticated using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] in (
      select id::text from public.properties where company_id = public.my_company_id()
    )
  );

drop policy if exists "company uploads documents" on storage.objects;
create policy "company uploads documents" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] in (
      select id::text from public.properties where company_id = public.my_company_id()
    )
  );

drop policy if exists "company deletes documents" on storage.objects;
create policy "company deletes documents" on storage.objects
  for delete to authenticated using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] in (
      select id::text from public.properties where company_id = public.my_company_id()
    )
  );

-- ---------------------------------------------------------------------------
-- Realtime for live ticket updates
-- ---------------------------------------------------------------------------
do $$ begin
  alter publication supabase_realtime add table public.tickets;
exception when duplicate_object then null; end $$;
