"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  X, 
  Building2, 
  PhoneCall, 
  LayoutList, 
  ArrowRight, 
  ArrowLeft,
  Check, 
  HelpCircle,
  Wrench,
  ShieldCheck,
  Bot
} from "lucide-react";

export function OnboardingGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeenGuide = localStorage.getItem("upkeep_onboarding_seen");
    if (!hasSeenGuide) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("upkeep_onboarding_seen", "true");
    setIsOpen(false);
  };

  const handleResetAndOpen = () => {
    setCurrentStep(0);
    setIsOpen(true);
  };

  const steps = [
    {
      badge: "Step 1 of 3",
      title: "Welcome to Upkeep",
      subtitle: "Autonomous maintenance triage for property management and tenants.",
      content: (
        <div className="space-y-4 text-left">
          <p className="text-sm text-ink-muted leading-relaxed">
            Upkeep automates tenant maintenance intake with conversational AI that asks the right diagnostic questions, guides safe self-fixes, and dispatches verified work orders.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="card p-3.5 bg-surface/60">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 mb-2">
                <Building2 className="h-4 w-4" />
              </div>
              <p className="text-xs font-semibold text-ink">Property managers</p>
              <p className="mt-1 text-[11px] text-ink-muted leading-normal">
                Upload custom SOPs and building manuals. Track all incoming work orders on a live dispatch board.
              </p>
            </div>

            <div className="card p-3.5 bg-surface/60">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 mb-2">
                <Bot className="h-4 w-4" />
              </div>
              <p className="text-xs font-semibold text-ink">Residents & tenants</p>
              <p className="mt-1 text-[11px] text-ink-muted leading-normal">
                No app installation required. Tenants call or message the AI agent directly from their property link.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      badge: "Step 2 of 3",
      title: "Intelligent triage workflow",
      subtitle: "Multi-turn diagnostic reasoning before dispatching technicians.",
      content: (
        <div className="space-y-3 text-left">
          <p className="text-sm text-ink-muted leading-relaxed">
            Rather than creating unvetted tickets, the agent conducts a structured triage dialogue:
          </p>

          <div className="space-y-2.5">
            <div className="flex items-start gap-3 rounded-xl border border-line bg-white p-3">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                <Wrench className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-ink">Diagnostic questions</p>
                <p className="text-[11px] text-ink-muted">
                  Clarifies exact fixture locations, appliance models, and whether water leaks or electrical hazards are active.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-line bg-white p-3">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                <ShieldCheck className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-ink">Safe self-fix guidance</p>
                <p className="text-[11px] text-ink-muted">
                  Walks tenants through safe 30-second steps (GFCI outlet resets, breaker checks, disposal buttons) to resolve false alarms.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-line bg-white p-3">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                <LayoutList className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-ink">Standardized work orders</p>
                <p className="text-[11px] text-ink-muted">
                  Assigns trade categories and severity ratings (Emergency, High, Medium, Low), then syncs tickets to your database.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      badge: "Step 3 of 3",
      title: "Explore the live platform",
      subtitle: "Select a view to test the system in real time.",
      content: (
        <div className="space-y-3 text-left">
          <p className="text-sm text-ink-muted">
            The platform is connected to live services. Choose an area to test:
          </p>

          <div className="space-y-2.5 pt-1">
            <Link
              href="/p/sunset-heights"
              onClick={handleClose}
              className="flex items-center justify-between rounded-xl border border-line bg-white p-3.5 hover:border-brand-200 hover:bg-brand-50/40 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <PhoneCall className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-ink">Tenant portal (Sunset Heights)</p>
                  <p className="text-[11px] text-ink-muted">Test real-time voice calling and diagnostic chat</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-ink-subtle group-hover:text-brand-600 group-hover:translate-x-0.5 transition" />
            </Link>

            <Link
              href="/company"
              onClick={handleClose}
              className="flex items-center justify-between rounded-xl border border-line bg-white p-3.5 hover:border-brand-200 hover:bg-brand-50/40 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface text-ink-muted">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-ink">Company dispatch dashboard</p>
                  <p className="text-[11px] text-ink-muted">View work orders, status filters, and building properties</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-ink-subtle group-hover:text-brand-600 group-hover:translate-x-0.5 transition" />
            </Link>
          </div>

          <div className="rounded-xl bg-surface p-3 border border-line mt-3 flex items-start gap-2.5">
            <HelpCircle className="h-4 w-4 text-brand-600 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-ink-muted leading-relaxed">
              <span className="font-semibold text-ink">Suggested test:</span> In the tenant chat, enter{" "}
              <span className="font-medium text-brand-700">&quot;My bathroom outlet stopped working&quot;</span>{" "}
              to see how the agent assists with troubleshooting before escalating to dispatch.
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={handleResetAndOpen}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full border border-line bg-white/95 px-3.5 py-2 text-xs font-medium text-ink shadow-soft backdrop-blur hover:border-brand-200 hover:text-brand-700 active:scale-[0.98] transition"
        title="Open platform guide"
      >
        <HelpCircle className="h-3.5 w-3.5 text-brand-600" />
        <span>Platform guide</span>
      </button>

      {/* Guide Modal Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white p-6 shadow-lift border border-line animate-pop-in">
            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-line pb-3.5">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold tracking-tight text-ink">
                  Upkeep<span className="text-brand-600">.</span>
                </span>
                <span className="badge bg-brand-50 text-brand-700 text-[11px]">
                  {steps[currentStep].badge}
                </span>
              </div>

              <button
                onClick={handleClose}
                className="btn btn-ghost btn-icon h-8 w-8 text-ink-subtle hover:text-ink"
                title="Close guide"
                aria-label="Close guide"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Step Content */}
            <div className="py-5">
              <h2 className="text-xl font-semibold tracking-tight text-ink text-left">
                {steps[currentStep].title}
              </h2>
              <p className="text-xs text-ink-muted mt-0.5 text-left mb-4">
                {steps[currentStep].subtitle}
              </p>

              {steps[currentStep].content}
            </div>

            {/* Bottom Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-line">
              <div className="flex items-center gap-1.5">
                {steps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentStep(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      currentStep === i ? "w-5 bg-brand-600" : "w-1.5 bg-line hover:bg-brand-200"
                    }`}
                    title={`Go to step ${i + 1}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                {currentStep > 0 && (
                  <button
                    onClick={() => setCurrentStep((prev) => prev - 1)}
                    className="btn btn-secondary h-9 px-4 text-xs"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Back</span>
                  </button>
                )}

                {currentStep < steps.length - 1 ? (
                  <button
                    onClick={() => setCurrentStep((prev) => prev + 1)}
                    className="btn btn-primary h-9 px-4 text-xs"
                  >
                    <span>Next</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={handleClose}
                    className="btn btn-primary h-9 px-4 text-xs"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Done</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
