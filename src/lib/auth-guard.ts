/**
 * Route guards for the signed-in areas.
 *
 * These run in `beforeLoad`, which the router evaluates top-down, so a guard on
 * a layout route protects every page beneath it — including the loaders, which
 * would otherwise fire their API calls before anyone checked who was asking.
 */
import { redirect } from "@tanstack/react-router";

import { dashboardPathFor, hasRole, primaryRole, type Role, type SessionUser } from "./auth";

/** Sends a signed-out visitor to the sign-in page, remembering where they were headed. */
export function requireSession(session: SessionUser | null, href: string): SessionUser {
  if (!session) {
    throw redirect({ to: "/auth/login", search: { redirect: href } });
  }
  return session;
}

/**
 * As {@link requireSession}, plus the role the area is for. A signed-in user who
 * lacks the role goes to their own dashboard rather than the sign-in page —
 * they are authenticated, just in the wrong place.
 */
export function requireRole(session: SessionUser | null, role: Role, href: string): SessionUser {
  const user = requireSession(session, href);

  if (!hasRole(user, role)) {
    throw redirect({ to: dashboardPathFor(primaryRole(user)) });
  }

  return user;
}
