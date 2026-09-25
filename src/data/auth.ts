/**
 * The server half of authentication.
 *
 * The API's JWT is kept in an httpOnly cookie that only these handlers read, so
 * the token is never exposed to client JavaScript. What the UI gets back is a
 * plain {@link SessionUser} decoded from that token's claims.
 */
import { createServerFn } from "@tanstack/react-start";
import { deleteCookie, setCookie } from "@tanstack/react-start/server";

import { apiPost, readAuthToken, TOKEN_COOKIE } from "./api-client";
import { dashboardPathFor, isRole, type Role, type SessionUser } from "@/lib/auth";

/** Mirrors the API's AuthUserDto. */
interface AuthUser {
  userId: string;
  firstName: string;
  lastName: string | null;
  email: string;
  phoneNumber: string | null;
  profileImageUrl: string | null;
  roles: string[];
}

/** Mirrors the API's LoginResultDto. */
interface LoginResult {
  requiresTwoFactor: boolean;
  token: string;
  twoFactorToken: string | null;
}

export interface AuthOutcome {
  ok: boolean;
  /** Where to go on success — the role's dashboard, or onboarding after signup. */
  redirectTo?: string;
  /** The API's errMessage, shown against the form. */
  error?: string;
  /** True if the account was created but requires admin approval (e.g. Provider) */
  pendingApproval?: boolean;
  /** Success message to display */
  message?: string;
}

/**
 * Matches the token's 24h lifetime, so the cookie and the credential inside it
 * stop being useful at the same moment.
 */
const MAX_AGE_SECONDS = 24 * 60 * 60;

function storeToken(token: string, role?: Role) {
  // TanStack's _serverFn endpoint only reliably sets ONE Set-Cookie header per
  // response. We work around this by storing a compound value that encodes both
  // the role and the JWT token in a single cookie.
  const value = role ? `${role}|${token}` : token;
  setCookie(TOKEN_COOKIE, value, {
    sameSite: "lax" as const,
    path: "/",
    maxAge: MAX_AGE_SECONDS,
    secure: process.env.NODE_ENV === "production",
  });
}

function clearToken() {
  setCookie(TOKEN_COOKIE, "", {
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    expires: new Date(0),
  });
}

/**
 * Reads the claims out of a JWT without verifying the signature.
 *
 * Verification is the API's job: it rejects a forged or expired token on every
 * protected endpoint. Nothing is trusted here beyond what the UI shell renders,
 * and the cookie can only have been written by `storeToken` after a successful
 * sign-in in the first place.
 *
 * Avoids `Buffer` so it also runs on the Cloudflare Worker this app builds for.
 */
