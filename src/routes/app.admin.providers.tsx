import { createFileRoute } from "@tanstack/react-router";
import { Card, Table, Badge } from "@/components/ui-kit";
import { formatINR, compactNumber } from "@/lib/mock-data";
import { getProviders, type ProviderCard } from "@/data/providers";

export const Route = createFileRoute("/app/admin/providers")({
  component: ProvidersAdmin,
  // Reuses the advertiser-facing directory endpoint rather than a second
  // projection of the same five tables.
  loader: () => getProviders(),
});

function ProvidersAdmin() {
  const providers = Route.useLoaderData();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-medium tracking-tight">Providers</h1>
      <Card>
        <Table<ProviderCard>
          columns={[
            { key: "name", label: "Name" },
            { key: "type", label: "Type", render: (r) => <Badge tone="info">{r.type}</Badge> },
            {
              key: "location",
              label: "Location",
              render: (r) => r.location ?? "No fixed location",
            },
            { key: "price", label: "Price", render: (r) => formatINR(r.price) },
            { key: "audience", label: "Audience", render: (r) => compactNumber(r.audience) },
            { key: "rating", label: "Rating" },
          ]}
          rows={providers}
          empty="No providers yet."
        />
      </Card>
    </div>
  );
}
