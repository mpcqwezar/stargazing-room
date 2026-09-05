import { createRssFetcher } from './createRssFetcher.js';

export const fetchStopGameNews = createRssFetcher({
  source: 'StopGame',
  url: 'https://rss.stopgame.ru/rss_news.xml'
});
