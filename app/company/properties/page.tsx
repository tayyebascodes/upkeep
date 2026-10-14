import Link from "next/link";
import { Building2, Settings2, Users } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { CopyLink } from "@/components/CopyLink";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { AddPropertyForm } from "./AddPropertyForm";
import type { Property } from "@/lib/types";

export default async function PropertiesPage() {
  const { profile } = await requireRole("company");
  const supabase = await createClient();

  const [{ data: properties }, { data: tenants }] = await Promise.all([
    supabase.from("properties").select("*").order("created_at"),
    supabase.from("profiles").select("property_id").eq("role", "tenant"),
  ]);

  const tenantCount = (id: string) => (tenants ?? []).filter((t) => t.property_id === id).length;

  return (
    <>
      <PageHeader eyebrow="Portfolio" title="Properties" />

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {((properties ?? []) as Property[]).map((p) => (
          <section key={p.id} className="card p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="flex items-center gap-2 font-medium">
                    {p.name}
                    {p.is_demo && <span className="badge bg-surface text-ink-subtle ring-1 ring-inset ring-line">Demo</span>}
                  </h2>
                  <p className="text-xs text-ink-subtle">{p.address || "No address"}</p>
                </div>
              </div>
              <span className="badge bg-brand-50 text-brand-700">
                <Users className="h-3 w-3" />
                {tenantCount(p.id)}
              </span>
            </div>

            <p className="label mt-6">Tenant link</p>
            <CopyLink path={`/p/${p.slug}`} />

            <Link href={`/company/setup?property=${p.id}`} className="btn btn-ghost -ml-3 mt-3 h-9 px-3 text-xs">
              <Settings2 className="h-3.5 w-3.5" />
              Configure agent
            </Link>
          </section>
        ))}

        <AddPropertyForm companyId={profile.company_id!} />
      </div>
    </>
  );
}
