-- Seed 5 demo properties for every company (new signups + existing companies).

alter table public.properties add column if not exists is_demo boolean not null default false;

create or replace function public.seed_demo_properties(p_company uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  demo record;
begin
  for demo in
    select * from (values
      ('Maple Court Apartments',  '1200 Maple Ave, Austin, TX'),
      ('Harbor View Lofts',       '48 Pier St, San Diego, CA'),
      ('Cedar Ridge Townhomes',   '305 Cedar Ridge Dr, Denver, CO'),
      ('Parkside Residences',     '77 Park Blvd, Chicago, IL'),
      ('Willow Creek Commons',    '910 Willow Creek Rd, Atlanta, GA')
    ) as d(name, address)
  loop
    insert into public.properties (company_id, name, slug, address, emergency_contact, is_demo)
    values (p_company, demo.name, public.unique_property_slug(demo.name), demo.address, '+1 (555) 010-0000', true);
  end loop;
end $$;

revoke execute on function public.seed_demo_properties(uuid) from public, anon, authenticated;

-- Same as before, plus demo properties for new companies.
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

    perform public.seed_demo_properties(v_company);

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

-- Backfill existing companies that don't have demo properties yet.
do $$
declare c record;
begin
  for c in
    select id from public.companies co
    where not exists (select 1 from public.properties p where p.company_id = co.id and p.is_demo)
  loop
    perform public.seed_demo_properties(c.id);
  end loop;
end $$;
