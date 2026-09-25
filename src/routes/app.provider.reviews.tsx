import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Card, Table, Badge, SearchBar, Button, Modal, Field, Textarea } from "@/components/ui-kit";
import { getReviews, replyToReview, type Review } from "@/data/reviews";
import { Star, MessageSquareQuote, CheckCircle2, User, Reply, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/app/provider/reviews")({
  component: ProviderReviewsPage,
  loader: () => getReviews(),
});

export function ProviderReviewsPage() {
  const initialReviews = Route.useLoaderData();
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [q, setQ] = useState("");

  // Sync state if initialReviews updates
  if (reviews !== initialReviews && initialReviews.length !== reviews.length) {
    setReviews(initialReviews);
  }

  const [replyingReview, setReplyingReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const term = q.trim().toLowerCase();

  const filteredReviews = initialReviews.filter((r) =>
    term
      ? r.reviewerName.toLowerCase().includes(term) ||
        r.campaignTitle.toLowerCase().includes(term) ||
        r.title.toLowerCase().includes(term) ||
        r.reviewText.toLowerCase().includes(term)
      : true,
  );

  const averageRating = (
    initialReviews.length > 0
      ? (initialReviews.reduce((acc, r) => acc + r.rating, 0) / initialReviews.length).toFixed(1)
      : "5.0"
  );

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingReview || !replyText.trim()) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await replyToReview({
        data: {
          reviewId: replyingReview.id,
          responseText: replyText.trim(),
        },
      });

      if (res && !res.success) {
        setErrorMessage(res.errMessage || "Failed to post response.");
        setIsSubmitting(false);
        return;
      }

      setReplyText("");
      setReplyingReview(null);
      await router.invalidate();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to post response.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-white">Ratings & Client Reviews</h1>
          <p className="text-sm text-white/60">
            Verified ratings and feedback from advertisers and brands on completed campaign executions.
          </p>
        </div>
      </div>

      {/* Ratings Overview Card */}
      <Card className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-5 text-center min-w-[110px]">
            <div className="text-4xl font-bold text-white">{averageRating}</div>
            <div className="flex justify-center gap-1 text-amber-400 mt-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={14} fill="currentColor" />
              ))}
            </div>
            <div className="text-[11px] text-white/50 mt-1">{initialReviews.length} Verified Reviews</div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Verified Creator Rating</h3>
            <p className="text-xs text-white/60 mt-0.5 max-w-sm">
              Your profile ratings are visible to prospective brand advertisers searching the creator discovery network.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full sm:w-auto text-xs">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
            <div className="text-white/50">Delivery Quality</div>
            <div className="text-base font-semibold text-white mt-0.5">5.0 / 5.0</div>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
            <div className="text-white/50">Communication</div>
            <div className="text-base font-semibold text-white mt-0.5">5.0 / 5.0</div>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
            <div className="text-white/50">Speed & Turnaround</div>
            <div className="text-base font-semibold text-white mt-0.5">5.0 / 5.0</div>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
            <div className="text-white/50">Value for Money</div>
            <div className="text-base font-semibold text-white mt-0.5">4.8 / 5.0</div>
          </div>
        </div>
      </Card>

      {/* Search */}
      <div className="max-w-md">
        <SearchBar
          value={q}
          onChange={setQ}
          placeholder="Search client reviews by brand or keyword..."
        />
      </div>

      {/* Reviews Cards or Empty State */}
      {filteredReviews.length === 0 ? (
        <Card className="p-12 text-center flex flex-col items-center justify-center border-dashed border-white/10">
          <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center text-white/40 mb-4">
            <MessageSquareQuote size={24} />
          </div>
          <h3 className="text-base font-semibold text-white">No reviews yet</h3>
          <p className="text-xs text-white/50 max-w-sm mt-1">
            {term
              ? `No reviews match your search "${q}".`
              : "When advertisers complete campaign bookings with you, their ratings and reviews will appear here."}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReviews.map((r) => (
            <Card key={r.id} className="space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-white text-sm">{r.reviewerName}</div>
                    <div className="text-xs text-white/40">{r.campaignTitle}</div>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded text-amber-400">
                    <Star size={12} fill="currentColor" />
                    <span className="font-semibold text-xs text-white">{r.rating}.0</span>
                  </div>
                </div>

                <div>
                  <div className="font-medium text-xs text-white/90">"{r.title}"</div>
                  <p className="text-xs text-white/70 mt-1 leading-relaxed">{r.reviewText}</p>
                </div>

                {/* Creator Reply Section */}
                {r.responseText ? (
                  <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-xs space-y-1 mt-2">
                    <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 size={12} /> Your Response ({r.responseDate}):
                    </div>
                    <p className="text-white/80">{r.responseText}</p>
                  </div>
                ) : (
                  <div className="pt-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setReplyingReview(r);
                        setReplyText("");
                        setErrorMessage(null);
                      }}
                    >
                      <Reply size={14} /> Reply to Review
                    </Button>
                  </div>
                )}
              </div>

              <div className="border-t border-white/10 pt-2 flex items-center justify-between text-[11px] text-white/40">
                <span>{r.createdDate}</span>
                <Badge tone="success">Verified Advertiser</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Reply Modal */}
      {replyingReview && (
        <Modal
          open={true}
          onClose={() => !isSubmitting && setReplyingReview(null)}
          title={`Reply to ${replyingReview.reviewerName}`}
          footer={
            <>
              <Button variant="ghost" disabled={isSubmitting} onClick={() => setReplyingReview(null)}>
                Cancel
              </Button>
              <Button variant="primary" disabled={isSubmitting} onClick={handleSendReply}>
                {isSubmitting ? "Posting..." : "Post Public Response"}
              </Button>
            </>
          }
        >
          <form onSubmit={handleSendReply} className="space-y-4 text-sm">
            {errorMessage && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400 flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="rounded-lg bg-white/5 p-3 text-xs text-white/70">
              "{replyingReview.reviewText}"
            </div>

            <Field label="Your Response">
              <Textarea
                required
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Thank the brand, acknowledge specific collaboration highlights..."
              />
            </Field>
          </form>
        </Modal>
      )}
    </div>
  );
}
