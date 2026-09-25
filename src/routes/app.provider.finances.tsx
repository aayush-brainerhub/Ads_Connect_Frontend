import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, Table, Badge, SearchBar, Button, Modal, Field, Input } from "@/components/ui-kit";
import { getInvoices, getPayments, type Invoice, type Payment } from "@/data/finance";
import { DollarSign, CreditCard, TrendingUp, Receipt, ArrowUpRight, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/app/provider/finances")({
  component: ProviderFinancesPage,
  loader: async () => {
    const [invoices, payments] = await Promise.all([getInvoices(), getPayments()]);
    return { invoices, payments };
  },
});

export function ProviderFinancesPage() {
  const { invoices: allInvoices, payments: allPayments } = Route.useLoaderData();

  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"payouts" | "invoices">("payouts");
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutBank, setPayoutBank] = useState("Chase Bank (**** 8832)");

  const term = q.trim().toLowerCase();

  // Provider's relevant invoices
  const providerInvoices = allInvoices.filter((i) =>
    term
      ? i.invoiceNumber.toLowerCase().includes(term) ||
        i.advertiserName.toLowerCase().includes(term) ||
        i.bookingNumber.toLowerCase().includes(term)
      : true,
  );

  const providerPayments = allPayments.filter((p) =>
    term
      ? p.paymentNumber.toLowerCase().includes(term) ||
        p.transactionReference.toLowerCase().includes(term)
      : true,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-white">Earnings & Payouts</h1>
          <p className="text-sm text-white/60">
            Track gross billings, platform commission deductions, verified milestone payouts, and bank transfers.
          </p>
        </div>
        <Button onClick={() => setShowPayoutModal(true)} size="sm">
          <CreditCard size={16} /> Payout Settings
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-white/50">Total Gross Billings</span>
            <div className="rounded-lg bg-white/5 p-2 text-white/70">
              <Receipt size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-semibold text-white">$16,500 USD</div>
            <p className="text-xs text-white/40 mt-1">Gross contract booking values</p>
          </div>
        </Card>

        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-white/50">Net Disbursed Payouts</span>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-semibold text-emerald-400">$10,560 USD</div>
            <p className="text-xs text-white/50 mt-1">Paid directly to your bank account</p>
          </div>
        </Card>

        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-white/50">Pending Escrow Release</span>
            <div className="rounded-lg bg-amber-500/10 p-2 text-amber-400">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-semibold text-amber-300">$4,500 USD</div>
            <p className="text-xs text-white/50 mt-1">Releases upon client deliverable approval</p>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 space-x-6">
        <button
          onClick={() => {
            setTab("payouts");
            setQ("");
          }}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
            tab === "payouts"
              ? "border-white text-white"
              : "border-transparent text-white/50 hover:text-white"
          }`}
        >
          Disbursed Payouts ({providerPayments.length})
        </button>
        <button
          onClick={() => {
            setTab("invoices");
            setQ("");
          }}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
            tab === "invoices"
              ? "border-white text-white"
              : "border-transparent text-white/50 hover:text-white"
          }`}
        >
          Billing Statements & Invoices ({providerInvoices.length})
        </button>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <SearchBar
          value={q}
          onChange={setQ}
          placeholder={tab === "payouts" ? "Search payouts by reference..." : "Search statements..."}
        />
      </div>

      {/* Payouts Table */}
      {tab === "payouts" && (
        <Card>
          <Table<Payment>
            columns={[
              {
                key: "paymentNumber",
                label: "Payout ID",
                render: (r) => <span className="font-mono text-white font-medium">{r.paymentNumber}</span>,
              },
              {
                key: "bookingNumber",
                label: "Booking Reference",
                render: (r) => <span className="text-xs font-mono text-white/70">{r.bookingNumber}</span>,
              },
              {
                key: "amount",
                label: "Disbursed Net Amount",
                render: (r) => (
                  <span className="font-semibold text-emerald-400">
                    ${r.amount.toLocaleString()} {r.currency}
                  </span>
                ),
              },
              {
                key: "paymentMethod",
                label: "Disbursement Channel",
                render: (r) => <Badge tone="info">{r.paymentMethod}</Badge>,
              },
              {
                key: "transactionReference",
                label: "Bank Transaction Ref",
                render: (r) => (
                  <span className="font-mono text-xs text-white/60 truncate max-w-[160px] inline-block">
                    {r.transactionReference}
                  </span>
                ),
              },
              {
                key: "status",
                label: "Transfer Status",
                render: (r) => <Badge tone="success">{r.status}</Badge>,
              },
              { key: "paymentDate", label: "Date & Time" },
            ]}
            rows={providerPayments}
            empty={term ? "No payouts matching search." : "No payouts recorded yet."}
          />
        </Card>
      )}

      {/* Invoices Table */}
      {tab === "invoices" && (
        <Card>
          <Table<Invoice>
            columns={[
              {
                key: "invoiceNumber",
                label: "Invoice #",
                render: (r) => <span className="font-mono text-white font-medium">{r.invoiceNumber}</span>,
              },
              {
                key: "advertiserName",
                label: "Advertiser Client",
                render: (r) => <span className="text-white font-medium">{r.advertiserName}</span>,
              },
              {
                key: "subtotal",
                label: "Gross Total",
                render: (r) => <span>${r.subtotal.toLocaleString()} USD</span>,
              },
              {
                key: "status",
                label: "Invoice Status",
                render: (r) => (
                  <Badge tone={r.status === "Paid" ? "success" : "warn"}>{r.status}</Badge>
                ),
              },
              { key: "dueDate", label: "Settlement Due Date" },
            ]}
            rows={providerInvoices}
            empty={term ? "No invoices found." : "No invoices registered."}
          />
        </Card>
      )}

      {/* Payout Settings Modal */}
      {showPayoutModal && (
        <Modal
          open={true}
          onClose={() => setShowPayoutModal(false)}
          title="Payout Bank Account Settings"
          footer={
            <>
              <Button variant="ghost" onClick={() => setShowPayoutModal(false)}>
                Close
              </Button>
              <Button variant="primary" onClick={() => setShowPayoutModal(false)}>
                Save Changes
              </Button>
            </>
          }
        >
          <div className="space-y-4 text-sm">
            <Field label="Primary Bank Account / Routing Number">
              <Input
                value={payoutBank}
                onChange={(e) => setPayoutBank(e.target.value)}
                placeholder="Account number / IBAN"
              />
            </Field>

            <Field label="Beneficiary Legal Name">
              <Input defaultValue="Virat Kohli Sports Media LLC" />
            </Field>

            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs text-white/70">
              Payouts are automatically wired within 24 hours of client deliverable approval. Standard bank clearing takes 1-2 business days.
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
