import { createRssFetcher } from './createRssFetcher.js';

export const fetchDtfNews = createRssFetcher({
  source: 'DTF',
  url: 'https://dtf.ru/rss/'
});
