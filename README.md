# Numeria Studio

Numeria Studio is the Professional app responsible for appraisal Sessions, Reports, and appraisal logic.

It does not own Customer, Reservation, Payment, Sales, Conversation, Message, ReplyDraft, SafetyCheck, MessageDraft, AI Usage, or AI Activity sources of truth.

## Public URL

- Site: https://numeria-studio.illusionddt.chatgpt.site
- Growth start screen: `/app/growth/start`
- Session screen pattern: `/app/sessions/{sessionId}`

## Contract Endpoints

- `/health`
- `/version`
- `/contracts/status`
- `/contracts/production-flow-result`
- `/contracts/data-boundaries`
- `/contracts/operational-manifest`
- `/contracts/ui-readiness`
- `/contracts/release-checklist`
- `/contracts/integration-map`
- `/contracts/qa-handoff`

## Data Boundary

Numeria Studio accepts and returns reference IDs only for cross-app flows.

Allowed cross-app references include:

- `workspaceId`
- `userId`
- `reservationId`
- `customerId`
- `sessionId`
- `reportId`
- `reportRef`
- `traceId`
- `correlationId`

Numeria Studio must not send Report body, PDF body, full appraisal text, full meeting transcript, customer master data, payment status, sales amount, API keys, or secret prompts to other apps.

## Main Flow

1. Growth Engine opens `/app/growth/start` with reference IDs.
2. Numeria Studio starts a Session and issues `sessionId`.
3. User continues to appraisal/Report flow.
4. Numeria Studio keeps Report as its source of truth.
5. Growth Engine receives only `sessionId`, `reportId`, or `reportRef` for follow-up context.

## Local Commands

```bash
npm test
npm run build
npm run smoke
```

`npm run smoke` runs the static endpoint test suite used for release checks.
