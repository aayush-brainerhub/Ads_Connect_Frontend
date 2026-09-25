import { createServerFn } from "@tanstack/react-start";

import { apiGet, apiPost } from "./api-client";

export interface CampaignRequest {
  id: string;
  campaignTitle: string;
  advertiser: string;
  budget: number;
  /** Pending, Viewed, Accepted, Declined, ProposalSubmitted, Withdrawn or Expired. */
  status: string;
  date: string;
  message: string | null;
  /** The thread opened alongside the request. */
  conversationId: string | null;
}

export const getProviderRequests = createServerFn({ method: "GET" }).handler(() =>
  apiGet<CampaignRequest[]>("/api/Request/GetProviderRequests"),
);

export const getMyRequests = createServerFn({ method: "GET" }).handler(() =>
  apiGet<CampaignRequest[]>("/api/Request/GetMyRequests"),
);

export interface CreateRequestInput {
  campaignId: string;
  providerId: string;
  budget: number;
  message?: string | null;
}

export interface CreateRequestResult {
  ok: boolean;
  /** Where to send the advertiser next — straight into the new thread. */
  conversationId?: string;
  error?: string;
}

export const createRequest = createServerFn({ method: "POST" })
  .inputValidator((input: unknown): CreateRequestInput => {
    const value = input as Partial<CreateRequestInput> | undefined;
    if (!value?.campaignId) throw new Error("Choose which campaign this request is for.");
    if (!value.providerId) throw new Error("A provider is required.");
    return {
      campaignId: value.campaignId,
      providerId: value.providerId,
      budget: Number(value.budget) || 0,
      message: value.message ?? null,
    };
  })
  .handler(async ({ data }): Promise<CreateRequestResult> => {
    const body = await apiPost<string>("/api/Request/CreateRequest", data);
    return body.success && body.data
      ? { ok: true, conversationId: body.data }
      : { ok: false, error: body.errMessage ?? "The request could not be sent." };
  });

export interface RespondResult {
  ok: boolean;
  error?: string;
}

export const respondToRequest = createServerFn({ method: "POST" })
  .inputValidator((input: unknown): { requestId: string; status: "Accepted" | "Declined" } => {
    const value = input as { requestId?: string; status?: string } | undefined;
    if (!value?.requestId) throw new Error("A request id is required.");
    if (value.status !== "Accepted" && value.status !== "Declined") {
      throw new Error("A request can only be accepted or declined.");
    }
    return { requestId: value.requestId, status: value.status };
  })
  .handler(async ({ data }): Promise<RespondResult> => {
    const body = await apiPost<string>("/api/Request/RespondToRequest", data);
    return body.success
      ? { ok: true }
      : { ok: false, error: body.errMessage ?? "Could not update the request." };
  });
