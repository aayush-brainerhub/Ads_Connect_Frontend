import { createServerFn } from "@tanstack/react-start";

import { apiGet } from "./api-client";

export interface IndustryOption {
  id: string;
  name: string;
}

export interface LocationOption {
  id: string;
  city: string;
  state: string | null;
}

export interface ProviderTypeOption {
  id: string;
  name: string;
}

export interface ChannelOption {
  id: string;
  name: string;
  category: string;
  description: string | null;
}

export interface PricingUnitOption {
  id: string;
  /** Machine code, e.g. "per_reel". */
  code: string;
  /** Display name, e.g. "Per Reel". */
  name: string;
}

export interface ReferenceData {
  industries: IndustryOption[];
  locations: LocationOption[];
  providerTypes: ProviderTypeOption[];
  channels: ChannelOption[];
  /** How a price is quoted — flat fee, per reel, CPM and so on. */
  pricingUnits: PricingUnitOption[];
  /**
   * Campaign objectives are pinned by the CK_Campaign_Objective check
   * constraint rather than a lookup table; the API reads them from the
   * constraint so the UI can only offer values an insert will accept.
   */
  objectives: string[];
}

/** Every lookup list the UI needs, in one request. */
export const getReferenceData = createServerFn({ method: "GET" }).handler(() =>
  apiGet<ReferenceData>("/api/Reference/GetReferenceData"),
);
