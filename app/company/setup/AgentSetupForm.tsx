"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UploadCloud, FileText, Check, ArrowUpRight, Trash2, PhoneCall, MessageSquare } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { CopyLink } from "@/components/CopyLink";
import { FormError } from "@/components/auth/Field";
import { Select } from "@/components/Select";
import { VoiceCallModal } from "@/components/VoiceCallModal";
import { ChatDrawer } from "@/components/ChatDrawer";
import { createClient } from "@/lib/supabase/client";
import type { Property, PropertyDocument } from "@/lib/types";

const VOICE_OPTIONS = [
  { value: "Female (Natural)", label: "Sarah — Natural" },
  { value: "Male (Trustworthy)", label: "Eric — Trustworthy" },
  { value: "Warm & Calm", label: "Jessica — Warm" },
];

const LANGUAGE_OPTIONS = [
  { value: "English", label: "English" },
  { value: "Spanish", label: "Spanish" },
  { value: "Bilingual", label: "Auto-detect" },
];

const TONE_OPTIONS = [
  { value: "Professional & Empathetic", label: "Professional" },
  { value: "Concise & Fast", label: "Direct" },
  { value: "Friendly & Casual", label: "Friendly" },
];

interface AgentSetupFormProps {
  property: Property;
  properties: Pick<Property, "id" | "name">[];
  initialDocuments: PropertyDocument[];
}

