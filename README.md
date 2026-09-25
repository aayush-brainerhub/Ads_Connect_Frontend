# AdsConnect / Velorix — frontend

TanStack Start (React 19, SSR) advertising marketplace. Run with Bun.

## Architecture

The frontend does **not** talk to Postgres. All database access goes through the
.NET API in `../backend`:

```
TanStack Start (:8080) --HTTP--> AdsConnect.api (:5036) --EF Core--> Postgres (:5432)
```

API calls happen inside `createServerFn` handlers, so they run server-to-server
and the API is never reached from the browser.

| File | Role |
|---|---|
| `src/data/api-client.ts` | `fetch` wrapper; base URL from `API_BASE_URL`; forwards the bearer token |
| `src/data/reference-data.ts` | `GET /api/Reference/GetReferenceData` — every dropdown list |
| `src/data/providers.ts` | `GET /api/Provider/GetProviders`, `GET /api/Provider/GetProviderById` |
| `src/data/auth.ts` | Sign in / sign up / sign out; owns the session cookie |
| `src/data/profile.ts` | `GET/POST /api/Profile/*` — the Advertiser and Provider rows |
| `src/data/campaigns.ts` | `/api/Campaign/*` |
| `src/data/requests.ts` | `/api/Request/*` |
| `src/data/inventory.ts` | `/api/Inventory/*` |
| `src/data/messages.ts` | `/api/Message/*` |
| `src/data/admin.ts` | `/api/Admin/*` |
| `src/lib/auth.ts` | Session and role types, safe to import anywhere |
| `src/lib/auth-guard.ts` | `requireSession` / `requireRole` for `beforeLoad` |
| `src/lib/status.ts` | Badge tones for the status values the check constraints allow |
| `src/lib/budget.ts` | The budget-bucket select ↔ `MonthlyBudgetMin`/`Max` |

Every API response is wrapped in the `ResponseData<T>` envelope
(`{ data, errMessage, success }`) with HTTP 200 even on failure, matching the PMS
house convention. `api-client.ts` unwraps it. Because the envelope cannot
distinguish a failure from a not-found, a server error on the provider detail
endpoint surfaces as a not-found page.

> Anything under a directory named `server/` is blocked from the client module
> graph by TanStack Start's import-protection plugin, which breaks **every** route
> because `routeTree.gen.ts` imports them all. Server functions live in
> `src/data/`, not `src/server/`.

## Running

Both processes are needed.

Use two terminals:

```sh
bun install

# terminal 1 — the .NET API on :5036
bun run api

# terminal 2 — the frontend on :8080
bun run dev
```

`bun run api` derives the API's connection string from the `DATABASE_URL` already
in `.env` and passes it to the process in memory, so there is no second copy of
the password to maintain. **Start the API first** — the discover, campaigns and
profile pages call it during SSR and render the error page if it is not up. The
marketing pages keep working either way, which makes a stopped API look like a
partial frontend bug rather than a missing process.

> Restarting the API invalidates your session. With no `Jwt:Key` configured it
> signs tokens with a key generated per process, so the cookie from before the
> restart no longer validates — you land back on the sign-in page. Set the key via
> user-secrets if that gets tiresome; see `../backend/README.md`.

To run the API from Visual Studio instead, set the connection string once via
user-secrets — see `../backend/README.md`. Visual Studio does not pick up
`bun run api`'s in-memory variable, and both bind port 5036, so run one or the
other, not both.

`.env` (gitignored) holds `API_BASE_URL`; copy `.env.example` if you don't have one.
`DATABASE_URL` is still there for the seed script below — the app itself no longer
reads it.

## What is real and what is still mock

**From the database, via the API:** every screen behind sign-in. The provider
directory and detail pages, both dashboards, campaigns, the provider request
inbox, inventory, messages, both onboarding wizards, both profile pages, and all
four admin pages.

**Still `src/lib/mock-data.ts`:** only `budgetBuckets` (a UI filter range with no
table behind it) and the `formatINR` / `compactNumber` formatters. The mock
`providers`, `campaigns`, `requests`, `conversations`, `users` and `adminMetrics`
arrays are no longer imported by anything and can go.

### Notes on the wiring

- **Lists are loader data**, so a mutation is followed by `router.invalidate()`
  rather than by patching local state. The tables never drift from the database.
- **The "Send request" modal asks which campaign.** A request hangs off a campaign
  in this schema, so it is chosen rather than guessed; with no campaigns yet, the
  modal says so and links to the campaigns page.
