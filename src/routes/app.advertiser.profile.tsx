import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Avatar, Button, Card, EmptyState, Field, Input, Select } from "@/components/ui-kit";
import { budgetBuckets } from "@/lib/mock-data";
import { bucketFor, budgetRangeFor } from "@/lib/budget";
import { initialsFor } from "@/lib/auth";
import { getReferenceData } from "@/data/reference-data";
import { getMyProfile, saveAdvertiserProfile, uploadProfileImage, removeProfileImage, AVATAR_TYPES } from "@/data/profile";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/app/advertiser/profile")({
  component: ProfilePage,
  loader: async () => {
    const [reference, profile] = await Promise.all([getReferenceData(), getMyProfile()]);
    return { reference, profile };
  },
});

function ProfilePage() {
  const { reference, profile } = Route.useLoaderData();
  const { industries, locations } = reference;
  const { session } = Route.useRouteContext();
  const router = useRouter();

  const advertiser = profile.advertiser;
  const [form, setForm] = useState({
    business: advertiser?.businessName ?? "",
    industryId: advertiser?.industryId ?? industries[0]?.id ?? "",
    locationId: advertiser?.locationId ?? locations[0]?.id ?? "",
    website: advertiser?.website ?? "",
    budget: bucketFor(advertiser?.monthlyBudgetMin ?? null, advertiser?.monthlyBudgetMax ?? null),
  });
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  const [avatarUrl, setAvatarUrl] = useState(profile.user?.profileImageUrl ?? null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [avatarPending, setAvatarPending] = useState(false);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarPending(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadProfileImage({ data: formData });
      if (res.ok && res.url) {
        setAvatarUrl(res.url);
        await router.invalidate();
      } else {
        alert(res.error || "Failed to upload image.");
      }
    } finally {
      setAvatarPending(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const onRemoveAvatar = async () => {
    if (!avatarUrl) return;
    setAvatarPending(true);
    try {
      const res = await removeProfileImage();
      if (res.ok) {
        setAvatarUrl(null);
        await router.invalidate();
      } else {
        alert(res.error || "Failed to remove image.");
      }
    } finally {
      setAvatarPending(false);
    }
  };

  const save = async () => {
    setPending(true);
    setStatus(null);
    try {
      const [min, max] = budgetRangeFor(form.budget);
      const result = await saveAdvertiserProfile({
        data: {
          businessName: form.business,
          industryId: form.industryId || null,
          locationId: form.locationId || null,
          website: form.website || null,
          monthlyBudgetMin: min,
          monthlyBudgetMax: max,
        },
      });
      if (!result.ok) {
        setStatus({ ok: false, text: result.error ?? "Could not save." });
        return;
      }
      await router.invalidate();
      setStatus({ ok: true, text: "Changes saved." });
    } catch (cause) {
      setStatus({ ok: false, text: cause instanceof Error ? cause.message : "Could not save." });
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-medium tracking-tight">Profile</h1>
      <Card>
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="relative group rounded-full overflow-hidden shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => fileInput.current?.click()}
            disabled={avatarPending}
          >
            <Avatar initials={initialsFor(session.name)} size={64} src={avatarUrl} />
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[10px] uppercase tracking-wider font-medium text-white">Edit</span>
            </div>
          </button>
          <div className="flex-1">
            <p className="text-lg tracking-tight">{session.name}</p>
            <p className="text-sm text-white/60">{session.email}</p>
          </div>
          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInput}
              className="hidden"
              accept={AVATAR_TYPES.join(",")}
              onChange={onFileChange}
            />
            <Button variant="secondary" size="sm" disabled={avatarPending} onClick={() => fileInput.current?.click()}>
              {avatarPending ? <Loader2 size={14} className="animate-spin" /> : "Upload"}
            </Button>
            {avatarUrl && (
              <Button variant="ghost" size="sm" disabled={avatarPending} onClick={onRemoveAvatar}>
                Remove
              </Button>
            )}
          </div>
        </div>

        {advertiser === null ? (
          <div className="mt-6">
            <EmptyState
              title="No advertiser profile yet"
              hint="Finish onboarding so providers know who is reaching out."
              action={
                <Link to="/onboarding/advertiser">
                  <Button>Finish onboarding</Button>
                </Link>
              }
            />
          </div>
        ) : (
          <>
            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              <Field label="Business name">
                <Input
                  value={form.business}
                  onChange={(e) => setForm({ ...form, business: e.target.value })}
                />
              </Field>
              <Field label="Industry">
                <Select
                  value={form.industryId}
                  onChange={(e) => setForm({ ...form, industryId: e.target.value })}
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
                  value={form.locationId}
                  onChange={(e) => setForm({ ...form, locationId: e.target.value })}
                >
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.city}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Monthly budget">
                <Select
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                >
                  {budgetBuckets.map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </Select>
              </Field>
              <div className="sm:col-span-2">
                <Field label="Website">
                  <Input
                    value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                    placeholder="https://"
                  />
                </Field>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              {status && (
                <span
                  role="status"
                  className={"text-sm " + (status.ok ? "text-emerald-300" : "text-red-300")}
                >
                  {status.text}
                </span>
              )}
              <Button onClick={save} disabled={pending || !form.business.trim()}>
                {pending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Saving…
                  </>
                ) : (
                  "Save changes"
                )}
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
