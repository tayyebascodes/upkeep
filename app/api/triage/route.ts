import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAgentPersona, buildSystemInstruction, type AgentPersona } from "@/lib/agent-config";

// Fallback models in priority order to guarantee 100% uptime even if one model experiences high demand (503)
const CANDIDATE_MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3-flash-preview",
  "gemini-3.8-flash",
];

// Contextual multi-turn fallback engine used when no external API key is present or during complete network outages
function generateRuleBasedReply(
  messages: Array<{ sender: string; text: string }>,
  unitNumber: string,
  persona: AgentPersona
) {
  const isSpanish = persona.language === "Spanish";
  const userMessages = messages.filter((m) => m.sender === "user");
  const turnCount = userMessages.length;
  const latestText = userMessages[userMessages.length - 1]?.text.toLowerCase() || "";
  const allText = userMessages.map((m) => m.text.toLowerCase()).join(" ");

  // 1. Smoke Detector / Alarm
  if (
    allText.includes("smoke") ||
    allText.includes("detector") ||
    allText.includes("alarm") ||
    allText.includes("beeping") ||
    allText.includes("humo") ||
    allText.includes("alarma")
  ) {
    if (turnCount <= 1) {
      return isSpanish
        ? "Para el detector de humo: ¿está emitiendo un chirrido cada 30 a 60 segundos (batería baja), o no sonó al presionar el botón central de prueba?"
        : "For the smoke detector: is it making a single chirp every 30 to 60 seconds (low battery signal), or did it fail to sound when pressing the center test button?";
    }
    if (turnCount === 2) {
      return isSpanish
        ? "Entendido. Por favor intenta mantener presionado el botón central de prueba por 5 segundos continuos. Si sigue sonando o no responde, la batería o el sensor expiraron. ¿Deseas que despache a nuestro técnico de mantenimiento para cambiarlo?"
        : "Understood. Please try holding the center 'TEST' button firmly for 5 continuous seconds. If it remains silent or keeps chirping, the backup battery or sensor has expired. Would you like me to dispatch our maintenance technician to replace it?";
    }
    return isSpanish
      ? `He programado al técnico de mantenimiento para reemplazar el detector de humo en ${unitNumber || "tu unidad"}.\n\n[ACTION:CREATE_TICKET:{"category":"Electrical","severity":"High","title":"Reemplazo de Detector de Humo","summary":"Inquilino reportó detector de humo sin funcionamiento o expirado en la unidad."}]`
      : `I have scheduled our maintenance technician to replace the smoke detector unit in ${unitNumber || "your unit"}.\n\n[ACTION:CREATE_TICKET:{"category":"Electrical","severity":"High","title":"Smoke Detector Replacement","summary":"Tenant reported non-functional or expired smoke detector in unit."}]`;
  }

  // 2. Electrical / Outlets / GFCI
  if (
    allText.includes("outlet") ||
    allText.includes("power") ||
    allText.includes("gfci") ||
    allText.includes("breaker") ||
    allText.includes("light") ||
    allText.includes("enchufe") ||
    allText.includes("luz") ||
    allText.includes("corriente")
  ) {
    if (turnCount <= 1) {
      return isSpanish
        ? "¿Funcionan otros enchufes o interruptores en esa habitación, y tiene el enchufe afectado un botón pequeño que dice 'RESET' al frente?"
        : "Are other outlets or light switches in that room working, and does the affected outlet have a small 'RESET' button on the front?";
    }
    if (turnCount === 2) {
      return isSpanish
        ? "Intenta presionar firmemente el botón 'RESET' hasta escuchar un clic firme. Si no hace clic o vuelve a saltar, el disyuntor se ha disparado. ¿Deseas que programe a un electricista?"
        : "Try firmly pressing the 'RESET' button until you feel a firm click. If it does not click or immediately trips again, the circuit may have tripped. Should I schedule an electrician to inspect it?";
    }
    return isSpanish
      ? `He creado una orden de trabajo de mantenimiento para tu problema eléctrico en ${unitNumber || "tu unidad"}.\n\n[ACTION:CREATE_TICKET:{"category":"Electrical","severity":"Medium","title":"Problema Eléctrico / Enchufe","summary":"Inquilino confirmó que el tomacorriente no tiene energía y falló el reinicio GFCI."}]`
      : `I have filed a maintenance work order for your electrical issue. A technician has been dispatched to inspect the outlet and circuit breaker.\n\n[ACTION:CREATE_TICKET:{"category":"Electrical","severity":"Medium","title":"Electrical Outlet Inoperative","summary":"Tenant confirmed outlet will not provide power and GFCI reset failed."}]`;
  }

  // 3. Plumbing / Water / Leak / Faucet
  if (
    allText.includes("leak") ||
    allText.includes("water") ||
    allText.includes("drip") ||
    allText.includes("sink") ||
    allText.includes("faucet") ||
    allText.includes("toilet") ||
    allText.includes("pipe") ||
    allText.includes("fuga") ||
    allText.includes("agua") ||
    allText.includes("goteo") ||
    allText.includes("tubo")
  ) {
    if (turnCount <= 1) {
      return isSpanish
        ? "¿El agua está goteando activamente en este momento, y proviene de la llave o de las tuberías debajo del lavamanos?"
        : "Is the water actively leaking right now, and is it coming from the faucet spout or the supply pipes underneath the vanity?";
    }
    if (turnCount === 2) {
      return isSpanish
        ? "Si gotea dentro del gabinete, coloca una cubeta debajo. ¿Hay una válvula ovalada debajo que puedas girar hacia la derecha para cortar el agua?"
        : "If water is dripping into the cabinet, placing a bucket underneath helps protect the wood. Is there an oval shut-off valve under the sink you can turn clockwise to stop the flow?";
    }
    return isSpanish
      ? `He enviado una orden prioritaria de plomería para tu unidad. Nuestro técnico ha sido asignado para reparar la fuga.\n\n[ACTION:CREATE_TICKET:{"category":"Plumbing","severity":"High","title":"Reparación de Fuga de Agua","summary":"Inquilino reportó fuga activa de plomería en la unidad que requiere atención."}]`
      : `I have submitted a priority plumbing work order for your unit. Our technician has been dispatched to repair the leak.\n\n[ACTION:CREATE_TICKET:{"category":"Plumbing","severity":"High","title":"Water Leak Repair","summary":"Tenant reports active plumbing leak in unit requiring repair."}]`;
  }

  // 4. HVAC / AC / Heat / Thermostat
  if (
    allText.includes("ac") ||
    allText.includes("heat") ||
    allText.includes("air") ||
    allText.includes("cold") ||
    allText.includes("warm") ||
    allText.includes("thermostat") ||
    allText.includes("aire") ||
    allText.includes("calefaccion") ||
    allText.includes("frio") ||
    allText.includes("calor")
  ) {
    if (turnCount <= 1) {
      return isSpanish
        ? "¿La pantalla del termostato está encendida, y el aire sopla a velocidad normal pero con la temperatura incorrecta?"
        : "Is the thermostat screen powered on, and is the air blowing at normal speed but the wrong temperature?";
    }
    if (turnCount === 2) {
      return isSpanish
        ? "Verifica si el termostato está en modo 'COOL' o 'HEAT' en vez de solo 'FAN'. Si la configuración está bien pero no alcanza la temperatura, despacharé al equipo de HVAC."
        : "Check if the thermostat switch is set to 'COOL' or 'HEAT' rather than 'FAN ONLY'. If the setting is correct and the temperature won't reach the target, I will dispatch our HVAC team.";
    }
    return isSpanish
      ? `He creado una solicitud de servicio HVAC para tu unidad. Un técnico certificado revisará el sistema de climatización.\n\n[ACTION:CREATE_TICKET:{"category":"HVAC","severity":"High","title":"Problema de Climatización HVAC","summary":"Inquilino reportó que el sistema no alcanza la temperatura deseada."}]`
      : `I have filed an HVAC service request for your unit. A certified technician will inspect the cooling/heating system.\n\n[ACTION:CREATE_TICKET:{"category":"HVAC","severity":"High","title":"HVAC Temperature System Issue","summary":"Tenant reports climate control system is not reaching set temperature."}]`;
  }

  // 5. General progression
  if (turnCount <= 1) {
    return isSpanish
      ? `Gracias por informarme. ¿Podrías indicarme exactamente en qué parte de la unidad está ocurriendo y desde cuándo comenzó?`
      : `Thank you for letting me know. Could you clarify where in the unit this is located and when it first started happening?`;
  }
  if (turnCount === 2) {
    return isSpanish
      ? `Entendido. ¿Ha causado daños visibles, ruidos extraños o riesgos de seguridad, o está aislado a esa área?`
      : `Understood. Has this caused any water damage, strange noises, or safety hazards, or is it isolated to that specific area?`;
  }
  return isSpanish
    ? `Gracias por los detalles diagnósticos. He creado una orden de trabajo de mantenimiento para el equipo de despacho de tu edificio.\n\n[ACTION:CREATE_TICKET:{"category":"Other","severity":"Medium","title":"Solicitud de Mantenimiento","summary":"Inquilino reportó un problema de mantenimiento que requiere visita técnica."}]`
    : `Thank you for those diagnostic details. I have created an official maintenance work order for your building's dispatch team.\n\n[ACTION:CREATE_TICKET:{"category":"Other","severity":"Medium","title":"Tenant Maintenance Request","summary":"Tenant reported ongoing maintenance issue requiring technician service."}]`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body;

    // Prefer authenticated tenant identity from session, fall back to body for demo/preview
    const { user, profile } = await getSession();
    const isTenant = Boolean(user && profile?.role === "tenant" && profile?.property_id);

    const propertyId = isTenant ? profile!.property_id! : body.propertyId || null;
    const initialPropertyName = isTenant ? profile!.properties?.name : body.propertyName || "the residential property";
    const unitNumber = isTenant ? profile!.unit_number : body.unitNumber || "your unit";
    const tenantId = isTenant ? user!.id : null;
    const tenantName = isTenant ? profile!.full_name : null;
    const tenantPhone = isTenant ? profile!.phone : null;

    // Load property settings & uploaded SOPs
    const admin = createAdminClient();
    const supabase = admin || (await createClient());
    let propertyRecord: any = null;
    let documents: Array<{ name: string; content?: string }> = [];

    if (propertyId) {
      const { data: prop } = await supabase
        .from("properties")
        .select("*")
        .eq("id", propertyId)
        .maybeSingle();
      if (prop) propertyRecord = prop;

      const { data: docs } = await supabase
        .from("documents")
        .select("name, storage_path")
        .eq("property_id", propertyId);
      if (docs) documents = docs;
    }

    // Support live preview overrides passed in request body
    if (body.agentVoice || body.agentLanguage || body.agentTone) {
      propertyRecord = {
        ...(propertyRecord || {}),
        ...(body.agentVoice ? { agent_voice: body.agentVoice } : {}),
        ...(body.agentLanguage ? { agent_language: body.agentLanguage } : {}),
        ...(body.agentTone ? { agent_tone: body.agentTone } : {}),
      };
    }

    const persona = getAgentPersona(propertyRecord);
    const propertyName = propertyRecord?.name || initialPropertyName || "the residential property";

    const apiKey = process.env.GEMINI_API_KEY || process.env.XAI_API_KEY;

    let rawReply = "";

    if (apiKey) {
      // Convert messages to Gemini format
      const contents = (messages || []).map((m: any) => ({
        role: m.sender === "user" ? "user" : "model",
        parts: [{ text: m.text }],
      }));

      const systemInstruction = buildSystemInstruction({
        persona,
        propertyName,
        unitNumber: unitNumber || "your unit",
        documents,
      });

      // Cascade through candidate models to guarantee 100% reliability
      for (const model of CANDIDATE_MODELS) {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
              body: JSON.stringify({
                contents,
                systemInstruction: { parts: [{ text: systemInstruction }] },
                generationConfig: { temperature: 0.4, maxOutputTokens: 800 },
              }),
            }
          );

          if (response.ok) {
            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              rawReply = text;
              break;
            }
          } else {
            console.warn(`Model ${model} returned status ${response.status}, trying next fallback...`);
          }
        } catch (fetchErr) {
          console.warn(`Model ${model} fetch failed, trying next fallback...`, fetchErr);
        }
      }
    }

    // Fall back to intelligent rule-based multi-turn engine if API key is not configured or all models were busy
    if (!rawReply) {
      rawReply = generateRuleBasedReply(messages || [], unitNumber, persona);
    }

    // Parse potential [ACTION:CREATE_TICKET:{...}]
    let cleanReply = rawReply;
    let createdTicket = null;

    if (cleanReply.includes("[ACTION:CREATE_TICKET:")) {
      const idx = cleanReply.indexOf("[ACTION:CREATE_TICKET:");
      cleanReply = cleanReply.substring(0, idx).trim();
    }

    const actionMatch = rawReply.match(/\[ACTION:CREATE_TICKET:(\{[\s\S]*?\})\]/);
    if (actionMatch) {
      try {
        const ticketData = JSON.parse(actionMatch[1]);

        const conversationTranscript = (messages || [])
          .map((m: any) => `${m.sender === "user" ? "Tenant" : "AI Agent"}: ${m.text}`)
          .concat(cleanReply ? [`AI Agent: ${cleanReply}`] : [])
          .join("\n\n");

        const fullDescription = ticketData.summary
          ? `${ticketData.summary}\n\n--- Full Conversation ---\n${conversationTranscript}`
          : conversationTranscript;

        if (propertyId && isTenant) {
          const supabase = await createClient();
          const { data: inserted, error: insertError } = await supabase.from("tickets").insert([
            {
              property_id: propertyId,
              tenant_id: tenantId,
              tenant_name: tenantName,
              tenant_phone: tenantPhone,
              unit_number: unitNumber || "Unknown",
              title: ticketData.title || "Maintenance Request",
              description: fullDescription,
              category: ticketData.category || "Other",
              severity: ticketData.severity || "Medium",
              status: "Pending",
              source: "chat",
            },
          ]).select();

          if (insertError) console.error("Triage ticket insert error:", insertError);
          if (inserted && inserted[0]) {
            createdTicket = inserted[0];
          }
        } else {
          createdTicket = {
            id: `demo-${Date.now()}`,
            property_id: propertyId || "demo-property",
            unit_number: unitNumber || "Unit 304",
            title: ticketData.title || "Maintenance Request",
            description: fullDescription,
            category: ticketData.category || "Other",
            severity: ticketData.severity || "Medium",
            status: "Pending",
            source: "chat",
            created_at: new Date().toISOString(),
          };
        }
      } catch (err) {
        console.error("Failed to parse ticket action:", err);
      }
    }

    return NextResponse.json({
      reply: cleanReply,
      createdTicket,
    });
  } catch (error: any) {
    console.error("Triage route failure:", error);
    return NextResponse.json(
      {
        reply: "Could you tell me if this is causing any active water leakage, electrical hazards, or immediate safety concerns?",
      },
      { status: 200 }
    );
  }
}
