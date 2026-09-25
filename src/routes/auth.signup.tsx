import { createFileRoute, Link, redirect, useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button, Input, PasswordInput, Field } from "@/components/ui-kit";
import { AuthShell, FormError, GoogleIcon } from "./auth.login";
import { signUp } from "@/data/auth";
import { dashboardPathFor, primaryRole, type Role } from "@/lib/auth";

export const Route = createFileRoute("/auth/signup")({
  beforeLoad: ({ context }) => {
    if (context.session) {
      throw redirect({ to: dashboardPathFor(primaryRole(context.session)) });
    }
  },
  component: SignupPage,
  head: () => ({ meta: [{ title: "Sign up — AdsConnect" }] }),
});

function SignupPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const [role, setRole] = useState<Role>("Advertiser");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const result = await signUp({ data: { name, email, password, role } });
      if (!result.ok) {
        setError(result.error ?? "The account could not be created.");
        return;
      }
      
      if (result.pendingApproval) {
        setSuccess(result.message ?? "Your account has been created. Our team will review and approve it shortly.");
        return;
      }

      // Register signs the new account in, so the root route has to re-read the
      // session before the onboarding guard runs.
      await router.invalidate();
      navigate({ to: result.redirectTo ?? dashboardPathFor(role) });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The account could not be created.");
    } finally {
      setPending(false);
    }
  };

  if (success) {
    return (
      <AuthShell title="Application Received" subtitle="We're reviewing your request">
        <div className="rounded-lg border border-white/10 bg-white/5 p-6 text-center">
          <p className="text-white/80">{success}</p>
          <div className="mt-6">
            <Link to="/auth/login" className="inline-block w-full rounded-lg bg-white px-4 py-2 text-sm text-black hover:bg-white/90">
              Return to Sign In
            </Link>
          </div>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Create your account" subtitle="Join AdsConnect in under a minute">
      <form onSubmit={submit} className="space-y-4">
        <Field label="I want to">
          <div className="grid grid-cols-2 gap-2">
            {(["Advertiser", "Provider"] as Role[]).map((r) => (
              <button type="button" key={r} onClick={() => setRole(r)}
                className={"rounded-lg border px-2 py-2 text-xs " + (role === r ? "border-white bg-white text-black" : "border-white/10 text-white/70 hover:bg-white/5")}>
                {r === "Advertiser" ? "Advertise" : "Provide"}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Full name">
          <Input required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        </Field>
        <Field label="Email">
          <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </Field>
        <Field label="Password">
          {/* The API rejects anything shorter, so the form does too rather than
              round-tripping to find out. */}
          <PasswordInput required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters" autoComplete="off" />
        </Field>

        {error && <FormError>{error}</FormError>}

        <Button className="w-full" disabled={pending}>
          {pending ? (<><Loader2 size={16} className="animate-spin" /> Creating account…</>) : "Create account"}
        </Button>
        <button type="button" disabled title="Google sign-in is not wired up yet"
          className="w-full rounded-full border border-white/15 px-4 py-2.5 text-sm flex items-center justify-center gap-2 opacity-40 cursor-not-allowed">
          <GoogleIcon /> Continue with Google
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-white/60">
        Already have an account? <Link to="/auth/login" className="text-white hover:underline">Sign in</Link>
      </p>
    </AuthShell>
  );
}
