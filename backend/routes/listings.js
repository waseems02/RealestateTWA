const express = require("express");
const { getListingById, listListings } = require("../services/listingsService");

const router = express.Router();

router.get("/", async (req, res) => {
  const result = await listListings(req.query);
  return res.json(result);
});

router.get("/:id", async (req, res) => {
  const result = await getListingById(req.params.id);

  if (!result.listing) {
    return res.status(404).json({
      success: false,
      source: result.source,
      listing: null,
      message: "Listing not found"
    });
  }

  return res.json(result);
});

module.exports = router;
