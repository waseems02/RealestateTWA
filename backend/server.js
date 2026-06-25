require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const { getSupabaseClient } = require("./services/supabaseClient");

const app = express();
const PORT = process.env.PORT || 3000;
const frontendOutDir = path.join(__dirname, "..", "frontend", "out");

app.use(cors({ origin: true, credentials: false }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    message: "RoomieFit server is running"
  });
});

app.get("/api/listings", async (_req, res) => {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return res.json({
      mode: "missing_supabase_env",
      data: []
    });
  }

  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ mode: "supabase", data });
});

app.use(express.static(frontendOutDir));

app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "API route not found" });
  }

  res.sendFile(path.join(frontendOutDir, "index.html"));
});

app.listen(PORT, () => {
  console.log(`RoomieFit server is running on port ${PORT}`);
});
