const express = require("express");

const router = express.Router();

router.get("/", (_req, res) => {
  res.json({
    status: "ok",
    message: "RoomieFit / RealestateTMA server is running",
    environment: process.env.NODE_ENV || "development"
  });
});

module.exports = router;
