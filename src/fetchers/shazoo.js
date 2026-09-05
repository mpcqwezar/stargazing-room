import { createRssFetcher } from './createRssFetcher.js';

function extractImageFromHtml(html) {
  if (!html) return null;
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : null;
}

export const fetchShazooNews = createRssFetcher({
  source: 'Shazoo',
  url: 'https://shazoo.ru/feed/rss',
  mapItem: item => {
    const publishedAt = new Date(item.isoDate || item.pubDate).getTime();
    const html = item['content:encoded'] || item.content || item.description || '';
    const image = extractImageFromHtml(html);
    return {
      title: item.title,
      link: item.link,
      publishedAt,
      source: 'Shazoo',
      image
    };
  }
});
