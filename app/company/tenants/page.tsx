import { createClient } from "@/lib/supabase/server";
import { TenantsDirectory, type TenantRow } from "./TenantsDirectory";

export default async function TenantsPage() {
  const supabase = await createClient();

  const [{ data: tenantsData }, { data: propertiesData }] = await Promise.all([
    supabase
      .from("profiles")
      .select("*, properties(id, name)")
      .eq("role", "tenant")
      .order("created_at", { ascending: false }),
    supabase
      .from("properties")
      .select("id, name, slug")
      .order("created_at"),
  ]);

  const tenants = (tenantsData ?? []) as TenantRow[];
  const properties = (propertiesData ?? []) as { id: string; name: string; slug: string }[];

  return <TenantsDirectory initialTenants={tenants} properties={properties} />;
}
