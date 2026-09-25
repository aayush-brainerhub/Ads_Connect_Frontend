import { createServerFn } from "@tanstack/react-start";
import { apiGet, apiPost } from "./api-client";

export interface CommissionRule {
  id: string;
  scope: "Global" | "Channel" | "ProviderType" | "Provider" | "Advertiser";
  channelId?: string | null;
  channelName?: string | null;
  providerTypeId?: string | null;
  providerTypeName?: string | null;
  percentageRate: number; // e.g. 10.0 for 10%
  fixedAmount: number;
  minFee?: number | null;
  maxFee?: number | null;
  currency: string;
  priority: number;
  isActive: boolean;
  effectiveFrom: string;
  effectiveTo?: string | null;
}

export interface PlatformFee {
  id: string;
  bookingId: string;
  bookingNumber: string;
  ruleId?: string | null;
  ruleScope: string;
  feeType: string;
  rateApplied: number;
  feeAmount: number;
  currency: string;
  calculatedDate: string;
}

export interface InvoiceLine {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  itemType: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  bookingId: string;
  bookingNumber: string;
  direction: "AdvertiserToPlatform" | "PlatformToProvider";
  advertiserId: string;
  advertiserName: string;
  providerId: string;
  providerName: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  amountPaid: number;
  currency: string;
  status: "Draft" | "Issued" | "Paid" | "Overdue" | "Cancelled";
  issuedDate: string;
  dueDate: string;
  paidDate?: string | null;
  documentUrl?: string | null;
  lines: InvoiceLine[];
}

export interface Payment {
  id: string;
  paymentNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  bookingId: string;
  bookingNumber: string;
  amount: number;
  currency: string;
  paymentMethod: "CreditCard" | "BankTransfer" | "UPI" | "Wallet" | "Stripe";
  transactionReference: string;
  status: "Pending" | "Completed" | "Failed" | "Refunded";
  paymentDate: string;
  notes?: string | null;
}

export interface FinancialOverview {
  grossGMV: number;
  platformRevenue: number;
  netProviderPayouts: number;
  pendingInvoicesAmount: number;
  completedPaymentsAmount: number;
  activeCommissionRules: number;
}

export const getFinancialOverview = createServerFn({ method: "GET" }).handler(
  async (): Promise<FinancialOverview> => {
    try {
      const res = await apiGet<FinancialOverview>("/api/Finance/GetOverview");
      if (res) return res;
    } catch {
      // Return zeroed structure if endpoint unreachable
    }
    return {
      grossGMV: 0,
      platformRevenue: 0,
      netProviderPayouts: 0,
      pendingInvoicesAmount: 0,
      completedPaymentsAmount: 0,
      activeCommissionRules: 0,
    };
  },
);

export const getInvoices = createServerFn({ method: "GET" }).handler(
  async (): Promise<Invoice[]> => {
    try {
      const res = await apiGet<Invoice[]>("/api/Finance/GetInvoices");
      if (res) return res;
    } catch {
      // No invoices
    }
    return [];
  },
);

export const getPayments = createServerFn({ method: "GET" }).handler(
  async (): Promise<Payment[]> => {
    try {
      const res = await apiGet<Payment[]>("/api/Finance/GetPayments");
      if (res) return res;
    } catch {
      // No payments
    }
    return [];
  },
);

export const getCommissionRules = createServerFn({ method: "GET" }).handler(
  async (): Promise<CommissionRule[]> => {
    try {
      const res = await apiGet<CommissionRule[]>("/api/Finance/GetCommissionRules");
      if (res) return res;
    } catch {
      // No commission rules
    }
    return [];
  },
);

export const createCommissionRule = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => input)
  .handler(async ({ data }) => {
    return await apiPost<CommissionRule>("/api/Finance/CreateCommissionRule", data);
  });

export const payInvoice = createServerFn({ method: "POST" })
  .inputValidator((input: { invoiceId: string; paymentMethod: string; notes?: string }) => input)
  .handler(async ({ data }) => {
    return await apiPost<Payment>("/api/Finance/PayInvoice", data);
  });
