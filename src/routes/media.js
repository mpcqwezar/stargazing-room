import express from "express";
import { cache } from "../cache/memory.js";

const router = express.Router();

router.get("/media", (req, res) => {
  res.json({
    updatedAt: cache.media.lastUpdated,
    letterboxd: cache.media.letterboxd,
    goodreads: cache.media.goodreads
  });
});

export default router;
