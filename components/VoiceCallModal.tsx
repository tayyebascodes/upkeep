"use client";

import { useState, useCallback } from "react";
import { useConversation } from "@11labs/react";
import { PhoneOff, Mic, MicOff, Volume2, Sparkles, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface VoiceCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyName: string;
  propertyId: string;
  unitNumber?: string;
  onTicketCreated?: () => void;
}

export function VoiceCallModal({
  isOpen,
  onClose,
  propertyName,
  propertyId,
  unitNumber = "Unit 304",
  onTicketCreated,
}: VoiceCallModalProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [transcriptLog, setTranscriptLog] = useState<Array<{ role: string; message: string }>>([]);

  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || "agent_6601m4xcbnd7e7atdcr9fwr7sv0h";

  const conversation = useConversation({
    onConnect: () => {
      setErrorMsg(null);
    },
    onDisconnect: () => {
      handleCallEndSync();
    },
    onMessage: (msg: any) => {
      if (msg.message) {
        setTranscriptLog((prev) => [...prev, { role: msg.source || "agent", message: msg.message }]);
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

  // End Call
  const handleEndCall = useCallback(async () => {
    await conversation.endSession();
    handleCallEndSync();
  }, [conversation]);

  // Sync ticket to Supabase when call ends
  const handleCallEndSync = async () => {
    if (transcriptLog.length > 0 && supabase) {
      try {
        await supabase.from("tickets").insert([
          {
            property_id: propertyId,
            unit_number: unitNumber,
            title: "Voice Call Inquiry",
            description: transcriptLog.map((t) => `${t.role}: ${t.message}`).join("\n"),
            category: "Other",
            severity: "Medium",
            status: "Pending",
            source: "voice_call",
          },
        ]);
        if (onTicketCreated) onTicketCreated();
      } catch (e) {
        console.error("Failed to save voice ticket:", e);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 flex flex-col items-center text-center">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            {propertyName} AI Voice Line
          </p>
        </div>
        <h3 className="text-xl font-bold text-slate-900">Maintenance Triage Agent</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          {isConnected
            ? isSpeaking
              ? "Agent is speaking..."
              : "Listening to you..."
            : isConnecting
            ? "Connecting voice channel..."
            : "Click below to begin web voice call"}
        </p>

        {/* Visualizer Orb (Matches design & ElevenLabs style) */}
        <div className="my-8 relative flex items-center justify-center">
          {/* Animated Glow Rings */}
          <div
            className={`absolute h-48 w-48 rounded-full transition-all duration-700 ${
              isSpeaking
                ? "bg-blue-400/20 scale-125 animate-pulse-slow"
                : isConnected
                ? "bg-sky-300/15 scale-105"
                : "bg-slate-100 scale-95"
            }`}
          />
          <div
            className={`absolute h-40 w-40 rounded-full transition-all duration-500 ${
              isSpeaking
                ? "bg-blue-500/25 scale-110"
                : isConnected
                ? "bg-sky-400/20 scale-100"
                : "bg-slate-200/50"
            }`}
          />

          {/* Core Orb */}
          <div
            className={`relative flex h-32 w-32 items-center justify-center rounded-full shadow-xl transition-all duration-500 ${
              isSpeaking
                ? "bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-500 shadow-blue-500/40 scale-105"
                : isConnected
                ? "bg-gradient-to-tr from-blue-500 to-cyan-400 shadow-sky-500/30"
                : "bg-gradient-to-tr from-slate-200 to-slate-300 shadow-slate-300"
            }`}
          >
            {isSpeaking ? (
              <div className="flex items-center gap-1">
                <span className="h-6 w-1 rounded-full bg-white animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-10 w-1 rounded-full bg-white animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-7 w-1 rounded-full bg-white animate-bounce" style={{ animationDelay: "300ms" }} />
                <span className="h-4 w-1 rounded-full bg-white animate-bounce" style={{ animationDelay: "450ms" }} />
              </div>
            ) : isConnected ? (
              <Mic className="h-10 w-10 text-white animate-pulse" />
            ) : (
              <Volume2 className="h-10 w-10 text-slate-500" />
            )}
          </div>
        </div>

        {/* Error notification if any */}
        {errorMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-50 p-2.5 text-xs text-rose-700 border border-rose-200">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <p className="text-left">{errorMsg}</p>
          </div>
        )}

        {/* Live Conversation Snippet */}
        {transcriptLog.length > 0 && (
          <div className="w-full max-h-24 overflow-y-auto mb-4 rounded-xl bg-slate-50 p-2.5 text-left text-xs text-slate-600 border border-slate-100">
            <p className="font-semibold text-[10px] uppercase tracking-wider text-slate-400 mb-1">Live Transcript</p>
            <p className="italic">"{transcriptLog[transcriptLog.length - 1]?.message}"</p>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-4">
          {!isConnected && !isConnecting ? (
            <button
              onClick={handleStartCall}
              className="flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700 active:scale-95 transition"
            >
              <Sparkles className="h-4 w-4" />
              <span>Connect Voice Agent</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`flex h-12 w-12 items-center justify-center rounded-full border transition ${
                  isMuted
                    ? "bg-amber-100 text-amber-700 border-amber-300"
                    : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                }`}
                title={isMuted ? "Unmute Mic" : "Mute Mic"}
              >
                {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>

              <button
                onClick={handleEndCall}
                className="flex items-center gap-2 rounded-full bg-rose-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/25 hover:bg-rose-700 active:scale-95 transition"
              >
                <PhoneOff className="h-4 w-4" />
                <span>End Call</span>
              </button>
            </>
          )}

          <button
            onClick={() => {
              if (isConnected) handleEndCall();
              onClose();
            }}
            className="text-xs text-slate-400 hover:text-slate-600 font-medium ml-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
