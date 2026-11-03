/** Conservative cancellation policy: never select newer runs, forks or production. */
function obsoleteValidationRuns(runs, current) {
  const createdAt = Date.parse(current.createdAt);
  if (!Number.isFinite(createdAt)) throw new Error('Invalid current validation timestamp');
  return runs.filter(run =>
    run.event === 'pull_request' && run.head_branch === current.branch &&
    run.head_repository?.full_name === current.repo && run.head_sha !== current.sha &&
    Date.parse(run.created_at) < createdAt &&
    ['queued', 'in_progress'].includes(run.status) &&
    ['NIKAHYA CI', 'Deploy NIKAHYA to Cloudflare Workers'].includes(run.name)
  );
}
module.exports = { obsoleteValidationRuns };
