import { createFileRoute, useRouter } from "@tanstack/react-router";
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
  Select,
} from "@/components/ui-kit";
import {
  getFinancialOverview,
  getInvoices,
  getPayments,
  getCommissionRules,
  createCommissionRule,
  type Invoice,
  type Payment,
  type CommissionRule,
} from "@/data/finance";
import {
  DollarSign,
  TrendingUp,
  Receipt,
  CreditCard,
  Plus,
  ArrowUpRight,
  AlertCircle,
} from "lucide-react";

export const Route = createFileRoute("/app/admin/finance")({
  component: AdminFinancePage,
  loader: async () => {
    const [overview, invoices, payments, rules] = await Promise.all([
      getFinancialOverview(),
      getInvoices(),
      getPayments(),
      getCommissionRules(),
    ]);
    return { overview, invoices, payments, rules };
  },
});

export function AdminFinancePage() {
  const { overview, invoices, payments, rules } = Route.useLoaderData();
  const router = useRouter();

  const [tab, setTab] = useState<"invoices" | "payments" | "rules">("invoices");
  const [q, setQ] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [newRuleScope, setNewRuleScope] = useState<CommissionRule["scope"]>("Channel");
  const [newRuleChannel, setNewRuleChannel] = useState("Digital & Social Media");
  const [newRuleProviderType, setNewRuleProviderType] = useState("Influencer & Creator");
  const [newRuleRate, setNewRuleRate] = useState("10.0");
  const [newRuleFixed, setNewRuleFixed] = useState("0");
  const [isSubmittingRule, setIsSubmittingRule] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const term = q.trim().toLowerCase();

  // Filter invoices
  const filteredInvoices = invoices.filter((inv) =>
    term
      ? inv.invoiceNumber.toLowerCase().includes(term) ||
        inv.advertiserName.toLowerCase().includes(term) ||
        inv.providerName.toLowerCase().includes(term) ||
        inv.bookingNumber.toLowerCase().includes(term)
      : true,
  );

  // Filter payments
  const filteredPayments = payments.filter((p) =>
    term
      ? p.paymentNumber.toLowerCase().includes(term) ||
        p.transactionReference.toLowerCase().includes(term) ||
        p.invoiceNumber.toLowerCase().includes(term)
      : true,
  );

  // Filter rules
  const filteredRules = rules.filter((r) =>
    term
      ? r.scope.toLowerCase().includes(term) ||
        (r.channelName && r.channelName.toLowerCase().includes(term)) ||
        (r.providerTypeName && r.providerTypeName.toLowerCase().includes(term))
      : true,
  );

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingRule(true);
    setErrorMessage(null);

    const payload = {
      scope: newRuleScope,
      channelName: newRuleScope === "Channel" ? newRuleChannel.trim() : undefined,
      providerTypeName: newRuleScope === "ProviderType" ? newRuleProviderType.trim() : undefined,
      percentageRate: parseFloat(newRuleRate) || 0,
      fixedAmount: parseFloat(newRuleFixed) || 0,
      currency: "INR",
      priority: 30,
    };

    try {
      const res = await createCommissionRule({ data: payload });
      if (res && !res.success) {
        setErrorMessage(res.errMessage || "Failed to create commission rule.");
        setIsSubmittingRule(false);
        return;
      }

      setShowAddRuleModal(false);
      setNewRuleRate("10.0");
      setNewRuleFixed("0");
      await router.invalidate();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create commission rule.";
      setErrorMessage(msg);
    } finally {
      setIsSubmittingRule(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-white">Finance & Billing</h1>
          <p className="text-sm text-white/60">
            Monitor platform Gross Merchandise Value, revenue cuts, invoice statuses, and commission rules.
          </p>
        </div>
        {tab === "rules" && (
          <Button onClick={() => setShowAddRuleModal(true)} size="sm">
            <Plus size={16} /> Add Commission Rule
          </Button>
        )}
      </div>

      {errorMessage && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400 flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-white/50">Total Gross GMV</span>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-semibold text-white">
              ₹{overview.grossGMV.toLocaleString()}
            </div>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
              <ArrowUpRight size={14} /> Live Contract Volume
            </p>
          </div>
        </Card>

        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-white/50">Platform Revenue</span>
            <div className="rounded-lg bg-sky-500/10 p-2 text-sky-400">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-semibold text-white">
              ₹{overview.platformRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-white/60 mt-1">Average 10-15% platform cut</p>
          </div>
        </Card>

        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-white/50">Net Provider Payouts</span>
            <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
              <CreditCard size={18} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-semibold text-white">
              ₹{overview.netProviderPayouts.toLocaleString()}
            </div>
            <p className="text-xs text-white/60 mt-1">Settled on deliverable approval</p>
          </div>
        </Card>

        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-white/50">Pending Invoices</span>
            <div className="rounded-lg bg-amber-500/10 p-2 text-amber-400">
              <Receipt size={18} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-semibold text-amber-300">
              ₹{overview.pendingInvoicesAmount.toLocaleString()}
            </div>
            <p className="text-xs text-white/60 mt-1">Due across active booking milestones</p>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 space-x-6">
        <button
          onClick={() => {
            setTab("invoices");
            setQ("");
            setErrorMessage(null);
          }}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
            tab === "invoices"
              ? "border-white text-white"
              : "border-transparent text-white/50 hover:text-white"
          }`}
        >
          Invoices & Line Items ({invoices.length})
        </button>
        <button
          onClick={() => {
            setTab("payments");
            setQ("");
            setErrorMessage(null);
          }}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
            tab === "payments"
              ? "border-white text-white"
              : "border-transparent text-white/50 hover:text-white"
          }`}
        >
          Payment Transactions ({payments.length})
        </button>
        <button
          onClick={() => {
            setTab("rules");
            setQ("");
            setErrorMessage(null);
          }}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
            tab === "rules"
              ? "border-white text-white"
              : "border-transparent text-white/50 hover:text-white"
          }`}
        >
          Commission Rules ({rules.length})
        </button>
      </div>

      {/* Search Bar */}
      <div className="max-w-md">
        <SearchBar
          value={q}
          onChange={setQ}
          placeholder={
            tab === "invoices"
              ? "Search invoices, bookings, advertisers..."
              : tab === "payments"
                ? "Search transaction ID, payments..."
                : "Search commission rules by scope or channel..."
          }
        />
      </div>

      {/* Invoices Tab */}
      {tab === "invoices" && (
        <Card>
          <Table<Invoice>
            columns={[
              {
                key: "invoiceNumber",
                label: "Invoice #",
                render: (r) => <span className="font-mono font-medium text-white">{r.invoiceNumber}</span>,
              },
              {
                key: "bookingNumber",
                label: "Booking Ref",
                render: (r) => <span className="text-white/70 font-mono text-xs">{r.bookingNumber}</span>,
              },
              {
                key: "direction",
                label: "Flow Direction",
                render: (r) => (
                  <Badge tone={r.direction === "AdvertiserToPlatform" || r.direction === "PlatformToAdvertiser" ? "info" : "default"}>
                    {r.direction === "PlatformToProvider" ? "Platform → Provider" : "Advertiser → Platform"}
                  </Badge>
                ),
              },
              {
                key: "parties",
                label: "Advertiser / Provider",
                render: (r) => (
                  <div className="text-xs">
                    <div className="text-white font-medium">{r.advertiserName}</div>
                    <div className="text-white/50">{r.providerName}</div>
                  </div>
                ),
              },
              {
                key: "totalAmount",
                label: "Total Amount",
                render: (r) => (
                  <span className="font-medium text-white">
                    ₹{r.totalAmount.toLocaleString()}
                  </span>
                ),
              },
              {
                key: "status",
                label: "Status",
                render: (r) => {
                  const tone =
                    r.status === "Paid"
                      ? "success"
                      : r.status === "Issued"
                        ? "warn"
                        : r.status === "Overdue"
                          ? "danger"
                          : "default";
                  return <Badge tone={tone}>{r.status}</Badge>;
                },
              },
              { key: "dueDate", label: "Due Date" },
              {
                key: "actions",
                label: "Action",
                render: (r) => (
                  <Button size="sm" variant="secondary" onClick={() => setSelectedInvoice(r)}>
                    View Breakdown
                  </Button>
                ),
              },
            ]}
            rows={filteredInvoices}
            empty={term ? "No invoices match that filter." : "No invoices registered yet."}
          />
        </Card>
      )}

      {/* Payments Tab */}
      {tab === "payments" && (
        <Card>
          <Table<Payment>
            columns={[
              {
                key: "paymentNumber",
                label: "Payment Ref",
                render: (r) => <span className="font-mono text-white font-medium">{r.paymentNumber}</span>,
              },
              {
                key: "invoiceNumber",
                label: "Invoice #",
                render: (r) => <span className="font-mono text-xs text-white/70">{r.invoiceNumber}</span>,
              },
              {
                key: "amount",
                label: "Amount",
                render: (r) => (
                  <span className="font-medium text-white">
                    ₹{r.amount.toLocaleString()}
                  </span>
                ),
              },
              {
                key: "paymentMethod",
                label: "Method",
                render: (r) => <Badge tone="info">{r.paymentMethod}</Badge>,
              },
              {
                key: "transactionReference",
                label: "Gateway Reference",
                render: (r) => (
                  <span className="font-mono text-xs text-white/60 truncate max-w-[180px] inline-block">
                    {r.transactionReference}
                  </span>
                ),
              },
              {
                key: "status",
                label: "Status",
                render: (r) => (
                  <Badge tone={r.status === "Completed" ? "success" : "warn"}>{r.status}</Badge>
                ),
              },
              { key: "paymentDate", label: "Date & Time" },
            ]}
            rows={filteredPayments}
            empty={term ? "No payments match that search." : "No payment transactions yet."}
          />
        </Card>
      )}

      {/* Commission Rules Tab */}
      {tab === "rules" && (
        <Card>
          <Table<CommissionRule>
            columns={[
              {
                key: "scope",
                label: "Scope",
                render: (r) => <Badge tone="info">{r.scope}</Badge>,
              },
              {
                key: "target",
                label: "Channel / Entity Target",
                render: (r) => (
                  <span className="text-white font-medium">
                    {r.channelName || r.providerTypeName || "Global Default"}
                  </span>
                ),
              },
              {
                key: "percentageRate",
                label: "Commission Rate",
                render: (r) => (
                  <span className="font-medium text-emerald-400">{r.percentageRate}%</span>
                ),
              },
              {
                key: "fixedAmount",
                label: "Fixed Fee",
                render: (r) => (
                  <span className="text-white/80">₹{r.fixedAmount}</span>
                ),
              },
              {
                key: "caps",
                label: "Min / Max Cap",
                render: (r) => (
                  <span className="text-xs text-white/60">
                    Min: ₹{r.minFee ?? "0"} • Max: {r.maxFee ? `₹${r.maxFee}` : "None"}
                  </span>
                ),
              },
              {
                key: "priority",
                label: "Priority",
                render: (r) => <span className="font-mono text-xs text-white/70">P{r.priority}</span>,
              },
              {
                key: "isActive",
                label: "Status",
                render: (r) => (
                  <Badge tone={r.isActive ? "success" : "danger"}>
                    {r.isActive ? "Active" : "Disabled"}
                  </Badge>
                ),
              },
              { key: "effectiveFrom", label: "Effective Since" },
            ]}
            rows={filteredRules}
            empty={term ? "No commission rules match search." : "No commission rules configured."}
          />
        </Card>
      )}

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <Modal
          open={true}
          onClose={() => setSelectedInvoice(null)}
          title={`Invoice ${selectedInvoice.invoiceNumber}`}
          size="lg"
          footer={
            <Button variant="secondary" onClick={() => setSelectedInvoice(null)}>
              Close
            </Button>
          }
        >
          <div className="space-y-5 text-sm">
            <div className="grid grid-cols-2 gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <div>
                <div className="text-xs text-white/40 uppercase">Advertiser</div>
                <div className="text-white font-medium">{selectedInvoice.advertiserName}</div>
              </div>
              <div>
                <div className="text-xs text-white/40 uppercase">Provider</div>
                <div className="text-white font-medium">{selectedInvoice.providerName}</div>
              </div>
              <div>
                <div className="text-xs text-white/40 uppercase">Booking Number</div>
                <div className="text-white font-mono">{selectedInvoice.bookingNumber}</div>
              </div>
              <div>
                <div className="text-xs text-white/40 uppercase">Due Date</div>
                <div className="text-white">{selectedInvoice.dueDate}</div>
              </div>
            </div>

            <div>
              <h4 className="text-xs uppercase tracking-wider text-white/60 mb-2">Itemized Invoice Lines</h4>
              <div className="rounded-xl border border-white/10 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/5 text-white/60">
                    <tr>
                      <th className="p-3">Description</th>
                      <th className="p-3 text-right">Qty</th>
                      <th className="p-3 text-right">Unit Price</th>
                      <th className="p-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {selectedInvoice.lines.map((line) => (
                      <tr key={line.id}>
                        <td className="p-3 text-white">{line.description}</td>
                        <td className="p-3 text-right text-white/80">{line.quantity}</td>
                        <td className="p-3 text-right text-white/80">₹{line.unitPrice.toLocaleString()}</td>
                        <td className="p-3 text-right text-white font-medium">₹{line.lineTotal.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-1.5 border-t border-white/10 pt-3 text-right text-xs">
              <div className="text-white/60">Subtotal: ₹{selectedInvoice.subtotal.toLocaleString()}</div>
              <div className="text-white/60">Tax Amount (GST): ₹{selectedInvoice.taxAmount.toLocaleString()}</div>
              <div className="text-base font-semibold text-white pt-1">
                Total Amount: ₹{selectedInvoice.totalAmount.toLocaleString()}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Commission Rule Modal */}
      {showAddRuleModal && (
        <Modal
          open={true}
          onClose={() => !isSubmittingRule && setShowAddRuleModal(false)}
          title="Create Commission Rule"
          footer={
            <>
              <Button variant="ghost" disabled={isSubmittingRule} onClick={() => setShowAddRuleModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" disabled={isSubmittingRule} onClick={handleAddRule}>
                {isSubmittingRule ? "Saving..." : "Save Rule"}
              </Button>
            </>
          }
        >
          <form onSubmit={handleAddRule} className="space-y-4">
            <Field label="Rule Scope">
              <Select
                value={newRuleScope}
                onChange={(e) => setNewRuleScope(e.target.value as CommissionRule["scope"])}
              >
                <option value="Global">Global Platform Default</option>
                <option value="Channel">Advertising Channel Specific</option>
                <option value="ProviderType">Provider Type Specific</option>
              </Select>
            </Field>

            {newRuleScope === "Channel" && (
              <Field label="Channel Name">
                <Input
                  value={newRuleChannel}
                  onChange={(e) => setNewRuleChannel(e.target.value)}
                  placeholder="e.g. Digital & Social Media, Billboards & DOOH"
                />
              </Field>
            )}

            {newRuleScope === "ProviderType" && (
              <Field label="Provider Type">
                <Input
                  value={newRuleProviderType}
                  onChange={(e) => setNewRuleProviderType(e.target.value)}
                  placeholder="e.g. Influencer & Creator, Agency Network"
                />
              </Field>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Field label="Percentage Cut (%)">
                <Input
                  type="number"
                  step="0.1"
                  value={newRuleRate}
                  onChange={(e) => setNewRuleRate(e.target.value)}
                />
              </Field>
              <Field label="Fixed Transaction Fee (₹)">
                <Input
                  type="number"
                  value={newRuleFixed}
                  onChange={(e) => setNewRuleFixed(e.target.value)}
                />
              </Field>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
