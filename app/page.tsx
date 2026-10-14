import Link from "next/link";
import {
  ArrowRight,
  AudioLines,
  BookOpenCheck,
  FileText,
  LayoutList,
  Link2,
  MessageSquare,
  PhoneCall,
  Siren,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { TicketStatusCard } from "@/components/TicketStatusCard";
import { MOCK_TICKETS } from "@/lib/mock";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { CtaBand } from "@/components/marketing/Sections";

const STATS = [
  { value: "24/7", label: "Always on" },
  { value: "70%", label: "Solved on the call" },
  { value: "0", label: "Manual intake" },
];

const FEATURES = [
  { icon: AudioLines, title: "Voice triage", body: "Tenants call. The agent asks the right questions." },
  { icon: BookOpenCheck, title: "Guided fixes", body: "Answers from your own manuals and SOPs." },
  { icon: Siren, title: "Emergency escalation", body: "Gas, fire, flooding go straight to your on-call line." },
  { icon: LayoutList, title: "One dispatch board", body: "Every request, every property, live." },
];

const STEPS = [
  { icon: FileText, title: "Upload SOPs", body: "Manuals and guides." },
  { icon: AudioLines, title: "Pick a voice", body: "Tone, language, escalation." },
  { icon: Link2, title: "Share the link", body: "Tenants join, then call or chat." },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 sm:px-6">
        {/* Hero */}
        <section className="relative grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-[1.1fr_1fr]">
          <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-brand-400/15 blur-[120px]" />

          <div>
            <p className="eyebrow">For property management companies</p>
            <h1 className="mt-4 text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              Maintenance,
              <br />
              <span className="text-brand-600">handled.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg text-ink-muted">
              An AI agent that answers every tenant call, guides simple fixes, and dispatches the rest.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/signup" className="btn btn-primary h-11 px-6">
                Get started
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/how-it-works" className="btn btn-secondary h-11 px-6">
                How it works
              </Link>
            </div>
          </div>

          {/* Product preview */}
          <div className="card p-2 shadow-lift">
            <div className="flex items-center justify-between px-3 pb-2 pt-2.5">
              <p className="text-sm font-medium">Live requests</p>
              <span className="flex items-center gap-1.5 text-xs text-ink-subtle">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-500" /> Synced
              </span>
            </div>
            {MOCK_TICKETS.slice(0, 4).map((t) => (
              <TicketStatusCard key={t.id} ticket={t} />
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-3 divide-x divide-line border-y border-line py-8">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-semibold tracking-tight text-brand-600 sm:text-4xl">{s.value}</p>
              <p className="mt-1 text-xs text-ink-muted sm:text-sm">{s.label}</p>
            </div>
          ))}
        </section>

        {/* Features */}
        <section id="features" className="scroll-mt-20 py-20">
          <p className="eyebrow text-center">Features</p>
          <h2 className="mt-3 text-center text-3xl font-semibold tracking-tight">Less phone tag. Fewer truck rolls.</h2>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="card p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-6 font-medium">{f.title}</h3>
                <p className="mt-1 text-sm text-ink-muted">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="scroll-mt-20 pb-20">
          <p className="eyebrow text-center">How it works</p>
          <h2 className="mt-3 text-center text-3xl font-semibold tracking-tight">Live in minutes.</h2>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <div key={step.title} className="card p-6">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium text-ink-subtle">0{i + 1}</span>
                </div>
                <h3 className="mt-6 font-medium">{step.title}</h3>
                <p className="mt-1 text-sm text-ink-muted">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tenant experience */}
        <section id="tenants" className="scroll-mt-20 pb-20">
          <div className="card grid items-center gap-10 overflow-hidden p-8 sm:p-12 lg:grid-cols-2">
            <div>
              <p className="eyebrow">For your tenants</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">One link. Call or chat.</h2>
              <p className="mt-3 max-w-sm text-ink-muted">
                Tenants join with your property link and track every request in real time.
              </p>
            </div>

            {/* Mini tenant portal mock */}
            <div className="mx-auto w-full max-w-sm space-y-3 rounded-3xl bg-surface p-4">
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
              <div className="rounded-2xl border border-line bg-white p-1">
                <TicketStatusCard ticket={MOCK_TICKETS[0]} />
              </div>
            </div>
          </div>
        </section>

        <CtaBand />
      </main>

      <MarketingFooter />
    </div>
  );
}
