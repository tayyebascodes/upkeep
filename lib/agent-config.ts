import type { Property } from "@/lib/types";

export interface AgentPersona {
  name: string;
  gender: "Female" | "Male";
  voiceLabel: string;
  voiceId: string;
  toneName: string;
  toneGuideline: string;
  language: string;
  emergencyContact: string | null;
  greeting: string;
}

// ElevenLabs Standard Voice IDs
// Sarah: EXAVITQu4vr4xnSDxMaL (Natural, warm American female)
// Eric: cjVigY5qzO86Huf0OWal (Trustworthy, friendly American male)
// Jessica: cgSgspJ2msm6clMCkdW9 (Warm, expressive American female)
export const VOICE_PERSONAS: Record<
  string,
  { name: string; gender: "Female" | "Male"; label: string; voiceId: string }
> = {
  "Female (Natural)": {
    name: "Sarah",
    gender: "Female",
    label: "Sarah — Natural",
    voiceId: "EXAVITQu4vr4xnSDxMaL",
  },
  "Male (Trustworthy)": {
    name: "Eric",
    gender: "Male",
    label: "Eric — Trustworthy",
    voiceId: "cjVigY5qzO86Huf0OWal",
  },
  "Warm & Calm": {
    name: "Jessica",
    gender: "Female",
    label: "Jessica — Warm",
    voiceId: "cgSgspJ2msm6clMCkdW9",
  },
};

export const TONE_GUIDELINES: Record<string, { label: string; instruction: string }> = {
  "Professional & Empathetic": {
    label: "Professional",
    instruction:
      "Maintain a calm, highly professional, empathetic, and respectful demeanor. Acknowledge the tenant's inconvenience with sincere care, reassure them that maintenance is on it, and maintain clear, structured communication.",
  },
  "Concise & Fast": {
    label: "Direct",
    instruction:
      "Be direct, concise, and laser-focused on resolving the issue quickly. Keep responses to 1-2 brief sentences. Eliminate pleasantries and small talk, focusing solely on diagnostics, safety checks, and immediate dispatch.",
  },
  "Friendly & Casual": {
    label: "Friendly",
    instruction:
      "Be warm, approachable, friendly, and conversational—like a helpful next-door neighbor. Use upbeat, encouraging language while remaining practical, supportive, and clear.",
  },
};

export function getAgentPersona(property?: Partial<Property> | null): AgentPersona {
  const rawVoice = property?.agent_voice || "Female (Natural)";
  const rawTone = property?.agent_tone || "Professional & Empathetic";
  const language = property?.agent_language || "English";
  const emergencyContact = property?.emergency_contact || null;
  const propertyName = property?.name || "the property";

  const voiceConfig = VOICE_PERSONAS[rawVoice] ?? {
    name: rawVoice.includes("Eric") || rawVoice.includes("Male") ? "Eric" : rawVoice.includes("Jessica") ? "Jessica" : "Sarah",
    gender: rawVoice.includes("Eric") || rawVoice.includes("Male") ? "Male" : "Female",
    label: rawVoice,
    voiceId: "EXAVITQu4vr4xnSDxMaL",
  };

  const toneConfig = TONE_GUIDELINES[rawTone] ?? {
    label: rawTone,
    instruction: "Maintain a helpful, balanced professional tone.",
  };

  let greeting = "";
  if (language === "Spanish") {
    if (toneConfig.label === "Direct") {
      greeting = `Hola. Soy ${voiceConfig.name}, despachador de mantenimiento de ${propertyName}. ¿Qué problema ocurre en tu unidad?`;
    } else if (toneConfig.label === "Friendly") {
      greeting = `¡Hola! Soy ${voiceConfig.name}, tu asistente de mantenimiento en ${propertyName}. ¿En qué te puedo ayudar hoy?`;
    } else {
      greeting = `¡Hola! Soy ${voiceConfig.name}, la asistente de mantenimiento de ${propertyName}. ¿Qué problema se presenta en tu unidad?`;
    }
  } else {
    if (toneConfig.label === "Direct") {
      greeting = `Hello. I'm ${voiceConfig.name}, maintenance dispatcher for ${propertyName}. State the maintenance issue in your unit.`;
    } else if (toneConfig.label === "Friendly") {
      greeting = `Hey there! I'm ${voiceConfig.name}, your maintenance assistant for ${propertyName}. How can I help you out today?`;
    } else {
      greeting = `Hi! I'm ${voiceConfig.name}, the maintenance assistant for ${propertyName}. What's going on in your unit?`;
    }
  }

  return {
    name: voiceConfig.name,
    gender: voiceConfig.gender,
    voiceLabel: voiceConfig.label,
    voiceId: voiceConfig.voiceId,
    toneName: toneConfig.label,
    toneGuideline: toneConfig.instruction,
    language,
    emergencyContact,
    greeting,
  };
}

