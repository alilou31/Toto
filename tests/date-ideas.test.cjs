const test = require('node:test');
const assert = require('node:assert/strict');

test('first dates suggest simple local outings without inferring profile preferences', () => {
  const { recommendedIdeaIds } = require('../lib/date-ideas.ts');
  assert.deepEqual(recommendedIdeaIds('first'), ['cafe', 'walk']);
});

test('shared activities exclude dinners and travel; unknown contexts retain the catalogue', () => {
  const { recommendedIdeaIds } = require('../lib/date-ideas.ts');
  assert.deepEqual(recommendedIdeaIds('shared'), ['culture', 'activity', 'walk']);
  assert.deepEqual(recommendedIdeaIds('all'), ['cafe', 'dinner', 'culture', 'activity', 'walk', 'getaway']);
  assert.deepEqual(recommendedIdeaIds('unknown'), recommendedIdeaIds('all'));
});
