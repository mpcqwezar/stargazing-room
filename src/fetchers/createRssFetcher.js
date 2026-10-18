import { fetchRss } from "./rssClient.js";

export function createRssFetcher({ url, maxAge, mapItem }) {
  return async function fetchItems() {
    const feed = await fetchRss(url);
    const cutoff = Date.now() - maxAge;

    return feed.items
      .map(mapItem)
      .filter(item => item.publishedAt >= cutoff);
  };
}
