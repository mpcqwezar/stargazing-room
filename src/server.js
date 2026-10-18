import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import { cache } from "./cache/memory.js";
import mediaRoutes from "./routes/media.js";

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

async function updateMedia() {
  const letterboxd = await safe(fetchLetterboxd, "Letterboxd");
  const goodreads = await safe(fetchGoodreads, "Goodreads");

  cache.media.letterboxd = letterboxd.sort((a, b) => b.publishedAt - a.publishedAt);
  cache.media.goodreads = goodreads.sort((a, b) => b.publishedAt - a.publishedAt);
  cache.media.lastUpdated = new Date();
}

await updateMedia();
const TEN_MINUTES = 10 * 60 * 1000;
setInterval(updateMedia, TEN_MINUTES);

app.use("/api", mediaRoutes);
app.use(express.static(path.join(__dirname, "../public")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
