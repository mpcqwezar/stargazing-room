import test from 'node:test';
import assert from 'node:assert/strict';

import worker from '../worker.js';

const originalFetch = global.fetch;

test('worker keeps Letterboxd entries in /api/media', async () => {
  global.fetch = async (url) => {
    if (String(url).includes('letterboxd.com')) {
      return {
        ok: true,
        status: 200,
        text: async () => `<?xml version="1.0" encoding="UTF-8"?>
          <rss version="2.0">
            <channel><item>
              <title>Test film</title>
              <link>https://example.com/film</link>
              <pubDate>Sun, 06 Sep 2026 19:00:00 +0000</pubDate>
              <description>A watched film</description>
              <letterboxd:filmTitle>Test film</letterboxd:filmTitle>
            </item></channel>
          </rss>`
      };
    }

    return {
      ok: false,
      status: 500,
      text: async () => 'nope'
    };
  };

  try {
    const response = await worker.fetch(
      new Request('http://localhost/api/media', {
        headers: { Origin: 'http://localhost:5173' }
      })
    );
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.ok(body.letterboxd.some((item) => item.source === 'Letterboxd' && item.title === 'Test film'));
    assert.ok(body.letterboxd[0].publishedAt > 0);
  } finally {
    global.fetch = originalFetch;
  }
});
