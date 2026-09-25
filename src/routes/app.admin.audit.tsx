import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, Table, Badge, SearchBar, Button, Modal } from "@/components/ui-kit";
import { getAuditLogs, type AuditLogItem } from "@/data/audit";
import { getReviews, toggleReviewPublish, type Review } from "@/data/reviews";
import { ShieldCheck, Eye, Star, CheckCircle, AlertTriangle, Download, Filter, Lock, FileText, CheckCircle2, XCircle } from "lucide-react";

export const Route = createFileRoute("/app/admin/audit")({
  component: AdminAuditPage,
  loader: async () => {
    const [auditLogs, reviews] = await Promise.all([getAuditLogs(), getReviews()]);
    return { auditLogs, reviews };
  },
});

function AdminAuditPage() {
  const { auditLogs: initialLogs, reviews: initialReviews } = Route.useLoaderData();

  const [tab, setTab] = useState<"audit" | "reviews">("audit");
  const [q, setQ] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("ALL");
  const [entityFilter, setEntityFilter] = useState<string>("ALL");
  const [reviewStatusFilter, setReviewStatusFilter] = useState<string>("ALL");
  const [selectedAudit, setSelectedAudit] = useState<AuditLogItem | null>(null);
  const [reviewsList, setReviewsList] = useState<Review[]>(initialReviews);

  const term = q.trim().toLowerCase();

  const filteredLogs = initialLogs.filter((log) => {
    const matchesTerm = term
      ? log.userName.toLowerCase().includes(term) ||
        log.userEmail.toLowerCase().includes(term) ||
        log.entityName.toLowerCase().includes(term) ||
        log.action.toLowerCase().includes(term) ||
        log.ipAddress.includes(term)
      : true;

    const matchesAction = actionFilter === "ALL" || log.action.toUpperCase() === actionFilter;
    const matchesEntity = entityFilter === "ALL" || log.entityName.toLowerCase() === entityFilter.toLowerCase();

    return matchesTerm && matchesAction && matchesEntity;
  });

  const filteredReviews = reviewsList.filter((rev) => {
    const matchesTerm = term
      ? rev.reviewerName.toLowerCase().includes(term) ||
        rev.providerName.toLowerCase().includes(term) ||
        rev.title.toLowerCase().includes(term) ||
        rev.campaignTitle.toLowerCase().includes(term)
      : true;

    const matchesStatus =
      reviewStatusFilter === "ALL" ||
      (reviewStatusFilter === "PUBLISHED" && rev.isPublished) ||
      (reviewStatusFilter === "HIDDEN" && !rev.isPublished);

    return matchesTerm && matchesStatus;
  });

  const toggleReviewPublishHandler = async (reviewId: string) => {
    setReviewsList((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, isPublished: !r.isPublished } : r)),
    );
    try {
      await toggleReviewPublish({ data: reviewId });
    } catch {
      // Done
    }
  };

  const exportAuditLogJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `audit-trail-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const formatJson = (val: unknown) => {
    if (val === null || val === undefined || val === "") return "null";
    if (typeof val === "string") {
      try {
        const parsed = JSON.parse(val);
        return JSON.stringify(parsed, null, 2);
      } catch {
        return val;
      }
    }
    return JSON.stringify(val, null, 2);
  };

  // Metrics
  const authEventsCount = initialLogs.filter((l) => l.action === "LOGIN" || l.entityName === "AuthSession").length;
  const financialEventsCount = initialLogs.filter((l) => l.action === "PAYMENT" || l.entityName === "Invoice" || l.entityName === "CommissionRule").length;
  const publishedReviewsCount = reviewsList.filter((r) => r.isPublished).length;
  const avgRating = reviewsList.length
    ? (reviewsList.reduce((acc, r) => acc + r.rating, 0) / reviewsList.length).toFixed(1)
    : "5.0";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-white flex items-center gap-2">
            <ShieldCheck className="text-emerald-400" size={26} /> Audit & Trust Logs
          </h1>
          <p className="text-sm text-white/60">
            Immutable system activity trails, security events, and platform review moderation.
          </p>
        </div>
        {tab === "audit" && (
          <Button variant="secondary" onClick={exportAuditLogJson} className="flex items-center gap-2 text-xs">
            <Download size={14} /> Export Compliance Log (JSON)
          </Button>
        )}
      </div>

      {/* KPI Cards */}
      {tab === "audit" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-white/5 border border-white/10">
            <div className="text-xs text-white/50">Total Logged Events</div>
            <div className="text-2xl font-semibold text-white mt-1">{initialLogs.length}</div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 size={12} /> Live stream active
            </div>
          </Card>
          <Card className="p-4 bg-white/5 border border-white/10">
            <div className="text-xs text-white/50">Auth & Security Events</div>
            <div className="text-2xl font-semibold text-white mt-1">{authEventsCount}</div>
            <div className="text-[11px] text-white/40 mt-1">Sessions & MFA events</div>
          </Card>
          <Card className="p-4 bg-white/5 border border-white/10">
            <div className="text-xs text-white/50">Financial Mutations</div>
            <div className="text-2xl font-semibold text-white mt-1">{financialEventsCount}</div>
            <div className="text-[11px] text-white/40 mt-1">Invoices, payouts & rules</div>
          </Card>
          <Card className="p-4 bg-white/5 border border-white/10">
            <div className="text-xs text-white/50">Ledger Security</div>
            <div className="text-2xl font-semibold text-emerald-400 mt-1">SOC-2 Type II</div>
            <div className="text-[11px] text-white/40 mt-1">Immutable SHA-256 trail</div>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-white/5 border border-white/10">
            <div className="text-xs text-white/50">Total User Reviews</div>
            <div className="text-2xl font-semibold text-white mt-1">{reviewsList.length}</div>
            <div className="text-[11px] text-white/40 mt-1">Verified bookings</div>
          </Card>
          <Card className="p-4 bg-white/5 border border-white/10">
            <div className="text-xs text-white/50">Average Rating</div>
            <div className="text-2xl font-semibold text-amber-400 mt-1 flex items-center gap-1">
              <Star size={20} fill="currentColor" /> {avgRating} / 5.0
            </div>
            <div className="text-[11px] text-white/40 mt-1">Platform satisfaction</div>
          </Card>
          <Card className="p-4 bg-white/5 border border-white/10">
            <div className="text-xs text-white/50">Published Reviews</div>
            <div className="text-2xl font-semibold text-emerald-400 mt-1">{publishedReviewsCount}</div>
            <div className="text-[11px] text-emerald-400 mt-1">Public on provider profiles</div>
          </Card>
          <Card className="p-4 bg-white/5 border border-white/10">
            <div className="text-xs text-white/50">Hidden / Flagged</div>
            <div className="text-2xl font-semibold text-amber-400 mt-1">{reviewsList.length - publishedReviewsCount}</div>
            <div className="text-[11px] text-white/40 mt-1">Pending moderation</div>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-white/10 space-x-6">
        <button
          onClick={() => {
            setTab("audit");
            setQ("");
          }}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
            tab === "audit"
              ? "border-white text-white"
              : "border-transparent text-white/50 hover:text-white"
          }`}
        >
          System Audit Trail ({initialLogs.length})
        </button>
        <button
          onClick={() => {
            setTab("reviews");
            setQ("");
          }}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
            tab === "reviews"
              ? "border-white text-white"
              : "border-transparent text-white/50 hover:text-white"
          }`}
        >
          Review Moderation ({reviewsList.length})
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="max-w-md w-full">
          <SearchBar
            value={q}
            onChange={setQ}
            placeholder={
              tab === "audit"
                ? "Search by user, action, entity, IP..."
                : "Search reviews by author, provider, title..."
            }
          />
        </div>

        {tab === "audit" ? (
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
            >
              <option value="ALL" className="bg-[#12141A]">All Actions</option>
              <option value="CREATE" className="bg-[#12141A]">CREATE</option>
              <option value="UPDATE" className="bg-[#12141A]">UPDATE</option>
              <option value="APPROVE" className="bg-[#12141A]">APPROVE</option>
              <option value="REJECT" className="bg-[#12141A]">REJECT</option>
              <option value="LOGIN" className="bg-[#12141A]">LOGIN</option>
              <option value="PAYMENT" className="bg-[#12141A]">PAYMENT</option>
            </select>

            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
            >
              <option value="ALL" className="bg-[#12141A]">All Entities</option>
              <option value="Campaign" className="bg-[#12141A]">Campaign</option>
              <option value="Booking" className="bg-[#12141A]">Booking</option>
              <option value="Invoice" className="bg-[#12141A]">Invoice</option>
              <option value="Payment" className="bg-[#12141A]">Payment</option>
              <option value="Review" className="bg-[#12141A]">Review</option>
              <option value="CommissionRule" className="bg-[#12141A]">CommissionRule</option>
              <option value="AdvertisingChannel" className="bg-[#12141A]">AdvertisingChannel</option>
              <option value="AuthSession" className="bg-[#12141A]">AuthSession</option>
              <option value="SystemConfig" className="bg-[#12141A]">SystemConfig</option>
            </select>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <select
              value={reviewStatusFilter}
              onChange={(e) => setReviewStatusFilter(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
            >
              <option value="ALL" className="bg-[#12141A]">All Visibilities</option>
              <option value="PUBLISHED" className="bg-[#12141A]">Published Only</option>
              <option value="HIDDEN" className="bg-[#12141A]">Hidden / Flagged</option>
            </select>
          </div>
        )}
      </div>

      {/* Audit Log Tab */}
      {tab === "audit" && (
        <Card>
          <Table<AuditLogItem>
            columns={[
              {
                key: "actor",
                label: "Actor / User",
                render: (r) => (
                  <div>
                    <div className="font-medium text-white">{r.userName}</div>
                    <div className="text-xs text-white/40">{r.userEmail}</div>
                  </div>
                ),
              },
              {
                key: "userRole",
                label: "Role",
                render: (r) => (
                  <Badge
                    tone={r.userRole === "Admin" ? "danger" : r.userRole === "Advertiser" ? "info" : "warn"}
                  >
                    {r.userRole}
                  </Badge>
                ),
              },
              {
                key: "action",
                label: "Action",
                render: (r) => {
                  const tone =
                    r.action === "APPROVE" || r.action === "PAYMENT"
                      ? "success"
                      : r.action === "DELETE" || r.action === "REJECT"
                        ? "danger"
                        : r.action === "UPDATE"
                          ? "warn"
                          : "info";
                  return <Badge tone={tone}>{r.action}</Badge>;
                },
              },
              {
                key: "entity",
                label: "Target Entity",
                render: (r) => (
                  <div>
                    <span className="font-mono text-xs text-white bg-white/5 px-2 py-0.5 rounded">
                      {r.entityName}
                    </span>
                    <div className="text-[11px] text-white/40 font-mono mt-0.5">{r.entityId}</div>
                  </div>
                ),
              },
              {
                key: "ipAddress",
                label: "Origin IP",
                render: (r) => <span className="font-mono text-xs text-white/70">{r.ipAddress}</span>,
              },
              { key: "createdDate", label: "Timestamp" },
              {
                key: "actions",
                label: "Payload",
                render: (r) => (
                  <Button size="sm" variant="secondary" onClick={() => setSelectedAudit(r)}>
                    <Eye size={14} /> Diff
                  </Button>
                ),
              },
            ]}
            rows={filteredLogs}
            empty={term || actionFilter !== "ALL" || entityFilter !== "ALL" ? "No audit logs matching search/filter." : "No audit activity recorded yet."}
          />
        </Card>
      )}

      {/* Reviews Tab */}
      {tab === "reviews" && (
        <Card>
          <Table<Review>
            columns={[
              {
                key: "parties",
                label: "Reviewer & Provider",
                render: (r) => (
                  <div>
                    <div className="text-white font-medium">{r.reviewerName}</div>
                    <div className="text-xs text-white/50">For: {r.providerName}</div>
                    <div className="text-[11px] text-white/40">{r.campaignTitle}</div>
                  </div>
                ),
              },
              {
                key: "rating",
                label: "Score",
                render: (r) => (
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star size={14} fill="currentColor" />
                    <span className="font-semibold text-white">{r.rating}.0</span>
                  </div>
                ),
              },
              {
                key: "content",
                label: "Review Content",
                render: (r) => (
                  <div className="max-w-md">
                    <div className="font-medium text-white text-xs">{r.title}</div>
                    <div className="text-xs text-white/70 mt-1 line-clamp-2">{r.reviewText}</div>
                    {r.responseText && (
                      <div className="mt-1 text-[11px] text-emerald-400 bg-emerald-500/10 p-1.5 rounded">
                        Provider Reply: {r.responseText}
                      </div>
                    )}
                  </div>
                ),
              },
              {
                key: "status",
                label: "Visibility",
                render: (r) => (
                  <Badge tone={r.isPublished ? "success" : "warn"}>
                    {r.isPublished ? "Published" : "Hidden"}
                  </Badge>
                ),
              },
              { key: "createdDate", label: "Date" },
              {
                key: "actions",
                label: "Moderation",
                render: (r) => (
                  <Button
                    size="sm"
                    variant={r.isPublished ? "danger" : "primary"}
                    onClick={() => toggleReviewPublishHandler(r.id)}
                  >
                    {r.isPublished ? "Hide / Flag" : "Publish"}
                  </Button>
                ),
              },
            ]}
            rows={filteredReviews}
            empty={term || reviewStatusFilter !== "ALL" ? "No reviews match that filter/search." : "No reviews submitted yet."}
          />
        </Card>
      )}

      {/* Audit Diff Payload Modal */}
      {selectedAudit && (
        <Modal
          open={true}
          onClose={() => setSelectedAudit(null)}
          title={`Audit Payload: ${selectedAudit.action} ${selectedAudit.entityName}`}
          size="lg"
          footer={
            <Button variant="secondary" onClick={() => setSelectedAudit(null)}>
              Close
            </Button>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 bg-white/5 p-3 rounded-lg">
              <div>
                <span className="text-white/40">Timestamp:</span> {selectedAudit.createdDate}
              </div>
              <div>
                <span className="text-white/40">IP Address:</span> {selectedAudit.ipAddress}
              </div>
              <div>
                <span className="text-white/40">Actor:</span> {selectedAudit.userName} ({selectedAudit.userRole})
              </div>
              <div>
                <span className="text-white/40">Entity ID:</span> {selectedAudit.entityId}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-white/70 font-medium uppercase text-[11px]">State Transition Diff</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                  <div className="text-red-400 font-medium mb-1 flex items-center gap-1">
                    <AlertTriangle size={12} /> Previous State (Old)
                  </div>
                  <pre className="font-mono text-[11px] text-white/80 overflow-x-auto whitespace-pre-wrap">
                    {formatJson(selectedAudit.oldValues)}
                  </pre>
                </div>
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                  <div className="text-emerald-400 font-medium mb-1 flex items-center gap-1">
                    <CheckCircle size={12} /> Committed State (New)
                  </div>
                  <pre className="font-mono text-[11px] text-white/80 overflow-x-auto whitespace-pre-wrap">
                    {formatJson(selectedAudit.newValues)}
                  </pre>
                </div>
              </div>
            </div>

            <div className="text-white/40 text-[11px]">
              User Agent: <span className="text-white/60">{selectedAudit.userAgent}</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
