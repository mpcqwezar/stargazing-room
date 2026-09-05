import express from "express";
import { cache } from "../cache/memory.js";

const router = express.Router();

router.get("/news", (req, res) => {
  res.json({
    updatedAt: cache.lastUpdated,
    news: cache.news
  });
});

export default router;
