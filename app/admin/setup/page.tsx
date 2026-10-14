"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Building2, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  Rocket, 
  Sliders, 
  Sparkles, 
  ArrowLeft,
  Copy,
  ExternalLink,
  Volume2,
  Trash2
} from "lucide-react";
import { Navbar } from "@/components/Navbar";

export default function AgentSetupPage() {
  const [voice, setVoice] = useState("Female (Natural)");
  const [language, setLanguage] = useState("English");
  const [tone, setTone] = useState("Professional & Empathetic");
  const [emergencyPhone, setEmergencyPhone] = useState("+1 (555) 911-0022");
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([
    "Whirlpool_Dishwasher_Troubleshooting_Guide.pdf",
    "Building_HVAC_Reset_Manual.docx",
  ]);
  const [isPublished, setIsPublished] = useState(true);
  const [copied, setCopied] = useState(false);

  const publicLink = "http://localhost:3000/p/sunset-heights";

  const handleCopy = () => {
    navigator.clipboard.writeText(publicLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFiles((prev) => [...prev, e.target.files![0].name]);
    }
  };

  const handleDeleteFile = (indexToRemove: number) => {
    setUploadedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-6 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Maintenance Agent Setup</h1>
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
              Company Onboarding
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Upload your property's maintenance manuals and configure the voice persona.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Upload Documents & Customization (Step 3 in Image) */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Card 1: Document Upload */}
            <div className="rounded-3xl bg-white p-6 border border-slate-200/90 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">1</span>
                <h3 className="text-sm font-bold text-slate-900">Maintenance Documents & SOPs</h3>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                The agent references these manuals during voice triage to guide self-resolution.
              </p>

              {/* Upload Dropzone */}
              <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition">
                <UploadCloud className="h-8 w-8 text-blue-600 mb-2" />
                <p className="text-xs font-bold text-slate-800">Upload documents (PDF, DOCX, etc.)</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Click to browse or drag and drop</p>
                <input type="file" onChange={handleFileUpload} className="hidden" accept=".pdf,.docx,.txt" />
              </label>

              {/* File list */}
              <div className="mt-4 space-y-2">
                {uploadedFiles.map((file, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2 text-xs border border-slate-200/60 hover:border-slate-300 transition">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <span className="font-medium text-slate-800 truncate">{file}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Vectorized
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteFile(i)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Delete file"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 2: Customize Agent Voice & Tone */}
            <div className="rounded-3xl bg-white p-6 border border-slate-200/90 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">2</span>
                <h3 className="text-sm font-bold text-slate-900">Customize Voice & Personality</h3>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Controls the ElevenLabs human voice persona heard by calling tenants.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Voice</label>
                  <select
                    value={voice}
                    onChange={(e) => setVoice(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Female (Natural)">Female (Natural - Sarah)</option>
                    <option value="Male (Trustworthy)">Male (Trustworthy - Eric)</option>
                    <option value="Warm & Calm">Warm & Calm (Jessica)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="Bilingual">Bilingual (Auto-detect)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tone</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Professional & Empathetic">Professional & Empathetic</option>
                    <option value="Concise & Fast">Concise & Direct</option>
                    <option value="Friendly & Casual">Friendly & Casual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Escalation Phone</label>
                  <input
                    type="text"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Review & Publish (Step 4 in Image) */}
          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Review & Publish</h3>
                <p className="text-xs text-slate-500 mb-4">
                  Check your settings before publishing to live tenants.
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    <span>Documents uploaded ({uploadedFiles.length})</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    <span>Manual configured (pgvector)</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    <span>Voice ({voice})</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    <span>ElevenLabs live binding</span>
                  </div>
                </div>
              </div>

              <div>
                <button
                  onClick={() => setIsPublished(true)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition"
                >
                  <Rocket className="h-4 w-4" />
                  <span>{isPublished ? "Agent Live & Active" : "Publish Agent"}</span>
                </button>

                {/* Tenant Share Link Box */}
                {isPublished && (
                  <div className="mt-4 rounded-2xl bg-blue-50/70 p-3.5 border border-blue-200">
                    <p className="text-[11px] font-bold text-blue-900 mb-1">Your Public Tenant Link:</p>
                    <div className="flex items-center justify-between gap-2 bg-white rounded-lg px-2.5 py-1.5 border border-blue-200">
                      <span className="text-xs text-slate-600 truncate font-mono">{publicLink}</span>
                      <button
                        onClick={handleCopy}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <Copy className="h-3 w-3" />
                        <span>{copied ? "Copied!" : "Copy"}</span>
                      </button>
                    </div>

                    <Link
                      href="/p/sunset-heights"
                      target="_blank"
                      className="mt-2.5 flex items-center justify-center gap-1 text-xs font-bold text-blue-700 hover:underline"
                    >
                      <span>Open Tenant Portal</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
