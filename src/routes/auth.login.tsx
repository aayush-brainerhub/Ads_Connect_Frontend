import { createFileRoute, Link, redirect, useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Phone, ArrowRight, Loader2 } from "lucide-react";
import { Button, Input, PasswordInput, Field, Card } from "@/components/ui-kit";
import { signIn } from "@/data/auth";
import { dashboardPathFor, primaryRole, type Role } from "@/lib/auth";

interface LoginSearch {
  /** Where to return to once signed in, set by the route guards. */
  redirect?: string;
  /** Set when a rejected token bounced the request back here. */
  expired?: boolean;
}

export const Route = createFileRoute("/auth/login")({
  validateSearch: (s: Record<string, unknown>): LoginSearch => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
    expired: s.expired === true || s.expired === "true" ? true : undefined,
  }),
  // Already signed in? Skip the form and go straight to the dashboard.
  beforeLoad: ({ context }) => {
    if (context.session) {
      throw redirect({ to: dashboardPathFor(primaryRole(context.session)) });
    }
  },
  component: LoginPage,
  head: () => ({ meta: [{ title: "Log in — AdsConnect" }] }),
});

function LoginPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const search = Route.useSearch();
  const [tab, setTab] = useState<"email" | "phone">("email");
  const [role, setRole] = useState<Role>("Advertiser");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(
    search.expired ? "Your session has expired. Please sign in again." : null,
  );
  const [pending, setPending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === "phone") {
      navigate({ to: "/auth/otp", search: { phone, role } });
      return;
    }

    setPending(true);
    setError(null);
    try {
      const result = await signIn({ data: { email, password, role } });
      if (!result.ok) {
        setError(result.error ?? "Sign in failed.");
        return;
      }
      // The session lives in root route context, which was resolved before the
      // cookie existed; invalidate so the guards on the target route see it.
      await router.invalidate();
      navigate({ to: search.redirect ?? result.redirectTo ?? dashboardPathFor(role) });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Sign in failed.");
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your AdsConnect account">
      <div className="flex gap-1 rounded-full bg-white/5 p-1 mb-6">
        {(["email", "phone"] as const).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)}
            className={"flex-1 rounded-full py-2 text-xs font-medium tracking-tight " + (tab === t ? "bg-white text-black" : "text-white/70")}>
            {t === "email" ? "Email" : "Phone OTP"}
          </button>
        ))}
      </div>
      <form onSubmit={submit} className="space-y-4">
        <Field label="I am a">
          <div className="grid grid-cols-3 gap-2">
            {(["Advertiser", "Provider", "Admin"] as Role[]).map((r) => (
              <button type="button" key={r} onClick={() => setRole(r)}
                className={"rounded-lg border px-2 py-2 text-xs " + (role === r ? "border-white bg-white text-black" : "border-white/10 text-white/70 hover:bg-white/5")}>
                {r}
              </button>
            ))}
          </div>
        </Field>

        {tab === "email" ? (
          <>
            <Field label="Email">
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@brand.com" autoComplete="email" />
            </Field>
            <Field label="Password">
              <PasswordInput required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
            </Field>
          </>
        ) : (
          <Field label="Phone number">
            <Input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98xxxxxxxx" />
          </Field>
        )}

        {error && <FormError>{error}</FormError>}

        <div className="flex justify-end">
          <Link to="/auth/forgot-password" className="text-xs text-white/60 hover:text-white">Forgot password?</Link>
        </div>
        <Button className="w-full" disabled={pending}>
          {pending ? (
            <><Loader2 size={16} className="animate-spin" /> Signing in…</>
          ) : tab === "email" ? (
            <><Mail size={16} /> Sign in</>
          ) : (
            <><Phone size={16} /> Send OTP</>
          )}
        </Button>
        <button type="button" disabled title="Google sign-in is not wired up yet"
          className="w-full rounded-full border border-white/15 px-4 py-2.5 text-sm text-white flex items-center justify-center gap-2 opacity-40 cursor-not-allowed">
          <GoogleIcon /> Continue with Google
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-white/60">
        New to AdsConnect? <Link to="/auth/signup" className="text-white hover:underline inline-flex items-center gap-1">Create account <ArrowRight size={12} /></Link>
      </p>
    </AuthShell>
  );
}

export function FormError({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
      {children}
    </p>
  );
}

export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="block text-center text-xl font-semibold tracking-tight mb-8">
          Ads<span className="text-white/60">Connect</span>
        </Link>
        <Card>
          <h1 className="text-2xl font-medium tracking-tight">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-white/60">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </Card>
      </div>
    </div>
  );
}

export function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C33.8 6.1 29.2 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C33.8 6.1 29.2 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.1 0 9.7-2 13.2-5.2l-6.1-5c-2 1.4-4.5 2.2-7.1 2.2-5.2 0-9.6-3.3-11.2-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.1 5c-.4.4 6.7-4.9 6.7-14.5 0-1.2-.1-2.3-.4-3.5z"/></svg>
  );
}
