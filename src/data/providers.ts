import { createServerFn } from "@tanstack/react-start";

import { apiGet, apiGetOrNull } from "./api-client";

export interface ProviderCard {
  id: string;
  name: string;
  type: string;
  /** City name, or null for providers with no fixed location. */
  location: string | null;
  /** Category of the provider's primary advertising channel. */
  category: string | null;
  price: number;
  audience: number;
  rating: number;
  description: string | null;
}

export const getProviders = createServerFn({ method: "GET" }).handler(() =>
  apiGet<ProviderCard[]>("/api/Provider/GetProviders"),
);

export const getProviderById = createServerFn({ method: "GET" })
  .inputValidator((id: unknown): string => {
    if (typeof id !== "string" || !id) throw new Error("A provider id is required.");
    return id;
  })
  .handler(({ data: id }) => {
    // The controller binds a Guid, so a non-GUID id — an old mock "p1" link,
    // say — fails ASP.NET model binding and comes back as a 400 ProblemDetails
    // rather than the ResponseData envelope. Reject it here so the route shows
    // its not-found page instead of a 500.
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return Promise.resolve(null);
    }
    return apiGetOrNull<ProviderCard>(`/api/Provider/GetProviderById?id=${encodeURIComponent(id)}`);
  });

/** "Aarav Mehta" -> "AM"; used for the avatar badge the mock data hardcoded. */
export function initialsFor(name: string): string {
  const parts = name
    .replace(/[^\p{L}\p{N} ]/gu, " ")
    .trim()
    .split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}
