/**
 * Seeds the 12 demo providers from src/lib/mock-data.ts into Ads_Connect.
 *
 * Idempotent: keyed on AppUser.Email, so re-running it changes nothing.
 *   Run:  bun scripts/seed-providers.ts
 *   Undo: bun scripts/seed-providers.ts --undo
 */
import pg from "pg";

const SEED_EMAIL_DOMAIN = "seed.adsconnect.local";

type Seed = {
  name: string;
  email: string;
  providerType: string; // ProviderType.Name
  city: string | null; // Location.City — null means no fixed location
  channel: string; // AdvertisingChannel.ChannelName
  pricingUnit: string; // PricingUnit.UnitCode
  price: number;
  audience: number;
  rating: number;
  description: string;
  inventoryName: string;
};

// The mock "type" names (Billboard, Digital Screen, Newspaper) do not exist in
// ProviderType — the database uses Outdoor Media / Venue Media / Print Media.
const SEEDS: Seed[] = [
  {
    name: "Virat Kohli",
    email: `virat.kohli@${SEED_EMAIL_DOMAIN}`,
    providerType: "Influencer",
    city: "Mumbai",
    channel: "Instagram",
    pricingUnit: "per_post",
    price: 5000000,
    audience: 271000000,
    rating: 4.9,
    description: "Indian international cricketer and the most-followed Indian on Instagram.",
    inventoryName: "Sponsored Instagram Post",
  },
  {
    name: "CarryMinati",
    email: `carryminati@${SEED_EMAIL_DOMAIN}`,
    providerType: "Influencer",
    city: "Delhi",
    channel: "Instagram",
    pricingUnit: "per_post",
    price: 800000,
    audience: 20000000,
    rating: 4.8,
    description: "Leading Indian content creator known for comedy and gaming content.",
    inventoryName: "Brand Integration Reel",
  },
  {
    name: "Red FM 93.5",
    email: `sales@redfm935.${SEED_EMAIL_DOMAIN}`,
    providerType: "Radio",
    city: "Mumbai",
    channel: "Radio",
    pricingUnit: "per_spot",
    price: 45000,
    audience: 3500000,
    rating: 4.6,
    description: "Bajaate Raho! High-energy youth-oriented radio programming.",
    inventoryName: "Morning Prime 30s Spot",
  },
  {
    name: "Laqshya Media Group",
    email: `bookings@laqshyamedia.${SEED_EMAIL_DOMAIN}`,
    providerType: "Outdoor Media",
    city: "Bengaluru",
    channel: "Billboard",
    pricingUnit: "per_month",
    price: 250000,
    audience: 2500000,
    rating: 4.7,
    description: "Premium large-format OOH advertising solutions in prime tech parks.",
    inventoryName: "Tech Park Mega Hoarding",
  },
  {
    name: "Bright Outdoor Media",
    email: `sales@brightoutdoor.${SEED_EMAIL_DOMAIN}`,
    providerType: "Outdoor Media",
    city: "Mumbai",
    channel: "Digital Screen",
    pricingUnit: "per_week",
    price: 120000,
    audience: 850000,
    rating: 4.5,
    description: "Leading OOH media agency specializing in transit and digital billboards.",
    inventoryName: "Bandra Kurla Complex DOOH",
  }
];

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function undo() {
  const c = await pool.connect();
  try {
    await c.query("BEGIN");
    // Every seeded row hangs off an AppUser with a seed-domain email; the
    // schema's ON DELETE CASCADE removes the Provider and its children.
    const r = await c.query(`DELETE FROM "AppUser" WHERE "Email" LIKE $1 RETURNING "UserId"`, [
      `%${SEED_EMAIL_DOMAIN}`,
    ]);
    await c.query("COMMIT");
    console.log(`Removed ${r.rowCount} seeded users and their providers.`);
  } catch (e) {
    await c.query("ROLLBACK");
    throw e;
  } finally {
    c.release();
  }
}

