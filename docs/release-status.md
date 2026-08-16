# Numeria Studio Release Status

## Status

Current status: `success`

Numeria Studio is ready for final public URL smoke checks. The app-side contract metadata and static endpoint publication are implemented on main.

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

## Remaining Manual Checks

- Confirm deployed `/contracts/*` endpoints return JSON from the public URL.
- Confirm `/app/growth/start` starts a Session from Growth reference IDs.
- Confirm Session success screen shows `sessionId`, `reportId`, `reportRef`, and primary CTAs.
- Confirm Growth Engine follow-up return URL carries only reference IDs.

## Not In Scope For This Step

- Full Growth Engine production integration.
- AI Platform Core live server-side POST verification from Sites if the environment returns 522.
- Persistent backend storage.
