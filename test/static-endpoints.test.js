import assert from 'node:assert/strict';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { test } from 'node:test';
import { execFileSync } from 'node:child_process';

test('static build publishes health, version, and contracts status endpoints', () => {
  rmSync('dist', { recursive: true, force: true });
  execFileSync('node', ['scripts/build.mjs'], { stdio: 'pipe' });

  for (const file of ['dist/health', 'dist/version', 'dist/contracts/status', 'dist/contracts/status.json']) {
    assert.equal(existsSync(file), true, `${file} should exist`);
  }

  const health = JSON.parse(readFileSync('dist/health', 'utf8'));
  assert.equal(health.appName, 'numeria-studio');
  assert.equal(health.status, 'ok');
  assert.match(health.timestamp, /^\d{4}-\d{2}-\d{2}T/);

  const version = JSON.parse(readFileSync('dist/version', 'utf8'));
  assert.equal(version.appName, 'numeria-studio');
  assert.equal(version.appVersion, '0.1.0');
  assert.equal(version.contractVersion, '0.1.0');
  assert.match(version.timestamp, /^\d{4}-\d{2}-\d{2}T/);

  const contractsStatus = JSON.parse(readFileSync('dist/contracts/status', 'utf8'));
  assert.equal(contractsStatus.appName, 'numeria-studio');
  assert.equal(contractsStatus.status, 'success');
  assert.equal(contractsStatus.professionalIdRequired, false);
  assert.equal(contractsStatus.usesLegacyEventNames, false);
  assert.equal(contractsStatus.usesReportTerminology, true);
});
