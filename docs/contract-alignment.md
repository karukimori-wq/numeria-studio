# Numeria Studio Contract Alignment

This note records the current alignment with `professional-platform-contracts`.

## Current Role

Numeria Studio owns:

- appraisal Session
- Report creation and editing
- appraisal-specific notes and local draft state

Numeria Studio does not own:

- Customer master
- Reservation master
- Payment or Sales ledger
- SNS PostDraft or MessageDraft
- Velvet Visit, professional Memory, ServiceNote, Timeline or NextAction
- Communication Planner Conversation, Message, ConversationContext, ReplyDraft or SafetyCheck
- AI Activity, AI Usage or AI Capability ledger

## Communication Planner Impact

Communication Planner is the 1-to-1 communication management app.

Communication Planner owns:

- Conversation
- Message
- ConversationContext
- ReplyDraft
- SafetyCheck
- communication send workflow

No direct Numeria -> Communication Planner body sharing is required for MVP.

If a future workflow links a Numeria report/session to a communication workflow, Numeria may pass reference IDs only:

- `workspaceId`
- `userId`
- `customerId`
- `sessionId`
- `reportId`
- `conversationId` where known
- `replyDraftId` where known
- `traceId`
- `correlationId`

Numeria must not pass:

- full Report bodies
- full appraisal text
- full meeting notes
- full conversation histories
- message bodies
- ConversationContext bodies
- ReplyDraft bodies
- SafetyCheck records as canonical data

## Velvet Impact

Velvet is a separate Professional App.

No direct Numeria -> Velvet integration is required for MVP.

If Growth Engine opens Numeria from a reservation or customer flow, Numeria may receive reference IDs only:

- `workspaceId`
- `userId`
- `customerId`
- `reservationId`
- `intent`
- `traceId`
- `correlationId`

Numeria must return reference IDs only:

- `sessionId`
- `reportId`
- `reportRef`
- `traceId`
- `correlationId`

## Static Monitoring Endpoints

The static build publishes these unauthenticated monitoring endpoints:

- `/health`
- `/version`
- `/contracts/status`
- `/contracts/status.json`

## Growth Engine Screen Start

Growth Engine can open Numeria at `/app/growth/start` with reference IDs only:

- `workspaceId`
- `userId`
- `reservationId`
- `customerId`
- `intent`
- `traceId`
- `correlationId`
- `returnUrl`

Numeria ignores prohibited inbound fields such as `paymentStatus`, `salesAmount`, `fullMeetingTranscript`, `fullReportBody`, `apiKey` and `secretPrompt`.

After Session start, Numeria generates `sessionId` and `reportId`, then shows CTAs for appraisal creation, Report creation, and returning to Growth Engine. The screen can also mark the session as completed and surface `studio.session.completed.v1`.

The Growth return URL includes reference IDs and statuses only. The reference JSON export also contains IDs and status fields only. Report body, PDF body, local draft names, birthdays, customer master data, payment state, sales amounts and full transcripts are not returned or exported.

The screen previews the exact Growth Engine reference payload before export or copy so users can verify that only reference IDs, status fields, event name, and data-safety flags are included.

## Appraisal Session History

The UI keeps a small local `AppraisalSessionHistory` for recent work continuity.

This history is a Numeria-owned appraisal/session snapshot and stores:

- `sessionId`
- `reportId`
- `reportRef`
- `sessionStatus`
- `reportStatus`
- `workspaceId`
- `userId`
- `reservationId`
- `customerId`
- theme and method labels
- timestamps

It does not store a Customer master, Report body, PDF body, local draft names, birthdays, payment status, sales amount, or full transcripts.

History links restore `sessionId`, `reportId`, `sessionStatus`, `reportStatus`, and `completedAt` from `/app/sessions/{sessionId}` URLs and query parameters. This restore path also uses reference IDs only.

Session routes show a restore notice so the user can confirm the active `sessionId` and related refs. The notice explicitly states that Report body, PDF body, personal names, payment data, sales data, and full appraisal notes are not restored from the URL.

## Data Safety

Numeria must not receive, store as canonical data, log, or send to other apps:

- canonical Customer master records
- `paymentStatus`
- `salesAmount`
- Stripe data
- Payment records
- Sales records
- full Report bodies outside Numeria
- `fullMeetingTranscript`
- Communication Planner full message bodies
- Communication Planner full ConversationContext bodies
- Communication Planner full ReplyDraft bodies
- Velvet full professional memory bodies
- Velvet full professional note bodies
- full conversation histories
- API keys
- access tokens
- secret prompts

Names and birthdays used in the static MVP are local draft inputs for report editing only. In the integrated product, Growth Engine remains the canonical Customer source of truth and Numeria should keep only appraisal/session/report snapshots when needed.

## Events

Numeria events remain:

- `studio.session.started.v1`
- `studio.session.completed.v1`
- `studio.report.generated.v1`

Velvet events are owned by Velvet and should not be emitted by Numeria.

Communication Planner events are owned by Communication Planner and should not be emitted by Numeria.
