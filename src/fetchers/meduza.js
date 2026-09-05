import { createRssFetcher } from './createRssFetcher.js';

export const fetchMeduzaNews = createRssFetcher({
  source: 'Meduza',
  url: 'https://meduza.io/rss/all'
});
