const test = require("node:test");
const assert = require("node:assert/strict");
const { mkdtempSync, writeFileSync, chmodSync, readFileSync, rmSync } = require("node:fs");
const { tmpdir } = require("node:os");
const { join, resolve } = require("node:path");
const { spawnSync } = require("node:child_process");

const script = resolve(__dirname, "../scripts/ci-install.sh");

function fakeInstall(mode) {
  const dir = mkdtempSync(join(tmpdir(), "nikahya-npm-retry-"));
  const npm = join(dir, "npm");
  const counter = join(dir, "attempts");
  writeFileSync(npm, [
    "#!/usr/bin/env bash",
    "set -euo pipefail",
    'echo x >> "$CI_FAKE_NPM_COUNTER"',
    'if [[ "$CI_FAKE_NPM_MODE" == "permanent" ]]; then echo "npm error code ERESOLVE" >&2; exit 1; fi',
    'if [[ "$CI_FAKE_NPM_MODE" == "transient" ]] && [[ $(wc -l < "$CI_FAKE_NPM_COUNTER") -eq 1 ]]; then echo "npm error code EIDLETIMEOUT" >&2; exit 1; fi',
    "exit 0",
  ].join("\n") + "\n");
  chmodSync(npm, 0o755);
  try {
    const run = spawnSync("bash", [script], {
      encoding: "utf8", timeout: 10000,
      env: { ...process.env, PATH: dir + ":" + process.env.PATH, CI_FAKE_NPM_COUNTER: counter,
        CI_FAKE_NPM_MODE: mode, CI_NPM_RETRY_DELAY_SECONDS: "0" },
    });
    assert.equal(run.error, undefined, String(run.error));
    return { status: run.status, calls: readFileSync(counter, "utf8").trim().split("\n").length, output: run.stdout + run.stderr };
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

test("successful npm installation runs once", () => {
  const result = fakeInstall("success");
  assert.equal(result.status, 0);
  assert.equal(result.calls, 1);
});

test("transient npm EIDLETIMEOUT is retried and recovered", () => {
  const result = fakeInstall("transient");
  assert.equal(result.status, 0);
  assert.equal(result.calls, 2);
});

test("non-network npm errors fail immediately without retries", () => {
  const result = fakeInstall("permanent");
  assert.equal(result.status, 1);
  assert.equal(result.calls, 1);
  assert.match(result.output, /not retrying/);
});
