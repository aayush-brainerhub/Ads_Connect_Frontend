import { createFileRoute } from "@tanstack/react-router";
import { Card, EmptyState } from "@/components/ui-kit";
import { Inbox, CheckCircle2, IndianRupee } from "lucide-react";
import { formatINR } from "@/lib/mock-data";
import { getProviderRequests } from "@/data/requests";

export const Route = createFileRoute("/app/provider/")({
  component: ProviderDashboard,
  loader: () => getProviderRequests(),
});

function ProviderDashboard() {
  const requests = Route.useLoaderData();

  const accepted = requests.filter((r) => r.status === "Accepted");
  // Agreed, not banked: nothing settles money in this app yet.
  const agreed = accepted.reduce((sum, r) => sum + r.budget, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-white/60">Your performance at a glance.</p>
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        <Stat icon={<Inbox size={16} />} label="Total requests" value={String(requests.length)} />
        <Stat
          icon={<CheckCircle2 size={16} />}
          label="Active deals"
          value={String(accepted.length)}
        />
        <Stat
          icon={<IndianRupee size={16} />}
          label="Agreed value"
          value={formatINR(agreed)}
          hint="across accepted requests"
        />
      </div>
      <Card>
        <h2 className="text-base font-medium tracking-tight">Latest requests</h2>
        {requests.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="No requests yet"
              hint="Add inventory and keep your profile current so advertisers can find you."
            />
          </div>
        ) : (
          <div className="mt-4 divide-y divide-white/5">
            {requests.slice(0, 5).map((r) => (
              <div key={r.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p>{r.campaignTitle}</p>
                  <p className="text-xs text-white/50">
                    {r.advertiser} · {r.date}
                  </p>
                </div>
                <span className="text-white/70">{formatINR(r.budget)}</span>
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
