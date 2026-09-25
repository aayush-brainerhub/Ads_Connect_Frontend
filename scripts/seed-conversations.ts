import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function seedConversations() {
  const c = await pool.connect();
  try {
    await c.query("BEGIN");
    
    const one = async (sql: string, params: unknown[] = []) => (await c.query(sql, params)).rows[0];
    const all = async (sql: string, params: unknown[] = []) => (await c.query(sql, params)).rows;

    // 1. Get the current Advertiser (Aayush)
    const adv = await one(`
      SELECT a."AdvertiserId", u."UserId", u."FirstName", u."LastName"
      FROM "Advertiser" a
      JOIN "AppUser" u ON u."UserId" = a."UserId"
      WHERE u."FirstName" ILIKE 'Aayush%'
      LIMIT 1
    `);

    if (!adv) {
      console.log("Could not find Advertiser 'Aayush'.");
      return;
    }

    // 2. Get one of their campaigns
    const campaign = await one(`SELECT "CampaignId" FROM "Campaign" WHERE "AdvertiserId" = $1 LIMIT 1`, [adv.AdvertiserId]);
    if (!campaign) {
      console.log("No campaigns found for the advertiser. Please run db:seed:campaigns first.");
      return;
    }

    // 3. Get two providers we seeded earlier
    const prov1 = await one(`SELECT p."ProviderId", p."UserId", u."FirstName" as "ProviderName", pc."ChannelId" 
      FROM "Provider" p 
      JOIN "AppUser" u ON u."UserId" = p."UserId"
      JOIN "ProviderChannel" pc ON pc."ProviderId" = p."ProviderId" AND pc."IsPrimary" = true
      WHERE u."FirstName" = 'Virat' LIMIT 1`);
      
    const prov2 = await one(`SELECT p."ProviderId", p."UserId", u."FirstName" as "ProviderName", pc."ChannelId"
      FROM "Provider" p 
      JOIN "AppUser" u ON u."UserId" = p."UserId"
      JOIN "ProviderChannel" pc ON pc."ProviderId" = p."ProviderId" AND pc."IsPrimary" = true
      WHERE u."FirstName" = 'CarryMinati' LIMIT 1`);

    if (!prov1 || !prov2) {
       console.log("Could not find seeded providers (Virat or CarryMinati).");
       return;
    }

    // Check if requests already exist
    const exist1 = await one(`SELECT "RequestId" FROM "CampaignProviderRequest" WHERE "ProviderId" = $1 AND "Status" != 'Withdrawn'`, [prov1.ProviderId]);
    if (exist1) {
       console.log("Conversations already seeded. Exiting.");
       return;
    }

    // Function to create a request + conversation
    const seedRequest = async (prov: any, msg1: string, msg2: string) => {
      // Create Requirement
      const req = await one(`
        INSERT INTO "CampaignRequirement" ("CampaignId", "ChannelId", "Title", "Quantity", "Currency", "Specs", "BudgetMin", "BudgetMax", "Status")
        VALUES ($1, $2, 'Standard Integration', 1, 'INR', '{}', $3, $4, 'Open') RETURNING "CampaignRequirementId"
      `, [campaign.CampaignId, prov.ChannelId, 500000, 1000000]);

      // Create Request
      const request = await one(`
        INSERT INTO "CampaignProviderRequest" ("CampaignRequirementId", "CampaignId", "ProviderId", "RequestedBy", "Status", "RequestDate")
        VALUES ($1, $2, $3, $4, 'Pending', CURRENT_DATE) RETURNING "RequestId"
      `, [req.CampaignRequirementId, campaign.CampaignId, prov.ProviderId, adv.UserId]);

      // Create Conversation
      const conv = await one(`
        INSERT INTO "Conversation" ("ContextType", "Subject", "RequestId", "MessageCount", "LastMessageDate")
        VALUES ('Request', $1, $2, 2, CURRENT_TIMESTAMP) RETURNING "ConversationId"
      `, [`Collaboration Inquiry: ${prov.ProviderName}`, request.RequestId]);

      // Create Participants
      await c.query(`
        INSERT INTO "ConversationParticipant" ("ConversationId", "UserId", "JoinedDate", "LastReadSeq")
        VALUES ($1, $2, CURRENT_TIMESTAMP, 0)
      `, [conv.ConversationId, adv.UserId]);
      
      await c.query(`
        INSERT INTO "ConversationParticipant" ("ConversationId", "UserId", "JoinedDate", "LastReadSeq")
        VALUES ($1, $2, CURRENT_TIMESTAMP, 0)
      `, [conv.ConversationId, prov.UserId]);

      // Create Messages
      await c.query(`
        INSERT INTO "Message" ("ConversationId", "SenderId", "MessageType", "MessageText", "Payload", "SentDate")
        VALUES ($1, $2, 'Text', $3, '{}', CURRENT_TIMESTAMP - INTERVAL '1 hour')
      `, [conv.ConversationId, adv.UserId, msg1]);

      await c.query(`
        INSERT INTO "Message" ("ConversationId", "SenderId", "MessageType", "MessageText", "Payload", "SentDate")
        VALUES ($1, $2, 'Text', $3, '{}', CURRENT_TIMESTAMP)
      `, [conv.ConversationId, prov.UserId, msg2]);
    };

    await seedRequest(prov1, 
      "Hi Virat, we'd love to partner with you for our Diwali apparel launch. Would you be interested?",
      "Hey Aayush, thanks for reaching out. Yes, I'm open to discussing this. Let's schedule a call."
    );

    await seedRequest(prov2,
      "Hey Carry, looking to get a sponsored integration in your next gaming video.",
      "Hello! Please send over the brief and we can take it from there."
    );

    await c.query("COMMIT");
    console.log("Successfully seeded conversations.");

  } catch (e) {
    await c.query("ROLLBACK");
    console.error(e);
  } finally {
    c.release();
  }
}

seedConversations().then(() => pool.end());
