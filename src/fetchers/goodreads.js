import { createRssFetcher } from './createRssFetcher.js';
import { extractImage } from './rssClient.js';

export const fetchGoodreads = createRssFetcher({
  source: 'Goodreads',
  url: 'https://www.goodreads.com/user/updates_rss/34756383?key=xrFk-6j0M2ESeb5WRErqLLv5XTow0nqfc_tmlHLpDO5tvt4Y',
  maxAge: 10 * 365 * 24 * 60 * 60 * 1000, // 10 years - show all RSS entries
  mapItem: item => ({
    title: item.title,
    link: item.link,
    publishedAt: new Date(item.isoDate || item.pubDate).getTime(),
    source: 'Goodreads',
    description: item.contentEncoded || item['content:encoded'] || item.description || '',
    image: extractImage(item),
    // Goodreads items contain the full HTML of the activity
    creator: item['dc:creator']
  })
});
