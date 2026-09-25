import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui-kit";
import { formatINR } from "@/lib/mock-data";
import { getAdminMetrics } from "@/data/admin";
import { getAllCampaigns } from "@/data/campaigns";

export const Route = createFileRoute("/app/admin/reports")({
  component: ReportsPage,
  loader: async () => {
    const [metrics, campaigns] = await Promise.all([getAdminMetrics(), getAllCampaigns()]);
    return { metrics, campaigns };
  },
});

function ReportsPage() {
  const { metrics, campaigns } = Route.useLoaderData();

  // Committed budget by the month the campaign was created. Derived from the
  // campaign list rather than a reporting endpoint — there is no financial data
  // behind this yet, and inventing an endpoint would imply there is.
  const byMonth = new Map<string, number>();
  for (const c of campaigns) {
    const month = c.createdAt.slice(0, 7);
    byMonth.set(month, (byMonth.get(month) ?? 0) + c.budget);
  }
  const months = [...byMonth.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-6);
  const peak = Math.max(1, ...months.map(([, total]) => total));

  const averageBudget = campaigns.length
    ? campaigns.reduce((sum, c) => sum + c.budget, 0) / campaigns.length
    : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-medium tracking-tight">Reports</h1>
      <div className="grid sm:grid-cols-2 gap-4">
        <Card>
          <p className="text-xs uppercase tracking-wider text-white/50">
            Committed budget by month
          </p>
          {months.length === 0 ? (
            <p className="mt-6 text-sm text-white/50">No campaigns to chart yet.</p>
          ) : (
            <div className="mt-6 flex items-end gap-3 h-44">
              {months.map(([month, total]) => (
                <div key={month} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full rounded-md bg-gradient-to-t from-white/10 to-white/60"
                    style={{ height: `${Math.max(4, (total / peak) * 100)}%` }}
                    title={formatINR(total)}
                  />
                  <span className="text-[11px] text-white/50">
                    {new Date(month + "-01").toLocaleDateString([], { month: "short" })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wider text-white/50">Topline metrics</p>
          <div className="mt-4 space-y-3 text-sm">
            <Row k="Committed budget" v={formatINR(metrics.committedBudget)} />
            <Row k="Avg. campaign budget" v={formatINR(averageBudget)} />
            <Row k="Active campaigns" v={String(metrics.activeCampaigns)} />
            <Row k="Active providers" v={String(metrics.totalProviders)} />
            <Row k="Active advertisers" v={String(metrics.totalAdvertisers)} />
            <Row k="Registered users" v={String(metrics.totalUsers)} />
          </div>
        </Card>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between border-b border-white/5 pb-2">
      <span className="text-white/60">{k}</span>
      <span>{v}</span>
    </div>
  );
}
