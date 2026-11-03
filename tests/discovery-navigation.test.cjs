const test = require('node:test');
const assert = require('node:assert/strict');

test('discovery position accepts only bounded integers', () => {
  const { discoveryPosition } = require('../lib/discovery-navigation.ts');
  assert.equal(discoveryPosition('1'), 1);
  assert.equal(discoveryPosition('49'), 49);
  for (const value of [null, '-1', '50', '1.5', 'Infinity', 'https://evil.example', '999999999999999999']) {
    assert.equal(discoveryPosition(value), 0);
  }
});

test('member return links are restricted to internal discovery routes', () => {
  const { discoveryReturnHref } = require('../lib/discovery-navigation.ts');
  assert.equal(discoveryReturnHref('?retour=immersif&position=1'), '/decouvrir/immersif?position=1');
  assert.equal(discoveryReturnHref('?retour=immersif&position=-1'), '/decouvrir/immersif?position=0');
  assert.equal(discoveryReturnHref('?retour=https://evil.example'), '/decouvrir');
  assert.equal(discoveryReturnHref(''), '/decouvrir');
});

test('invalid photo sources use a placeholder rather than breaking the page', () => {
  const { discoveryPhotoSrc } = require('../lib/discovery-navigation.ts');
  assert.equal(discoveryPhotoSrc('https://photos.example/a.jpg'), 'https://photos.example/a.jpg');
  assert.equal(discoveryPhotoSrc('/photos/a.jpg'), '/photos/a.jpg');
  for (const value of [null, '', 'not a URL', 'javascript:alert(1)', '//other.example/photo', 'https://user:pass@photos.example/a.jpg']) {
    assert.equal(discoveryPhotoSrc(value), null);
  }
});
