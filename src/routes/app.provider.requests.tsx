import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Card, Table, Badge, Button } from "@/components/ui-kit";
import { formatINR } from "@/lib/mock-data";
import { isAwaitingResponse, requestTone } from "@/lib/status";
import { getProviderRequests, respondToRequest, type CampaignRequest } from "@/data/requests";

export const Route = createFileRoute("/app/provider/requests")({
  component: RequestsPage,
  loader: () => getProviderRequests(),
});

function RequestsPage() {
  const requests = Route.useLoaderData();
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const respond = async (id: string, status: "Accepted" | "Declined") => {
    setBusyId(id);
    setError(null);
    try {
      const result = await respondToRequest({ data: { requestId: id, status } });
      if (!result.ok) {
        setError(result.error ?? "Could not update the request.");
        return;
      }
      await router.invalidate();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update the request.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">Campaign requests</h1>
        <p className="mt-1 text-sm text-white/60">
          Accept or decline incoming requests from advertisers.
        </p>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
        >
          {error}
        </p>
      )}

      <Card>
        <Table<CampaignRequest>
          columns={[
            { key: "campaignTitle", label: "Campaign" },
            { key: "advertiser", label: "Advertiser" },
            { key: "budget", label: "Budget", render: (r) => formatINR(r.budget) },
            { key: "date", label: "Date" },
            {
              key: "status",
              label: "Status",
              render: (r) => <Badge tone={requestTone(r.status)}>{r.status}</Badge>,
            },
            {
              key: "actions",
              label: "",
              className: "text-right",
              render: (r) =>
                isAwaitingResponse(r.status) ? (
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={busyId === r.id}
                      onClick={() => respond(r.id, "Declined")}
                    >
                      Decline
                    </Button>
                    <Button
                      size="sm"
                      disabled={busyId === r.id}
                      onClick={() => respond(r.id, "Accepted")}
                    >
                      Accept
                    </Button>
                  </div>
                ) : (
                  <span className="text-white/40 text-xs">—</span>
                ),
            },
          ]}
          rows={requests}
          empty="No requests yet — advertisers will appear here once they reach out."
        />
      </Card>
    </div>
  );
}
