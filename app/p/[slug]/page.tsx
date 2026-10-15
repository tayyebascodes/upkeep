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
  let propertyRecord: any = null;

  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const { data: propBySlug } = await supabase.from("properties").select("*").eq("slug", slug).maybeSingle();
    if (propBySlug) {
      propertyRecord = propBySlug;
      propertyName = propBySlug.name;
    } else {
      const { data } = await supabase.rpc("get_property_by_slug", { p_slug: slug });
      const property = Array.isArray(data) ? data[0] : null;
      if (!property) notFound();
      propertyRecord = property;
      propertyName = property.name;
    }
  }

  const { getAgentPersona } = await import("@/lib/agent-config");
  const persona = getAgentPersona(propertyRecord);

  return (
    <AuthShell
      eyebrow="Tenant portal"
      title={propertyName}
      subtitle={`Report issues by call or chat with ${persona.name}. 24/7.`}
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
        <div className="py-2 text-center space-y-4">
          <div className="rounded-2xl border border-line bg-surface/50 p-4 text-left">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">Configured Assistant</span>
              <span className="badge bg-brand-50 text-brand-700 text-[11px]">{persona.toneName}</span>
            </div>
            <div className="mt-2.5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-white font-semibold text-sm">
                {persona.name[0]}
              </div>
              <div>
                <p className="font-semibold text-ink text-sm">{persona.name}</p>
                <p className="text-xs text-ink-muted">
                  Voice: {persona.voiceLabel} · {persona.language}
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-ink-muted">
            Share this link with your residents so they can join and report issues to {persona.name}.
          </p>

          <div className="flex flex-col gap-2 pt-1">
            <Link href={`/company/setup?property=${propertyRecord?.id}`} className="btn btn-primary">
              Configure agent & SOPs
            </Link>
            <Link href="/company" className="btn btn-secondary">
              Back to dispatch board
            </Link>
          </div>
        </div>
      ) : (
        <TenantJoinForm propertySlug={slug} />
      )}
    </AuthShell>
  );
}
