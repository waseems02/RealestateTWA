const express = require("express");
const { getSupabaseClient } = require("../services/supabaseClient");
const { demoListings } = require("../utils/demoData");

const router = express.Router();

router.get("/", async (_req, res) => {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return res.json({ mode: "mock", data: demoListings });
  }

  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.warn(`Supabase listings query failed: ${error.message}`);
    return res.json({ mode: "mock", warning: "Supabase query failed", data: demoListings });
  }

  return res.json({ mode: "supabase", data });
});

module.exports = router;
