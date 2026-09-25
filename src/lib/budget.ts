import { budgetBuckets } from "./mock-data";

/**
 * Turns one of the UI's budget buckets into the numeric range
 * Advertiser.MonthlyBudgetMin / MonthlyBudgetMax stores.
 *
 * `budgetBuckets` stays a hardcoded UI filter range — there is no table behind
 * it — so this mapping lives beside it rather than in the API.
 */
export function budgetRangeFor(bucket: string): [number | null, number | null] {
  switch (bucket) {
    case budgetBuckets[0]:
      return [null, 10_000];
    case budgetBuckets[1]:
      return [10_000, 50_000];
    case budgetBuckets[2]:
      return [50_000, 200_000];
    case budgetBuckets[3]:
      return [200_000, null];
    default:
      return [null, null];
  }
}

/** The bucket a stored range came from, for prefilling the select. */
export function bucketFor(min: number | null, max: number | null): string {
  return (
    budgetBuckets.find((bucket) => {
      const [bucketMin, bucketMax] = budgetRangeFor(bucket);
      return bucketMin === min && bucketMax === max;
    }) ?? budgetBuckets[1]
  );
}
