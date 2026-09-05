import { createRssFetcher } from './createRssFetcher.js';

export const fetchUnianNews = createRssFetcher({
  source: 'УНИАН',
  url: 'https://rss.unian.net/site/news_rus.rss'
});
