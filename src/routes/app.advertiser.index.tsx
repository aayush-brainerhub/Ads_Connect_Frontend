import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, EmptyState, Button } from "@/components/ui-kit";
import { formatINR } from "@/lib/mock-data";
import { getMyCampaigns } from "@/data/campaigns";
import { ArrowUpRight, Megaphone, TrendingUp, MessageSquare, Plus } from "lucide-react";

export const Route = createFileRoute("/app/advertiser/")({
  component: AdvertiserDashboard,
  loader: () => getMyCampaigns(),
});

function AdvertiserDashboard() {
  const campaigns = Route.useLoaderData();

  const active = campaigns.filter((c) => c.status === "Active");
  // Committed, not spent: nothing in this app settles money yet, so summing the
  // live campaigns' budgets is the honest figure to show.
  const committed = active.reduce((sum, c) => sum + c.budget, 0);
  const responses = campaigns.reduce((sum, c) => sum + c.responses, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-white/60">Snapshot of your advertising performance.</p>
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        <Stat
          icon={<Megaphone size={16} />}
          label="Active campaigns"
          value={String(active.length)}
          hint={`${campaigns.length} in total`}
        />
        <Stat
          icon={<TrendingUp size={16} />}
          label="Budget committed"
          value={formatINR(committed)}
          hint="across live campaigns"
        />
        <Stat
          icon={<MessageSquare size={16} />}
          label="Providers accepted"
          value={String(responses)}
          hint="across all campaigns"
        />
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-medium tracking-tight">Recent campaigns</h2>
          <Link
            to="/app/advertiser/campaigns"
            className="text-xs text-white/70 hover:text-white inline-flex items-center gap-1"
          >
            View all <ArrowUpRight size={12} />
          </Link>
        </div>
        {campaigns.length === 0 ? (
          <div className="mt-5">
            <EmptyState
              title="No campaigns yet"
              hint="Create a campaign, then send requests to the providers you want."
              action={
                <Link to="/app/advertiser/campaigns">
                  <Button>
                    <Plus size={14} /> New campaign
                  </Button>
                </Link>
              }
            />
          </div>
        ) : (
          <div className="mt-5 divide-y divide-white/5">
            {campaigns.slice(0, 4).map((c) => (
              <div key={c.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm text-white">{c.title}</p>
                  <p className="text-xs text-white/50">
                    {[c.industry, c.location].filter(Boolean).join(" · ") || c.objective}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm">{formatINR(c.budget)}</p>
                  <p className="text-xs text-white/50">{c.responses} accepted</p>
                </div>
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
