"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, X, Users, Building2, Phone, Mail, UserCheck } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/PageHeader";
import { Select, type SelectOption } from "@/components/Select";
import type { Profile } from "@/lib/types";

export type TenantRow = Profile & {
  properties?: { id?: string; name: string } | null;
};

interface TenantsDirectoryProps {
  initialTenants: TenantRow[];
  properties: { id: string; name: string; slug: string }[];
}

export function TenantsDirectory({ initialTenants, properties }: TenantsDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [propertyFilter, setPropertyFilter] = useState("all");

  const propertyOptions: SelectOption[] = useMemo(() => {
    return [
      { value: "all", label: "All properties" },
      ...properties.map((p) => ({ value: p.id, label: p.name })),
    ];
  }, [properties]);

  const filteredTenants = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return initialTenants.filter((tenant) => {
      // Property match
      if (propertyFilter !== "all") {
        if (tenant.property_id !== propertyFilter) {
          return false;
        }
      }

      // Search query match
      if (!query) return true;

      const nameMatch = tenant.full_name?.toLowerCase().includes(query) ?? false;
      const unitMatch = tenant.unit_number?.toLowerCase().includes(query) ?? false;
      const emailMatch = tenant.email?.toLowerCase().includes(query) ?? false;
      const phoneMatch = tenant.phone?.toLowerCase().includes(query) ?? false;
      const propertyNameMatch = tenant.properties?.name?.toLowerCase().includes(query) ?? false;

      return nameMatch || unitMatch || emailMatch || phoneMatch || propertyNameMatch;
    });
  }, [initialTenants, searchTerm, propertyFilter]);

  const hasActiveFilters = Boolean(searchTerm.trim() || propertyFilter !== "all");

  const handleClearFilters = () => {
    setSearchTerm("");
    setPropertyFilter("all");
  };

  const eyebrowText = hasActiveFilters
    ? `Showing ${filteredTenants.length} of ${initialTenants.length} tenants`
    : `${initialTenants.length} joined`;

  return (
    <>
      <PageHeader eyebrow={eyebrowText} title="Tenants" />

      {/* Toolbar / Search & Filters */}
      <div className="mt-8 mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, unit, property, or email..."
              className="input h-10 w-full rounded-full pl-10 pr-9 text-xs sm:text-sm"
              aria-label="Search tenants"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink transition"
                title="Clear search"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Property Dropdown */}
          {properties.length > 1 && (
            <Select
              value={propertyFilter}
              onChange={setPropertyFilter}
              options={propertyOptions}
              className="w-full sm:w-auto sm:min-w-[190px] rounded-full"
              aria-label="Filter by property"
            />
          )}
        </div>

        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="btn btn-ghost h-9 px-3 text-xs self-start sm:self-auto"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Tenants Table Card */}
      <div className="card overflow-hidden">
        {initialTenants.length === 0 ? (
          <EmptyState
            title="No tenants yet"
            body="Tenants join through your property link."
            action={
              <Link href="/company/properties" className="btn btn-secondary">
                Get tenant link
              </Link>
            }
          />
        ) : filteredTenants.length === 0 ? (
          <div className="py-14 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-surface text-ink-subtle mb-3">
              <Search className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-ink">No tenants found</p>
            <p className="mt-1 text-xs text-ink-muted">
              No tenants match your search &ldquo;{searchTerm}&rdquo;
            </p>
            <div className="mt-4">
              <button onClick={handleClearFilters} className="btn btn-secondary h-8 px-3 text-xs">
                Reset filters
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-line text-xs text-ink-subtle">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Unit</th>
                  <th className="px-5 py-3 font-medium">Property</th>
                  <th className="px-5 py-3 font-medium">Contact</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-sm">
                {filteredTenants.map((t) => (
                  <tr key={t.id} className="transition hover:bg-brand-50/40">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-xs font-medium text-brand-700 flex-shrink-0">
                          {(t.full_name || t.email || "?").charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-ink">{t.full_name || "—"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-ink-muted font-mono text-xs">
                      {t.unit_number || "—"}
                    </td>
                    <td className="px-5 py-4">
                      {t.properties?.name ? (
                        <span className="badge bg-surface text-ink ring-1 ring-inset ring-line">
                          {t.properties.name}
                        </span>
                      ) : (
                        <span className="text-ink-subtle">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-ink-muted">{t.email || "—"}</p>
                      {t.phone && <p className="text-xs text-ink-subtle mt-0.5">{t.phone}</p>}
                    </td>
                    <td className="px-5 py-4 text-xs text-ink-subtle">
                      {t.created_at ? new Date(t.created_at).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