async function seed() {
  const c = await pool.connect();
  try {
    await c.query("BEGIN");

    const one = async (sql: string, params: unknown[] = []) => (await c.query(sql, params)).rows[0];

    const providerRole = await one(`SELECT "RoleId" FROM "Role" WHERE "RoleName" = 'Provider'`);
    if (!providerRole) throw new Error("Role 'Provider' is missing.");

    // Gurgaon is a real market for this data but is absent from the starter
    // Location set, so add it rather than misfiling Cyber Hub under Delhi.
    await c.query(
      `INSERT INTO "Location" ("City","State","Country") VALUES ('Gurgaon','Haryana','India')
       ON CONFLICT ON CONSTRAINT "UQ_Location" DO NOTHING`,
    );

    let created = 0;
    let skipped = 0;

    for (const s of SEEDS) {
      const existing = await one(`SELECT "UserId" FROM "AppUser" WHERE lower("Email") = lower($1)`, [
        s.email,
      ]);
      if (existing) {
        skipped++;
        continue;
      }

      const [firstName, ...rest] = s.name.split(" ");
      const user = await one(
        `INSERT INTO "AppUser" ("FirstName","LastName","Email","IsEmailVerified")
         VALUES ($1,$2,$3,true) RETURNING "UserId"`,
        [firstName, rest.join(" ") || null, s.email],
      );
      await c.query(`INSERT INTO "UserRole" ("UserId","RoleId") VALUES ($1,$2) ON CONFLICT DO NOTHING`, [
        user.UserId,
        providerRole.RoleId,
      ]);

      const type = await one(`SELECT "ProviderTypeId" FROM "ProviderType" WHERE "Name" = $1`, [
        s.providerType,
      ]);
      if (!type) throw new Error(`ProviderType '${s.providerType}' not found.`);

      const loc = s.city
        ? await one(`SELECT "LocationId" FROM "Location" WHERE "City" = $1`, [s.city])
        : null;
      if (s.city && !loc) throw new Error(`Location '${s.city}' not found.`);

      const chan = await one(`SELECT "ChannelId" FROM "AdvertisingChannel" WHERE "ChannelName" = $1`, [
        s.channel,
      ]);
      if (!chan) throw new Error(`AdvertisingChannel '${s.channel}' not found.`);

      const unit = await one(`SELECT "PricingUnitId" FROM "PricingUnit" WHERE "UnitCode" = $1`, [
        s.pricingUnit,
      ]);
      if (!unit) throw new Error(`PricingUnit '${s.pricingUnit}' not found.`);

      const prov = await one(
        `INSERT INTO "Provider" ("UserId","ProviderTypeId","ProviderName","ProviderDescription",
                                 "PrimaryLocationId","Email","Rating","RatingCount","TotalAudience","IsVerified")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,true) RETURNING "ProviderId"`,
        [
          user.UserId,
          type.ProviderTypeId,
          s.name,
          s.description,
          loc?.LocationId ?? null,
          s.email,
          s.rating,
          10,
          s.audience,
        ],
      );

      let providerLocationId: string | null = null;
      if (loc) {
        const pl = await one(
          `INSERT INTO "ProviderLocation" ("ProviderId","LocationId","IsPrimary")
           VALUES ($1,$2,true) RETURNING "ProviderLocationId"`,
          [prov.ProviderId, loc.LocationId],
        );
        providerLocationId = pl.ProviderLocationId;
      }

      await c.query(
        `INSERT INTO "ProviderChannel" ("ProviderId","ChannelId","AudienceSize","IsPrimary")
         VALUES ($1,$2,$3,true)`,
        [prov.ProviderId, chan.ChannelId, s.audience],
      );

      const inv = await one(
        `INSERT INTO "ProviderInventory" ("ProviderId","ChannelId","ProviderLocationId","InventoryName","Description","Status")
         VALUES ($1,$2,$3,$4,$5,'Active') RETURNING "InventoryId"`,
        [prov.ProviderId, chan.ChannelId, providerLocationId, s.inventoryName, s.description],
      );

      await c.query(
        `INSERT INTO "ProviderPricing" ("InventoryId","ProviderId","PricingUnitId","PricingName","UnitPrice","ValidPeriod","IsDefault")
         VALUES ($1,$2,$3,$4,$5,daterange(CURRENT_DATE, NULL, '[)'),true)`,
        [inv.InventoryId, prov.ProviderId, unit.PricingUnitId, s.inventoryName, s.price],
      );

      created++;
    }

    await c.query("COMMIT");
    console.log(`Seeded ${created} providers (${skipped} already present).`);
  } catch (e) {
    await c.query("ROLLBACK");
    throw e;
  } finally {
    c.release();
  }
}

await (process.argv.includes("--undo") ? undo() : seed());
await pool.end();
