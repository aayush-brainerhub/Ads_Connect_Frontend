import { createFileRoute } from "@tanstack/react-router";
import { Card, Table, Badge } from "@/components/ui-kit";
import { formatINR } from "@/lib/mock-data";
import { campaignTone } from "@/lib/status";
import { getAllCampaigns, type Campaign } from "@/data/campaigns";

export const Route = createFileRoute("/app/admin/campaigns")({
  component: CampaignsAdmin,
  loader: () => getAllCampaigns(),
});

function CampaignsAdmin() {
  const campaigns = Route.useLoaderData();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-medium tracking-tight">Campaigns</h1>
      <Card>
        <Table<Campaign>
          columns={[
            { key: "title", label: "Campaign" },
            { key: "advertiser", label: "Advertiser", render: (r) => r.advertiser ?? "—" },
            { key: "industry", label: "Industry", render: (r) => r.industry ?? "—" },
            { key: "location", label: "Location", render: (r) => r.location ?? "—" },
            { key: "budget", label: "Budget", render: (r) => formatINR(r.budget) },
            { key: "objective", label: "Objective" },
            { key: "responses", label: "Responses" },
            {
              key: "status",
              label: "Status",
              render: (r) => <Badge tone={campaignTone(r.status)}>{r.status}</Badge>,
            },
          ]}
          rows={campaigns}
          empty="No campaigns on the platform yet."
        />
      </Card>
    </div>
  );
}
