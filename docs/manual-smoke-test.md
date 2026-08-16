# Manual Smoke Test

Use this guide after Sites publishes the current main branch.

## 1. Contract Endpoints

Open each endpoint in the browser and confirm JSON is returned.

- `https://numeria-studio.illusionddt.chatgpt.site/health`
- `https://numeria-studio.illusionddt.chatgpt.site/version`
- `https://numeria-studio.illusionddt.chatgpt.site/contracts/status`
- `https://numeria-studio.illusionddt.chatgpt.site/contracts/production-flow-result`
- `https://numeria-studio.illusionddt.chatgpt.site/contracts/data-boundaries`
- `https://numeria-studio.illusionddt.chatgpt.site/contracts/operational-manifest`
- `https://numeria-studio.illusionddt.chatgpt.site/contracts/ui-readiness`
- `https://numeria-studio.illusionddt.chatgpt.site/contracts/release-checklist`
- `https://numeria-studio.illusionddt.chatgpt.site/contracts/integration-map`
- `https://numeria-studio.illusionddt.chatgpt.site/contracts/qa-handoff`

Expected:

- HTTP 200
- JSON body
- `appName: numeria-studio`
- `/contracts/status` has top-level `status: success`

## 2. Growth Start Screen

Open:

```text
https://numeria-studio.illusionddt.chatgpt.site/app/growth/start?workspaceId=ws_test_001&userId=user_test_owner_001&reservationId=reservation_test_001&customerId=customer_test_001&intent=start_appraisal_session
```

Expected:

- Growth context is visible as reference IDs.
- Session can be started.
- `sessionId` is visible after start.
- Primary CTAs are visible.
- Report creation path is available.

## 3. Session Restore Screen

Open:

```text
https://numeria-studio.illusionddt.chatgpt.site/app/sessions/session_test_001?workspaceId=ws_test_001&userId=user_test_owner_001&reservationId=reservation_test_001&customerId=customer_test_001
```

Expected:

- Session restore notice is visible.
- Reference payload preview is visible.
- Report body, PDF body, payment fields, sales fields, and full transcript are not restored from URL.

## 4. Data Safety

Confirm the Growth return payload contains only reference IDs:

- `sessionId`
- `reportId`
- `reportRef`
- `workspaceId`
- `userId`
- `reservationId`
- `customerId`

It must not contain:

- `reportBody`
- `pdfBody`
- `paymentStatus`
- `salesAmount`
- `fullMeetingTranscript`
- `apiKey`
- `secretPrompt`
