import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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

export async function DELETE(req: Request) {
  const { supabase, user } = await getClient();
  if (!supabase || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const ticketId = searchParams.get("id");
    if (!ticketId) return NextResponse.json({ error: "Missing ticket id" }, { status: 400 });

    // Allow mock or demo tickets to be cleared without error
    if (ticketId.startsWith("demo-") || ticketId.startsWith("t-")) {
      return NextResponse.json({ success: true, id: ticketId });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, company_id, property_id")
      .eq("id", user.id)
      .single();

    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 403 });

    const adminClient = createAdminClient();
    const queryClient = adminClient || supabase;

    const { data: ticket, error: fetchError } = await queryClient
      .from("tickets")
      .select("id, property_id, tenant_id")
      .eq("id", ticketId)
      .single();

    if (fetchError || !ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    if (profile.role === "company") {
      const { data: prop } = await queryClient
        .from("properties")
        .select("company_id")
        .eq("id", ticket.property_id)
        .single();

      if (!prop || prop.company_id !== profile.company_id) {
        return NextResponse.json({ error: "Forbidden: property does not belong to your company" }, { status: 403 });
      }
    } else if (profile.role === "tenant") {
      if (ticket.tenant_id !== user.id) {
        return NextResponse.json({ error: "Forbidden: you can only delete your own tickets" }, { status: 403 });
      }
    }

    const { error: deleteError } = await queryClient.from("tickets").delete().eq("id", ticketId);
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, id: ticketId });
  } catch (err: any) {
    console.error("Failed to delete ticket:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
