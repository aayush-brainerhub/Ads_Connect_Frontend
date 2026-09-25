import { createServerFn } from "@tanstack/react-start";
import { apiGet, apiPost } from "./api-client";

export interface ProposalItem {
  id: string;
  proposalId: string;
  inventoryId?: string | null;
  channelName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Proposal {
  id: string;
  requestId: string;
  campaignTitle: string;
  advertiserName: string;
  providerId: string;
  providerName: string;
  providerAvatar?: string;
  version: number;
  description: string;
  deliverablesSummary: string;
  termsConditions: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  startDate: string;
  endDate: string;
  validUntil: string;
  status: "Draft" | "Submitted" | "Accepted" | "Rejected" | "Expired";
  submittedDate: string;
  decidedDate?: string | null;
  rejectionReason?: string | null;
  items: ProposalItem[];
}

export interface BookingItem {
  id: string;
  bookingId: string;
  inventoryId?: string | null;
  channelName: string;
  itemTitle: string;
  scheduledDate: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  status: "Pending" | "Scheduled" | "Completed" | "Cancelled";
}

export interface CampaignDeliverable {
  id: string;
  bookingId: string;
  bookingNumber: string;
  campaignTitle: string;
  deliverableType: "Post" | "Reel" | "Story" | "Video" | "Banner" | "Broadcast";
  title: string;
  description: string;
  dueDate: string;
  status: "Pending" | "Submitted" | "UnderReview" | "Approved" | "RevisionRequested";
  submittedDate?: string | null;
  proofUrl?: string | null;
  proofMetrics?: string | null;
  reviewComments?: string | null;
  reviewedDate?: string | null;
  revisionCount: number;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  proposalId: string;
  campaignId: string;
  campaignTitle: string;
  advertiserId: string;
  advertiserName: string;
  providerId: string;
  providerName: string;
  totalAmount: number;
  platformFeeAmount: number;
  taxAmount: number;
  providerPayout: number;
  currency: string;
  startDate: string;
  endDate: string;
  status: "Confirmed" | "InProgress" | "Completed" | "Cancelled";
  bookedDate: string;
  confirmedDate?: string | null;
  completedDate?: string | null;
  items: BookingItem[];
  deliverables: CampaignDeliverable[];
}

export const getProposals = createServerFn({ method: "GET" }).handler(
  async (): Promise<Proposal[]> => {
    try {
      const res = await apiGet<Proposal[]>("/api/Booking/GetProposals");
      if (res) return res;
    } catch {
      // Empty
    }
    return [];
  },
);

export const getBookings = createServerFn({ method: "GET" }).handler(
  async (): Promise<Booking[]> => {
    try {
      const res = await apiGet<Booking[]>("/api/Booking/GetBookings");
      if (res) return res;
    } catch {
      // Empty
    }
    return [];
  },
);

export const getDeliverables = createServerFn({ method: "GET" }).handler(
  async (): Promise<CampaignDeliverable[]> => {
    try {
      const res = await apiGet<CampaignDeliverable[]>("/api/Booking/GetDeliverables");
      if (res) return res;
    } catch {
      // Empty
    }
    return [];
  },
);

export const createProposal = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => input)
  .handler(async ({ data }) => {
    return await apiPost<Proposal>("/api/Booking/CreateProposal", data);
  });

export const respondToProposal = createServerFn({ method: "POST" })
  .inputValidator((input: { proposalId: string; accept: boolean; rejectionReason?: string }) => input)
  .handler(async ({ data }) => {
    return await apiPost<Booking>("/api/Booking/RespondToProposal", data);
  });

export const submitDeliverableProof = createServerFn({ method: "POST" })
  .inputValidator((input: { deliverableId: string; proofUrl: string; proofMetrics?: string }) => input)
  .handler(async ({ data }) => {
    return await apiPost<string>("/api/Booking/SubmitDeliverableProof", data);
  });

export const reviewDeliverable = createServerFn({ method: "POST" })
  .inputValidator((input: { deliverableId: string; approved: boolean; comments?: string }) => input)
  .handler(async ({ data }) => {
    return await apiPost<string>("/api/Booking/ReviewDeliverable", data);
  });
