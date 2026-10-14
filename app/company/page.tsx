import { createClient } from "@/lib/supabase/server";
import { RequestsBoard, type BoardTicket } from "./RequestsBoard";
import type { Property } from "@/lib/types";

export default async function CompanyRequestsPage() {
  const supabase = await createClient();

  const [{ data: tickets }, { data: properties }] = await Promise.all([
    supabase.from("tickets").select("*, properties(name)").order("created_at", { ascending: false }),
    supabase.from("properties").select("id, name, slug").order("created_at"),
  ]);

  return (
    <RequestsBoard
      initialTickets={(tickets ?? []) as BoardTicket[]}
      properties={(properties ?? []) as Pick<Property, "id" | "name" | "slug">[]}
    />
  );
}
