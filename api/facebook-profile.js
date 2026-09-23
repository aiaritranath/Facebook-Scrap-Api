// api/facebook-profile.js
// Private API — developed by @its_aritra_nath

/* ------------------------------------------------------------------ */
/*  CONFIG                                                             */
/* ------------------------------------------------------------------ */

const PRIVATE_API_KEY = process.env.PRIVATE_API_KEY || "aritra";

const SERPAPI_KEY =
  process.env.SERPAPI_KEY ||
  "40242a83adc479365210d32cbe4dbc3827c808cf3a5119d36a55cc135031d955";

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
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-key, Authorization");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed. Use GET.",
      ...DEVELOPER,
    });
  }

  // Private key check
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

  const profileId = (req.query && req.query.profile_id) || "serpapicom";

  // ---- Call SerpAPI directly via REST ----
  try {
    const url =
      "https://serpapi.com/search.json" +
      `?engine=facebook_profile` +
      `&profile_id=${encodeURIComponent(profileId)}` +
      `&api_key=${encodeURIComponent(SERPAPI_KEY)}`;

    const serpRes = await fetch(url);
    const data = await serpRes.json();

    if (!serpRes.ok || data.error) {
      return res.status(502).json({
        success: false,
        error: "SerpAPI request failed.",
        details: data.error || `HTTP ${serpRes.status}`,
        ...DEVELOPER,
      });
    }

    const profileResults = data.profile_results || [];

    return res.status(200).json({
      success: true,
      ...DEVELOPER,
      query: { engine: "facebook_profile", profile_id: profileId },
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
