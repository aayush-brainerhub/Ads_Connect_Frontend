import { createFileRoute, redirect, useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Sparkles, Loader2, LogOut } from "lucide-react";
import { Button, Card, Input, Field, Select } from "@/components/ui-kit";
import { budgetBuckets } from "@/lib/mock-data";
import { bucketFor, budgetRangeFor } from "@/lib/budget";
import { getReferenceData } from "@/data/reference-data";
import { getMyProfile, saveAdvertiserProfile } from "@/data/profile";
import { requireRole } from "@/lib/auth-guard";
import { signOut as signOutFn } from "@/data/auth";

export const Route = createFileRoute("/onboarding/advertiser")({
  // The loader reads the lookup lists, which the API now requires a token for.
  beforeLoad: ({ context, location }) => ({
    session: requireRole(context.session, "Advertiser", location.href),
  }),
  component: AdvertiserOnboarding,
  loader: async () => {
    const [reference, profile] = await Promise.all([getReferenceData(), getMyProfile()]);
    if (profile.advertiser) {
      throw redirect({ to: "/app/advertiser" });
    }
    return { reference, profile };
  },
  head: () => ({ meta: [{ title: "Advertiser onboarding — AdsConnect" }] }),
});

function AdvertiserOnboarding() {
  const { reference, profile } = Route.useLoaderData();
  const { industries, locations } = reference;
  const navigate = useNavigate();
  const router = useRouter();

  // Prefilled when you come back to this page after saving once.
  const existing = profile.advertiser;
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [f, setF] = useState({
    business: existing?.businessName ?? "",
    industryId: existing?.industryId ?? industries[0]?.id ?? "",
    locationId: existing?.locationId ?? locations[0]?.id ?? "",
    website: existing?.website ?? "",
    budget: existing
      ? bucketFor(existing.monthlyBudgetMin, existing.monthlyBudgetMax)
      : budgetBuckets[1],
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const [min, max] = budgetRangeFor(f.budget);
      const result = await saveAdvertiserProfile({
        data: {
          businessName: f.business,
          industryId: f.industryId || null,
          locationId: f.locationId || null,
          website: f.website || null,
          monthlyBudgetMin: min,
          monthlyBudgetMax: max,
        },
      });
      if (!result.ok) {
        setError(result.error ?? "Could not save your profile.");
        return;
      }
      await router.invalidate();
      setDone(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save your profile.");
    } finally {
      setPending(false);
    }
  };

  if (done) {
    return (
      <Wrap>
        <Card className="text-center py-10">
          <div className="mx-auto h-14 w-14 rounded-full bg-emerald-500/15 text-emerald-300 flex items-center justify-center">
            <Check size={24} />
          </div>
          <h2 className="mt-5 text-xl font-medium tracking-tight">Welcome to AdsConnect</h2>
          <p className="mt-1 text-sm text-white/60">
            You can create a campaign and start sending requests to providers.
          </p>
          <div className="mt-6">
            <Button onClick={() => navigate({ to: "/app/advertiser" })}>
              <Sparkles size={14} /> Go to dashboard
            </Button>
          </div>
        </Card>
      </Wrap>
    );
  }

  return (
    <Wrap>
      <Card>
        <h2 className="text-lg font-medium tracking-tight">Tell us about your business</h2>
        <form className="mt-5 grid sm:grid-cols-2 gap-4" onSubmit={submit}>
          <Field label="Business name">
            <Input
              required
              value={f.business}
              onChange={(e) => setF({ ...f, business: e.target.value })}
            />
          </Field>
          <Field label="Industry">
            <Select
              value={f.industryId}
              onChange={(e) => setF({ ...f, industryId: e.target.value })}
            >
              {industries.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="City">
            <Select
              value={f.locationId}
              onChange={(e) => setF({ ...f, locationId: e.target.value })}
            >
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.city}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Monthly budget">
            <Select value={f.budget} onChange={(e) => setF({ ...f, budget: e.target.value })}>
              {budgetBuckets.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </Select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Website">
              <Input
                value={f.website}
                onChange={(e) => setF({ ...f, website: e.target.value })}
                placeholder="https://"
              />
            </Field>
          </div>
          {error && (
            <p
              role="alert"
              className="sm:col-span-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
            >
              {error}
            </p>
          )}
          <div className="sm:col-span-2 flex justify-end">
            <Button disabled={pending || !f.business.trim()}>
              {pending ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Saving…
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </div>
        </form>
      </Card>
    </Wrap>
  );
}

function Wrap({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const router = useRouter();

  const signOut = async () => {
    await signOutFn();
    await router.invalidate();
    navigate({ to: "/auth/login" });
  };

  return (
    <div className="min-h-screen bg-black text-white px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-medium tracking-tight">Set up as an Advertiser</h1>
            <p className="mt-1 text-sm text-white/60">Tell us where you want to grow.</p>
          </div>
          <button onClick={signOut} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5">
            <LogOut size={16} /> Sign out
          </button>
        </div>
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
