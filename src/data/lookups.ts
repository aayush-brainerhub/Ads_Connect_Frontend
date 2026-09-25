import { createServerFn } from "@tanstack/react-start";
import { apiGet, apiPost } from "./api-client";

export interface LookupItem {
  id: string;
  code?: string;
  name: string;
  category?: string;
  description?: string;
  isActive: boolean;
  itemCount: number;
}

export interface LookupsBundle {
  industries: LookupItem[];
  locations: LookupItem[];
  providerTypes: LookupItem[];
  channels: LookupItem[];
  pricingUnits: LookupItem[];
  roles: LookupItem[];
}

export interface CreateLookupInput {
  category: string;
  name: string;
  code?: string;
  subCategory?: string;
  description?: string;
  state?: string;
}

export interface ToggleLookupInput {
  category: string;
  id: string;
}

export const getLookupsBundle = createServerFn({ method: "GET" }).handler(
  async (): Promise<LookupsBundle> => {
    try {
      const res = await apiGet<LookupsBundle>("/api/Reference/GetLookupsBundle");
      if (res) return res;
    } catch {
      // Fallback empty bundle
    }
    return {
      industries: [],
      locations: [],
      providerTypes: [],
      channels: [],
      pricingUnits: [],
      roles: [],
    };
  },
);

export const createLookupItem = createServerFn({ method: "POST" })
  .inputValidator((input: CreateLookupInput) => input)
  .handler(async ({ data }) => {
    return await apiPost<string>("/api/Reference/CreateLookupItem", data);
  });

export const toggleLookupStatus = createServerFn({ method: "POST" })
  .inputValidator((input: ToggleLookupInput) => input)
  .handler(async ({ data }) => {
    return await apiPost<string>("/api/Reference/ToggleLookupStatus", data);
  });
