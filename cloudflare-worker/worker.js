/**
 * Paste this whole file into Cloudflare Dashboard → Compute → Workers → Create → Edit code.
 * Then Deploy. No CLI / no install on your computer.
 *
 * Endpoints:
 *   GET /api/news
 *   GET /api/media
 */

const DAY = 24 * 60 * 60 * 1000;
const TEN_YEARS = 10 * 365 * DAY;

const NEWS_FEEDS = [
  { source: "Shazoo", url: "https://shazoo.ru/feed/rss" },
  { source: "DTF", url: "https://dtf.ru/rss/" },
  { source: "StopGame", url: "https://rss.stopgame.ru/rss_news.xml" },
  { source: "Wowhead", url: "https://www.wowhead.com/news/rss/retail" },
  { source: "Standard", url: "https://www.standard.co.uk/rss" },
  { source: "Meduza", url: "https://meduza.io/rss/all" },
];

const MEDIA_FEEDS = [
  {
    source: "Letterboxd",
    url: "https://letterboxd.com/mpcomp/rss/",
    maxAge: TEN_YEARS,
    mapItem: (item) => ({
      ...item,
      description: item.description || "",
      filmTitle: item.filmTitle || item.title,
    }),
  },
  {
    source: "Goodreads",
    url: "https://www.goodreads.com/user/updates_rss/34756383?key=xrFk-6j0M2ESeb5WRErqLLv5XTow0nqfc_tmlHLpDO5tvt4Y",
    maxAge: TEN_YEARS,
    mapItem: (item) => ({ ...item, description: item.description || "" }),
  },
];

const ALLOWED_ORIGINS = [
  "https://mpcqwezar.github.io",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
];

export default {
  async fetch(request) {
    const origin = request.headers.get("Origin") || "";
    const cors = corsHeaders(origin);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    const url = new URL(request.url);
    try {
      if (url.pathname === "/api/news") {
        const news = await collectNews();
        return json({ updatedAt: new Date().toISOString(), news }, cors);
      }
      if (url.pathname === "/api/media") {
        const media = await collectMedia();
        return json({ updatedAt: new Date().toISOString(), ...media }, cors);
      }
      return json({ ok: true, endpoints: ["/api/news", "/api/media"] }, cors);
    } catch (error) {
      return json({ error: String(error.message || error) }, cors, 500);
    }
  },
};

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
}

function json(body, cors, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...cors,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

async function collectNews() {
  const batches = await Promise.all(
    NEWS_FEEDS.map((feed) =>
      safeFetchFeed(feed).catch(() => [])
    )
  );
  return batches.flat().sort((a, b) => b.publishedAt - a.publishedAt);
}

async function collectMedia() {
  const [letterboxd, goodreads] = await Promise.all(
    MEDIA_FEEDS.map((feed) => safeFetchFeed(feed).catch(() => []))
  );
  return {
    letterboxd: letterboxd.sort((a, b) => b.publishedAt - a.publishedAt),
    goodreads: goodreads.sort((a, b) => b.publishedAt - a.publishedAt),
  };
}

async function safeFetchFeed(feed) {
  const res = await fetch(feed.url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; StargazingRoom/1.0)",
      Accept: "application/rss+xml, application/xml, text/xml, */*",
    },
  });
  if (!res.ok) throw new Error(`${feed.source}: HTTP ${res.status}`);
  const xml = await res.text();
  const maxAge = feed.maxAge ?? DAY;
  const now = Date.now();
  const items = parseRssItems(xml)
    .map((raw) => {
      const base = {
        title: raw.title,
        link: raw.link,
        publishedAt: Date.parse(raw.pubDate || ""),
        source: feed.source,
        image: raw.image,
        description: raw.description,
        filmTitle: raw.filmTitle,
        filmYear: raw.filmYear,
        watchedDate: raw.watchedDate,
        rewatch: raw.rewatch,
        memberLike: raw.memberLike,
        tmdbMovieId: raw.tmdbMovieId,
        creator: raw.creator,
      };
      return feed.mapItem ? feed.mapItem(base) : base;
    })
    .filter((n) => !Number.isNaN(n.publishedAt) && now - n.publishedAt <= maxAge);
  return items;
}

function parseRssItems(xml) {
  const items = [];
  const containerRe = /<(item|entry)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let match;
  while ((match = containerRe.exec(xml))) {
    const block = match[2];
    const title = textTag(block, "title");
    const link = textTag(block, "link") || attrTag(block, "link", "href");
    const pubDate =
      textTag(block, "pubDate") ||
      textTag(block, "published") ||
      textTag(block, "updated") ||
      textTag(block, "dc:date");
    const description =
      textTag(block, "content:encoded") ||
      textTag(block, "content") ||
      textTag(block, "summary") ||
      textTag(block, "description") ||
      "";
    const image =
      mediaImage(block) ||
      firstImgSrc(description) ||
      enclosureUrl(block);

    items.push({
      title: decodeXml(title),
      link: decodeXml(link),
      pubDate,
      description: decodeXml(description),
      image,
      filmTitle: textTag(block, "letterboxd:filmTitle"),
      filmYear: textTag(block, "letterboxd:filmYear"),
      watchedDate: textTag(block, "letterboxd:watchedDate"),
      rewatch: textTag(block, "letterboxd:rewatch"),
      memberLike: textTag(block, "letterboxd:memberLike"),
      tmdbMovieId: textTag(block, "tmdb:movieId"),
      creator: textTag(block, "dc:creator"),
    });
  }
  return items;
}

function textTag(block, name) {
  const re = new RegExp(
    `<${escapeRe(name)}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escapeRe(name)}>`,
    "i"
  );
  const m = block.match(re);
  if (!m) return null;
  return stripCdata(m[1]).trim();
}

function attrTag(block, name, attr) {
  const re = new RegExp(
    `<${escapeRe(name)}[^>]*\\s${escapeRe(attr)}=["']([^"']+)["'][^>]*/?>`,
    "i"
  );
  const m = block.match(re);
  return m ? m[1].trim() : null;
}

function mediaImage(block) {
  const re = /<media:content\b[^>]*\burl=["']([^"']+)["'][^>]*>/gi;
  let m;
  while ((m = re.exec(block))) {
    const tag = m[0];
    if (/medium=["']image["']/i.test(tag) || /\.(jpe?g|png|webp|gif)(\?|$)/i.test(m[1])) {
      return m[1];
    }
  }
  const thumb = block.match(/<media:thumbnail\b[^>]*\burl=["']([^"']+)["']/i);
  return thumb ? thumb[1] : null;
}

function enclosureUrl(block) {
  const m = block.match(/<enclosure\b[^>]*\burl=["']([^"']+)["'][^>]*>/i);
  return m ? m[1] : null;
}

function firstImgSrc(html) {
  if (!html) return null;
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : null;
}

function stripCdata(value) {
  return value.replace(/^<!\[CDATA\[([\s\S]*?)\]\]>$/i, "$1");
}

function decodeXml(value) {
  if (!value) return value;
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
