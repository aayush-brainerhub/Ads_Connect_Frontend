/**
 * Badge tones for the status values the database allows.
 *
 * These come straight from the API, which in turn gets them from the CK_*
 * check constraints, so the sets here match what the tables can actually
 * contain — Campaign has six statuses, not the three the mock data had, and a
 * declined request is "Declined", not "Rejected".
 */
type Tone = "default" | "success" | "warn" | "danger" | "info";

/** CK_Campaign_Status. */
export function campaignTone(status: string): Tone {
  switch (status) {
    case "Active":
      return "success";
    case "Draft":
    case "PendingApproval":
    case "Paused":
      return "warn";
    case "Cancelled":
      return "danger";
    default:
      return "default";
  }
}

/** CK_Request_Status. */
export function requestTone(status: string): Tone {
  switch (status) {
    case "Accepted":
      return "success";
    case "Declined":
    case "Expired":
      return "danger";
    case "Pending":
    case "Viewed":
      return "warn";
    case "ProposalSubmitted":
      return "info";
    default:
      return "default";
  }
}

/** CK_Inventory_Status. */
export function inventoryTone(status: string): Tone {
  switch (status) {
    case "Active":
      return "success";
    case "Paused":
    case "Draft":
      return "warn";
    default:
      return "default";
  }
}

/** A request the provider has not answered yet. */
export function isAwaitingResponse(status: string): boolean {
  return status === "Pending" || status === "Viewed";
}
