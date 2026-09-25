import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { formatINR, compactNumber } from "@/lib/mock-data";
import { getProviderById, initialsFor } from "@/data/providers";
import { getMyCampaigns } from "@/data/campaigns";
import { createRequest } from "@/data/requests";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Field,
  Input,
  Modal,
  Textarea,
  Select,
} from "@/components/ui-kit";
import { ArrowLeft, MapPin, Star, MessageSquare, Loader2 } from "lucide-react";

interface Search {
  contact?: number;
}

export const Route = createFileRoute("/app/advertiser/discover/$id")({
  component: ProviderDetail,
  validateSearch: (s: Record<string, unknown>): Search => ({ contact: s.contact ? 1 : 0 }),
  loader: async ({ params }) => {
    const [provider, campaigns] = await Promise.all([
      getProviderById({ data: params.id }),
      getMyCampaigns(),
    ]);
    if (!provider) throw notFound();
    return { provider, campaigns };
  },
  errorComponent: ({ error }) => <div className="text-red-300 text-sm">{error.message}</div>,
  notFoundComponent: () => <div className="text-white/60 text-sm">Provider not found.</div>,
});

function ProviderDetail() {
  const { provider: p, campaigns } = Route.useLoaderData();
  const { contact } = Route.useSearch();
  const navigate = useNavigate();

  const [open, setOpen] = useState(Boolean(contact));
  // A request hangs off a campaign in this schema, so which campaign it is for is
  // part of sending it rather than something to guess afterwards.
  const [campaignId, setCampaignId] = useState(campaigns[0]?.id ?? "");
  const [budget, setBudget] = useState("");
  const [msg, setMsg] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    setOpen(false);
    setError(null);
    navigate({
      to: "/app/advertiser/discover/$id",
      params: { id: p.id },
      search: { contact: 0 },
    });
  };

  const send = async () => {
    setPending(true);
    setError(null);
    try {
      const result = await createRequest({
        data: {
          campaignId,
          providerId: p.id,
          budget: Number(budget) || p.price,
          message: msg || null,
        },
      });
      if (!result.ok) {
        setError(result.error ?? "The request could not be sent.");
        return;
      }
      setOpen(false);
      navigate({ to: "/app/advertiser/messages" });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The request could not be sent.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link
        to="/app/advertiser/discover"
        className="inline-flex items-center gap-2 text-xs text-white/60 hover:text-white"
      >
        <ArrowLeft size={12} /> Back to discover
      </Link>
      <Card>
        <div className="flex flex-wrap items-start gap-5">
          <Avatar initials={initialsFor(p.name)} size={72} />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-medium tracking-tight">{p.name}</h1>
              <Badge tone="info">{p.type}</Badge>
              <div className="flex items-center gap-1 text-amber-300 text-sm">
                <Star size={14} fill="currentColor" />
                {p.rating}
              </div>
            </div>
            <p className="mt-1 text-sm text-white/60 flex items-center gap-3">
              <MapPin size={12} />
              {[p.location ?? "No fixed location", p.category].filter(Boolean).join(" · ")}
            </p>
            <p className="mt-4 text-sm text-white/80 max-w-2xl">{p.description}</p>
          </div>
          <Button onClick={() => setOpen(true)}>
            <MessageSquare size={14} /> Send request
          </Button>
        </div>
        <div className="mt-8 grid sm:grid-cols-3 gap-4">
          <Metric label="Price" value={formatINR(p.price)} />
          <Metric label="Audience" value={compactNumber(p.audience)} />
          <Metric label="Avg. response" value="< 24 hours" />
        </div>
      </Card>

      <Modal
        open={open}
        onClose={close}
        title={`Send request to ${p.name}`}
        footer={
          <>
            <Button variant="secondary" onClick={close}>
              Cancel
            </Button>
            <Button onClick={send} disabled={!campaignId || pending}>
              {pending ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Sending…
                </>
              ) : (
                "Send request"
              )}
            </Button>
          </>
        }
      >
        {campaigns.length === 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-white/70">
              A request belongs to a campaign, and you don't have one yet.
            </p>
            <Link to="/app/advertiser/campaigns">
              <Button>Create a campaign first</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <Field label="Campaign">
              <Select value={campaignId} onChange={(e) => setCampaignId(e.target.value)}>
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Proposed budget (₹)">
              <Input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder={String(p.price)}
              />
            </Field>
            <Field label="Message">
              <Textarea
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                placeholder="Tell the provider about your campaign..."
              />
            </Field>
            {error && (
              <p
                role="alert"
                className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
              >
                {error}
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 p-4">
      <p className="text-[11px] uppercase tracking-wider text-white/50">{label}</p>
      <p className="mt-2 text-xl tracking-tight">{value}</p>
    </div>
  );
}
