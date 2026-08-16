# Numeria Studio Release Status

## Status

Current status: `success`

Numeria Studio is complete from the GitHub main and static contract perspective. The remaining public verification is an external browser/Sites runtime check.

## Completed

- Contract status returns `status: success`.
- `professionalIdRequired` remains `false` for MVP.
- Report terminology is used instead of Document terminology.
- Stable events are `studio.session.started.v1`, `studio.session.completed.v1`, and `studio.report.generated.v1`.
- Customer, Reservation, Payment, and Sales remain Growth Engine sources of truth.
- Conversation, Message, ReplyDraft, and SafetyCheck remain Communication Planner sources of truth.
- AI Activity and AI Usage remain AI Platform Core sources of truth.
- Operational contract endpoints are published by the static build.
- Growth Engine return path is reference-ID only.
- README, release status, and manual smoke test documents are present.
- `npm run smoke` is defined as `node --test test/static-endpoints.test.js`.

## Public Verification Status

Attempted from the assistant environment on 2026-08-17 JST:

- `https://numeria-studio.illusionddt.chatgpt.site/health`
- `https://numeria-studio.illusionddt.chatgpt.site/version`
- `https://numeria-studio.illusionddt.chatgpt.site/contracts/status`
- `https://numeria-studio.illusionddt.chatgpt.site/contracts/release-checklist`
- `https://numeria-studio.illusionddt.chatgpt.site/contracts/qa-handoff`

Result: the assistant web fetch did not return page contents and behaved like an external cache/search limitation. This is recorded as `external_verification_pending`, not an app-side contract failure.

## Remaining Manual Checks

- Confirm deployed `/contracts/*` endpoints return JSON from the public URL in a normal browser.
- Confirm `/app/growth/start` starts a Session from Growth reference IDs.
- Confirm Session success screen shows `sessionId`, `reportId`, `reportRef`, and primary CTAs.
- Confirm Growth Engine follow-up return URL carries only reference IDs.

## Completion Decision

Numeria Studio can be treated as app-side MVP complete once the public browser smoke checks above pass.

## Not In Scope For This Step

- Full Growth Engine production integration.
- AI Platform Core live server-side POST verification from Sites if the environment returns 522.
- Persistent backend storage.
