import Link from "next/link";
import { 
  Building2, 
  Sparkles, 
  PhoneCall, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  Users, 
  FileText, 
  Sliders, 
  CheckCircle2, 
  Wrench,
  Bot
} from "lucide-react";
import { Navbar } from "@/components/Navbar";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Hero Section (Matches Real Estate Company Flow Step 1) */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-400/10 blur-[120px] rounded-full -z-10 pointer-events-none" />

        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 border border-blue-200/80 mb-6 shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-blue-600" />
          <span>Real Estate Maintenance AI Agent</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 max-w-3xl mx-auto leading-tight">
          Handle tenant queries & maintenance <span className="text-blue-600 underline decoration-blue-200 underline-offset-8">24/7 automatically</span>.
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Set up your property maintenance agent in minutes. Tenants get instant voice triage, guided self-resolution for minor fixes, and automatic dispatch.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/admin"
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700 active:scale-95 transition"
          >
            <span>Open Company Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/p/sunset-heights"
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-sm transition"
          >
            <PhoneCall className="h-4 w-4 text-blue-600" />
            <span>Try Live Tenant Voice Call</span>
          </Link>
        </div>

        {/* Value Props Row (Matches Design Middle Banner) */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-2.5 rounded-2xl bg-white p-3.5 border border-slate-200/80 shadow-sm text-left">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 flex-shrink-0">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Automates Triage</p>
              <p className="text-[10px] text-slate-500">Zero manual call intake</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-2xl bg-white p-3.5 border border-slate-200/80 shadow-sm text-left">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 flex-shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Saves Team Time</p>
              <p className="text-[10px] text-slate-500">70% solved on call</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-2xl bg-white p-3.5 border border-slate-200/80 shadow-sm text-left">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 flex-shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">24/7 Emergency</p>
              <p className="text-[10px] text-slate-500">Instant safety protocols</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-2xl bg-white p-3.5 border border-slate-200/80 shadow-sm text-left">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600 flex-shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Satisfied Tenants</p>
              <p className="text-[10px] text-slate-500">Real-time status updates</p>
            </div>
          </div>
        </div>

        {/* 5-Step Company Flow Visualizer (Exact breakdown from Design image) */}
        <div className="mt-20 text-left">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-900">How Upkeep Works for Real Estate Companies</h2>
            <p className="text-sm text-slate-500 mt-1">Set up your maintenance agent in minutes and let it handle tenant queries 24/7.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Step 1 */}
            <div className="rounded-2xl bg-white p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
              <div>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold mb-3">1</span>
                <h3 className="text-sm font-bold text-slate-900">Visit Homepage</h3>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                  Learn about features and how Upkeep automates maintenance requests.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="rounded-2xl bg-white p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
              <div>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold mb-3">2</span>
                <h3 className="text-sm font-bold text-slate-900">Easy Signup</h3>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                  Create your company account in just a few steps. No complex setup.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="rounded-2xl bg-white p-5 border border-blue-200 shadow-sm bg-gradient-to-b from-white to-blue-50/30 flex flex-col justify-between">
              <div>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold mb-3">3</span>
                <h3 className="text-sm font-bold text-slate-900">Set Up Agent</h3>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                  Upload maintenance SOPs and customize voice, tone, and emergency contacts.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="rounded-2xl bg-white p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
              <div>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold mb-3">4</span>
                <h3 className="text-sm font-bold text-slate-900">Publish & Go Live</h3>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                  Review settings and get your custom public tenant link ready to share.
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="rounded-2xl bg-white p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
              <div>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold mb-3">5</span>
                <h3 className="text-sm font-bold text-slate-900">Use the Agent</h3>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                  Tenants make web voice calls or chat. Tickets populate in your dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
