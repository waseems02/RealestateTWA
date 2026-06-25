require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");

const healthRoutes = require("./routes/health");
const listingsRoutes = require("./routes/listings");
const aiRoutes = require("./routes/ai");
const telegramRoutes = require("./routes/telegram");

const app = express();
const PORT = process.env.PORT || 3000;
const frontendDir = path.join(__dirname, "..", "frontend");

app.use(
  cors({
    origin: process.env.PUBLIC_APP_URL || true,
    credentials: false
  })
);
app.use(express.json({ limit: "1mb" }));

app.use("/api/health", healthRoutes);
app.use("/api/listings", listingsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/telegram", telegramRoutes);

app.use(express.static(frontendDir, { extensions: ["html"] }));

app.get("/", (_req, res) => {
  res.sendFile(path.join(frontendDir, "index.html"));
});

app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "API route not found" });
  }

  return res.sendFile(path.join(frontendDir, "index.html"));
});

app.listen(PORT, () => {
  console.log(`RoomieFit / RealestateTMA server is running on port ${PORT}`);
});
