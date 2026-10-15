-- Allow companies to delete tickets belonging to their properties
drop policy if exists "company deletes tickets" on public.tickets;
create policy "company deletes tickets" on public.tickets
  for delete to authenticated
  using (
    property_id in (select id from public.properties where company_id = public.my_company_id())
  );

-- Allow tenants to delete their own tickets
drop policy if exists "tenant deletes own tickets" on public.tickets;
create policy "tenant deletes own tickets" on public.tickets
  for delete to authenticated
  using (
    tenant_id = auth.uid()
  );
