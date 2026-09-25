import { createServerFn } from "@tanstack/react-start";

import { apiGet } from "./api-client";

export interface AdminMetrics {
  totalProviders: number;
  totalAdvertisers: number;
  totalCampaigns: number;
  /**
   * Budget committed across live campaigns — not revenue. Payment and Invoice
   * are empty, so there is nothing settled to report yet.
   */
  committedBudget: number;
  totalUsers: number;
  activeCampaigns: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  /** Comma-joined; a user may hold more than one role. */
  role: string;
  joined: string;
  status: string;
}

export const getAdminMetrics = createServerFn({ method: "GET" }).handler(() =>
  apiGet<AdminMetrics>("/api/Admin/GetMetrics"),
);

export const getAdminUsers = createServerFn({ method: "GET" }).handler(() =>
  apiGet<AdminUser[]>("/api/Admin/GetUsers"),
);

export const approveProvider = createServerFn({ method: "POST" })
  .inputValidator((userId: string) => userId)
  .handler(async ({ data: userId }) => {
    // We created an ApproveProvider endpoint which uses PUT method
    // but the `api-client.ts` uses PUT for update operations
    const { apiPut } = await import("./api-client");
    return apiPut<boolean>(`/api/Admin/ApproveProvider/${userId}`, {});
  });
