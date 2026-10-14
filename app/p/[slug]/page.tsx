import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { TenantJoinForm } from "@/components/auth/TenantJoinForm";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSession } from "@/lib/auth";
import { homeFor } from "@/lib/routes";

// Public tenant join page. Companies share this link with their tenants.
export default async function PropertyJoinPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const { profile } = await getSession();
  if (profile?.role === "tenant") redirect(homeFor(profile.role));
  const isCompanyPreview = profile?.role === "company";

  let propertyName = "Your property";
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const { data } = await supabase.rpc("get_property_by_slug", { p_slug: slug });
    const property = Array.isArray(data) ? data[0] : null;
    if (!property) notFound();
    propertyName = property.name;
  }

  return (
    <AuthShell
      eyebrow="Tenant portal"
      title={propertyName}
      subtitle="Report issues by call or chat. 24/7."
      footer={
        <>
          Already joined?{" "}
          <Link href="/login?next=/tenant" className="font-medium text-brand-700 hover:underline">
            Log in
          </Link>
        </>
      }
    >
      {isCompanyPreview ? (
        <div className="py-2 text-center">
          <p className="font-medium">Tenant join page</p>
          <p className="mt-1 text-sm text-ink-muted">Share this link with tenants. You're signed in as the company.</p>
          <Link href="/company/properties" className="btn btn-secondary mt-4">
            Back to properties
          </Link>
        </div>
      ) : (
        <TenantJoinForm propertySlug={slug} />
      )}
    </AuthShell>
  );
}
