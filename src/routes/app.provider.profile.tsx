import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState, useRef } from "react";
import {
  Avatar,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  Select,
  Textarea,
} from "@/components/ui-kit";
import { initialsFor } from "@/lib/auth";
import { getReferenceData } from "@/data/reference-data";
import { getMyProfile, saveProviderProfile, uploadProfileImage, removeProfileImage, AVATAR_TYPES } from "@/data/profile";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/app/provider/profile")({
  component: ProviderProfile,
  loader: async () => {
    const [reference, profile] = await Promise.all([getReferenceData(), getMyProfile()]);
    return { reference, profile };
  },
});

function ProviderProfile() {
  const { reference, profile } = Route.useLoaderData();
  const { providerTypes, locations, channels } = reference;
  const { session } = Route.useRouteContext();
  const router = useRouter();

  const provider = profile.provider;
  const [form, setForm] = useState({
    name: provider?.providerName ?? "",
    providerTypeId: provider?.providerTypeId ?? providerTypes[0]?.id ?? "",
    locationId: provider?.locationId ?? locations[0]?.id ?? "",
    channelId: provider?.primaryChannelId ?? channels[0]?.id ?? "",
    mobile: provider?.phoneNumber ?? "",
    website: provider?.website ?? "",
    audience: provider?.totalAudience ? String(provider.totalAudience) : "",
    description: provider?.description ?? "",
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
      const result = await saveProviderProfile({
        data: {
          providerName: form.name,
          providerTypeId: form.providerTypeId,
          locationId: form.locationId || null,
          primaryChannelId: form.channelId || null,
          audienceSize: Number(form.audience) || null,
          phoneNumber: form.mobile || null,
          website: form.website || null,
          description: form.description || null,
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

        {provider === null ? (
          <div className="mt-6">
            <EmptyState
              title="No provider profile yet"
              hint="Finish onboarding so advertisers can discover and book you."
              action={
                <Link to="/onboarding/provider">
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
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </Field>
              <Field label="Provider type">
                <Select
                  value={form.providerTypeId}
                  onChange={(e) => setForm({ ...form, providerTypeId: e.target.value })}
                >
                  {providerTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Location">
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
              {/* The primary channel is what sets the category on your discover card. */}
              <Field label="Primary channel">
                <Select
                  value={form.channelId}
                  onChange={(e) => setForm({ ...form, channelId: e.target.value })}
                >
                  {channels.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} · {c.category}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Mobile">
                <Input
                  type="tel"
                  value={form.mobile}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                />
              </Field>
              <Field label="Audience size">
                <Input
                  type="number"
                  value={form.audience}
                  onChange={(e) => setForm({ ...form, audience: e.target.value })}
                />
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
              <div className="sm:col-span-2">
                <Field label="Description">
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
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
              <Button onClick={save} disabled={pending || !form.name.trim()}>
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
