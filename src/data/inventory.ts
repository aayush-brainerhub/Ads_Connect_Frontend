import { createServerFn } from "@tanstack/react-start";

import { apiGet, apiPost, apiDelete } from "./api-client";

export interface InventoryItem {
  id: string;
  name: string;
  description: string | null;
  channelId: string;
  channel: string;
  price: number;
  pricingUnitId: string | null;
  pricingUnit: string | null;
  /** Draft, Active, Paused or Archived. */
  status: string;
}

export const getMyInventory = createServerFn({ method: "GET" }).handler(() =>
  apiGet<InventoryItem[]>("/api/Inventory/GetMyInventory"),
);

export interface SaveInventoryInput {
  /** Omit to create, supply to update. */
  id?: string | null;
  name: string;
  description?: string | null;
  channelId: string;
  price: number;
  pricingUnitId: string;
  status: string;
}

export interface InventoryResult {
  ok: boolean;
  error?: string;
}

export const saveInventory = createServerFn({ method: "POST" })
  .inputValidator((input: unknown): SaveInventoryInput => {
    const value = input as Partial<SaveInventoryInput> | undefined;
    if (!value?.name?.trim()) throw new Error("A name is required.");
    if (!value.channelId) throw new Error("Choose an advertising channel.");
    if (!value.pricingUnitId) throw new Error("Choose how the price is quoted.");
    return {
      id: value.id ?? null,
      name: value.name.trim(),
      description: value.description ?? null,
      channelId: value.channelId,
      price: Number(value.price) || 0,
      pricingUnitId: value.pricingUnitId,
      status: value.status ?? "Active",
    };
  })
  .handler(async ({ data }): Promise<InventoryResult> => {
    const body = await apiPost<InventoryItem>("/api/Inventory/SaveInventory", data);
    return body.success ? { ok: true } : { ok: false, error: body.errMessage ?? "Could not save." };
  });

export const deleteInventory = createServerFn({ method: "POST" })
  .inputValidator((input: unknown): string => {
    if (typeof input !== "string" || !input) throw new Error("An inventory id is required.");
    return input;
  })
  .handler(async ({ data: id }): Promise<InventoryResult> => {
    // The id goes in the query string: the controller action takes a bare Guid,
    // which ASP.NET binds from the URL rather than the body.
    const body = await apiDelete<string>(
      `/api/Inventory/DeleteInventory?id=${encodeURIComponent(id)}`,
    );
    return body.success
      ? { ok: true }
      : { ok: false, error: body.errMessage ?? "Could not remove." };
  });
