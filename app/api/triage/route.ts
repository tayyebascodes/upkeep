import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

// Fallback models in priority order to guarantee 100% uptime even if one model experiences high demand (503)
const CANDIDATE_MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3-flash-preview",
  "gemini-3.8-flash",
];

// Contextual multi-turn fallback engine used when no external API key is present or during complete network outages
function generateRuleBasedReply(messages: Array<{ sender: string; text: string }>, unitNumber: string) {
  const userMessages = messages.filter((m) => m.sender === "user");
  const turnCount = userMessages.length;
  const latestText = userMessages[userMessages.length - 1]?.text.toLowerCase() || "";
  const allText = userMessages.map((m) => m.text.toLowerCase()).join(" ");

  // 1. Smoke Detector / Alarm
  if (allText.includes("smoke") || allText.includes("detector") || allText.includes("alarm") || allText.includes("beeping")) {
    if (turnCount <= 1) {
      return "For the smoke detector: is it making a single chirp every 30 to 60 seconds (low battery signal), or did it fail to sound when pressing the center test button?";
    }
    if (turnCount === 2) {
      return "Understood. Please try holding the center 'TEST' button firmly for 5 continuous seconds. If it remains silent or keeps chirping, the backup battery or sensor has expired. Would you like me to dispatch our maintenance technician to replace it?";
    }
    return `I have scheduled our maintenance technician to replace the smoke detector unit in ${unitNumber || "your unit"}.\n\n[ACTION:CREATE_TICKET:{"category":"Electrical","severity":"High","title":"Smoke Detector Replacement","summary":"Tenant reported non-functional or expired smoke detector in unit."}]`;
  }

  // 2. Electrical / Outlets / GFCI
  if (allText.includes("outlet") || allText.includes("power") || allText.includes("gfci") || allText.includes("breaker") || allText.includes("light")) {
    if (turnCount <= 1) {
      return "Are other outlets or light switches in that room working, and does the affected outlet have a small 'RESET' button on the front?";
    }
    if (turnCount === 2) {
      return "Try firmly pressing the 'RESET' button until you feel a firm click. If it does not click or immediately trips again, the circuit may have tripped. Should I schedule an electrician to inspect it?";
    }
    return `I have filed a maintenance work order for your electrical issue. A technician has been dispatched to inspect the outlet and circuit breaker.\n\n[ACTION:CREATE_TICKET:{"category":"Electrical","severity":"Medium","title":"Electrical Outlet Inoperative","summary":"Tenant confirmed outlet will not provide power and GFCI reset failed."}]`;
  }

  // 3. Plumbing / Water / Leak / Faucet
  if (allText.includes("leak") || allText.includes("water") || allText.includes("drip") || allText.includes("sink") || allText.includes("faucet") || allText.includes("toilet") || allText.includes("pipe")) {
    if (turnCount <= 1) {
      return "Is the water actively leaking right now, and is it coming from the faucet spout or the supply pipes underneath the vanity?";
    }
    if (turnCount === 2) {
      return "If water is dripping into the cabinet, placing a bucket underneath helps protect the wood. Is there an oval shut-off valve under the sink you can turn clockwise to stop the flow?";
    }
    return `I have submitted a priority plumbing work order for your unit. Our technician has been dispatched to repair the leak.\n\n[ACTION:CREATE_TICKET:{"category":"Plumbing","severity":"High","title":"Water Leak Repair","summary":"Tenant reports active plumbing leak in unit requiring repair."}]`;
  }

  // 4. HVAC / AC / Heat / Thermostat
  if (allText.includes("ac") || allText.includes("heat") || allText.includes("air") || allText.includes("cold") || allText.includes("warm") || allText.includes("thermostat")) {
    if (turnCount <= 1) {
      return "Is the thermostat screen powered on, and is the air blowing at normal speed but the wrong temperature?";
    }
    if (turnCount === 2) {
      return "Check if the thermostat switch is set to 'COOL' or 'HEAT' rather than 'FAN ONLY'. If the setting is correct and the temperature won't reach the target, I will dispatch our HVAC team.";
    }
    return `I have filed an HVAC service request for your unit. A certified technician will inspect the cooling/heating system.\n\n[ACTION:CREATE_TICKET:{"category":"HVAC","severity":"High","title":"HVAC Temperature System Issue","summary":"Tenant reports climate control system is not reaching set temperature."}]`;
  }

  // 5. General progression
  if (turnCount <= 1) {
    return "Thank you for letting me know. Could you clarify where in the unit this is located and when it first started happening?";
  }
  if (turnCount === 2) {
    return "Understood. Has this caused any water damage, strange noises, or safety hazards, or is it isolated to that specific area?";
  }
  return `Thank you for those diagnostic details. I have created an official maintenance work order for your building's dispatch team.\n\n[ACTION:CREATE_TICKET:{"category":"Other","severity":"Medium","title":"Tenant Maintenance Request","summary":"Tenant reported ongoing maintenance issue requiring technician service."}]`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body;

    // Prefer authenticated tenant identity from session, fall back to body for demo/preview
    const { user, profile } = await getSession();
    const isTenant = Boolean(user && profile?.role === "tenant" && profile?.property_id);

    const propertyId = isTenant ? profile!.property_id! : body.propertyId || null;
    const propertyName = isTenant ? profile!.properties?.name : body.propertyName || "the residential property";
    const unitNumber = isTenant ? profile!.unit_number : body.unitNumber || "your unit";
    const tenantId = isTenant ? user!.id : null;
    const tenantName = isTenant ? profile!.full_name : null;
    const tenantPhone = isTenant ? profile!.phone : null;

    const apiKey = process.env.GEMINI_API_KEY || process.env.XAI_API_KEY;

    let rawReply = "";

    if (apiKey) {
      // Convert messages to Gemini format
      const contents = (messages || []).map((m: any) => ({
        role: m.sender === "user" ? "user" : "model",
        parts: [{ text: m.text }],
      }));

      const systemInstruction = `You are "Upkeep", an intelligent, empathetic, and highly trained AI maintenance triage agent for ${propertyName || "the residential property"}. You are talking to the tenant in ${unitNumber || "their unit"}.

YOUR MISSION:
You are NOT a primitive automated bot. You conduct a dynamic, back-and-forth diagnostic conversation with the tenant to narrow down the problem, eliminate false alarms, test safe tenant self-resolution steps, and—only when necessary—gather all exact specifications to file a formal maintenance work order.

CONVERSATION GUIDELINES:
1. EMERGENCY SAFETY FIRST:
   - If the tenant mentions: smelling natural gas, visible open flames/smoke, electrical sparks, or ceiling collapse:
   - Immediately instruct them to evacuate and call 911. Do not ask troubleshooting questions.
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

Tone: Conversational, friendly, professional, concise (2 to 4 sentences per turn). Do not output huge walls of text.`;

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
      rawReply = generateRuleBasedReply(messages || [], unitNumber);
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
              description: ticketData.summary || cleanReply,
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
            description: ticketData.summary || cleanReply,
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
