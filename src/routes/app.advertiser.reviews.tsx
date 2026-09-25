import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Card, Table, Badge, SearchBar, Button, Modal, Field, Input, Textarea, Select } from "@/components/ui-kit";
import { getReviews, createReview, type Review } from "@/data/reviews";
import { getBookings, type Booking } from "@/data/bookings";
import { Star, MessageSquareQuote, Plus, CheckCircle2, UserCheck, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/app/advertiser/reviews")({
  component: AdvertiserReviewsPage,
  loader: async () => {
    const [reviews, bookings] = await Promise.all([
      getReviews().catch(() => [] as Review[]),
      getBookings().catch(() => [] as Booking[]),
    ]);
    return { reviews, bookings };
  },
});

export function AdvertiserReviewsPage() {
  const { reviews: initialReviews, bookings } = Route.useLoaderData();
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [q, setQ] = useState("");

  // Sync state when loader data changes (e.g. on router.invalidate)
  if (reviews !== initialReviews && initialReviews.length !== reviews.length) {
    setReviews(initialReviews);
  }

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string>(
    bookings.length > 0 ? bookings[0].id : "",
  );
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const term = q.trim().toLowerCase();

  const filteredReviews = initialReviews.filter((r) =>
    term
      ? r.providerName.toLowerCase().includes(term) ||
        r.campaignTitle.toLowerCase().includes(term) ||
        r.title.toLowerCase().includes(term) ||
        r.reviewText.toLowerCase().includes(term)
      : true,
  );

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !reviewText.trim()) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await createReview({
        data: {
          bookingId: selectedBookingId || undefined,
          rating,
          title: title.trim(),
          reviewText: reviewText.trim(),
        },
      });

      if (res && !res.success) {
        setErrorMessage(res.errMessage || "Failed to publish review.");
        setIsSubmitting(false);
        return;
      }

      setShowAddModal(false);
      setTitle("");
      setReviewText("");
      await router.invalidate();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to publish review.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-white">Reviews & Endorsements</h1>
          <p className="text-sm text-white/60">
            Share feedback and ratings on creators and media providers following campaign completion.
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} size="sm">
          <Plus size={16} /> Write a Review
        </Button>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <SearchBar
          value={q}
          onChange={setQ}
          placeholder="Search reviews by provider or campaign..."
        />
      </div>

      {/* Reviews Grid or Empty State */}
      {filteredReviews.length === 0 ? (
        <Card className="p-12 text-center flex flex-col items-center justify-center border-dashed border-white/10">
          <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center text-white/40 mb-4">
            <MessageSquareQuote size={24} />
          </div>
          <h3 className="text-base font-semibold text-white">No reviews found</h3>
          <p className="text-xs text-white/50 max-w-sm mt-1 mb-5">
            {term
              ? `No reviews match your search "${q}". Try a different keyword.`
              : "You haven't written any provider reviews yet. Rate and endorse creators after campaign executions."}
          </p>
          {!term && (
            <Button onClick={() => setShowAddModal(true)} size="sm" variant="secondary">
              <Plus size={14} /> Write First Review
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReviews.map((r) => (
            <Card key={r.id} className="space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-white text-base">{r.providerName}</h3>
                    <div className="text-xs text-white/40">{r.campaignTitle}</div>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-full text-amber-400">
                    <Star size={14} fill="currentColor" />
                    <span className="font-semibold text-xs text-white">{r.rating}.0</span>
                  </div>
                </div>

                <div className="pt-1">
                  <div className="font-medium text-xs text-white/90">"{r.title}"</div>
                  <p className="text-xs text-white/70 mt-1 leading-relaxed">{r.reviewText}</p>
                </div>

                {/* Criteria Tags */}
                <div className="grid grid-cols-2 gap-1.5 pt-2 text-[11px] text-white/60">
                  <div className="flex justify-between bg-white/[0.02] p-1.5 rounded border border-white/5">
                    <span>Communication:</span>
                    <span className="text-white font-medium">{r.criteriaRatings?.communication ?? 5}/5</span>
                  </div>
                  <div className="flex justify-between bg-white/[0.02] p-1.5 rounded border border-white/5">
                    <span>Delivery Speed:</span>
                    <span className="text-white font-medium">{r.criteriaRatings?.deliverySpeed ?? 5}/5</span>
                  </div>
                </div>

                {/* Response from provider */}
                {r.responseText && (
                  <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2.5 text-xs text-emerald-300 mt-2">
                    <div className="font-medium flex items-center gap-1 text-[11px]">
                      <UserCheck size={12} /> Provider Response ({r.responseDate}):
                    </div>
                    <div className="mt-0.5 text-white/80">{r.responseText}</div>
                  </div>
                )}
              </div>

              <div className="border-t border-white/10 pt-2 flex items-center justify-between text-[11px] text-white/40">
                <span>Submitted on {r.createdDate}</span>
                <Badge tone="success">Verified Booking</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Review Modal */}
      {showAddModal && (
        <Modal
          open={true}
          onClose={() => !isSubmitting && setShowAddModal(false)}
          title="Submit Provider Review"
          footer={
            <>
              <Button variant="ghost" disabled={isSubmitting} onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" disabled={isSubmitting} onClick={handleAddReview}>
                {isSubmitting ? "Publishing..." : "Publish Review"}
              </Button>
            </>
          }
        >
          <form onSubmit={handleAddReview} className="space-y-4 text-sm">
            {errorMessage && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400 flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            {bookings.length > 0 ? (
              <Field label="Completed Campaign Booking">
                <Select
                  value={selectedBookingId}
                  onChange={(e) => setSelectedBookingId(e.target.value)}
                >
                  {bookings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bookingNumber} - {b.campaignTitle} ({b.providerName})
                    </option>
                  ))}
                </Select>
              </Field>
            ) : (
              <Field label="Campaign / Provider Context">
                <div className="text-xs text-white/60 bg-white/5 p-2.5 rounded border border-white/10">
                  Direct Endorsement & Verified Feedback Review
                </div>
              </Field>
            )}

            <Field label="Overall Star Rating (1 to 5)">
              <div className="flex gap-2 items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className={`p-2 rounded-lg border transition-all ${
                      rating >= star
                        ? "border-amber-400/50 bg-amber-400/10 text-amber-400"
                        : "border-white/10 text-white/30 hover:text-white"
                    }`}
                  >
                    <Star size={20} fill={rating >= star ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Headline Summary">
              <Input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Exceptional engagement and on-time delivery!"
              />
            </Field>

            <Field label="Detailed Review & Feedback">
              <Textarea
                required
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Describe your collaboration, communication responsiveness, audience demographic response, and overall campaign return..."
              />
            </Field>
          </form>
        </Modal>
      )}
    </div>
  );
}
