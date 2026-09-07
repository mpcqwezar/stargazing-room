import test from 'node:test';
import assert from 'node:assert/strict';

import worker from '../../../cloudflare-worker/worker.js';

const originalFetch = global.fetch;

test('worker keeps Shazoo Atom entries in /api/news', async () => {
  global.fetch = async (url) => {
    if (String(url).includes('shazoo.ru')) {
      return {
        ok: true,
        status: 200,
        text: async () => `<?xml version="1.0" encoding="UTF-8"?>
          <feed xmlns="http://www.w3.org/2005/Atom">
            <entry>
              <title>Test entry</title>
              <link href="https://example.com/post" rel="alternate" />
              <id>test-1</id>
              <published>2026-09-06T19:00:00+00:00</published>
              <content type="html"><![CDATA[<img src="https://example.com/image.jpg" />]]></content>
            </entry>
          </feed>`
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
      new Request('http://localhost/api/news', {
        headers: { Origin: 'http://localhost:5173' }
      })
    );
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.ok(body.news.some((n) => n.source === 'Shazoo' && n.title === 'Test entry'));
    assert.ok(body.news[0].publishedAt > 0);
  } finally {
    global.fetch = originalFetch;
  }
});
