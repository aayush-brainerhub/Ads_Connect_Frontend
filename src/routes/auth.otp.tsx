import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui-kit";
import { AuthShell, FormError } from "./auth.login";
import { isRole, type Role } from "@/lib/auth";

interface OtpSearch {
  phone?: string;
  role?: Role;
}

export const Route = createFileRoute("/auth/otp")({
  component: OtpPage,
  validateSearch: (s: Record<string, unknown>): OtpSearch => ({
    phone: typeof s.phone === "string" ? s.phone : undefined,
    role: isRole(s.role) ? s.role : "Advertiser",
  }),
  head: () => ({ meta: [{ title: "Verify — AdsConnect" }] }),
});

/**
 * Phone sign-in has no backend behind it: AdsConnect has no SMS provider wired
 * up and the API issues tokens for email + password only. The screen is kept so
 * the flow stays visible, but it no longer signs anyone in — it used to accept
 * any six digits and hand out a session, which looked like working auth.
 */
function OtpPage() {
  const { phone } = Route.useSearch();
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  const update = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return;
    const next = [...digits];
    next[i] = v;
    setDigits(next);
    if (v && i < 5) refs.current[i + 1]?.focus();
  };

  return (
    <AuthShell
      title="Enter verification code"
      subtitle={phone ? `Sent to ${phone}` : "Check your email or phone"}
    >
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <div className="flex justify-between gap-2">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              value={d}
              onChange={(e) => update(i, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Backspace" && !d && i > 0) refs.current[i - 1]?.focus();
              }}
              maxLength={1}
              inputMode="numeric"
              className="h-14 w-12 rounded-lg border border-white/15 bg-white/[0.04] text-center text-xl text-white outline-none focus:border-white/40"
            />
          ))}
        </div>
        <FormError>
          Phone verification isn't available yet — no code was sent. Sign in with your email address
          and password instead.
        </FormError>
        <Button type="button" className="w-full" disabled>
          Verify &amp; continue
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-white/60">
        <Link to="/auth/login" className="text-white hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  );
}
