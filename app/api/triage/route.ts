import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

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

    if (!apiKey) {
      return NextResponse.json({
        reply: "I'm here to help diagnose your issue. Could you clarify where in the unit this is happening and when it first started?",
      });
    }

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
2. BACK-AND-FORTH DIAGNOSTICS:
   - Never close the conversation in one reply.
   - Ask 1 to 2 sharp diagnostic questions per turn to pinpoint: exact location, fixture/appliance brand, whether it's continuous or intermittent, and if there is active water damage.
   - Example (Leak): "Is the water leaking continuously or only when the faucet is running? And is it coming from the spout or underneath the vanity cabinet?"
   - Example (Power): "Are other outlets or ceiling lights in the same room working, or is power out across the whole area?"
3. SAFE SELF-RESOLUTION TRIAGE:
   - For common issues, politely suggest a safe 30-second check:
     * Electrical: Suggest pressing the "RESET" button on the center of the GFCI outlet.
     * Disposal: Suggest checking the red reset button underneath the disposal unit under the sink.
     * AC/Heat: Check if the thermostat display has power or batteries.
   - Ask: "Could you take a quick look to see if that helps, or would you prefer our technician to handle it?"
4. DISPATCH CONFIRMATION & TICKET FILING:
   - When self-resolution fails or the issue clearly requires a licensed professional (e.g. cracked pipe, burnt wire, freon leak, broken appliance):
     - Confirm the diagnosis with the tenant.
     - Tell them you are dispatching the team.
     - Include this exact format at the very end of your response so our system can log the work order:
       [ACTION:CREATE_TICKET:{"category":"Plumbing|Electrical|HVAC|Appliance|Structural|Other","severity":"Emergency|High|Medium|Low","title":"Brief Title","summary":"Diagnostic details"}]

Tone: Conversational, friendly, professional, concise (2 to 4 sentences per turn). Do not output huge walls of text.`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          contents,
          systemInstruction: {
            parts: [{ text: systemInstruction }],
          },
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 1500,
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API error:", errText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const rawReply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Thank you for the update. Could you provide a bit more detail about what you're noticing?";

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

        // Save to Supabase if signed-in tenant, or return demo ticket object
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
        reply:
          "I'm experiencing a brief connection hiccup. Could you tell me if this is causing any active water leakage, electrical hazards, or immediate safety concerns?",
      },
      { status: 200 }
    );
  }
}