function decodeClaims(token: string): Record<string, unknown> | null {
  const payload = token.split(".")[1];
  if (!payload) return null;

  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const bytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * The signed-in user, or null.
 *
 * A token whose `exp` has passed is treated as signed out even though the cookie
 * is still there, so an expired session shows the sign-in page rather than a
 * dashboard that 401s on every panel.
 */
function decodeUser(token: string): SessionUser | null {
  const claims = decodeClaims(token);
  if (!claims) return null;

  const exp = typeof claims.exp === "number" ? claims.exp : 0;
  if (!exp || exp * 1000 <= Date.now()) return null;

  const userId = typeof claims.sub === "string" ? claims.sub : null;
  const email = typeof claims.email === "string" ? claims.email : "";
  if (!userId) return null;

  // A single role serialises as a string, several as an array.
  const rawRoles = claims.role;
  const roles = (Array.isArray(rawRoles) ? rawRoles : rawRoles == null ? [] : [rawRoles]).filter(
    isRole,
  );

  return {
    userId,
    name: typeof claims.name === "string" && claims.name ? claims.name : email,
    email,
    roles,
  };
}

function currentUser(): SessionUser | null {
  const token = readAuthToken();
  return token ? decodeUser(token) : null;
}

export const getSession = createServerFn({ method: "GET" }).handler(
  async (): Promise<SessionUser | null> => currentUser(),
);

interface Credentials {
  email: string;
  password: string;
  role: Role;
}

function validateCredentials(input: unknown): Credentials {
  const value = input as Partial<Credentials> | undefined;
  if (!value?.email || !value.password || !isRole(value.role)) {
    throw new Error("An email address, a password and a role are required.");
  }
  return { email: value.email, password: value.password, role: value.role };
}

/**
 * The "I am a" picker on the sign-in form is checked against the roles the
 * account actually holds, rather than being taken at its word — otherwise
 * choosing Admin would put an advertiser in the admin shell, where every panel
 * would then fail its own guard.
 */
function roleMismatch(token: string, role: Role): string | null {
  const user = decodeUser(token);
  if (!user) return "Invalid token.";
  return user.roles.includes(role) ? null : `This account is not registered as ${article(role)}.`;
}

function article(role: Role) {
  return role === "Advertiser" || role === "Admin" ? `an ${role}` : `a ${role}`;
}

export const signIn = createServerFn({ method: "POST" })
  .inputValidator(validateCredentials)
  .handler(async ({ data }): Promise<AuthOutcome> => {
    const body = await apiPost<LoginResult>(
      "/api/SignIn/Login",
      { emailAddress: data.email, password: data.password },
      { skipAuth: true },
    );

    if (!body.success || !body.data) {
      return { ok: false, error: body.errMessage || "Sign in failed." };
    }

    const mismatch = roleMismatch(body.data.token, data.role);
    if (mismatch) {
      return { ok: false, error: mismatch };
    }

    storeToken(body.data.token, data.role);
    return { ok: true, redirectTo: dashboardPathFor(data.role) };
  });

interface Registration extends Credentials {
  name: string;
}

export const signUp = createServerFn({ method: "POST" })
  .inputValidator((input: unknown): Registration => {
    const value = input as Partial<Registration> | undefined;
    if (!value?.name?.trim()) throw new Error("A name is required.");
    return { ...validateCredentials(value), name: value.name.trim() };
  })
  .handler(async ({ data }): Promise<AuthOutcome> => {
    // The API takes first and last name separately; the form asks for one field.
    const [firstName, ...rest] = data.name.split(/\s+/);

    const body = await apiPost<LoginResult>(
      "/api/SignIn/Register",
      {
        firstName,
        lastName: rest.length ? rest.join(" ") : null,
        emailAddress: data.email,
        password: data.password,
        role: data.role,
      },
      { skipAuth: true },
    );

    if (body.success && !body.data) {
      // This is the "Account created but pending approval" path
      return { ok: true, pendingApproval: true, message: body.errMessage || "Account created." };
    }

    if (!body.success || !body.data) {
      return { ok: false, error: body.errMessage || "The account could not be created." };
    }

    // Register signs the new account straight in, so the token is stored here too
    // and onboarding does not ask for the password a second time.
    storeToken(body.data.token, data.role);

    return {
      ok: true,
      redirectTo:
        data.role === "Provider"
          ? "/onboarding/provider"
          : data.role === "Advertiser"
            ? "/onboarding/advertiser"
            : dashboardPathFor(data.role),
    };
  });

export const signOut = createServerFn({ method: "POST" }).handler(async () => {
  // Nothing to tell the API: the token is stateless and simply stops being sent.
  clearToken();
  return { ok: true };
});

export const changePassword = createServerFn({ method: "POST" })
  .inputValidator((input: unknown): { currentPassword: string; newPassword: string } => {
    const value = input as { currentPassword?: string; newPassword?: string } | undefined;
    if (!value?.currentPassword || !value.newPassword) {
      throw new Error("Both the current and the new password are required.");
    }
    return { currentPassword: value.currentPassword, newPassword: value.newPassword };
  })
  .handler(async ({ data }): Promise<AuthOutcome> => {
    const body = await apiPost<string>("/api/SignIn/ChangePassword", data);
    return body.success
      ? { ok: true }
      : { ok: false, error: body.errMessage || "The password could not be changed." };
  });
