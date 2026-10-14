import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { TenantHome } from "./TenantHome";
import type { Property, Ticket } from "@/lib/types";

export default async function TenantPage() {
  const { profile } = await requireRole("tenant");
  const supabase = await createClient();

  const [{ data: property }, { data: tickets }] = await Promise.all([
    supabase.from("properties").select("*").eq("id", profile.property_id!).single(),
    supabase.from("tickets").select("*").eq("tenant_id", profile.id).order("created_at", { ascending: false }),
  ]);

  return (
    <TenantHome
      profile={profile}
      property={property as Property}
      initialTickets={(tickets ?? []) as Ticket[]}
    />
  );
}
