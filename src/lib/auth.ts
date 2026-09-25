/**
 * Session shapes and role rules shared by client and server.
 *
 * Nothing here touches cookies or the API — the server-only half lives in
 * `src/data/auth.ts`, so this module is safe to import from any component.
 */

export type Role = "Advertiser" | "Provider" | "Admin";

/**
 * Most privileged first. `primaryRole` and the "I am a" pickers both read this,
 * so the order is the single place the precedence is defined.
 */
export const ROLES: Role[] = ["Admin", "Provider", "Advertiser"];

export interface SessionUser {
  userId: string;
  /** First + last name, as the API assembled it into the token's `name` claim. */
  name: string;
  email: string;
  /** Every role the account holds. Guards test against this, not a single role. */
  roles: Role[];
}

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as string[]).includes(value);
}

export function hasRole(user: SessionUser | null, role: Role): boolean {
  return user?.roles.includes(role) ?? false;
}

/** The role the account is shown as when it holds more than one. */
export function primaryRole(user: SessionUser): Role {
  return ROLES.find((role) => user.roles.includes(role)) ?? "Advertiser";
}

export function dashboardPathFor(role: Role) {
  if (role === "Advertiser") return "/app/advertiser";
  if (role === "Provider") return "/app/provider";
  return "/app/admin";
}

/** "Aarav Mehta" -> "AM" for the avatar badge. */
export function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "U";
}
