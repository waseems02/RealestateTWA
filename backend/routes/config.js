const express = require("express");

const router = express.Router();

/**
 * GET /api/config.js
 *
 * Returns a tiny JS payload that sets window.RoomieFitConfig with the public
 * Supabase credentials the browser needs to instantiate @supabase/supabase-js.
 *
 * Safe to expose: the anon key is a public-by-design key — Supabase RLS
 * policies (set in 0004_adopt_new_schema.sql) are what actually protect rows.
 * The service-role key is NEVER served here.
 *
 * Frontend usage:
 *   <script src="/api/config.js"></script>
 *   then window.RoomieFitConfig.SUPABASE_URL etc.
 */
router.get("/config.js", (_req, res) => {
  const cfg = {
    SUPABASE_URL: process.env.SUPABASE_URL || "",
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || "",
  };
  res.type("application/javascript");
  res.send(`window.RoomieFitConfig = ${JSON.stringify(cfg)};\n`);
});

module.exports = router;
