"use client";

import { useState, useCallback, useRef } from "react";
import { useConversation } from "@11labs/react";
import { PhoneCall, PhoneOff, Mic, MicOff, Volume2, AlertCircle, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface VoiceCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyName: string;
  propertyId: string;
  unitNumber: string;
  tenantId: string;
  tenantName?: string;
  tenantPhone?: string;
  onTicketCreated?: () => void;
}

export function VoiceCallModal({
  isOpen,
  onClose,
  propertyName,
  propertyId,
  unitNumber,
  tenantId,
  tenantName,
  tenantPhone,
  onTicketCreated,
}: VoiceCallModalProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [transcriptLog, setTranscriptLog] = useState<Array<{ role: string; message: string }>>([]);
  // Refs so the disconnect handler sees the latest transcript and saves only once per call.
  const transcriptRef = useRef<Array<{ role: string; message: string }>>([]);
  const savedRef = useRef(false);

  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || "agent_6601m4xcbnd7e7atdcr9fwr7sv0h";

  // Sync ticket to Supabase when call ends
  const handleCallEndSync = async () => {
    const log = transcriptRef.current;
    if (savedRef.current || log.length === 0) return;
    savedRef.current = true;

    const { error } = await createClient().from("tickets").insert([
      {
        property_id: propertyId,
        tenant_id: tenantId,
        tenant_name: tenantName,
        tenant_phone: tenantPhone,
        unit_number: unitNumber,
        title: "Voice Call Inquiry",
        description: log.map((t) => `${t.role === "agent" ? "AI Agent" : "Tenant"}: ${t.message}`).join("\n\n"),
        category: "Other",
        severity: "Medium",
        status: "Pending",
        source: "voice_call",
      },
    ]);
    if (error) console.error("Failed to save voice ticket:", error);
    else if (onTicketCreated) onTicketCreated();
  };

  const conversation = useConversation({
    onConnect: () => {
      setErrorMsg(null);
    },
    onDisconnect: () => {
      handleCallEndSync();
    },
    onMessage: (msg: any) => {
      if (msg.message) {
        const entry = { role: msg.source || "agent", message: msg.message };
        transcriptRef.current = [...transcriptRef.current, entry];
        setTranscriptLog(transcriptRef.current);
      }
    },
    onError: (err: any) => {
      console.error("ElevenLabs error:", err);
      setErrorMsg(typeof err === "string" ? err : "Microphone or connection error occurred.");
    },
  });

  const isConnected = conversation.status === "connected";
  const isConnecting = conversation.status === "connecting";
  const isSpeaking = conversation.isSpeaking;

  // Start Call session with ElevenLabs
  const handleStartCall = useCallback(async () => {
    try {
      setErrorMsg(null);
      transcriptRef.current = [];
      savedRef.current = false;
      setTranscriptLog([]);
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({
        agentId: agentId,
        dynamicVariables: {
          company_name: propertyName,
          unit_number: unitNumber,
        },
      });
    } catch (err: any) {
      console.error("Failed to start voice call:", err);
      setErrorMsg(err.message || "Please allow microphone access to talk to the maintenance agent.");
    }
  }, [conversation, agentId, propertyName, unitNumber]);

  // End Call (onDisconnect saves the ticket)
  const handleEndCall = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  if (!isOpen) return null;

  const statusText = isConnected
    ? isSpeaking
      ? "Speaking"
      : "Listening"
    : isConnecting
    ? "Connecting"
    : "Ready";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative flex w-full max-w-sm flex-col items-center overflow-hidden rounded-3xl bg-white p-8 text-center shadow-lift animate-pop-in">
        <button
          onClick={() => {
            if (isConnected) handleEndCall();
            onClose();
          }}
          className="btn btn-ghost btn-icon absolute right-3 top-3 h-8 w-8"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <p className="eyebrow">{propertyName}</p>
        <h3 className="mt-2 text-xl font-semibold tracking-tight">Maintenance line</h3>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-muted">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isConnected ? "bg-brand-500 animate-pulse" : isConnecting ? "bg-brand-300 animate-pulse" : "bg-ink-subtle"
            }`}
          />
          {statusText}
        </p>

        {/* Orb */}
        <div className="relative my-10 flex items-center justify-center">
          <div
            className={`absolute h-44 w-44 rounded-full transition-all duration-700 ${
              isSpeaking ? "scale-125 bg-brand-400/20 animate-pulse-slow" : isConnected ? "scale-105 bg-brand-300/15" : "scale-95 bg-brand-50"
            }`}
          />
          <div
            className={`absolute h-36 w-36 rounded-full transition-all duration-500 ${
              isSpeaking ? "scale-110 bg-brand-500/20" : isConnected ? "bg-brand-400/15" : "bg-brand-100/60"
            }`}
          />
          <div
            className={`relative flex h-28 w-28 items-center justify-center rounded-full transition-all duration-500 ${
              isConnected
                ? "bg-gradient-to-br from-brand-500 to-brand-700 shadow-lift"
                : "bg-gradient-to-br from-brand-100 to-brand-200"
            } ${isSpeaking ? "scale-105" : ""}`}
          >
            {isSpeaking ? (
              <div className="flex items-center gap-1">
                {[
                  ["h-6", "0ms"],
                  ["h-10", "150ms"],
                  ["h-7", "300ms"],
                  ["h-4", "450ms"],
                ].map(([h, delay]) => (
                  <span
                    key={delay}
                    className={`${h} w-1 rounded-full bg-white animate-bounce`}
                    style={{ animationDelay: delay }}
                  />
                ))}
              </div>
            ) : isConnected ? (
              <Mic className="h-9 w-9 text-white" />
            ) : (
              <Volume2 className="h-9 w-9 text-brand-600" />
            )}
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 flex w-full items-center gap-2 rounded-xl bg-red-50 p-3 text-left text-xs text-red-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <p>{errorMsg}</p>
          </div>
        )}

        {transcriptLog.length > 0 && (
          <p className="mb-6 line-clamp-2 text-sm text-ink-muted">
            &ldquo;{transcriptLog[transcriptLog.length - 1]?.message}&rdquo;
          </p>
        )}

        {/* Controls */}
        {!isConnected && !isConnecting ? (
          <button onClick={handleStartCall} className="btn btn-primary h-12 px-8">
            <PhoneCall className="h-4 w-4" />
            Start call
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`btn btn-icon h-12 w-12 ${isMuted ? "bg-brand-100 text-brand-700" : "btn-secondary"}`}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>

            <button onClick={handleEndCall} className="btn btn-danger h-12 px-6">
              <PhoneOff className="h-4 w-4" />
              End
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
