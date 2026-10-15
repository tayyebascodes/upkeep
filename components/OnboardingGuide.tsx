"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  X, 
  Building2, 
  PhoneCall, 
  MessageSquare, 
  LayoutList, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2, 
  HelpCircle,
  Wrench,
  ShieldCheck,
  Bot
} from "lucide-react";

export function OnboardingGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Check if first-time visitor
  useEffect(() => {
    const hasSeenGuide = localStorage.getItem("upkeep_onboarding_seen");
    if (!hasSeenGuide) {
      // Delay slightly for smooth entrance after page load
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 900);
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
      title: "Welcome to Upkeep 👋",
      subtitle: "The 24/7 AI Maintenance Agent for Real Estate",
      content: (
        <div className="space-y-4 text-left">
          <p className="text-sm text-ink-muted leading-relaxed">
            Upkeep automates maintenance triage for apartment buildings and property management companies through natural voice calls and chat.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="rounded-xl border border-line bg-surface p-3.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 mb-2">
                <Building2 className="h-4 w-4" />
              </div>
              <p className="text-xs font-semibold text-ink">For Companies</p>
              <p className="mt-1 text-[11px] text-ink-muted leading-normal">
                Upload manuals, configure voice/tone, and watch tickets populate on a live dispatch board.
              </p>
            </div>

            <div className="rounded-xl border border-line bg-surface p-3.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 mb-2">
                <Bot className="h-4 w-4" />
              </div>
              <p className="text-xs font-semibold text-ink">For Tenants</p>
              <p className="mt-1 text-[11px] text-ink-muted leading-normal">
                No complex apps to install. Tenants call or chat to triage issues and track repairs in real time.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      badge: "Step 2 of 3",
      title: "How the AI Agent Thinks 🧠",
      subtitle: "Multi-Turn Diagnostics, Not a Simple Form",
      content: (
        <div className="space-y-3.5 text-left">
          <p className="text-sm text-ink-muted leading-relaxed">
            Unlike primitive chatbots that immediately log tickets, Upkeep acts like a seasoned maintenance dispatcher:
          </p>

          <div className="space-y-2.5">
            <div className="flex items-start gap-3 rounded-xl border border-line bg-white p-3 shadow-soft">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-800 text-xs font-bold">
                1
              </div>
              <div>
                <p className="text-xs font-semibold text-ink">Asks Diagnostic Questions</p>
                <p className="text-[11px] text-ink-muted">
                  Pinpoints exact locations, appliance models, and whether leaks/sparks are active.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-line bg-white p-3 shadow-soft">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-800 text-xs font-bold">
                2
              </div>
              <div>
                <p className="text-xs font-semibold text-ink">Guides Safe DIY Fixes First</p>
                <p className="text-[11px] text-ink-muted">
                  Guides tenants through 30-second checks (GFCI reset buttons, breaker checks, disposal resets).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-line bg-white p-3 shadow-soft">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-800 text-xs font-bold">
                3
              </div>
              <div>
                <p className="text-xs font-semibold text-ink">Files Official Work Orders</p>
                <p className="text-[11px] text-ink-muted">
                  Automatically classifies Category, assigns Severity, and syncs to your Supabase database.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      badge: "Step 3 of 3",
      title: "Try It Live Right Now 🚀",
      subtitle: "Choose an interactive path to test",
      content: (
        <div className="space-y-3 text-left">
          <p className="text-sm text-ink-muted">
            Everything is live and connected. Select what you'd like to explore:
          </p>

          <div className="space-y-2.5 pt-1">
            <Link
              href="/signup"
              onClick={handleClose}
              className="flex items-center justify-between rounded-xl border border-brand-200 bg-brand-50/60 p-3.5 hover:bg-brand-100/50 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-ink">Create a Company Account</p>
                  <p className="text-[11px] text-ink-muted">Sign up to manage properties and view the live board</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-brand-600 group-hover:translate-x-0.5 transition" />
            </Link>

            <Link
              href="/login"
              onClick={handleClose}
              className="flex items-center justify-between rounded-xl border border-line bg-white p-3.5 hover:border-brand-200 hover:bg-surface transition group shadow-soft"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface text-ink-muted">
                  <PhoneCall className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-ink">Log in to Your Dashboard</p>
                  <p className="text-[11px] text-ink-muted">Access your company or tenant view</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-ink-muted group-hover:text-brand-600 transition" />
            </Link>
          </div>

          <div className="rounded-xl bg-surface p-3 border border-line mt-3 text-center">
            <p className="text-[11px] text-ink-muted">
              💡 <span className="font-semibold text-ink">Quick Pro-Tip:</span> In the tenant chat, try saying: <br />
              <span className="italic font-medium text-brand-700">"My bathroom outlet isn't working"</span> to see the AI guide a fix!
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      {/* Floating Trigger Button (Always available in bottom right) */}
      <button
        onClick={handleResetAndOpen}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-xs font-semibold text-ink shadow-soft hover:border-brand-200 hover:bg-brand-50/50 hover:text-brand-700 active:scale-95 transition"
        title="Open interactive guide"
      >
        <Sparkles className="h-3.5 w-3.5 text-brand-600 animate-pulse" />
        <span>How to use Upkeep</span>
      </button>

      {/* Guide Modal Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white p-6 shadow-lift border border-line animate-pop-in">
            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-line pb-3.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-semibold text-brand-700">
                <Sparkles className="h-3 w-3 text-brand-600" />
                {steps[currentStep].badge}
              </span>

              <button
                onClick={handleClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-ink-subtle hover:bg-surface hover:text-ink transition"
                title="Close guide"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Step Content */}
            <div className="py-5">
              <h2 className="text-xl font-bold tracking-tight text-ink text-left">
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
                    className={`h-2 rounded-full transition-all ${
                      currentStep === i ? "w-6 bg-brand-600" : "w-2 bg-line hover:bg-brand-200"
                    }`}
                    title={`Go to step ${i + 1}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                {currentStep > 0 && (
                  <button
                    onClick={() => setCurrentStep((prev) => prev - 1)}
                    className="btn btn-secondary h-9 px-4 text-xs font-semibold"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Back</span>
                  </button>
                )}

                {currentStep < steps.length - 1 ? (
                  <button
                    onClick={() => setCurrentStep((prev) => prev + 1)}
                    className="btn btn-primary h-9 px-4 text-xs font-semibold"
                  >
                    <span>Next</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={handleClose}
                    className="btn btn-primary h-9 px-5 text-xs font-semibold"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Got it!</span>
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
