import { createServerFn } from "@tanstack/react-start";

import { apiGet, apiPost, apiPostFile, apiDelete, publicApiUrl } from "./api-client";

export interface AdvertiserProfile {
  id: string;
  businessName: string;
  industryId: string | null;
  industry: string | null;
  locationId: string | null;
  location: string | null;
  website: string | null;
  monthlyBudgetMin: number | null;
  monthlyBudgetMax: number | null;
}

export interface ProviderProfile {
  id: string;
  providerName: string;
  providerTypeId: string;
  providerType: string;
  locationId: string | null;
  location: string | null;
  phoneNumber: string | null;
  website: string | null;
  description: string | null;
  totalAudience: number;
  primaryChannelId: string | null;
  primaryChannel: string | null;
}

export interface ProfileUser {
  userId: string;
  firstName: string;
  lastName: string | null;
  email: string;
  phoneNumber: string | null;
  /** Absolute URL, or null when the account still shows initials. */
  profileImageUrl: string | null;
}

/** `advertiser` and `provider` are null until that onboarding wizard is completed. */
export interface MyProfile {
  user: ProfileUser | null;
  advertiser: AdvertiserProfile | null;
  provider: ProviderProfile | null;
}

export interface SaveResult {
  ok: boolean;
  error?: string;
}

export const getMyProfile = createServerFn({ method: "GET" }).handler(async () => {
  const profile = await apiGet<MyProfile>("/api/Profile/GetMyProfile");
  return withAbsoluteAvatar(profile);
});

/**
 * The API stores the avatar as a path so the column stays portable; the browser
 * loads it straight off the API's static-file handler, so it needs the host.
 */
function withAbsoluteAvatar(profile: MyProfile): MyProfile {
  if (!profile.user?.profileImageUrl) return profile;
  return {
    ...profile,
    user: { ...profile.user, profileImageUrl: publicApiUrl(profile.user.profileImageUrl) },
  };
}

export interface AdvertiserProfileInput {
  businessName: string;
  industryId: string | null;
  locationId: string | null;
  website?: string | null;
  monthlyBudgetMin: number | null;
  monthlyBudgetMax: number | null;
}

export const saveAdvertiserProfile = createServerFn({ method: "POST" })
  .inputValidator((input: unknown): AdvertiserProfileInput => {
    const value = input as Partial<AdvertiserProfileInput> | undefined;
    if (!value?.businessName?.trim()) throw new Error("A business name is required.");
    return {
      businessName: value.businessName.trim(),
      industryId: value.industryId ?? null,
      locationId: value.locationId ?? null,
      website: value.website ?? null,
      monthlyBudgetMin: value.monthlyBudgetMin ?? null,
      monthlyBudgetMax: value.monthlyBudgetMax ?? null,
    };
  })
  .handler(async ({ data }): Promise<SaveResult> => {
    const body = await apiPost<AdvertiserProfile>("/api/Profile/SaveAdvertiserProfile", data);
    return body.success ? { ok: true } : { ok: false, error: body.errMessage ?? "Could not save." };
  });

export interface ProviderProfileInput {
  providerName: string;
  providerTypeId: string;
  locationId: string | null;
  primaryChannelId: string | null;
  audienceSize: number | null;
  phoneNumber?: string | null;
  website?: string | null;
  description?: string | null;
}

export const saveProviderProfile = createServerFn({ method: "POST" })
  .inputValidator((input: unknown): ProviderProfileInput => {
    const value = input as Partial<ProviderProfileInput> | undefined;
    if (!value?.providerName?.trim()) throw new Error("A provider name is required.");
    if (!value.providerTypeId) throw new Error("A provider type is required.");
    return {
      providerName: value.providerName.trim(),
      providerTypeId: value.providerTypeId,
      locationId: value.locationId ?? null,
      primaryChannelId: value.primaryChannelId ?? null,
      audienceSize: value.audienceSize ?? null,
      phoneNumber: value.phoneNumber ?? null,
      website: value.website ?? null,
      description: value.description ?? null,
    };
  })
  .handler(async ({ data }): Promise<SaveResult> => {
    const body = await apiPost<ProviderProfile>("/api/Profile/SaveProviderProfile", data);
    return body.success ? { ok: true } : { ok: false, error: body.errMessage ?? "Could not save." };
  });

/** What the file input accepts, and what the API will store. */
export const AVATAR_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

export interface AvatarResult extends SaveResult {
  /** The new absolute URL, for an immediate preview. */
  url?: string;
}

export const uploadProfileImage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown): FormData => {
    // FormData passes through the RPC layer untouched, so the bytes are streamed
    // rather than base64'd into a JSON payload.
    if (!(input instanceof FormData)) throw new Error("An image file is required.");
    const file = input.get("file");
    if (!(file instanceof File) || file.size === 0) throw new Error("Choose an image to upload.");
    if (!AVATAR_TYPES.includes(file.type)) {
      throw new Error("That file type is not supported. Use PNG, JPEG, WebP or GIF.");
    }
    if (file.size > AVATAR_MAX_BYTES) throw new Error("That image is larger than 2 MB.");
    return input;
  })
  .handler(async ({ data }): Promise<AvatarResult> => {
    const body = await apiPostFile<string>("/api/Profile/UploadProfileImage", data);
    return body.success && body.data
      ? { ok: true, url: publicApiUrl(body.data) }
      : { ok: false, error: body.errMessage ?? "The image could not be uploaded." };
  });

export const removeProfileImage = createServerFn({ method: "POST" }).handler(
  async (): Promise<SaveResult> => {
    const body = await apiDelete<string>("/api/Profile/RemoveProfileImage");
    return body.success ? { ok: true } : { ok: false, error: body.errMessage ?? "Could not remove." };
  },
);
