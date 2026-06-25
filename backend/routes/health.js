const express = require("express");

const router = express.Router();

router.get("/", (_req, res) => {
  res.json({
    status: "ok",
    message: "RoomieFit server is running on Railway",
    railwayProject: "faithful-insight",
    environment: process.env.NODE_ENV || "development"
  });
});

module.exports = router;
