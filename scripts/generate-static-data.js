import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { fetchGoodreads } from "../src/fetchers/goodreads.js";
import { fetchLetterboxd } from "../src/fetchers/letterboxd.js";

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

const letterboxd = (await safe(fetchLetterboxd, "Letterboxd"))
  .sort((a, b) => b.publishedAt - a.publishedAt);
const goodreads = (await safe(fetchGoodreads, "Goodreads"))
  .sort((a, b) => b.publishedAt - a.publishedAt);
const updatedAt = new Date().toISOString();

await mkdir(outputDirectory, { recursive: true });
await writeFile(
  path.join(outputDirectory, "media.json"),
  JSON.stringify({ updatedAt, letterboxd, goodreads })
);

console.log(`Static data written to ${outputDirectory}`);
