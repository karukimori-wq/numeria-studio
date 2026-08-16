import assert from 'node:assert/strict';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { test } from 'node:test';
import { execFileSync } from 'node:child_process';

test('static build publishes health, version, and contracts status endpoints', () => {
  rmSync('dist', { recursive: true, force: true });
  execFileSync('node', ['scripts/build.mjs'], { stdio: 'pipe' });

  for (const file of [
    'dist/health',
    'dist/version',
    'dist/contracts/status',
    'dist/contracts/status.json',
    'dist/contracts/production-flow-result',
    'dist/contracts/production-flow-result.json',
    'dist/contracts/data-boundaries',
    'dist/contracts/data-boundaries.json',
    'dist/contracts/operational-manifest',
    'dist/contracts/operational-manifest.json',
    'dist/contracts/ui-readiness',
    'dist/contracts/ui-readiness.json',
    'dist/src/reference-safety.js',
    'dist/src/contract-links.js',
    'dist/app/growth/start/index.html',
    'dist/app/sessions/sample/index.html',
  ]) {
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
  assert.equal(contractsStatus.screenFlow.growthEngineStartEntryPoint, '/app/growth/start');
  assert.equal(contractsStatus.screenFlow.integrationMode, 'reference_ids_only');
  assert.equal(contractsStatus.screenFlow.reportBodyReturnedToGrowthEngine, false);
  assert.equal(contractsStatus.screenFlow.paymentStatusAccepted, false);
  assert.equal(contractsStatus.screenFlow.salesAmountAccepted, false);
  assert.equal(contractsStatus.screenFlow.supportsGrowthEngineScreenStart, true);
  assert.equal(contractsStatus.screenFlow.supportsSessionCompletion, true);
  assert.equal(contractsStatus.screenFlow.supportsReferenceOnlyExport, true);
  assert.equal(contractsStatus.screenFlow.supportsLocalAppraisalSessionHistory, true);
  assert.equal(contractsStatus.screenFlow.supportsSessionUrlRestore, true);
  assert.equal(contractsStatus.screenFlow.supportsSessionRestoreNotice, true);
  assert.equal(contractsStatus.screenFlow.supportsReferencePayloadPreview, true);
  assert.equal(contractsStatus.screenFlow.supportsReferencePayloadCopy, true);
  assert.equal(contractsStatus.screenFlow.supportsClipboardFallback, true);
  assert.equal(contractsStatus.screenFlow.supportsReferenceSafetyChecklist, true);
  assert.equal(contractsStatus.screenFlow.supportsDataBoundaryEndpoint, true);
  assert.equal(contractsStatus.screenFlow.supportsOperationalManifest, true);
  assert.equal(contractsStatus.screenFlow.supportsOperationalLinksPanel, true);
  assert.equal(contractsStatus.screenFlow.supportsUiReadinessEndpoint, true);
  assert.deepEqual(contractsStatus.staticEndpoints.productionFlowResult, [
    '/contracts/production-flow-result',
    '/contracts/production-flow-result.json',
  ]);
  assert.deepEqual(contractsStatus.staticEndpoints.dataBoundaries, [
    '/contracts/data-boundaries',
    '/contracts/data-boundaries.json',
  ]);
  assert.deepEqual(contractsStatus.staticEndpoints.operationalManifest, [
    '/contracts/operational-manifest',
    '/contracts/operational-manifest.json',
  ]);
  assert.deepEqual(contractsStatus.staticEndpoints.uiReadiness, [
    '/contracts/ui-readiness',
    '/contracts/ui-readiness.json',
  ]);
  assert.equal(contractsStatus.screenFlow.localHistoryStoresReportBody, false);
  assert.equal(contractsStatus.screenFlow.localHistoryStoresCustomerMaster, false);

  const productionFlow = JSON.parse(readFileSync('dist/contracts/production-flow-result', 'utf8'));
  assert.equal(productionFlow.appName, 'numeria-studio');
  assert.equal(productionFlow.flowName, 'growth-to-numeria-screen-start');
  assert.equal(productionFlow.status, 'ready');
  assert.equal(productionFlow.entryPoint, '/app/growth/start');
  assert.equal(productionFlow.dataSafety.paymentStatusAccepted, false);
  assert.equal(productionFlow.dataSafety.salesAmountAccepted, false);
  assert.equal(productionFlow.dataSafety.reportBodyReturnedToGrowthEngine, false);
  assert.equal(productionFlow.dataSafety.customerMasterReturned, false);
  assert.equal(productionFlow.dataSafety.fullMeetingTranscriptReturned, false);

  const dataBoundaries = JSON.parse(readFileSync('dist/contracts/data-boundaries', 'utf8'));
  assert.equal(dataBoundaries.appName, 'numeria-studio');
  assert.equal(dataBoundaries.status, 'success');
  assert.equal(dataBoundaries.integrationMode, 'reference_ids_only');
  assert.equal(dataBoundaries.owns.includes('Session'), true);
  assert.equal(dataBoundaries.owns.includes('Report'), true);
  assert.equal(dataBoundaries.owns.includes('AppraisalLogic'), true);
  for (const ownedElsewhere of ['Customer', 'Reservation', 'Payment', 'Sales', 'Conversation', 'Message', 'ReplyDraft', 'SafetyCheck', 'MessageDraft', 'AIActivity']) {
    assert.equal(dataBoundaries.doesNotOwn.includes(ownedElsewhere), true);
  }
  for (const prohibited of ['paymentStatus', 'salesAmount', 'fullMeetingTranscript', 'apiKey', 'accessToken', 'secretPrompt']) {
    assert.equal(dataBoundaries.prohibitedInboundFields.includes(prohibited), true);
  }
  for (const prohibited of ['reportBody', 'pdfBody', 'fullReportBody', 'fullAppraisalText', 'fullMeetingTranscript', 'paymentStatus', 'salesAmount', 'apiKey', 'accessToken', 'secretPrompt']) {
    assert.equal(dataBoundaries.prohibitedOutboundFields.includes(prohibited), true);
  }
  assert.equal(dataBoundaries.externalAppBoundaries['growth-engine'].receivesRefsOnly, true);
  assert.equal(dataBoundaries.externalAppBoundaries['growth-engine'].reportBodyReturned, false);
  assert.equal(dataBoundaries.externalAppBoundaries['growth-engine'].paymentOrSalesReturned, false);
  assert.equal(dataBoundaries.externalAppBoundaries['communication-planner'].receivesRefsOnly, true);
  assert.equal(dataBoundaries.externalAppBoundaries['communication-planner'].reportBodySent, false);
  assert.equal(dataBoundaries.externalAppBoundaries['communication-planner'].conversationOwnedByNumeria, false);
  assert.equal(dataBoundaries.externalAppBoundaries['ai-platform-core'].receivesRefsOnly, true);
  assert.equal(dataBoundaries.externalAppBoundaries['ai-platform-core'].secretPromptSent, false);
  assert.equal(dataBoundaries.externalAppBoundaries['ai-platform-core'].fullTranscriptSent, false);

  const manifest = JSON.parse(readFileSync('dist/contracts/operational-manifest', 'utf8'));
  assert.equal(manifest.appName, 'numeria-studio');
  assert.equal(manifest.status, 'success');
  assert.equal(manifest.baseUrl, 'https://numeria-studio.illusionddt.chatgpt.site');
  assert.equal(manifest.healthEndpoints.health, '/health');
  assert.equal(manifest.healthEndpoints.version, '/version');
  assert.equal(manifest.healthEndpoints.contractsStatus, '/contracts/status');
  assert.deepEqual(manifest.contractEndpoints.uiReadiness, [
    '/contracts/ui-readiness',
    '/contracts/ui-readiness.json',
  ]);
  assert.equal(manifest.screenEntryPoints.growthStart, '/app/growth/start');
  assert.equal(manifest.sourceOfTruth.session, 'numeria-studio');
  assert.equal(manifest.sourceOfTruth.report, 'numeria-studio');
  assert.equal(manifest.sourceOfTruth.customer, 'growth-engine');
  assert.equal(manifest.sourceOfTruth.conversation, 'communication-planner');
  assert.equal(manifest.sourceOfTruth.aiActivity, 'ai-platform-core');
  assert.equal(manifest.crossAppPayloadPolicy.mode, 'reference_ids_only');
  for (const ref of ['workspaceId', 'userId', 'reservationId', 'customerId', 'sessionId', 'reportId', 'reportRef', 'traceId', 'correlationId']) {
    assert.equal(manifest.crossAppPayloadPolicy.allowedRefs.includes(ref), true);
  }
  for (const prohibited of ['paymentStatus', 'salesAmount', 'customerMaster', 'reportBody', 'pdfBody', 'fullReportBody', 'fullAppraisalText', 'fullMeetingTranscript', 'apiKey', 'accessToken', 'secretPrompt']) {
    assert.equal(manifest.crossAppPayloadPolicy.prohibitedFields.includes(prohibited), true);
  }
  assert.deepEqual(manifest.stableEvents, [
    'studio.session.started.v1',
    'studio.session.completed.v1',
    'studio.report.generated.v1',
  ]);

  const uiReadiness = JSON.parse(readFileSync('dist/contracts/ui-readiness', 'utf8'));
  assert.equal(uiReadiness.appName, 'numeria-studio');
  assert.equal(uiReadiness.status, 'success');
  assert.equal(uiReadiness.screenFlow.growthStartEntryPoint, '/app/growth/start');
  assert.equal(uiReadiness.screenFlow.sessionStartShowsPrimaryCtas, true);
  assert.equal(uiReadiness.screenFlow.sessionStartCanContinueToReport, true);
  assert.equal(uiReadiness.screenFlow.sessionStartCanReturnToGrowthFollowup, true);
  assert.equal(uiReadiness.screenFlow.operationalLinksVisible, true);
  assert.deepEqual(uiReadiness.requiredVisibleRefs, ['sessionId', 'reportId', 'reportRef']);
  assert.equal(uiReadiness.ctaLabels.includes('鑑定作成へ進む'), true);
  assert.equal(uiReadiness.ctaLabels.includes('Report作成へ進む'), true);
  assert.equal(uiReadiness.ctaLabels.includes('Growth Engineのフォロー画面へ戻る'), true);
  assert.equal(uiReadiness.operationalLinks.includes('/contracts/ui-readiness'), true);
  assert.equal(uiReadiness.dataSafety.referenceIdsOnly, true);
  assert.equal(uiReadiness.dataSafety.paymentStatusAccepted, false);
  assert.equal(uiReadiness.dataSafety.salesAmountAccepted, false);
  assert.equal(uiReadiness.dataSafety.customerMasterOwned, false);
  assert.equal(uiReadiness.dataSafety.reportBodyReturnedToGrowthEngine, false);
  assert.equal(uiReadiness.dataSafety.fullMeetingTranscriptReturned, false);
});

test('growth screen source keeps Growth payload reference-id only', () => {
  const appSource = readFileSync('src/main.js', 'utf8');
  const safetySource = readFileSync('src/reference-safety.js', 'utf8');
  const linksSource = readFileSync('src/contract-links.js', 'utf8');
  for (const ref of ['workspaceId', 'userId', 'reservationId', 'customerId', 'intent', 'traceId', 'correlationId', 'returnUrl']) {
    assert.match(appSource, new RegExp(`['"]${ref}['"]`));
  }
  for (const field of ['paymentStatus', 'salesAmount', 'fullMeetingTranscript', 'fullReportBody', 'apiKey', 'secretPrompt']) {
    assert.match(appSource, new RegExp(`['"]${field}['"]`));
  }
  assert.match(appSource, /function startSession/);
  assert.match(appSource, /sessionStatus:\s*'started'/);
  assert.match(appSource, /sessionStatus:\s*'completed'/);
  assert.match(appSource, /reportRef/);
  assert.match(appSource, /function buildReferenceExport/);
  assert.match(appSource, /function buildAppraisalSessionSnapshot/);
  assert.match(appSource, /function readSessionContextFromUrl/);
  assert.match(appSource, /function renderSessionRestoreNotice/);
  assert.match(safetySource, /function ensureReferenceSafetyChecklist/);
  assert.match(appSource, /allowedSessionRefs/);
  assert.match(appSource, /pathSessionId/);
  assert.match(appSource, /decodeURIComponent\(pathSessionId\)/);
  assert.match(appSource, /Session Restored/);
  assert.match(appSource, /Report本文、PDF本文、個人名、支払い、売上、全文カルテはURLから復元しません/);
  assert.match(appSource, /reference-preview/);
  assert.match(appSource, /Growth Engineへ返す参照ID payloadを確認/);
  assert.match(appSource, /function copyReferenceJson/);
  assert.match(appSource, /function copyText/);
  assert.match(appSource, /document\.execCommand\('copy'\)/);
  assert.match(appSource, /コピー未対応/);
  assert.match(safetySource, /Reference Safety/);
  assert.match(safetySource, /Report本文なし/);
  assert.match(safetySource, /売上情報なし/);
  assert.match(safetySource, /ensureReferenceSafetyChecklist/);
  assert.match(safetySource, /document\.querySelector\('\.safety-checklist'\)/);
  assert.match(linksSource, /Operational Links/);
  assert.match(linksSource, /operationalLinks/);
  assert.match(linksSource, /\/health/);
  assert.match(linksSource, /\/version/);
  assert.match(linksSource, /\/contracts\/status/);
  assert.match(linksSource, /\/contracts\/production-flow-result/);
  assert.match(linksSource, /\/contracts\/data-boundaries/);
  assert.match(linksSource, /\/contracts\/operational-manifest/);
  assert.match(linksSource, /\/contracts\/ui-readiness/);
  assert.match(linksSource, /参照IDのみ/);
  assert.doesNotMatch(linksSource, /reportBody\s*:/);
  assert.doesNotMatch(linksSource, /paymentStatus\s*:/);
  assert.doesNotMatch(linksSource, /salesAmount\s*:/);
  assert.match(appSource, /参照IDをコピー/);
  assert.match(appSource, /historyStoreKey = 'numeria-appraisal-session-history'/);
  assert.match(appSource, /Appraisal Session History/);
  assert.match(appSource, /studio\.session\.completed\.v1/);
  assert.match(appSource, /Growth Engineのフォロー画面へ戻る/);
  assert.match(appSource, /reportBodyIncluded:\s*false/);
  assert.match(appSource, /clientNameIncluded:\s*false/);
  assert.match(appSource, /birthdayIncluded:\s*false/);
  assert.match(appSource, /No customer master, payment, sales, transcript, or report body/);
  assert.doesNotMatch(appSource, /paymentStatus:\s*payload/);
  assert.doesNotMatch(appSource, /salesAmount:\s*payload/);
});
