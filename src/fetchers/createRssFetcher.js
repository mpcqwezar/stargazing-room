import { fetchRss } from './rssClient.js';

const DEFAULT_DAY = 24 * 60 * 60 * 1000;

export function createRssFetcher({ source, url, maxAge = DEFAULT_DAY, mapItem }) {
  const mapper =
    mapItem ||
    (item => ({
      title: item.title,
      link: item.link,
      publishedAt: new Date(item.isoDate || item.pubDate).getTime(),
      source,
      image: item.enclosure?.url || null
    }));

  return async function fetcher() {
    const feed = await fetchRss(url);
    const now = Date.now();
    return (feed.items || [])
      .map(mapper)
      .filter(n => !isNaN(n.publishedAt) && now - n.publishedAt <= maxAge);
  };
}
