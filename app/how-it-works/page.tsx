import type { Metadata } from "next";
import { AudioLines, ClipboardCheck, FileText, Link2, PhoneCall, Wrench } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { CtaBand, PageHero, SectionTitle } from "@/components/marketing/Sections";

export const metadata: Metadata = { title: "How it works | Upkeep" };

const SETUP = [
  { icon: FileText, title: "Upload your SOPs", body: "Appliance manuals, reset guides, building rules. PDF, DOCX or TXT." },
  { icon: AudioLines, title: "Pick a voice", body: "Choose voice, tone and language. Add your emergency line." },
  { icon: Link2, title: "Share the link", body: "Each property gets a join link. Send it to tenants." },
];

const FLOW = [
  { icon: PhoneCall, title: "Tenant calls or chats", body: "From their phone, any time." },
  { icon: AudioLines, title: "Agent triages", body: "Asks what, where, how bad." },
  { icon: Wrench, title: "Fix or ticket", body: "Simple issue? Guided fix. Otherwise, a ticket." },
  { icon: ClipboardCheck, title: "You dispatch", body: "Ticket lands on your board. Tenant sees updates." },
];

export default function HowItWorksPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 sm:px-6">
        <PageHero
          eyebrow="How it works"
          title={
            <>
              Live in minutes.
              <br />
              <span className="text-brand-600">Working for years.</span>
            </>
          }
          body="Three steps to set up. Then every request runs the same way."
        />

        {/* Setup timeline */}
        <section className="pb-20">
          <SectionTitle eyebrow="Setup" title="Three steps." />
          <ol className="mx-auto mt-12 max-w-2xl">
            {SETUP.map((s, i) => (
              <li key={s.title} className="relative flex gap-5 pb-10 last:pb-0">
                {i < SETUP.length - 1 && <span className="absolute left-5 top-12 h-[calc(100%-3rem)] w-px bg-line" />}
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-medium text-white">
                  {i + 1}
                </div>
                <div className="card flex-1 p-5">
                  <div className="flex items-center gap-2">
                    <s.icon className="h-4 w-4 text-brand-600" />
                    <h3 className="font-medium">{s.title}</h3>
                  </div>
                  <p className="mt-1 text-sm text-ink-muted">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Request flow */}
        <section className="pb-20">
          <SectionTitle eyebrow="Every request" title="What happens on a call." />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FLOW.map((f, i) => (
              <div key={f.title} className="card relative p-6">
                <span className="absolute right-5 top-5 text-xs font-medium text-ink-subtle">0{i + 1}</span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-6 font-medium">{f.title}</h3>
                <p className="mt-1 text-sm text-ink-muted">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        <CtaBand title="Ready when you are." body="Create an account and add your first property." />
      </main>
      <MarketingFooter />
    </div>
  );
}
