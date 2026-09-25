/**
 * Thin client for the AdsConnect .NET API.
 *
 * Only ever called from inside `createServerFn` handlers, so the request goes
 * server-to-server and the API is never exposed to the browser. That is also why
 * the access token can live in an httpOnly cookie: this module reads it out of
 * the incoming request and forwards it as a bearer header, and the token itself
 * never reaches client JavaScript.
 */
import { redirect } from "@tanstack/react-router";
import { getCookie, setCookie } from "@tanstack/react-start/server";

/** The `ResponseData<T>` envelope every AdsConnect controller returns. */
export interface ResponseData<T> {
  data: T | null;
  errMessage: string | null;
  success: boolean;
}

/** Name of the httpOnly cookie holding the API's JWT (Fallback). */
export const TOKEN_COOKIE = "adconnect_token";

// Read lazily rather than at module scope: this module is part of the route
// graph, and a top-level process.env access would throw if it were ever
// evaluated in the browser.
function baseUrl(): string {
  return process.env.API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:5036";
}

/** The raw JWT from the session cookie, or null when signed out. */
export function readAuthToken(): string | null {
  // The session is stored as a compound cookie: "Role|jwt.header.payload.sig"
  // This is because TanStack's _serverFn endpoint only emits one Set-Cookie
  // header per response, so we can't set role and token separately.
  const raw = getCookie(TOKEN_COOKIE);
  if (!raw) return null;

  const pipeIdx = raw.indexOf("|");
  if (pipeIdx === -1) {
    // Legacy plain token (no role prefix)
    return raw;
  }
  // Return the JWT part (everything after the first pipe)
  return raw.substring(pipeIdx + 1);
}

/** The role stored in the session cookie, or null. */
export function readActiveRole(): string | null {
  const raw = getCookie(TOKEN_COOKIE);
  if (!raw) return null;
  const pipeIdx = raw.indexOf("|");
  if (pipeIdx === -1) return null;
  return raw.substring(0, pipeIdx);
}

/**
 * Turns an API-relative path into one the *browser* can fetch.
 *
 * Only uploaded avatars use this. They are served by the API's static-file
 * handler and loaded by an `<img>` tag, which is the single exception to "the
 * API is never reached from the browser" — every data call still goes through a
 * server function.
 */
export function publicApiUrl(path: string): string {
  return /^https?:\/\//i.test(path) ? path : `${baseUrl()}${path}`;
}

async function request(
  path: string,
  init?: RequestInit,
  options?: { skipAuth?: boolean },
): Promise<Response> {
  const token = options?.skipAuth ? null : readAuthToken();
  try {
    return await fetch(`${baseUrl()}${path}`, {
      ...init,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init?.headers,
      },
    });
  } catch (cause) {
    throw new Error(
      `Cannot reach the AdsConnect API at ${baseUrl()}. Is it running? ` +
        `Start it with: bun run api`,
      { cause },
    );
  }
}

/**
 * A 401 means the bearer token was rejected, not that the user did something
 * wrong — most often the API restarted and re-generated its development signing
 * key, which invalidates every token it previously issued. The cookie still
 * looks unexpired to the route guards, so it is dropped here and the request is
 * turned into a trip back to the sign-in page rather than an error screen.
 */
function rejectUnauthorized(): never {
  setCookie(TOKEN_COOKIE, "", {
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    expires: new Date(0),
  });
  throw redirect({ to: "/auth/login", search: { expired: true } });
}

async function envelope<T>(path: string, init?: RequestInit): Promise<ResponseData<T>> {
  const response = await request(path, init);

  if (response.status === 401 || response.status === 403) {
    rejectUnauthorized();
  }

  // Controllers answer 200 even for failures, so a non-2xx here means the
  // request never reached an action (bad route, unhandled middleware error).
  if (!response.ok) {
    throw new Error(
      `${init?.method ?? "GET"} ${path} failed: ${response.status} ${response.statusText}`,
    );
  }

  return (await response.json()) as ResponseData<T>;
}

export async function apiGet<T>(path: string): Promise<T> {
  const body = await envelope<T>(path);
  if (!body.success || body.data == null) {
    throw new Error(body.errMessage || `GET ${path} returned success=false`);
  }
  return body.data;
}

/**
 * Like {@link apiGet}, but resolves to null instead of throwing when the API
 * reports failure.
 *
 * The ResponseData envelope cannot distinguish "not found" from "something went
 * wrong" — both are 200 with `success: false` — so a genuine server-side error
 * on a detail endpoint surfaces to the user as a not-found page.
 */
export async function apiGetOrNull<T>(path: string): Promise<T | null> {
  const body = await envelope<T>(path);
  return body.success && body.data != null ? body.data : null;
}

/**
 * POST returning the whole envelope rather than unwrapping it.
 *
 * The auth flows need `errMessage` verbatim — "Incorrect email address or
 * password", "An account already exists for that email address" — to show
 * against the form, so unwrapping into a thrown Error would lose exactly the
 * part the UI wants.
 *
 * `skipAuth` is for Login and Register: sending a stale bearer token to them is
 * pointless, and would make a rejected leftover cookie bounce the sign-in page
 * back to itself.
 */
export async function apiPost<T>(
  path: string,
  body: unknown,
  options?: { skipAuth?: boolean },
): Promise<ResponseData<T>> {
  const init: RequestInit = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };

  if (!options?.skipAuth) {
    return envelope<T>(path, init);
  }

  const response = await request(path, init, { skipAuth: true });
  if (!response.ok) {
    throw new Error(`POST ${path} failed: ${response.status} ${response.statusText}`);
  }
  return (await response.json()) as ResponseData<T>;
}

/**
 * POST multipart form data — an upload.
 *
 * The body is passed through as-is and `Content-Type` is deliberately left
 * unset: fetch derives it from the FormData, and setting it by hand would drop
 * the multipart boundary and make the API see an empty form.
 */
export async function apiPostFile<T>(path: string, body: FormData): Promise<ResponseData<T>> {
  return envelope<T>(path, { method: "POST", body });
}

export async function apiPut<T>(
  path: string,
  body: unknown,
): Promise<ResponseData<T>> {
  const init: RequestInit = {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
  return envelope<T>(path, init);
}

export async function apiDelete<T>(
  path: string,
  body?: unknown,
): Promise<ResponseData<T>> {
  const init: RequestInit = {
    method: "DELETE",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  };
  return envelope<T>(path, init);
}
