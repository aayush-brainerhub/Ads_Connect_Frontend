import { createFileRoute } from "@tanstack/react-router";
import { Card, EmptyState } from "@/components/ui-kit";
import { formatINR } from "@/lib/mock-data";
import { getAdminMetrics } from "@/data/admin";
import { getAllCampaigns } from "@/data/campaigns";
import { Briefcase, Users, Megaphone, IndianRupee } from "lucide-react";

export const Route = createFileRoute("/app/admin/")({
  component: AdminDashboard,
  loader: async () => {
    const [metrics, campaigns] = await Promise.all([getAdminMetrics(), getAllCampaigns()]);
    return { metrics, campaigns };
  },
});

function AdminDashboard() {
  const { metrics, campaigns } = Route.useLoaderData();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">Platform overview</h1>
        <p className="mt-1 text-sm text-white/60">Operational metrics across AdsConnect.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat
          icon={<Briefcase size={16} />}
          label="Total providers"
          value={String(metrics.totalProviders)}
        />
        <Stat
          icon={<Users size={16} />}
          label="Total advertisers"
          value={String(metrics.totalAdvertisers)}
        />
        <Stat
          icon={<Megaphone size={16} />}
          label="Total campaigns"
          value={String(metrics.totalCampaigns)}
          hint={`${metrics.activeCampaigns} active`}
        />
        {/* Not "revenue": nothing settles money yet, so this is what advertisers
            have committed across live campaigns. */}
        <Stat
          icon={<IndianRupee size={16} />}
          label="Committed budget"
          value={formatINR(metrics.committedBudget)}
          hint="across active campaigns"
        />
      </div>
      <Card>
        <h2 className="text-base font-medium tracking-tight">Recent campaigns</h2>
        {campaigns.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="No campaigns on the platform yet" />
          </div>
        ) : (
          <div className="mt-4 divide-y divide-white/5">
            {campaigns.slice(0, 8).map((c) => (
              <div key={c.id} className="flex justify-between py-3 text-sm">
                <div>
                  <p>{c.title}</p>
                  <p className="text-xs text-white/50">
                    {[c.advertiser, c.industry, c.location].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <span className="text-white/70">{formatINR(c.budget)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card>
      <div className="flex items-center gap-2 text-white/60 text-xs uppercase tracking-wider">
        {icon}
        {label}
      </div>
      <p className="mt-3 text-3xl font-medium tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-xs text-white/50">{hint}</p>}
    </Card>
  );
}
