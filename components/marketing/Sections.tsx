import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function PageHero({ eyebrow, title, body }: { eyebrow: string; title: React.ReactNode; body: string }) {
  return (
    <section className="relative py-16 text-center sm:py-24">
      <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[360px] w-[680px] -translate-x-1/2 rounded-full bg-brand-400/15 blur-[120px]" />
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">{title}</h1>
      <p className="mx-auto mt-5 max-w-lg text-lg text-ink-muted">{body}</p>
    </section>
  );
}

export function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <>
      <p className="eyebrow text-center">{eyebrow}</p>
      <h2 className="mt-3 text-center text-3xl font-semibold tracking-tight">{title}</h2>
    </>
  );
}

export function IconCard({ icon: Icon, title, body }: { icon: LucideIcon; title: string; body: string }) {
  return (
    <div className="card p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-6 font-medium">{title}</h3>
      <p className="mt-1 text-sm text-ink-muted">{body}</p>
    </div>
  );
}

export function CtaBand({
  title = "Put maintenance on autopilot.",
  body = "Set up your first property today.",
  href = "/signup",
  label = "Get started",
}: {
  title?: string;
  body?: string;
  href?: string;
  label?: string;
}) {
  return (
    <section className="pb-24">
      <div className="relative overflow-hidden rounded-3xl bg-brand-600 px-8 py-14 text-center text-white">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-2 text-brand-100">{body}</p>
        <Link href={href} className="btn mt-8 h-11 bg-white px-6 text-brand-700 hover:bg-brand-50">
          {label}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
