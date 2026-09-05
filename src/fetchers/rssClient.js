import Parser from "rss-parser";

const parser = new Parser({
  customFields: {
    item: [
      ["content:encoded", "contentEncoded"],
      ["description", "description"],
      ["media:content", "mediaContent", { keepArray: true }],
      // Letterboxd fields
      ["letterboxd:watchedDate", "letterboxd:watchedDate"],
      ["letterboxd:rewatch", "letterboxd:rewatch"],
      ["letterboxd:filmTitle", "letterboxd:filmTitle"],
      ["letterboxd:filmYear", "letterboxd:filmYear"],
      ["letterboxd:memberLike", "letterboxd:memberLike"],
      // TMDB field
      ["tmdb:movieId", "tmdb:movieId"],
      // Dublin Core creator
      ["dc:creator", "dc:creator"]
    ]
  }
});

export async function fetchRss(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) NewsAggregator/1.0"
    }
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const xml = await res.text();
  return parser.parseString(xml);
}

export function extractImage(item) {
  // 1. media:content (Wowhead, Standard)
  if (item.mediaContent?.length) {
    const img = item.mediaContent.find(m => m.medium === "image");
    if (img?.url) return img.url;
  }

  // 2. content:encoded (Shazoo)
  const html = item.contentEncoded || item.description || "";
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (match) return match[1];

  // 3. enclosure fallback
  if (item.enclosure?.url) return item.enclosure.url;

  return null;
}