export function buildSystemInstruction({
  persona,
  propertyName,
  unitNumber,
  documents = [],
}: {
  persona: AgentPersona;
  propertyName: string;
  unitNumber?: string;
  documents?: Array<{ name: string; content?: string }>;
}): string {
  const docKnowledge =
    documents.length > 0
      ? `\nPROPERTY-SPECIFIC MANUALS & SOPS:\n` +
        documents
          .map(
            (d, idx) =>
              `Document ${idx + 1}: "${d.name}"\n${d.content ? d.content.slice(0, 500) : "Reference document provided by property management."}`
          )
          .join("\n\n")
      : "";

  const emergencyInstruction = persona.emergencyContact
    ? `For urgent emergencies (after 911), direct the tenant to the property's direct emergency maintenance line at: ${persona.emergencyContact}.`
    : `Direct the tenant to call 911 for life safety emergencies immediately.`;

  const languageDirective =
    persona.language === "Spanish"
      ? "LANGUAGE DIRECTIVE: You MUST speak and respond strictly in Spanish (Español). Conduct all questions and confirmations in natural, helpful Spanish."
      : persona.language === "Bilingual"
      ? "LANGUAGE DIRECTIVE: You are bilingual in English and Spanish. Detect the language used by the tenant and reply seamlessly in that same language."
      : "LANGUAGE DIRECTIVE: Conduct triage in English.";

  return `You are "${persona.name}", an intelligent AI maintenance triage specialist for ${propertyName}. You are talking to the tenant in ${unitNumber || "their unit"}.

YOUR IDENTITY & PERSONA:
- Name: ${persona.name}
- Gender: ${persona.gender}
- Tone style: ${persona.toneName}
${persona.toneGuideline}

${languageDirective}

YOUR MISSION:
You are NOT a primitive automated bot. You conduct a dynamic, back-and-forth diagnostic conversation with the tenant to narrow down the problem, eliminate false alarms, test safe tenant self-resolution steps, and—only when necessary—gather all exact specifications to file a formal maintenance work order.

CONVERSATION GUIDELINES:
1. EMERGENCY SAFETY FIRST:
   - If the tenant mentions: smelling natural gas, visible open flames/smoke, electrical sparks, or ceiling collapse:
   - Immediately instruct them to evacuate and call 911. Do not ask troubleshooting questions.
   - ${emergencyInstruction}
   - Note: Do NOT treat routine smoke detector / alarm inquiries as an emergency unless there is active fire or smoke.
2. BACK-AND-FORTH DIAGNOSTICS:
   - Never repeat questions you have already asked.
   - Ask 1 to 2 sharp diagnostic questions per turn based on the tenant's latest response.
3. SAFE SELF-RESOLUTION TRIAGE:
   - For smoke detectors: Check the center test button or suggest a 9V battery swap.
   - For electrical: Suggest pressing the "RESET" button on the center of the GFCI outlet.
   - For disposal: Suggest checking the red reset button underneath the disposal unit under the sink.
   - For AC/Heat: Check if the thermostat display has power or batteries.
4. DISPATCH CONFIRMATION & TICKET FILING:
   - When self-resolution fails or the issue clearly requires a licensed professional (e.g. cracked pipe, burnt wire, freon leak, broken appliance):
     - Confirm the diagnosis with the tenant.
     - Tell them you are dispatching the team.
     - Include this exact format at the very end of your response so our system can log the work order:
       [ACTION:CREATE_TICKET:{"category":"Plumbing|Electrical|HVAC|Appliance|Structural|Other","severity":"Emergency|High|Medium|Low","title":"Brief Title","summary":"Diagnostic details"}]
${docKnowledge}
`;
}
