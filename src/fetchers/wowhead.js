import { createRssFetcher } from './createRssFetcher.js';
import { extractImage } from './rssClient.js';

export const fetchWowheadNews = createRssFetcher({
  source: 'Wowhead',
  url: 'https://www.wowhead.com/news/rss/retail',
  mapItem: item => ({
    title: item.title,
    link: item.link,
    publishedAt: new Date(item.pubDate).getTime(),
    source: 'Wowhead',
    image: extractImage(item)
  })
});
