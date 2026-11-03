const test = require('node:test');
const assert = require('node:assert/strict');

test('production always uses the official origin, even with a stale build variable', () => {
  const { getSiteUrl } = require('../lib/site-origin.ts');
  for (const value of [undefined, '', 'https://nikahya.rassoul-ali.workers.dev', 'https://www.nakahya.com', 'javascript:alert(1)']) {
    assert.equal(getSiteUrl({ NODE_ENV: 'production', NEXT_PUBLIC_SITE_URL: value }), 'https://nakahya.com');
  }
});

test('local development origins remain available without accepting unsafe URLs', () => {
  const { getSiteUrl } = require('../lib/site-origin.ts');
  assert.equal(getSiteUrl({ NEXT_PUBLIC_SITE_URL: 'http://localhost:3000/' }), 'http://localhost:3000');
  assert.equal(getSiteUrl({ NEXT_PUBLIC_SITE_URL: 'http://127.0.0.1:8771' }), 'http://127.0.0.1:8771');
  for (const value of ['http://evil.example', 'https://user:pass@evil.example', 'https://nakahya.com/path', 'not a URL']) {
    assert.equal(getSiteUrl({ NEXT_PUBLIC_SITE_URL: value }), 'https://nakahya.com');
  }
});

test('canonical redirects preserve paths and queries without redirecting legacy API writes', () => {
  const { canonicalRedirect } = require('../lib/site-origin.ts');
  assert.equal(canonicalRedirect('https://nikahya.rassoul-ali.workers.dev/bons-plans?source=test'), 'https://nakahya.com/bons-plans?source=test');
  assert.equal(canonicalRedirect('https://www.nakahya.com/demo'), 'https://nakahya.com/demo');
  assert.equal(canonicalRedirect('http://nakahya.com/demo'), 'https://nakahya.com/demo');
  assert.equal(canonicalRedirect('http://nakahya.com/api/auth/login', 'POST'), 'https://nakahya.com/api/auth/login');
  for (const path of ['/api/auth/oauth/callback?code=fixture', '/api/webhooks/stripe-identity', '/api/newsletter/confirm?token=fixture']) {
    assert.equal(canonicalRedirect('https://nikahya.rassoul-ali.workers.dev' + path), null);
    assert.equal(canonicalRedirect('https://nikahya.rassoul-ali.workers.dev' + path, 'POST'), null);
  }
  for (const url of ['https://nakahya.com/demo', 'http://127.0.0.1:3000/demo', 'https://other.example/demo']) {
    assert.equal(canonicalRedirect(url), null);
  }
});

test('private routes retain noindex without hiding public editorial content', () => {
  const { privatePath } = require('../lib/site-origin.ts');
  assert.equal(privatePath('/decouvrir/immersif'), true);
  assert.equal(privatePath('/messages/123'), true);
  assert.equal(privatePath('/sorties'), true);
  assert.equal(privatePath('/api/auth/me'), true);
  assert.equal(privatePath('/bons-plans'), false);
  assert.equal(privatePath('/demo'), false);
});

test('Wrangler binds the official domain to the same Worker', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../wrangler.jsonc'), 'utf8'));
  assert.equal(config.name, 'nikahya');
  assert.equal(config.workers_dev, true);
  assert.ok(config.routes.some(route => route.pattern === 'nakahya.com' && route.custom_domain === true));
});
