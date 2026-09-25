import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Card,
  Table,
  Badge,
  SearchBar,
  Button,
  Modal,
  Textarea,
  Field,
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
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCheck2,
  Calendar,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

export const Route = createFileRoute("/app/advertiser/bookings")({
  component: AdvertiserBookingsPage,
  loader: async () => {
    const [proposals, bookings, deliverables] = await Promise.all([
      getProposals(),
      getBookings(),
      getDeliverables(),
    ]);
    return { proposals, bookings, deliverables };
  },
});

export function AdvertiserBookingsPage() {
  const {
    proposals: initialProposals,
    bookings: initialBookings,
    deliverables: initialDeliverables,
  } = Route.useLoaderData();

  const [tab, setTab] = useState<"proposals" | "bookings" | "deliverables">("proposals");
  const [q, setQ] = useState("");

  const [proposals, setProposals] = useState<Proposal[]>(initialProposals);
  const [deliverables, setDeliverables] = useState<CampaignDeliverable[]>(initialDeliverables);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);

  const [reviewingDeliverable, setReviewingDeliverable] = useState<CampaignDeliverable | null>(null);
  const [revisionNotes, setRevisionNotes] = useState("");

  const term = q.trim().toLowerCase();

  const filteredProposals = proposals.filter((p) =>
    term
      ? p.campaignTitle.toLowerCase().includes(term) ||
        p.providerName.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
      : true,
  );

  const filteredBookings = initialBookings.filter((b) =>
    term
      ? b.bookingNumber.toLowerCase().includes(term) ||
        b.campaignTitle.toLowerCase().includes(term) ||
        b.providerName.toLowerCase().includes(term)
      : true,
  );

  const filteredDeliverables = deliverables.filter((d) =>
    term
      ? d.title.toLowerCase().includes(term) ||
        d.campaignTitle.toLowerCase().includes(term) ||
        d.bookingNumber.toLowerCase().includes(term)
      : true,
  );

  const handleAcceptProposal = (propId: string) => {
    setProposals((prev) =>
      prev.map((p) => (p.id === propId ? { ...p, status: "Accepted", decidedDate: "Today" } : p)),
    );
    setSelectedProposal(null);
  };

  const handleDeclineProposal = (propId: string) => {
    setProposals((prev) =>
      prev.map((p) => (p.id === propId ? { ...p, status: "Rejected", decidedDate: "Today" } : p)),
    );
    setSelectedProposal(null);
  };

  const handleApproveDeliverable = (delivId: string) => {
    setDeliverables((prev) =>
      prev.map((d) =>
        d.id === delivId
          ? { ...d, status: "Approved", reviewedDate: new Date().toISOString().split("T")[0] }
          : d,
      ),
    );
    setReviewingDeliverable(null);
  };

  const handleRequestRevision = (delivId: string) => {
    setDeliverables((prev) =>
      prev.map((d) =>
        d.id === delivId
          ? {
              ...d,
              status: "RevisionRequested",
              reviewComments: revisionNotes || "Revision requested by advertiser.",
              revisionCount: d.revisionCount + 1,
            }
          : d,
      ),
    );
    setRevisionNotes("");
    setReviewingDeliverable(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-white">Proposals & Bookings</h1>
          <p className="text-sm text-white/60">
            Review custom provider proposals, manage booked ad inventory, and inspect live campaign deliverables.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 space-x-6">
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
          Proposals Received ({proposals.length})
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
          Proof & Deliverables ({deliverables.length})
        </button>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <SearchBar
          value={q}
          onChange={setQ}
          placeholder={
            tab === "proposals"
              ? "Search proposals by provider or campaign..."
              : tab === "bookings"
                ? "Search booking numbers, campaigns..."
                : "Search deliverables and proof metrics..."
          }
        />
      </div>

      {/* Proposals Tab */}
      {tab === "proposals" && (
        <Card>
          <Table<Proposal>
            columns={[
              {
                key: "campaign",
                label: "Campaign & Provider",
                render: (r) => (
                  <div>
                    <div className="font-medium text-white">{r.campaignTitle}</div>
                    <div className="text-xs text-white/50 mt-0.5">Provider: {r.providerName}</div>
                  </div>
                ),
              },
              {
                key: "deliverables",
                label: "Deliverables Scope",
                render: (r) => (
                  <div className="max-w-xs text-xs text-white/80 line-clamp-2">
                    {r.deliverablesSummary}
                  </div>
                ),
              },
              {
                key: "schedule",
                label: "Execution Dates",
                render: (r) => (
                  <span className="text-xs text-white/70">
                    {r.startDate} → {r.endDate}
                  </span>
                ),
              },
              {
                key: "totalAmount",
                label: "Total Quote",
                render: (r) => (
                  <span className="font-semibold text-emerald-400">
                    ${r.totalAmount.toLocaleString()} {r.currency}
                  </span>
                ),
              },
              {
                key: "status",
                label: "Status",
                render: (r) => {
                  const tone =
                    r.status === "Accepted"
                      ? "success"
                      : r.status === "Submitted"
                        ? "info"
                        : r.status === "Rejected"
                          ? "danger"
                          : "default";
                  return <Badge tone={tone}>{r.status}</Badge>;
                },
              },
              {
                key: "actions",
                label: "Action",
                render: (r) => (
                  <Button size="sm" variant="secondary" onClick={() => setSelectedProposal(r)}>
                    Review Quote
                  </Button>
                ),
              },
            ]}
            rows={filteredProposals}
            empty={term ? "No proposals match that search." : "No proposals received yet."}
          />
        </Card>
      )}

      {/* Bookings Tab */}
      {tab === "bookings" && (
        <div className="space-y-4">
          {filteredBookings.map((b) => (
            <Card key={b.id} className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-white">{b.bookingNumber}</span>
                    <Badge tone={b.status === "InProgress" ? "info" : "success"}>{b.status}</Badge>
                  </div>
                  <h3 className="text-base font-medium text-white mt-1">{b.campaignTitle}</h3>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-white">${b.totalAmount.toLocaleString()} USD</div>
                  <div className="text-xs text-white/40">Provider: {b.providerName}</div>
                </div>
              </div>

              {/* Reserved Items */}
              <div className="space-y-2">
                <div className="text-xs uppercase tracking-wider text-white/50">Reserved Inventory Slots</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {b.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3 text-xs"
                    >
                      <div>
                        <div className="font-medium text-white">{item.itemTitle}</div>
                        <div className="text-white/40">{item.channelName} • {item.scheduledDate}</div>
                      </div>
                      <Badge tone={item.status === "Scheduled" ? "info" : "warn"}>{item.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deliverables summary */}
              <div className="flex items-center justify-between pt-2 text-xs text-white/60">
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} /> Campaign Duration: {b.startDate} to {b.endDate}
                </span>
                <span className="text-emerald-400 font-medium">
                  {b.deliverables.filter((d) => d.status === "Approved").length} of {b.deliverables.length} Deliverables Completed
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Deliverables Tab */}
      {tab === "deliverables" && (
        <Card>
          <Table<CampaignDeliverable>
            columns={[
              {
                key: "title",
                label: "Deliverable Item",
                render: (r) => (
                  <div>
                    <div className="font-medium text-white">{r.title}</div>
                    <div className="text-xs text-white/50">{r.campaignTitle} ({r.bookingNumber})</div>
                  </div>
                ),
              },
              {
                key: "deliverableType",
                label: "Type",
                render: (r) => <Badge tone="info">{r.deliverableType}</Badge>,
              },
              { key: "dueDate", label: "Due Date" },
              {
                key: "proof",
                label: "Proof & Performance",
                render: (r) =>
                  r.proofUrl ? (
                    <div className="text-xs">
                      <a
                        href={r.proofUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sky-400 hover:underline flex items-center gap-1"
                      >
                        <ExternalLink size={12} /> Live Link
                      </a>
                      {r.proofMetrics && (
                        <div className="text-white/60 mt-0.5">{r.proofMetrics}</div>
                      )}
                    </div>
                  ) : (
                    <span className="text-white/40 text-xs">— Awaiting Upload —</span>
                  ),
              },
              {
                key: "status",
                label: "Status",
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
                  <Button size="sm" variant="secondary" onClick={() => setReviewingDeliverable(r)}>
                    Inspect & Review
                  </Button>
                ),
              },
            ]}
            rows={filteredDeliverables}
            empty={term ? "No deliverables match that filter." : "No deliverables submitted yet."}
          />
        </Card>
      )}

      {/* Proposal Details Modal */}
      {selectedProposal && (
        <Modal
          open={true}
          onClose={() => setSelectedProposal(null)}
          title={`Proposal from ${selectedProposal.providerName}`}
          size="lg"
          footer={
            selectedProposal.status === "Submitted" ? (
              <>
                <Button variant="danger" onClick={() => handleDeclineProposal(selectedProposal.id)}>
                  Decline Proposal
                </Button>
                <Button variant="primary" onClick={() => handleAcceptProposal(selectedProposal.id)}>
                  <CheckCircle2 size={16} /> Accept & Confirm Booking
                </Button>
              </>
            ) : (
              <Button variant="secondary" onClick={() => setSelectedProposal(null)}>
                Close
              </Button>
            )
          }
        >
          <div className="space-y-4 text-sm">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2">
              <div className="text-xs text-white/50 uppercase">Campaign Request</div>
              <div className="font-semibold text-white text-base">{selectedProposal.campaignTitle}</div>
              <p className="text-white/70 text-xs">{selectedProposal.description}</p>
            </div>

            <div>
              <h4 className="text-xs uppercase tracking-wider text-white/60 mb-2">Itemized Deliverables</h4>
              <div className="rounded-xl border border-white/10 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/5 text-white/60">
                    <tr>
                      <th className="p-3">Item / Channel</th>
                      <th className="p-3 text-right">Qty</th>
                      <th className="p-3 text-right">Unit Price</th>
                      <th className="p-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {selectedProposal.items.map((item) => (
                      <tr key={item.id}>
                        <td className="p-3 text-white">
                          <div className="font-medium">{item.channelName}</div>
                          <div className="text-white/50 text-[11px]">{item.description}</div>
                        </td>
                        <td className="p-3 text-right text-white/80">{item.quantity}</td>
                        <td className="p-3 text-right text-white/80">${item.unitPrice.toLocaleString()}</td>
                        <td className="p-3 text-right font-medium text-white">${item.totalPrice.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs space-y-1">
              <div className="text-white/40 uppercase">Terms & Conditions</div>
              <div className="text-white/80">{selectedProposal.termsConditions}</div>
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-3">
              <span className="text-xs text-white/50">Valid until: {selectedProposal.validUntil}</span>
              <div className="text-right">
                <span className="text-xs text-white/60 mr-2">Total Amount:</span>
                <span className="text-lg font-bold text-emerald-400">
                  ${selectedProposal.totalAmount.toLocaleString()} {selectedProposal.currency}
                </span>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Review Deliverable Modal */}
      {reviewingDeliverable && (
        <Modal
          open={true}
          onClose={() => setReviewingDeliverable(null)}
          title={`Review Deliverable: ${reviewingDeliverable.title}`}
          size="md"
          footer={
            <>
              <Button variant="danger" onClick={() => handleRequestRevision(reviewingDeliverable.id)}>
                Request Revision
              </Button>
              <Button variant="primary" onClick={() => handleApproveDeliverable(reviewingDeliverable.id)}>
                <CheckCircle2 size={16} /> Approve Deliverable
              </Button>
            </>
          }
        >
          <div className="space-y-4 text-sm">
            <div>
              <div className="text-xs text-white/50 uppercase">Description</div>
              <div className="text-white/80 text-xs mt-0.5">{reviewingDeliverable.description}</div>
            </div>

            {reviewingDeliverable.proofUrl && (
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 space-y-2">
                <div className="text-xs text-white/50 uppercase">Proof of Live Execution</div>
                <a
                  href={reviewingDeliverable.proofUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky-400 hover:underline text-xs flex items-center gap-1.5"
                >
                  <ExternalLink size={14} /> Open Live Post: {reviewingDeliverable.proofUrl}
                </a>
                {reviewingDeliverable.proofMetrics && (
                  <div className="text-xs text-emerald-400 bg-emerald-500/10 p-2 rounded flex items-center gap-1.5">
                    <TrendingUp size={14} /> {reviewingDeliverable.proofMetrics}
                  </div>
                )}
              </div>
            )}

            <Field label="Revision Feedback (if requesting changes)">
              <Textarea
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
                placeholder="Mention timestamps, brand link positioning, or audio adjustments required..."
              />
            </Field>
          </div>
        </Modal>
      )}
    </div>
  );
}
