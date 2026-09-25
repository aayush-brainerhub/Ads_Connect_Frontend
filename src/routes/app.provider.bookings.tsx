import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Card,
  Table,
  Badge,
  SearchBar,
  Button,
  Modal,
  Field,
  Input,
  Textarea,
  Select,
} from "@/components/ui-kit";
import {
  getProposals,
  getBookings,
  getDeliverables,
  type Proposal,
  type Booking,
  type CampaignDeliverable,
} from "@/data/bookings";
import {
  Plus,
  Send,
  UploadCloud,
  CheckCircle2,
  Calendar,
  ExternalLink,
  Receipt,
  Clock,
} from "lucide-react";

export const Route = createFileRoute("/app/provider/bookings")({
  component: ProviderBookingsPage,
  loader: async () => {
    const [proposals, bookings, deliverables] = await Promise.all([
      getProposals(),
      getBookings(),
      getDeliverables(),
    ]);
    return { proposals, bookings, deliverables };
  },
});

export function ProviderBookingsPage() {
  const {
    proposals: initialProposals,
    bookings: initialBookings,
    deliverables: initialDeliverables,
  } = Route.useLoaderData();

  const [tab, setTab] = useState<"deliverables" | "proposals" | "bookings">("deliverables");
  const [q, setQ] = useState("");

  const [proposals, setProposals] = useState<Proposal[]>(initialProposals);
  const [deliverables, setDeliverables] = useState<CampaignDeliverable[]>(initialDeliverables);

  const [showCreateProposalModal, setShowCreateProposalModal] = useState(false);
  const [campaignTitle, setCampaignTitle] = useState("Summer Fashion Blitz 2026");
  const [advertiserName, setAdvertiserName] = useState("Aayush Chauhan (Brandify)");
  const [scopeText, setScopeText] = useState("");
  const [totalQuote, setTotalQuote] = useState("4500");

  const [submittingDeliverable, setSubmittingDeliverable] = useState<CampaignDeliverable | null>(null);
  const [proofUrl, setProofUrl] = useState("");
  const [proofMetrics, setProofMetrics] = useState("");

  const term = q.trim().toLowerCase();

  const filteredDeliverables = deliverables.filter((d) =>
    term
      ? d.title.toLowerCase().includes(term) ||
        d.campaignTitle.toLowerCase().includes(term) ||
        d.bookingNumber.toLowerCase().includes(term)
      : true,
  );

  const filteredProposals = proposals.filter((p) =>
    term
      ? p.campaignTitle.toLowerCase().includes(term) ||
        p.advertiserName.toLowerCase().includes(term) ||
        p.status.toLowerCase().includes(term)
      : true,
  );

  const filteredBookings = initialBookings.filter((b) =>
    term
      ? b.bookingNumber.toLowerCase().includes(term) ||
        b.campaignTitle.toLowerCase().includes(term) ||
        b.advertiserName.toLowerCase().includes(term)
      : true,
  );

  const handleCreateProposal = (e: React.FormEvent) => {
    e.preventDefault();
    const newProp: Proposal = {
      id: `prop-${Date.now()}`,
      requestId: `req-${Date.now()}`,
      campaignTitle,
      advertiserName,
      providerId: "prov-my-id",
      providerName: "Me (Creator)",
      version: 1,
      description: scopeText || "Custom creator campaign package with tailored deliverables.",
      deliverablesSummary: "1 Dedicated Post + 2 Stories with customized trackable discount code.",
      termsConditions: "Payment released upon proof approval. 1 round of revisions included.",
      subtotal: parseFloat(totalQuote) || 0,
      discountAmount: 0,
      taxAmount: (parseFloat(totalQuote) || 0) * 0.1,
      totalAmount: (parseFloat(totalQuote) || 0) * 1.1,
      currency: "USD",
      startDate: "2026-10-10",
      endDate: "2026-10-25",
      validUntil: "2026-10-05",
      status: "Submitted",
      submittedDate: new Date().toISOString().split("T")[0],
      items: [
        {
          id: `pitem-${Date.now()}`,
          proposalId: `prop-${Date.now()}`,
          channelName: "Instagram Reels",
          description: scopeText || "Dedicated creator video endorsement",
          quantity: 1,
          unitPrice: parseFloat(totalQuote) || 0,
          totalPrice: parseFloat(totalQuote) || 0,
        },
      ],
    };

    setProposals([newProp, ...proposals]);
    setScopeText("");
    setShowCreateProposalModal(false);
  };

  const handleSubmitProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingDeliverable || !proofUrl.trim()) return;

    setDeliverables((prev) =>
      prev.map((d) =>
        d.id === submittingDeliverable.id
          ? {
              ...d,
              status: "Submitted",
              proofUrl: proofUrl.trim(),
              proofMetrics: proofMetrics.trim() || "50k Views (Live)",
              submittedDate: new Date().toLocaleString(),
            }
          : d,
      ),
    );

    setProofUrl("");
    setProofMetrics("");
    setSubmittingDeliverable(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-white">Proposals & Execution</h1>
          <p className="text-sm text-white/60">
            Submit campaign proposals, manage reserved bookings, and submit deliverable execution proofs.
          </p>
        </div>
        {tab === "proposals" && (
          <Button onClick={() => setShowCreateProposalModal(true)} size="sm">
            <Plus size={16} /> Create Proposal
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 space-x-6">
        <button
          onClick={() => {
            setTab("deliverables");
            setQ("");
          }}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
            tab === "deliverables"
              ? "border-white text-white"
              : "border-transparent text-white/50 hover:text-white"
          }`}
        >
          Deliverables Hub ({deliverables.length})
        </button>
        <button
          onClick={() => {
            setTab("proposals");
            setQ("");
          }}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
            tab === "proposals"
              ? "border-white text-white"
              : "border-transparent text-white/50 hover:text-white"
          }`}
        >
          Sent Proposals ({proposals.length})
        </button>
        <button
          onClick={() => {
            setTab("bookings");
            setQ("");
          }}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
            tab === "bookings"
              ? "border-white text-white"
              : "border-transparent text-white/50 hover:text-white"
          }`}
        >
          Active Bookings ({initialBookings.length})
        </button>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <SearchBar
          value={q}
          onChange={setQ}
          placeholder={
            tab === "deliverables"
              ? "Search deliverables to upload proof..."
              : tab === "proposals"
                ? "Search proposals sent..."
                : "Search bookings..."
          }
        />
      </div>

      {/* Deliverables Submission Hub */}
      {tab === "deliverables" && (
        <Card>
          <Table<CampaignDeliverable>
            columns={[
              {
                key: "title",
                label: "Deliverable Task",
                render: (r) => (
                  <div>
                    <div className="font-medium text-white">{r.title}</div>
                    <div className="text-xs text-white/40">{r.campaignTitle} ({r.bookingNumber})</div>
                  </div>
                ),
              },
              {
                key: "deliverableType",
                label: "Format",
                render: (r) => <Badge tone="info">{r.deliverableType}</Badge>,
              },
              { key: "dueDate", label: "Deadline" },
              {
                key: "proof",
                label: "Proof Submission",
                render: (r) =>
                  r.proofUrl ? (
                    <div className="text-xs">
                      <a
                        href={r.proofUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sky-400 hover:underline flex items-center gap-1"
                      >
                        <ExternalLink size={12} /> View Proof
                      </a>
                      <div className="text-white/60 mt-0.5">{r.proofMetrics}</div>
                    </div>
                  ) : (
                    <span className="text-amber-400 text-xs">Awaiting Execution</span>
                  ),
              },
              {
                key: "status",
                label: "Review Status",
                render: (r) => {
                  const tone =
                    r.status === "Approved"
                      ? "success"
                      : r.status === "Submitted"
                        ? "info"
                        : r.status === "RevisionRequested"
                          ? "danger"
                          : "warn";
                  return <Badge tone={tone}>{r.status}</Badge>;
                },
              },
              {
                key: "actions",
                label: "Action",
                render: (r) => (
                  <Button
                    size="sm"
                    variant={r.status === "Approved" ? "secondary" : "primary"}
                    onClick={() => setSubmittingDeliverable(r)}
                  >
                    <UploadCloud size={14} /> {r.proofUrl ? "Update Proof" : "Submit Proof"}
                  </Button>
                ),
              },
            ]}
            rows={filteredDeliverables}
            empty={term ? "No deliverables matching query." : "No scheduled deliverables."}
          />
        </Card>
      )}

      {/* Proposals Sent */}
      {tab === "proposals" && (
        <Card>
          <Table<Proposal>
            columns={[
              {
                key: "campaign",
                label: "Target Campaign",
                render: (r) => (
                  <div>
                    <div className="font-medium text-white">{r.campaignTitle}</div>
                    <div className="text-xs text-white/50">{r.advertiserName}</div>
                  </div>
                ),
              },
              {
                key: "deliverables",
                label: "Proposed Scope",
                render: (r) => (
                  <div className="max-w-xs text-xs text-white/70 line-clamp-2">
                    {r.deliverablesSummary}
                  </div>
                ),
              },
              {
                key: "totalAmount",
                label: "Quote Amount",
                render: (r) => (
                  <span className="font-semibold text-emerald-400">
                    ${r.totalAmount.toLocaleString()} {r.currency}
                  </span>
                ),
              },
              {
                key: "status",
                label: "Status",
                render: (r) => (
                  <Badge
                    tone={
                      r.status === "Accepted"
                        ? "success"
                        : r.status === "Submitted"
                          ? "info"
                          : r.status === "Rejected"
                            ? "danger"
                            : "default"
                    }
                  >
                    {r.status}
                  </Badge>
                ),
              },
              { key: "submittedDate", label: "Sent Date" },
              { key: "validUntil", label: "Valid Until" },
            ]}
            rows={filteredProposals}
            empty={term ? "No proposals found." : "No proposals submitted yet."}
          />
        </Card>
      )}

      {/* Bookings */}
      {tab === "bookings" && (
        <div className="space-y-4">
          {filteredBookings.map((b) => (
            <Card key={b.id} className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div>
                  <span className="font-mono text-xs font-semibold text-white bg-white/5 px-2 py-0.5 rounded">
                    {b.bookingNumber}
                  </span>
                  <h3 className="text-base font-medium text-white mt-1">{b.campaignTitle}</h3>
                  <div className="text-xs text-white/40 mt-0.5">Advertiser: {b.advertiserName}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-emerald-400">
                    ${b.providerPayout.toLocaleString()} USD
                  </div>
                  <div className="text-[11px] text-white/40">Net Payout after Platform Cut</div>
                </div>
              </div>

              <div className="text-xs text-white/60 flex items-center justify-between">
                <span>Execution Period: {b.startDate} → {b.endDate}</span>
                <Badge tone="success">Contract Confirmed</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Submit Proof Modal */}
      {submittingDeliverable && (
        <Modal
          open={true}
          onClose={() => setSubmittingDeliverable(null)}
          title={`Submit Execution Proof: ${submittingDeliverable.title}`}
          footer={
            <>
              <Button variant="ghost" onClick={() => setSubmittingDeliverable(null)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSubmitProof}>
                <Send size={16} /> Submit for Client Approval
              </Button>
            </>
          }
        >
          <form onSubmit={handleSubmitProof} className="space-y-4 text-sm">
            <div className="rounded-lg bg-white/5 p-3 text-xs text-white/80">
              {submittingDeliverable.description}
            </div>

            <Field label="Live Post / Content URL">
              <Input
                required
                type="url"
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
                placeholder="https://instagram.com/reel/... or https://youtube.com/watch?v=..."
              />
            </Field>

            <Field label="Live Metrics / Impressions / Reach Summary">
              <Input
                value={proofMetrics}
                onChange={(e) => setProofMetrics(e.target.value)}
                placeholder="e.g. 140,000 Views • 12,500 Likes • 980 Comments"
              />
            </Field>
          </form>
        </Modal>
      )}

      {/* Create Proposal Modal */}
      {showCreateProposalModal && (
        <Modal
          open={true}
          onClose={() => setShowCreateProposalModal(false)}
          title="Create Custom Campaign Proposal"
          footer={
            <>
              <Button variant="ghost" onClick={() => setShowCreateProposalModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleCreateProposal}>
                Send Proposal
              </Button>
            </>
          }
        >
          <form onSubmit={handleCreateProposal} className="space-y-4 text-sm">
            <Field label="Campaign Title">
              <Input
                required
                value={campaignTitle}
                onChange={(e) => setCampaignTitle(e.target.value)}
              />
            </Field>

            <Field label="Advertiser Name / Company">
              <Input
                required
                value={advertiserName}
                onChange={(e) => setAdvertiserName(e.target.value)}
              />
            </Field>

            <Field label="Proposed Deliverables & Execution Details">
              <Textarea
                required
                value={scopeText}
                onChange={(e) => setScopeText(e.target.value)}
                placeholder="List proposed video formats, dates, exclusivity, link placement..."
              />
            </Field>

            <Field label="Total Quote Amount (USD)">
              <Input
                required
                type="number"
                value={totalQuote}
                onChange={(e) => setTotalQuote(e.target.value)}
              />
            </Field>
          </form>
        </Modal>
      )}
    </div>
  );
}
