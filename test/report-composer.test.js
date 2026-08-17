import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const readText = (path) => readFileSync(path, 'utf8');

test('report composer shows calculation context without returning bodies to Growth Engine', () => {
  const index = readText('index.html');
  const build = readText('scripts/build.mjs');
  const composer = readText('src/report-composer.js');
  const composerStyles = readText('src/report-composer.css');
  const contractStatus = JSON.parse(readText('contracts/status.json'));
  const uiReadiness = JSON.parse(readText('contracts/ui-readiness.json'));

  assert.match(index, /src\/report-composer\.js/);
  assert.match(index, /src\/report-composer\.css/);
  assert.match(build, /src\/report-composer\.js/);
  assert.match(build, /src\/report-composer\.css/);

  assert.match(composer, /function buildAppraisalMaterials/);
  assert.match(composer, /function renderReportComposerMaterials/);
  assert.match(composer, /appraisal-diagram/);
  assert.match(composer, /data-insert-material/);
  assert.match(composer, /Growth Engineへ返すpayloadには含めません/);
  assert.match(composer, /paymentStatus・salesAmount・fullMeetingTranscript/);

  assert.match(composerStyles, /\.report-composer-materials/);
  assert.match(composerStyles, /\.material-grid/);
  assert.match(composerStyles, /\.appraisal-diagram/);

  assert.equal(contractStatus.screenFlow.supportsReportComposerMaterialPanel, true);
  assert.equal(contractStatus.screenFlow.supportsCalculationResultPanel, true);
  assert.equal(contractStatus.screenFlow.supportsAppraisalDiagramPanel, true);
  assert.equal(contractStatus.screenFlow.supportsReportMaterialInsert, true);
  assert.equal(contractStatus.screenFlow.reportComposerKeepsReportBodyLocal, true);
  assert.equal(contractStatus.screenFlow.reportComposerSendsCalculationResultsToGrowthEngine, false);

  assert.equal(uiReadiness.screenFlow.reportComposerShowsCalculationResults, true);
  assert.equal(uiReadiness.screenFlow.reportComposerShowsAppraisalDiagram, true);
  assert.equal(uiReadiness.screenFlow.reportComposerSupportsMaterialInsert, true);
  assert.equal(uiReadiness.dataSafety.reportBodyReturnedToGrowthEngine, false);
  assert.equal(uiReadiness.dataSafety.calculationResultsReturnedToGrowthEngine, false);
  assert.equal(uiReadiness.dataSafety.appraisalDiagramReturnedToGrowthEngine, false);
});
