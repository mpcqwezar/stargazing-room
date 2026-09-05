import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import { cache } from "./cache/memory.js";
import newsRoutes from "./routes/news.js";
import mediaRoutes from "./routes/media.js";

import { fetchShazooNews } from "./fetchers/shazoo.js";
import { fetchDtfNews } from "./fetchers/dtf.js";
import { fetchStopGameNews } from "./fetchers/stopgame.js";
import { fetchWowheadNews } from "./fetchers/wowhead.js";
import { fetchStandardNews } from "./fetchers/standard.js";
import { fetchMeduzaNews } from "./fetchers/meduza.js";
import { fetchLetterboxd } from "./fetchers/letterboxd.js";
import { fetchGoodreads } from "./fetchers/goodreads.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

async function safe(fn, name) {
  try {
    const data = await fn();
    console.log(`[OK] ${name}: ${data.length}`);
    return data;
  } catch (e) {
    console.warn(`[WARN] ${name}: ${e.message}`);
    return [];
  }
}

async function updateNews() {
  const all = [
    ...(await safe(fetchShazooNews, "Shazoo")),
    ...(await safe(fetchDtfNews, "DTF")),
    ...(await safe(fetchStopGameNews, "StopGame")),
    ...(await safe(fetchWowheadNews, "Wowhead")),
    ...(await safe(fetchStandardNews, "Standard")),
    ...(await safe(fetchMeduzaNews, "Meduza"))
  ];

  cache.news = all.sort((a, b) => b.publishedAt - a.publishedAt);
  cache.lastUpdated = new Date();
}

async function updateMedia() {
  const letterboxd = await safe(fetchLetterboxd, "Letterboxd");
  const goodreads = await safe(fetchGoodreads, "Goodreads");

  cache.media.letterboxd = letterboxd.sort((a, b) => b.publishedAt - a.publishedAt);
  cache.media.goodreads = goodreads.sort((a, b) => b.publishedAt - a.publishedAt);
  cache.media.lastUpdated = new Date();
}

await updateNews();
await updateMedia();
// refresh every 10 minutes instead of 1 minute
const TEN_MINUTES = 10 * 60 * 1000;
setInterval(updateNews, TEN_MINUTES);
setInterval(updateMedia, TEN_MINUTES);

app.use("/api", newsRoutes);
app.use("/api", mediaRoutes);
app.use(express.static(path.join(__dirname, "../public")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
