import type { Metadata } from "next";
import {
  AudioLines,
  BookOpenCheck,
  Building2,
  Languages,
  LayoutList,
  MessageSquare,
  Radio,
  ShieldCheck,
  Siren,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { CtaBand, IconCard, PageHero, SectionTitle } from "@/components/marketing/Sections";

export const metadata: Metadata = { title: "Features | Upkeep" };

const CORE = [
  { icon: AudioLines, title: "Voice triage", body: "A natural voice agent picks up every call and asks the right questions." },
  { icon: MessageSquare, title: "Chat", body: "Same agent, by text. For tenants who'd rather type." },
  { icon: BookOpenCheck, title: "Guided fixes", body: "Answers from your manuals. Breakers, filters, resets — solved on the call." },
  { icon: Siren, title: "Emergency escalation", body: "Gas, fire, flooding. Safety steps first, then your on-call line." },
  { icon: LayoutList, title: "Dispatch board", body: "Every request with unit, category and severity. Update status in one click." },
  { icon: Radio, title: "Live status", body: "Tenants see progress in real time. No “any update?” calls." },
];

const MORE = [
  { icon: Building2, title: "Multi-property", body: "One account, every building. Filter by property." },
  { icon: Languages, title: "Languages & tone", body: "English, Spanish or auto-detect. Pick the voice." },
  { icon: ShieldCheck, title: "Private by default", body: "Tenants see only their requests. Companies see only theirs." },
];

export default function FeaturesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 sm:px-6">
        <PageHero
          eyebrow="Features"
          title={
            <>
              Everything your front desk does.
              <br />
              <span className="text-brand-600">Around the clock.</span>
            </>
          }
          body="Intake, troubleshooting, escalation and tracking — handled by one agent."
        />

        <section className="pb-20">
          <SectionTitle eyebrow="Core" title="From call to closed." />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CORE.map((f) => (
              <IconCard key={f.title} {...f} />
            ))}
          </div>
        </section>

        {/* Highlight */}
        <section className="pb-20">
          <div className="card grid items-center gap-10 p-8 sm:p-12 lg:grid-cols-2">
            <div>
              <p className="eyebrow">Safety first</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">Emergencies never wait in a queue.</h2>
              <p className="mt-3 max-w-sm text-ink-muted">
                Keywords like gas, smoke or burst pipe trigger safety guidance and an instant alert.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2 rounded-3xl bg-surface p-4">
              <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-brand-600 px-4 py-2.5 text-sm text-white">
                I smell gas in the kitchen.
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-xs font-medium text-white">
                <Siren className="h-3.5 w-3.5" /> Emergency: call 911. Dispatch notified.
              </div>
              <div className="w-fit max-w-[85%] rounded-2xl rounded-bl-md border border-line bg-white px-4 py-2.5 text-sm">
                Leave the unit now. Don&rsquo;t touch any switches.
              </div>
            </div>
          </div>
        </section>

        <section className="pb-20">
          <SectionTitle eyebrow="And more" title="Built for portfolios." />
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {MORE.map((f) => (
              <IconCard key={f.title} {...f} />
            ))}
          </div>
        </section>

        <CtaBand />
      </main>
      <MarketingFooter />
    </div>
  );
}
