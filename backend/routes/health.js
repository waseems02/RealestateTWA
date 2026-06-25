const express = require("express");

const router = express.Router();

router.get("/", (_req, res) => {
  res.json({
    status: "ok",
    project: "RoomieFit",
    railwayProject: "faithful-insight",
    environment: process.env.NODE_ENV || "development",
    railwayEnvironment: process.env.RAILWAY_ENVIRONMENT || "local"
  });
});

module.exports = router;
