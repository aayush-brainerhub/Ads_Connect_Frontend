import { createFileRoute, redirect, useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Check, ArrowRight, ArrowLeft, Sparkles, Loader2, LogOut } from "lucide-react";
import { Button, Card, Input, Field, Select, Textarea } from "@/components/ui-kit";
import { getReferenceData } from "@/data/reference-data";
import { getMyProfile, saveProviderProfile } from "@/data/profile";
import { saveInventory } from "@/data/inventory";
import { requireRole } from "@/lib/auth-guard";
import { signOut as signOutFn } from "@/data/auth";

export const Route = createFileRoute("/onboarding/provider")({
  // The loader reads the lookup lists, which the API now requires a token for.
  beforeLoad: ({ context, location }) => ({
    session: requireRole(context.session, "Provider", location.href),
  }),
  component: ProviderOnboarding,
  loader: async () => {
    const [reference, profile] = await Promise.all([getReferenceData(), getMyProfile()]);
    if (profile.provider) {
      throw redirect({ to: "/app/provider" });
    }
    return { reference, profile };
  },
  head: () => ({ meta: [{ title: "Provider onboarding — AdsConnect" }] }),
});

function ProviderOnboarding() {
  const { reference, profile } = Route.useLoaderData();
  const { providerTypes, locations, channels, pricingUnits } = reference;
  const navigate = useNavigate();
  const router = useRouter();

  const existing = profile.provider;
  const [step, setStep] = useState(1);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [typeId, setTypeId] = useState<string | null>(existing?.providerTypeId ?? null);
  const [basic, setBasic] = useState({
    business: existing?.providerName ?? "",
    locationId: existing?.locationId ?? locations[0]?.id ?? "",
    mobile: existing?.phoneNumber ?? "",
    website: existing?.website ?? "",
    description: existing?.description ?? "",
  });
  // Step 3 is what makes the profile findable: the primary channel decides the
  // category on the discover card, and the first slot gives it a price.
  const [inv, setInv] = useState({
    channelId: existing?.primaryChannelId ?? channels[0]?.id ?? "",
    audience: existing?.totalAudience ? String(existing.totalAudience) : "",
    listing: "",
    price: "",
    pricingUnitId: pricingUnits.find((u) => u.code === "flat")?.id ?? pricingUnits[0]?.id ?? "",
  });

  const finish = async () => {
    if (!typeId) return;
    setPending(true);
    setError(null);
    try {
      const saved = await saveProviderProfile({
        data: {
          providerName: basic.business,
          providerTypeId: typeId,
          locationId: basic.locationId || null,
          primaryChannelId: inv.channelId || null,
          audienceSize: inv.audience !== "" ? Number(inv.audience) : null,
          phoneNumber: basic.mobile || null,
          website: basic.website || null,
          description: basic.description || null,
        },
      });

      if (!saved.ok) {
        setError(saved.error ?? "Could not save your profile.");
        return;
      }

      // The first listing is optional — a provider can add inventory later from
      // the inventory page, so a blank name here is not an error.
      if (inv.listing.trim()) {
        const slot = await saveInventory({
          data: {
            name: inv.listing,
            channelId: inv.channelId,
            price: Number(inv.price) || 0,
            pricingUnitId: inv.pricingUnitId,
            status: "Active",
          },
        });
        if (!slot.ok) {
          setError(slot.error ?? "Your profile was saved, but the listing could not be added.");
          return;
        }
      }

      await router.invalidate();
      setStep(4);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save your profile.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-medium tracking-tight">Set up as a Provider</h1>
            <p className="mt-1 text-sm text-white/60">
              A few quick steps to start receiving campaign requests.
            </p>
          </div>
          <button onClick={async () => { await signOutFn(); await router.invalidate(); navigate({ to: "/auth/login" }); }} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5">
            <LogOut size={16} /> Sign out
          </button>
        </div>

        <Stepper step={step} labels={["Type", "Basics", "Inventory", "Done"]} />

        <Card className="mt-8">
          {step === 1 && (
            <>
              <h2 className="text-lg font-medium tracking-tight">What kind of provider are you?</h2>
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {providerTypes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTypeId(t.id)}
                    className={
                      "rounded-xl border px-4 py-5 text-sm text-left " +
                      (typeId === t.id
                        ? "border-white bg-white text-black"
                        : "border-white/10 hover:bg-white/5")
                    }
                  >
                    {t.name}
                  </button>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <Button disabled={!typeId} onClick={() => setStep(2)}>
                  Continue <ArrowRight size={14} />
                </Button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-lg font-medium tracking-tight">Tell us about you</h2>
              <div className="mt-5 grid sm:grid-cols-2 gap-4">
                <Field label="Business name">
                  <Input
                    required
                    value={basic.business}
                    onChange={(e) => setBasic({ ...basic, business: e.target.value })}
                  />
                </Field>
                <Field label="Location">
                  <Select
                    value={basic.locationId}
                    onChange={(e) => setBasic({ ...basic, locationId: e.target.value })}
                  >
                    {locations.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.city}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Mobile number">
                  <Input
                    type="tel"
                    value={basic.mobile}
                    onChange={(e) => setBasic({ ...basic, mobile: e.target.value })}
                  />
                </Field>
                <Field label="Website">
                  <Input
                    value={basic.website}
                    onChange={(e) => setBasic({ ...basic, website: e.target.value })}
                    placeholder="https://"
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Short description">
                    <Textarea
                      value={basic.description}
                      onChange={(e) => setBasic({ ...basic, description: e.target.value })}
                      placeholder="What advertisers get when they book you."
                    />
                  </Field>
                </div>
              </div>
              <div className="mt-6 flex justify-between">
                <Button variant="secondary" onClick={() => setStep(1)}>
                  <ArrowLeft size={14} /> Back
                </Button>
                <Button disabled={!basic.business.trim()} onClick={() => setStep(3)}>
                  Continue <ArrowRight size={14} />
                </Button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-lg font-medium tracking-tight">Inventory details</h2>
              <p className="mt-1 text-sm text-white/60">
                Your channel decides how advertisers find you. The listing is optional — you can add
                more from the inventory page later.
              </p>
              <div className="mt-5 grid sm:grid-cols-2 gap-4">
                <Field label="Channel">
                  <Select
                    value={inv.channelId}
                    onChange={(e) => setInv({ ...inv, channelId: e.target.value })}
                  >
                    {channels.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} · {c.category}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Audience size">
                  <Input
                    type="number"
                    value={inv.audience}
                    onChange={(e) => setInv({ ...inv, audience: e.target.value })}
                    placeholder="e.g. 250000"
                  />
                </Field>
                <Field label="First listing (optional)">
                  <Input
                    value={inv.listing}
                    onChange={(e) => setInv({ ...inv, listing: e.target.value })}
                    placeholder="Instagram Reel — 60s"
                  />
                </Field>
                <Field label="Price (₹)">
                  <Input
                    type="number"
                    value={inv.price}
                    onChange={(e) => setInv({ ...inv, price: e.target.value })}
                  />
                </Field>
                <Field label="Quoted as">
                  <Select
                    value={inv.pricingUnitId}
                    onChange={(e) => setInv({ ...inv, pricingUnitId: e.target.value })}
                  >
                    {pricingUnits.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
              {error && (
                <p
                  role="alert"
                  className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
                >
                  {error}
                </p>
              )}
              <div className="mt-6 flex justify-between">
                <Button variant="secondary" onClick={() => setStep(2)}>
                  <ArrowLeft size={14} /> Back
                </Button>
                <Button onClick={finish} disabled={pending || !inv.channelId}>
                  {pending ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Saving…
                    </>
                  ) : (
                    <>
                      Finish <ArrowRight size={14} />
                    </>
                  )}
                </Button>
              </div>
            </>
          )}

          {step === 4 && (
            <div className="text-center py-6">
              <div className="mx-auto h-14 w-14 rounded-full bg-emerald-500/15 text-emerald-300 flex items-center justify-center">
                <Check size={24} />
              </div>
              <h2 className="mt-5 text-xl font-medium tracking-tight">You're all set</h2>
              <p className="mt-1 text-sm text-white/60">
                Your provider profile is live. Advertisers can now find you.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Button onClick={() => navigate({ to: "/app/provider" })}>
                  <Sparkles size={14} /> Go to dashboard
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Stepper({ step, labels }: { step: number; labels: string[] }) {
  return (
    <div className="mt-8 flex items-center gap-2 sm:gap-3 overflow-x-auto -mx-4 px-4 pb-1">
      {labels.map((l, i) => {
        const n = i + 1;
        const done = n < step || (n === labels.length && step === labels.length);
        const active = n === step;
        return (
          <div key={l} className="flex items-center gap-2 sm:gap-3 sm:flex-1 shrink-0">
            <div
              className={
                "h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-xs " +
                (done
                  ? "bg-white text-black"
                  : active
                    ? "bg-white/20 text-white border border-white/40"
                    : "bg-white/5 text-white/50")
              }
            >
              {done ? <Check size={14} /> : n}
            </div>
            <span
              className={
                "text-xs whitespace-nowrap " + (active || done ? "text-white" : "text-white/40")
              }
            >
              {l}
            </span>
            {i < labels.length - 1 && <div className="hidden sm:block flex-1 h-px bg-white/10" />}
            {i < labels.length - 1 && <div className="sm:hidden h-px w-4 bg-white/10" />}
          </div>
        );
      })}
    </div>
  );
}
