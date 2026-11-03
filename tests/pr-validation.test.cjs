const test = require('node:test');
const assert = require('node:assert/strict');

test('only older validations of this repository PR branch can be cancelled', () => {
  const { obsoleteValidationRuns } = require('../scripts/pr-validation.cjs');
  const current = { repo: 'owner/repo', branch: 'feat/domain', sha: 'current', createdAt: '2026-11-03T11:00:00Z' };
  const old = { id: 1, name: 'NIKAHYA CI', event: 'pull_request', head_branch: current.branch, head_repository: { full_name: current.repo }, head_sha: 'old', status: 'in_progress', created_at: '2026-11-03T10:00:00Z' };
  const candidates = [old,
    { ...old, id: 2, event: 'push' }, { ...old, id: 3, head_sha: 'current' },
    { ...old, id: 4, created_at: '2026-11-03T12:00:00Z' }, { ...old, id: 5, head_branch: 'main' },
    { ...old, id: 6, head_repository: { full_name: 'fork/repo' } }, { ...old, id: 7, name: 'Production Smoke' },
    { ...old, id: 8, status: 'completed' }, { ...old, id: 9, created_at: 'invalid' },
    { ...old, id: 10, created_at: current.createdAt },
  ];
  assert.deepEqual(obsoleteValidationRuns(candidates, current).map(run => run.id), [1]);
});
