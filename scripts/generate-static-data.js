import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { fetchDtfNews } from "../src/fetchers/dtf.js";
import { fetchGoodreads } from "../src/fetchers/goodreads.js";
import { fetchLetterboxd } from "../src/fetchers/letterboxd.js";
import { fetchMeduzaNews } from "../src/fetchers/meduza.js";
import { fetchShazooNews } from "../src/fetchers/shazoo.js";
import { fetchStandardNews } from "../src/fetchers/standard.js";
import { fetchStopGameNews } from "../src/fetchers/stopgame.js";
import { fetchWowheadNews } from "../src/fetchers/wowhead.js";

const outputDirectory = path.resolve("client/public/data");

async function safe(fetcher, name) {
  try {
    const data = await fetcher();
    console.log(`[OK] ${name}: ${data.length}`);
    return data;
  } catch (error) {
    console.warn(`[WARN] ${name}: ${error.message}`);
    return [];
  }
}

const news = [
  ...(await safe(fetchShazooNews, "Shazoo")),
  ...(await safe(fetchDtfNews, "DTF")),
  ...(await safe(fetchStopGameNews, "StopGame")),
  ...(await safe(fetchWowheadNews, "Wowhead")),
  ...(await safe(fetchStandardNews, "Standard")),
  ...(await safe(fetchMeduzaNews, "Meduza"))
].sort((a, b) => b.publishedAt - a.publishedAt);

const letterboxd = (await safe(fetchLetterboxd, "Letterboxd"))
  .sort((a, b) => b.publishedAt - a.publishedAt);
const goodreads = (await safe(fetchGoodreads, "Goodreads"))
  .sort((a, b) => b.publishedAt - a.publishedAt);
const updatedAt = new Date().toISOString();

await mkdir(outputDirectory, { recursive: true });
await Promise.all([
  writeFile(
    path.join(outputDirectory, "news.json"),
    JSON.stringify({ updatedAt, news })
  ),
  writeFile(
    path.join(outputDirectory, "media.json"),
    JSON.stringify({ updatedAt, letterboxd, goodreads })
  )
]);

console.log(`Static data written to ${outputDirectory}`);
