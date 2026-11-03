const test = require('node:test');
const assert = require('node:assert/strict');

const offers = [{ ideaId: 'cafe' }];
function request(body = '{"ideaId":"cafe"}', overrides = {}) {
  return new Request('https://nakahya.example/api/affiliate-clicks', {
    method: 'POST', body,
    headers: { origin: 'https://nakahya.example', 'content-type': 'application/json', ...overrides },
  });
}

test('click measurement is disabled by default and rejects foreign or absent origins', async () => {
  const { validateAffiliateClick } = require('../lib/affiliate-clicks.ts');
  assert.deepEqual(await validateAffiliateClick(request(), offers), { status: 404 });
  assert.deepEqual(await validateAffiliateClick(request(), offers, true), { ideaId: 'cafe' });
  for (const origin of ['', 'https://other.example', 'https://nakahya.example.evil.example']) {
    assert.deepEqual(await validateAffiliateClick(request(undefined, { origin }), offers, true), { status: 403 });
  }
});

test('only a currently approved idea can be measured, without member data or a supplied destination', async () => {
  const { validateAffiliateClick } = require('../lib/affiliate-clicks.ts');
  assert.deepEqual(await validateAffiliateClick(request(), [], true), { status: 404 });
  for (const body of ['null', '[]', '{}', '{', '{"ideaId":1}', '{"ideaId":"unknown"}', '{"ideaId":"cafe","memberId":"private"}', '{"ideaId":"cafe","url":"https://evil.example"}']) {
    const result = await validateAffiliateClick(request(body), offers, true);
    assert.ok('status' in result, body);
  }
});

test('oversized and non-JSON click requests are refused before storage', async () => {
  const { validateAffiliateClick } = require('../lib/affiliate-clicks.ts');
  assert.deepEqual(await validateAffiliateClick(request(' '.repeat(513)), offers, true), { status: 413 });
  assert.deepEqual(await validateAffiliateClick(request(undefined, { 'content-length': '99999' }), offers, true), { status: 413 });
  assert.deepEqual(await validateAffiliateClick(request(undefined, { 'content-type': 'text/plain' }), offers, true), { status: 415 });
});
