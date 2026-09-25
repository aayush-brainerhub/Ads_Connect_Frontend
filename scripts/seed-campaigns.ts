import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function seedCampaigns() {
  const c = await pool.connect();
  try {
    await c.query("BEGIN");
    
    const one = async (sql: string, params: unknown[] = []) => (await c.query(sql, params)).rows[0];
    const all = async (sql: string, params: unknown[] = []) => (await c.query(sql, params)).rows;

    // Find a user named Aayush Chauhan (Advertiser)
    let advertiserRow = await one(`
      SELECT a."AdvertiserId" 
      FROM "Advertiser" a
      JOIN "AppUser" u ON u."UserId" = a."UserId"
      WHERE u."FirstName" ILIKE 'Aayush%'
      LIMIT 1
    `);

    if (!advertiserRow) {
      console.log("Could not find an Advertiser named 'Aayush'. Picking the first available advertiser.");
      advertiserRow = await one(`SELECT "AdvertiserId" FROM "Advertiser" LIMIT 1`);
    }

    if (!advertiserRow) {
      console.log("No advertisers found in the database. Exiting.");
      return;
    }
    const advertiserId = advertiserRow.AdvertiserId;

    // Try to get a valid objective
    const constraints = await all(`
      SELECT pg_get_constraintdef(c.oid) as def
      FROM pg_constraint c
      JOIN pg_class t ON c.conrelid = t.oid
      WHERE t.relname = 'Campaign' AND c.conname = 'CK_Campaign_Objective'
    `);
    
    // Default valid objectives if constraint not found
    let validObjectives = ["Awareness", "Consideration", "Conversion"];
    if (constraints.length > 0) {
       const def = constraints[0].def;
       console.log("Objective Constraint:", def);
       const match = def.match(/'([^']+)'/g);
       if (match) {
         validObjectives = match.map((m: string) => m.replace(/'/g, ''));
       }
    }
    console.log("Valid objectives:", validObjectives);
    
    // Choose one of the valid objectives
    const obj1 = validObjectives.includes("Brand Awareness") ? "Brand Awareness" : validObjectives[0];
    const obj2 = validObjectives.includes("Lead Generation") ? "Lead Generation" : validObjectives[0];
    const obj3 = validObjectives.includes("App Installs") ? "App Installs" : validObjectives[0];

    const industry = await one(`SELECT "IndustryId" FROM "Industry" LIMIT 1`);
    const indId = industry ? industry.IndustryId : null;

    const campaigns = [
      {
        name: "Diwali Fest: Youth Apparel Launch",
        description: "Looking for top fashion influencers to promote our upcoming ethnic wear collection for Diwali. Seeking engaging Reels and Story highlights.",
        objective: obj1,
        budget: 500000,
        currency: "INR",
        targetAudience: JSON.stringify({ demographics: ["Gen Z", "Millennials (18-35)"], interests: ["fashion", "ethnic wear", "festive shopping"] }),
        status: "Active"
      },
      {
        name: "FinTech App Install Drive",
        description: "Campaign to drive mobile app installs for our new expense tracking app. We want tech reviewers and personal finance creators.",
        objective: obj3,
        budget: 1200000,
        currency: "INR",
        targetAudience: JSON.stringify({ demographics: ["Working professionals (22-45)"], interests: ["tech-savvy", "financial planning tools"] }),
        status: "Draft"
      },
      {
        name: "B2B SaaS Lead Generation",
        description: "Promoting our new CRM tool through newsletter sponsorships and LinkedIn thought leaders.",
        objective: obj2,
        budget: 200000,
        currency: "INR",
        targetAudience: JSON.stringify({ demographics: ["Small business owners", "sales managers", "startup founders"] }),
        status: "Active"
      }
    ];

    let count = 0;
    for (const cmp of campaigns) {
      // Check if it already exists
      const existing = await one(`SELECT "CampaignId" FROM "Campaign" WHERE "CampaignName" = $1 AND "AdvertiserId" = $2`, [cmp.name, advertiserId]);
      if (!existing) {
        await c.query(`
          INSERT INTO "Campaign" (
            "AdvertiserId", "CampaignName", "Description", "IndustryId", 
            "Objective", "Budget", "Currency", "TargetAudience", "Status",
            "StartDate", "EndDate"
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days'
          )
        `, [advertiserId, cmp.name, cmp.description, indId, cmp.objective, cmp.budget, cmp.currency, cmp.targetAudience, cmp.status]);
        count++;
      }
    }
    
    await c.query("COMMIT");
    console.log(`Successfully seeded ${count} campaigns for Advertiser.`);

  } catch (e) {
    await c.query("ROLLBACK");
    console.error(e);
  } finally {
    c.release();
  }
}

seedCampaigns().then(() => pool.end());
