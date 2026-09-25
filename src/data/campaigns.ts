import { createServerFn } from "@tanstack/react-start";

import { apiGet, apiPost, apiPut, apiDelete } from "./api-client";

export interface Campaign {
  id: string;
  title: string;
  industry: string | null;
  location: string | null;
  budget: number;
  objective: string;
  description: string | null;
  /** Draft, PendingApproval, Active, Paused, Completed or Cancelled. */
  status: string;
  /** Kept current by a database trigger as providers accept. */
  responses: number;
  createdAt: string;
  /** Only populated on the admin list. */
  advertiser: string | null;
}

export const getMyCampaigns = createServerFn({ method: "GET" }).handler(() =>
  apiGet<Campaign[]>("/api/Campaign/GetMyCampaigns"),
);

export const getAllCampaigns = createServerFn({ method: "GET" }).handler(() =>
  apiGet<Campaign[]>("/api/Campaign/GetAllCampaigns"),
);

export interface CreateCampaignInput {
  title: string;
  industryId: string | null;
  locationId: string | null;
  budget: number;
  objective: string;
  description?: string | null;
}

export interface CreateCampaignResult {
  ok: boolean;
  campaign?: Campaign;
  error?: string;
}

export const createCampaign = createServerFn({ method: "POST" })
  .inputValidator((input: unknown): CreateCampaignInput => {
    const value = input as Partial<CreateCampaignInput> | undefined;
    if (!value?.title?.trim()) throw new Error("A campaign title is required.");
    if (!value.objective) throw new Error("A campaign objective is required.");
    return {
      title: value.title.trim(),
      industryId: value.industryId ?? null,
      locationId: value.locationId ?? null,
      budget: Number(value.budget) || 0,
      objective: value.objective,
      description: value.description ?? null,
    };
  })
  .handler(async ({ data }): Promise<CreateCampaignResult> => {
    const body = await apiPost<Campaign>("/api/Campaign/CreateCampaign", data);
    return body.success && body.data
      ? { ok: true, campaign: body.data }
      : { ok: false, error: body.errMessage ?? "The campaign could not be created." };
  });

export interface UpdateCampaignInput extends CreateCampaignInput {
  id: string;
}

export const updateCampaign = createServerFn({ method: "POST" })
  .inputValidator((input: unknown): UpdateCampaignInput => {
    const value = input as Partial<UpdateCampaignInput> | undefined;
    if (!value?.id) throw new Error("A campaign ID is required.");
    if (!value?.title?.trim()) throw new Error("A campaign title is required.");
    if (!value.objective) throw new Error("A campaign objective is required.");
    return {
      id: value.id,
      title: value.title.trim(),
      industryId: value.industryId ?? null,
      locationId: value.locationId ?? null,
      budget: Number(value.budget) || 0,
      objective: value.objective,
      description: value.description ?? null,
    };
  })
  .handler(async ({ data }): Promise<CreateCampaignResult> => {
    const body = await apiPut<Campaign>("/api/Campaign/UpdateCampaign", data);
    return body.success && body.data
      ? { ok: true, campaign: body.data }
      : { ok: false, error: body.errMessage ?? "The campaign could not be updated." };
  });

export interface DeleteCampaignResult {
  ok: boolean;
  error?: string;
}

export const deleteCampaign = createServerFn({ method: "POST" })
  .inputValidator((input: unknown): string => {
    if (typeof input !== "string" || !input) throw new Error("A campaign ID is required.");
    return input;
  })
  .handler(async ({ data: id }): Promise<DeleteCampaignResult> => {
    const body = await apiDelete<string>(`/api/Campaign/DeleteCampaign?id=${encodeURIComponent(id)}`);
    return body.success
      ? { ok: true }
      : { ok: false, error: body.errMessage ?? "The campaign could not be deleted." };
  });
