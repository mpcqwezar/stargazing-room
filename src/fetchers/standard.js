import { createRssFetcher } from './createRssFetcher.js';
import { extractImage } from './rssClient.js';

export const fetchStandardNews = createRssFetcher({
  source: 'Standard',
  url: 'https://www.standard.co.uk/rss',
  mapItem: item => ({
    title: item.title,
    link: item.link,
    publishedAt: new Date(item.pubDate).getTime(),
    source: 'Standard',
    image: extractImage(item)
  })
});
