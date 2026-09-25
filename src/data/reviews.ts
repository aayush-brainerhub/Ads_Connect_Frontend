import { createServerFn } from "@tanstack/react-start";
import { apiGet, apiPost, apiPut } from "./api-client";

export interface Review {
  id: string;
  bookingId: string;
  bookingNumber: string;
  campaignTitle: string;
  direction: "AdvertiserToProvider" | "ProviderToAdvertiser";
  reviewerName: string;
  reviewerRole: "Advertiser" | "Provider";
  providerId?: string;
  providerName: string;
  advertiserId?: string;
  advertiserName: string;
  rating: number; // 1 to 5
  title: string;
  reviewText: string;
  criteriaRatings: {
    communication: number;
    deliverySpeed: number;
    quality: number;
    valueForMoney: number;
  };
  isPublished: boolean;
  responseText?: string | null;
  responseDate?: string | null;
  createdDate: string;
}

export const getReviews = createServerFn({ method: "GET" }).handler(
  async (): Promise<Review[]> => {
    try {
      const res = await apiGet<Review[]>("/api/Review/GetReviews");
      if (res) return res;
    } catch {
      // Return empty array
    }
    return [];
  },
);

export const createReview = createServerFn({ method: "POST" })
  .inputValidator((input: { bookingId?: string; providerId?: string; rating: number; title: string; reviewText: string }) => input)
  .handler(async ({ data }) => {
    return await apiPost<Review>("/api/Review/CreateReview", data);
  });

export const replyToReview = createServerFn({ method: "POST" })
  .inputValidator((input: { reviewId: string; responseText: string }) => input)
  .handler(async ({ data }) => {
    return await apiPost<string>("/api/Review/ReplyToReview", data);
  });

export const toggleReviewPublish = createServerFn({ method: "POST" })
  .inputValidator((reviewId: string) => reviewId)
  .handler(async ({ data: id }) => {
    return await apiPut<string>(`/api/Review/TogglePublish/${id}`, {});
  });
