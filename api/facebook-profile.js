// api/facebook-profile.js
// Private API — developed by @its_aritra_nath
const serpapi = require("serpapi");

/* ------------------------------------------------------------------ */
/*  CONFIG                                                             */
/* ------------------------------------------------------------------ */

// The private key that protects THIS api (value = "aritra")
const PRIVATE_API_KEY = "aritra";

// Your SerpAPI key. Prefer setting SERPAPI_KEY in Vercel env vars.
const SERPAPI_KEY =
  process.env.SERPAPI_KEY ||
  "40242a83adc479365210d32cbe4dbc3827c808cf3a5119d36a55cc135031d955";

// Developer credit (always injected into every response)
const DEVELOPER = {
  developed_by: "@its_aritra_nath",
  developer_name: "Aritra Nath",
  instagram: "https://instagram.com/its_aritra_nath",
  api_name: "Facebook Profile API",
  version: "1.0.0",
};

/* ------------------------------------------------------------------ */
/*  HANDLER                                                            */
/* ------------------------------------------------------------------ */

module.exports = async (req, res) => {
  // ---- CORS so it is callable from any browser ----
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-key, Authorization");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed. Use GET.",
      ...DEVELOPER,
    });
  }

  // ---- Private key check ----
  const providedKey =
    req.headers["x-api-key"] ||
    (req.headers.authorization || "").replace(/^Bearer\s+/i, "") ||
    (req.query && req.query.key);

  if (!providedKey || providedKey !== PRIVATE_API_KEY) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized: invalid or missing private API key.",
      hint: "Pass it as ?key=aritra or header x-api-key: aritra",
      ...DEVELOPER,
    });
  }

  // ---- Input ----
  const profileId = (req.query && req.query.profile_id) || "serpapicom";

  // ---- Call SerpAPI ----
  try {
    const client = new serpapi.Client({ api_key: SERPAPI_KEY });

    const results = await client.search({
      engine: "facebook_profile",
      profile_id: profileId,
    });

    const profileResults = results["profile_results"] || results.profile_results || [];

    return res.status(200).json({
      success: true,
      ...DEVELOPER,
      query: {
        engine: "facebook_profile",
        profile_id: profileId,
      },
      count: Array.isArray(profileResults) ? profileResults.length : 0,
      fetched_at: new Date().toISOString(),
      profile_results: profileResults,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Failed to fetch profile results.",
      details: err && err.message ? err.message : String(err),
      ...DEVELOPER,
    });
  }
};