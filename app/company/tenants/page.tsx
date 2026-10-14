import Link from "next/link";
import { PageHeader, EmptyState } from "@/components/PageHeader";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

type TenantRow = Profile & { properties?: { name: string } | null };

export default async function TenantsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*, properties(name)")
    .eq("role", "tenant")
    .order("created_at", { ascending: false });

  const tenants = (data ?? []) as TenantRow[];

  return (
    <>
      <PageHeader eyebrow={`${tenants.length} joined`} title="Tenants" />

      <div className="card mt-8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-line text-xs text-ink-subtle">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Unit</th>
                <th className="px-5 py-3 font-medium">Property</th>
                <th className="px-5 py-3 font-medium">Contact</th>
                <th className="px-5 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-sm">
              {tenants.map((t) => (
                <tr key={t.id} className="transition hover:bg-brand-50/40">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-xs font-medium text-brand-700">
                        {(t.full_name || t.email || "?").charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{t.full_name || "—"}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-ink-muted">{t.unit_number || "—"}</td>
                  <td className="px-5 py-4 text-ink-muted">{t.properties?.name || "—"}</td>
                  <td className="px-5 py-4">
                    <p className="text-ink-muted">{t.email}</p>
                    {t.phone && <p className="text-xs text-ink-subtle">{t.phone}</p>}
                  </td>
                  <td className="px-5 py-4 text-ink-subtle">
                    {t.created_at ? new Date(t.created_at).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {tenants.length === 0 && (
          <EmptyState
            title="No tenants yet"
            body="Tenants join through your property link."
            action={
              <Link href="/company/properties" className="btn btn-secondary">
                Get tenant link
              </Link>
            }
          />
        )}
      </div>
    </>
  );
}
