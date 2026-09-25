import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, Table, Badge, SearchBar, Button, Modal, Field, Input, Select } from "@/components/ui-kit";
import { getInvoices, getPayments, type Invoice, type Payment } from "@/data/finance";
import { Receipt, CreditCard, CheckCircle2, ShieldCheck, DollarSign, ArrowDownRight } from "lucide-react";

export const Route = createFileRoute("/app/advertiser/billing")({
  component: AdvertiserBillingPage,
  loader: async () => {
    const [invoices, payments] = await Promise.all([getInvoices(), getPayments()]);
    return { invoices, payments };
  },
});

export function AdvertiserBillingPage() {
  const { invoices: initialInvoices, payments: initialPayments } = Route.useLoaderData();

  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"invoices" | "payments">("invoices");

  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<Payment["paymentMethod"]>("Stripe");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const term = q.trim().toLowerCase();

  const filteredInvoices = invoices.filter((i) =>
    term
      ? i.invoiceNumber.toLowerCase().includes(term) ||
        i.providerName.toLowerCase().includes(term) ||
        i.bookingNumber.toLowerCase().includes(term)
      : true,
  );

  const filteredPayments = payments.filter((p) =>
    term
      ? p.paymentNumber.toLowerCase().includes(term) ||
        p.transactionReference.toLowerCase().includes(term) ||
        p.invoiceNumber.toLowerCase().includes(term)
      : true,
  );

  const totalInvoiced = invoices.reduce((acc, i) => acc + i.totalAmount, 0);
  const totalPaid = invoices
    .filter((i) => i.status === "Paid")
    .reduce((acc, i) => acc + i.totalAmount, 0);
  const outstanding = invoices
    .filter((i) => i.status === "Issued" || i.status === "Overdue")
    .reduce((acc, i) => acc + i.totalAmount, 0);

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingInvoice) return;

    setIsProcessing(true);
    setTimeout(() => {
      // Mark invoice paid
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === payingInvoice.id
            ? {
                ...inv,
                status: "Paid",
                amountPaid: inv.totalAmount,
                paidDate: new Date().toISOString().split("T")[0],
              }
            : inv,
        ),
      );

      // Create payment log
      const newPay: Payment = {
        id: `pay-${Date.now()}`,
        paymentNumber: `PAY-2026-${Math.floor(Math.random() * 900 + 100)}`,
        invoiceId: payingInvoice.id,
        invoiceNumber: payingInvoice.invoiceNumber,
        bookingId: payingInvoice.bookingId,
        bookingNumber: payingInvoice.bookingNumber,
        amount: payingInvoice.totalAmount,
        currency: payingInvoice.currency,
        paymentMethod,
        transactionReference: `tx_${Math.random().toString(36).substring(2, 12)}`,
        status: "Completed",
        paymentDate: new Date().toLocaleString(),
        notes: "Settled online via Advertiser Portal",
      };

      setPayments([newPay, ...payments]);
      setIsProcessing(false);
      setPayingInvoice(null);
    }, 800);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-white">Billing & Payments</h1>
          <p className="text-sm text-white/60">
            Manage campaign escrow invoices, download payment receipts, and settle outstanding balances.
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-white/50">Total Invoiced</span>
            <div className="rounded-lg bg-white/5 p-2 text-white/70">
              <Receipt size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-semibold text-white">${totalInvoiced.toLocaleString()} USD</div>
            <p className="text-xs text-white/50 mt-1">Across all confirmed campaign bookings</p>
          </div>
        </Card>

        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-white/50">Total Paid to Date</span>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-semibold text-emerald-400">${totalPaid.toLocaleString()} USD</div>
            <p className="text-xs text-white/50 mt-1">Escrow funds secured and settled</p>
          </div>
        </Card>

        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-white/50">Outstanding Balance</span>
            <div className="rounded-lg bg-amber-500/10 p-2 text-amber-400">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-semibold text-amber-300">${outstanding.toLocaleString()} USD</div>
            <p className="text-xs text-white/50 mt-1">Due before campaign launch</p>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 space-x-6">
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
          Campaign Invoices ({invoices.length})
        </button>
        <button
          onClick={() => {
            setTab("payments");
            setQ("");
          }}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
            tab === "payments"
              ? "border-white text-white"
              : "border-transparent text-white/50 hover:text-white"
          }`}
        >
          Payment History ({payments.length})
        </button>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <SearchBar
          value={q}
          onChange={setQ}
          placeholder={tab === "invoices" ? "Search invoice # or provider..." : "Search transaction ID..."}
        />
      </div>

      {/* Invoices List */}
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
                key: "bookingNumber",
                label: "Booking Ref",
                render: (r) => <span className="text-xs font-mono text-white/60">{r.bookingNumber}</span>,
              },
              {
                key: "providerName",
                label: "Provider / Creator",
                render: (r) => <span className="text-white font-medium">{r.providerName}</span>,
              },
              {
                key: "totalAmount",
                label: "Amount Due",
                render: (r) => (
                  <span className="font-semibold text-white">
                    ${r.totalAmount.toLocaleString()} {r.currency}
                  </span>
                ),
              },
              {
                key: "status",
                label: "Status",
                render: (r) => (
                  <Badge tone={r.status === "Paid" ? "success" : r.status === "Issued" ? "warn" : "danger"}>
                    {r.status}
                  </Badge>
                ),
              },
              { key: "dueDate", label: "Due Date" },
              {
                key: "actions",
                label: "Actions",
                render: (r) => (
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="secondary" onClick={() => setSelectedInvoice(r)}>
                      Lines
                    </Button>
                    {r.status !== "Paid" && (
                      <Button size="sm" variant="primary" onClick={() => setPayingInvoice(r)}>
                        Pay Now
                      </Button>
                    )}
                  </div>
                ),
              },
            ]}
            rows={filteredInvoices}
            empty={term ? "No invoices match that filter." : "No invoices found."}
          />
        </Card>
      )}

      {/* Payments List */}
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
                  <span className="font-semibold text-emerald-400">
                    ${r.amount.toLocaleString()} {r.currency}
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
                label: "Transaction Hash",
                render: (r) => (
                  <span className="font-mono text-xs text-white/60 truncate max-w-[160px] inline-block">
                    {r.transactionReference}
                  </span>
                ),
              },
              {
                key: "status",
                label: "Status",
                render: (r) => <Badge tone="success">{r.status}</Badge>,
              },
              { key: "paymentDate", label: "Date & Time" },
            ]}
            rows={filteredPayments}
            empty={term ? "No payment records match search." : "No payment history yet."}
          />
        </Card>
      )}

      {/* Pay Now Modal */}
      {payingInvoice && (
        <Modal
          open={true}
          onClose={() => setPayingInvoice(null)}
          title={`Pay Invoice ${payingInvoice.invoiceNumber}`}
          footer={
            <>
              <Button variant="ghost" onClick={() => setPayingInvoice(null)} disabled={isProcessing}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleProcessPayment} disabled={isProcessing}>
                {isProcessing ? "Processing Escrow..." : `Pay $${payingInvoice.totalAmount.toLocaleString()} USD`}
              </Button>
            </>
          }
        >
          <form onSubmit={handleProcessPayment} className="space-y-4 text-sm">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-white/50">Campaign Escrow Amount</div>
                <div className="text-xl font-bold text-white mt-0.5">
                  ${payingInvoice.totalAmount.toLocaleString()} {payingInvoice.currency}
                </div>
              </div>
              <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
                <ShieldCheck size={20} />
              </div>
            </div>

            <Field label="Payment Method">
              <Select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as Payment["paymentMethod"])}
              >
                <option value="Stripe">Credit / Debit Card (Stripe)</option>
                <option value="BankTransfer">Direct ACH / Wire Transfer</option>
                <option value="UPI">UPI Instant Payment</option>
                <option value="Wallet">Corporate Advertising Wallet</option>
              </Select>
            </Field>

            <Field label="Cardholder / Business Account Name">
              <Input defaultValue="Aayush Chauhan (Brandify Inc.)" required />
            </Field>

            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-300">
              Funds are held securely in platform escrow and will only be released to the creator once deliverable proof is reviewed and approved by you.
            </div>
          </form>
        </Modal>
      )}

      {/* View Breakdown Modal */}
      {selectedInvoice && (
        <Modal
          open={true}
          onClose={() => setSelectedInvoice(null)}
          title={`Breakdown: ${selectedInvoice.invoiceNumber}`}
          size="md"
          footer={
            <Button variant="secondary" onClick={() => setSelectedInvoice(null)}>
              Close
            </Button>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="rounded-xl border border-white/10 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-white/5 text-white/60">
                  <tr>
                    <th className="p-2.5">Item</th>
                    <th className="p-2.5 text-right">Qty</th>
                    <th className="p-2.5 text-right">Unit Price</th>
                    <th className="p-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {selectedInvoice.lines.map((l) => (
                    <tr key={l.id}>
                      <td className="p-2.5 text-white">{l.description}</td>
                      <td className="p-2.5 text-right text-white/80">{l.quantity}</td>
                      <td className="p-2.5 text-right text-white/80">${l.unitPrice.toLocaleString()}</td>
                      <td className="p-2.5 text-right font-medium text-white">${l.lineTotal.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-white/10 pt-3 text-right space-y-1">
              <div className="text-white/60">Subtotal: ${selectedInvoice.subtotal.toLocaleString()}</div>
              <div className="text-white/60">Tax Amount: ${selectedInvoice.taxAmount.toLocaleString()}</div>
              <div className="text-sm font-semibold text-white">
                Total: ${selectedInvoice.totalAmount.toLocaleString()} {selectedInvoice.currency}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