export function AgentSetupForm({ property, properties, initialDocuments }: AgentSetupFormProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [name, setName] = useState(property.name);
  const [address, setAddress] = useState(property.address ?? "");
  const [voice, setVoice] = useState(property.agent_voice ?? "Female (Natural)");
  const [language, setLanguage] = useState(property.agent_language ?? "English");
  const [tone, setTone] = useState(property.agent_tone ?? "Professional & Empathetic");
  const [emergencyPhone, setEmergencyPhone] = useState(property.emergency_contact ?? "");
  const [documents, setDocuments] = useState(initialDocuments);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const previewProperty: Property = useMemo(
    () => ({
      ...property,
      name: name.trim() || property.name,
      address: address.trim() || property.address,
      agent_voice: voice,
      agent_language: language,
      agent_tone: tone,
      emergency_contact: emergencyPhone.trim() || null,
    }),
    [property, name, address, voice, language, tone, emergencyPhone]
  );

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const { error } = await supabase
      .from("properties")
      .update({
        name: name.trim(),
        address: address.trim() || null,
        agent_voice: voice,
        agent_language: language,
        agent_tone: tone,
        emergency_contact: emergencyPhone.trim() || null,
      })
      .eq("id", property.id);
    setSaving(false);

    if (error) return setError(error.message);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    setError(null);
    const path = `${property.id}/${Date.now()}-${file.name.replace(/[^\w.-]+/g, "_")}`;

    const { error: uploadError } = await supabase.storage.from("documents").upload(path, file);
    if (uploadError) {
      setUploading(false);
      return setError(uploadError.message);
    }

    const { data, error: insertError } = await supabase
      .from("documents")
      .insert({ property_id: property.id, name: file.name, storage_path: path })
      .select()
      .single();
    setUploading(false);

    if (insertError) return setError(insertError.message);
    setDocuments((prev) => [...prev, data as PropertyDocument]);
  };

  const handleDelete = async (doc: PropertyDocument) => {
    setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    await supabase.storage.from("documents").remove([doc.storage_path]);
    const { error } = await supabase.from("documents").delete().eq("id", doc.id);
    if (error) {
      setError(error.message);
      setDocuments((prev) => [...prev, doc]);
    }
  };

  const checklist = [
    { done: documents.length > 0, label: `${documents.length} documents` },
    { done: Boolean(emergencyPhone.trim()), label: "Emergency phone" },
    { done: true, label: VOICE_OPTIONS.find((v) => v.value === voice)?.label ?? voice },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Agent"
        title="Setup"
        actions={
          properties.length > 1 && (
            <Select
              value={property.id}
              onChange={(id) => router.push(`/company/setup?property=${id}`)}
              options={properties.map((p) => ({ value: p.id, label: p.name }))}
              className="w-auto max-w-[240px] rounded-full"
              aria-label="Property"
            />
          )
        }
      />

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-4 md:col-span-2">
          {/* Property */}
          <section className="card p-6">
            <h2 className="font-medium">Property</h2>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="input" />
              </div>
              <div>
                <label className="label">Address</label>
                <input value={address} onChange={(e) => setAddress(e.target.value)} className="input" />
              </div>
            </div>
          </section>

          {/* Knowledge */}
          <section className="card p-6">
            <h2 className="font-medium">Knowledge</h2>
            <p className="mt-0.5 text-sm text-ink-muted">Manuals the agent uses to guide fixes.</p>

            <label
              className={`mt-5 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-brand-200 bg-brand-50/40 p-8 text-center transition hover:border-brand-400 hover:bg-brand-50 ${
                uploading ? "pointer-events-none opacity-60" : ""
              }`}
            >
              <UploadCloud className="mb-2 h-6 w-6 text-brand-600" />
              <p className="text-sm font-medium">{uploading ? "Uploading…" : "Drop files or browse"}</p>
              <p className="mt-0.5 text-xs text-ink-subtle">PDF, DOCX, TXT</p>
              <input type="file" onChange={handleFileUpload} className="hidden" accept=".pdf,.docx,.txt" />
            </label>

            {documents.length > 0 && (
              <ul className="mt-3 divide-y divide-line">
                {documents.map((doc) => (
                  <li key={doc.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <FileText className="h-4 w-4 flex-shrink-0 text-brand-600" />
                      <span className="truncate">{doc.name}</span>
                    </div>
                    <button
                      onClick={() => handleDelete(doc)}
                      className="btn btn-ghost btn-icon h-8 w-8"
                      aria-label={`Remove ${doc.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Voice */}
          <section className="card p-6">
            <h2 className="font-medium">Voice</h2>
            <p className="mt-0.5 text-sm text-ink-muted">How the agent sounds to tenants.</p>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="agent-voice" className="label">Voice</label>
                <Select id="agent-voice" value={voice} onChange={setVoice} options={VOICE_OPTIONS} />
              </div>

              <div>
                <label htmlFor="agent-language" className="label">Language</label>
                <Select id="agent-language" value={language} onChange={setLanguage} options={LANGUAGE_OPTIONS} />
              </div>

              <div>
                <label htmlFor="agent-tone" className="label">Tone</label>
                <Select id="agent-tone" value={tone} onChange={setTone} options={TONE_OPTIONS} />
              </div>

              <div>
                <label className="label">Emergency phone</label>
                <input
                  type="tel"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="input"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Publish */}
        <aside className="card h-fit p-6 md:sticky md:top-24">
          <h2 className="font-medium">Status</h2>

          <ul className="mt-4 space-y-2.5">
            {checklist.map((item) => (
              <li key={item.label} className="flex items-center gap-2.5 text-sm text-ink-muted">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full ${
                    item.done ? "bg-brand-600 text-white" : "border border-line bg-white"
                  }`}
                >
                  {item.done && <Check className="h-3 w-3" />}
                </span>
                {item.label}
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <FormError message={error} />
          </div>

          <button onClick={handleSave} disabled={saving} className="btn btn-primary mt-2 w-full">
            {saved ? <Check className="h-4 w-4" /> : null}
            {saving ? "Saving…" : saved ? "Saved" : "Save changes"}
          </button>

          {/* Test / Preview Agent */}
          <div className="mt-6 border-t border-line pt-5 space-y-2.5">
            <div className="flex items-center justify-between">
              <p className="label mb-0">Test your agent</p>
              <span className="text-[11px] text-ink-subtle">Live preview</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsVoiceOpen(true)}
                className="btn btn-secondary h-9 px-2 text-xs flex items-center justify-center gap-1.5"
                title="Test calling this agent"
              >
                <PhoneCall className="h-3.5 w-3.5 text-brand-600" />
                <span>Test Call</span>
              </button>
              <button
                type="button"
                onClick={() => setIsChatOpen(true)}
                className="btn btn-secondary h-9 px-2 text-xs flex items-center justify-center gap-1.5"
                title="Test chatting with this agent"
              >
                <MessageSquare className="h-3.5 w-3.5 text-brand-600" />
                <span>Test Chat</span>
              </button>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <p className="label">Tenant link</p>
            <CopyLink path={`/p/${property.slug}`} />
            <Link href={`/p/${property.slug}`} target="_blank" className="btn btn-ghost h-9 w-full text-xs">
              Open join page <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </aside>
      </div>

      {/* Test Modals */}
      <VoiceCallModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        propertyName={previewProperty.name}
        propertyId={previewProperty.id}
        unitNumber="Unit 1A (Test)"
        tenantId="manager-preview"
        tenantName="Property Manager"
        property={previewProperty}
      />
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        propertyName={previewProperty.name}
        propertyId={previewProperty.id}
        unitNumber="Unit 1A (Test)"
        property={previewProperty}
      />
    </>
  );
}
