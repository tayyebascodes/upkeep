import { PageHeader, EmptyState } from "@/components/PageHeader";
import { createClient } from "@/lib/supabase/server";
import { AgentSetupForm } from "./AgentSetupForm";
import type { Property, PropertyDocument } from "@/lib/types";

export default async function AgentSetupPage({
  searchParams,
}: {
  searchParams: Promise<{ property?: string }>;
}) {
  const { property: propertyParam } = await searchParams;
  const supabase = await createClient();

  const { data: propertyData } = await supabase.from("properties").select("*").order("created_at");
  const properties = (propertyData ?? []) as Property[];
  const property = properties.find((p) => p.id === propertyParam) ?? properties[0];

  if (!property) {
    return (
      <>
        <PageHeader eyebrow="Agent" title="Setup" />
        <div className="card mt-8">
          <EmptyState title="Add a property first." />
        </div>
      </>
    );
  }

  const { data: documents } = await supabase
    .from("documents")
    .select("*")
    .eq("property_id", property.id)
    .order("created_at");

  return (
    <AgentSetupForm
      key={property.id}
      property={property}
      properties={properties.map(({ id, name }) => ({ id, name }))}
      initialDocuments={(documents ?? []) as PropertyDocument[]}
    />
  );
}
