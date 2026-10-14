import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

// Authenticated ticket API. RLS scopes results to the caller:
// companies see their properties' tickets, tenants see their own.

async function getClient() {
  if (!isSupabaseConfigured) return { supabase: null, user: null };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function GET() {
  const { supabase, user } = await getClient();
  if (!supabase || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase.from("tickets").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const { supabase, user } = await getClient();
  if (!supabase || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, property_id, unit_number, full_name, phone")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "tenant" || !profile.property_id) {
      return NextResponse.json({ error: "Only tenants can create tickets" }, { status: 403 });
    }

    const { title, description, category, severity, source } = await req.json();

    const { data, error } = await supabase
      .from("tickets")
      .insert([
        {
          property_id: profile.property_id,
          tenant_id: user.id,
          tenant_name: profile.full_name,
          tenant_phone: profile.phone,
          unit_number: profile.unit_number || "Unknown",
          title: title || "Maintenance Request",
          description: description || "",
          category: category || "Other",
          severity: severity || "Medium",
          status: "Pending",
          source: source || "chat",
        },
      ])
      .select();

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    return NextResponse.json({ success: true, ticket: data?.[0] });
  } catch (err: any) {
    console.error("Failed to create ticket:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
