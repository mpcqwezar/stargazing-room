import { createRssFetcher } from './createRssFetcher.js';
import { extractImage } from './rssClient.js';

export const fetchLetterboxd = createRssFetcher({
  source: 'Letterboxd',
  url: 'https://letterboxd.com/mpcomp/rss/',
  maxAge: 10 * 365 * 24 * 60 * 60 * 1000, // 10 years - show all RSS entries
  mapItem: item => ({
    title: item.title,
    link: item.link,
    publishedAt: new Date(item.isoDate || item.pubDate).getTime(),
    source: 'Letterboxd',
    description: item.contentEncoded || item['content:encoded'] || item.description || '',
    image: extractImage(item),
    // Additional Letterboxd-specific fields
    filmTitle: item['letterboxd:filmTitle'] || item.title,
    filmYear: item['letterboxd:filmYear'],
    watchedDate: item['letterboxd:watchedDate'],
    rewatch: item['letterboxd:rewatch'],
    memberLike: item['letterboxd:memberLike'],
    tmdbMovieId: item['tmdb:movieId'],
    creator: item['dc:creator']
  })
});