- **Inventory is keyed to an advertising channel, not a provider type.** A provider
  type is what you are, a channel is what you sell, and `ProviderInventory.ChannelId`
  is the required column. The modal also asks how the price is quoted, because the
  price lives in `ProviderPricing` against a `PricingUnit`.
- **Provider onboarding step 3 asks for a channel** rather than the old
  type-specific freeform fields. The primary channel is what sets the category on
  your discover card, so a profile without one is not findable. The first listing
  is optional.
- **Status values come from the database**, not from the UI's old vocabulary: a
  declined request is `Declined`, not "Rejected", and inventory is `Active`, not
  "Live". `src/lib/status.ts` maps them to badge tones.
- **Nothing settles money yet**, so the tiles say "committed budget" and "agreed
  value" rather than revenue and earnings.

**Real:** sign-in and sign-up. See below.

## Authentication

Email and password, against `/api/SignIn/*`. Every API endpoint except Login and
Register now requires a bearer token, so a signed-out request for the lookup
lists or the provider directory gets a 401 rather than data.

```
form ──> signIn server fn ──> POST /api/SignIn/Login ──> { token, user }
                   │
                   └─> httpOnly cookie `adconnect_token`
                       └─> forwarded as `Authorization: Bearer` by api-client.ts
```

The token is kept in an **httpOnly** cookie, never in `localStorage`, so client
JavaScript cannot read it. Only the server functions can, which is fine because
every API call already goes through one. The trade-off is that the browser cannot
tell who is signed in on its own: `__root.tsx` resolves the session in
`beforeLoad` and passes it down as route context, and components read it from
there rather than from a hook.

`getSession` decodes the token's claims without verifying the signature — the API
does that on every protected endpoint, and the cookie can only have been written
by our own handler after a successful sign-in. An expired `exp` reads as signed
out, and a token the API *rejects* (usually because the dev signing key changed on
restart) drops the cookie and bounces to `/auth/login?expired=true`.

Guards live on the layout routes, so they cover the loaders underneath:

| Area | Guard |
|---|---|
| `/app/advertiser/*`, `/onboarding/advertiser` | `requireRole(..., "Advertiser")` |
| `/app/provider/*`, `/onboarding/provider` | `requireRole(..., "Provider")` |
| `/app/admin/*` | `requireRole(..., "Admin")` |

Signed out → `/auth/login?redirect=<where you were going>`. Signed in but wrong
role → your own dashboard. Already signed in and visiting `/auth/login` → likewise.

The "I am a" picker on the sign-in form is checked against the roles the account
actually holds, so choosing Admin as an advertiser fails with a message instead of
dropping you into a shell whose every page would then redirect you out again.

**Not implemented:** phone OTP, password reset and Google sign-in. All three need
a mail/SMS sender or an OAuth client that this project does not have. Those
screens are disabled and say so — previously they accepted any input and handed
out a session, which looked like working auth.

**The 12 seeded providers cannot sign in** — they have no `PasswordHash`. Create an
account at `/auth/signup`; it writes a real `AppUser` plus its `UserRole` row.
Signing up does **not** yet create the `Advertiser` / `Provider` profile row —
onboarding is still a mock form.

## Seeding demo providers

`scripts/seed-providers.ts` inserts the 12 demo providers that used to live in
`mock-data.ts`. It is idempotent and transactional, keyed on `AppUser.Email`.

```sh
bun run db:seed        # re-running changes nothing
bun run db:seed:undo   # removes them again
```

> This script connects to Postgres **directly** with `pg`, bypassing the API. It
> predates the backend and is kept as a dev convenience; `pg` is a devDependency
> for that reason alone. Port it to the API before relying on it for anything
> beyond local demo data.

Notes on the seeded data:

- Mock provider types were renamed to match `ProviderType`: `Billboard` ->
  `Outdoor Media`, `Digital Screen` -> `Venue Media`, `Newspaper` -> `Print Media`.
- `Gurgaon, Haryana` was **added** to `Location`; it was missing from the 12-city
  starter set. `db:seed:undo` does not remove it.
- `DevWeekly Newsletter` intentionally has no location and renders as
  "No fixed location".
- The mock content categories (`Lifestyle`, `Beauty`, `Food`) are gone — the
  schema has nowhere to store them. Cards show the primary channel's category
  instead, e.g. `Influencer · Social`.
