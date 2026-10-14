import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured, MOCK_TICKETS } from "@/lib/supabase";

export async function GET() {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase tickets GET error:", error);
        return NextResponse.json(MOCK_TICKETS);
      }
      return NextResponse.json(data);
    } catch (e) {
      console.error("Tickets API error:", e);
      return NextResponse.json(MOCK_TICKETS);
    }
  }

  return NextResponse.json(MOCK_TICKETS);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { property_id, unit_number, title, description, category, severity, source } = body;

    if (supabase) {
      const { data, error } = await supabase.from("tickets").insert([
        {
          property_id,
          unit_number: unit_number || "Unit 304",
          title: title || "Maintenance Request",
          description: description || "",
          category: category || "Other",
          severity: severity || "Medium",
          status: "Pending",
          source: source || "chat",
        },
      ]).select();

      if (error) {
        console.error("Supabase tickets POST error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, ticket: data?.[0] });
    }

    return NextResponse.json({
      success: true,
      ticket: {
        id: `mock-${Date.now()}`,
        title,
        description,
        category,
        severity,
        status: "Pending",
        created_at: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error("Failed to create ticket:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
