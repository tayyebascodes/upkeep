import type { Metadata } from "next";
import Link from "next/link";
import { Bell, Link2, MessageSquare, PhoneCall, UserPlus } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { IconCard, PageHero, SectionTitle } from "@/components/marketing/Sections";
import { TicketStatusCard } from "@/components/TicketStatusCard";
import { MOCK_TICKETS } from "@/lib/mock";

export const metadata: Metadata = { title: "For tenants | Upkeep" };

const STEPS = [
  { icon: Link2, title: "Get your link", body: "Your property manager sends it." },
  { icon: UserPlus, title: "Join", body: "Name, unit, email. Done." },
  { icon: PhoneCall, title: "Call or chat", body: "Describe the issue. Any hour." },
  { icon: Bell, title: "Track it", body: "See status change live." },
];

const FAQ = [
  { q: "Is it free for tenants?", a: "Yes. Your property manager covers it." },
  { q: "What if it's an emergency?", a: "Call 911 first. The agent also alerts your manager's on-call line." },
  { q: "No link yet?", a: "Ask your property manager. Each building has its own." },
];

export default function ForTenantsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 sm:px-6">
        <PageHero
          eyebrow="For tenants"
          title={
            <>
              Something broke?
              <br />
              <span className="text-brand-600">Just say so.</span>
            </>
          }
          body="Report issues by call or chat, 24/7, and watch them get fixed."
        />

        {/* Preview */}
        <section className="pb-20">
          <div className="mx-auto w-full max-w-sm space-y-3 rounded-3xl bg-white p-4 shadow-lift ring-1 ring-line">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-4 rounded-2xl bg-brand-600 p-4 text-white">
                <PhoneCall className="h-5 w-5" />
                <p className="text-sm font-medium">Call</p>
              </div>
              <div className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-4">
                <MessageSquare className="h-5 w-5 text-brand-600" />
                <p className="text-sm font-medium">Chat</p>
              </div>
            </div>
            <div className="rounded-2xl bg-surface p-1">
              {MOCK_TICKETS.slice(0, 2).map((t) => (
                <TicketStatusCard key={t.id} ticket={t} />
              ))}
            </div>
          </div>
        </section>

        <section className="pb-20">
          <SectionTitle eyebrow="Getting started" title="Four steps. One minute." />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <IconCard key={s.title} {...s} />
            ))}
          </div>
        </section>

        <section className="pb-20">
          <SectionTitle eyebrow="Questions" title="Good to know." />
          <div className="card mx-auto mt-12 max-w-2xl divide-y divide-line">
            {FAQ.map((f) => (
              <div key={f.q} className="p-6">
                <h3 className="font-medium">{f.q}</h3>
                <p className="mt-1 text-sm text-ink-muted">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="pb-24 text-center">
          <p className="text-sm text-ink-muted">Already joined?</p>
          <Link href="/login?next=/tenant" className="btn btn-primary mt-3 h-11 px-6">
            Tenant log in
          </Link>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
