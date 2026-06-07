# Spec for Log Login Operations

branch: claude/feature/log-login-operations

## Summary
- Record every login attempt (successful or failed) so that operators can audit authentication activity.
- Each log entry captures who tried to log in, when, whether it succeeded, and basic contextual metadata (e.g. IP address, user-agent).
- Logs are persisted and queryable; they are not ephemeral console output.

## Functional Requirements
- On every login attempt via the `/login` page, create a login-log record before redirecting the user.
- A log record must include: user identifier (email or username), timestamp (UTC), outcome (`success` | `failure`), failure reason if applicable (e.g. wrong password, account not found), and request metadata (IP address, user-agent string).
- Failed login attempts must be logged even when no matching user account exists.
- Logs must be written server-side; they must not rely on client-side calls.
- Existing login flow UX must not change — logging is a silent side effect.
- The login page must continue to behave identically from the user's perspective regardless of any logging errors (log failures must not break the login flow).

## Figma Design Reference (only if referenced)
- N/A — this is a back-end/observability feature with no UI changes.

## Possible Edge Cases
- Logging service is unavailable or throws — must not propagate to the user; swallow the error and potentially emit a warning to the server console.
- Very high frequency of failed attempts from a single IP — logging must not become a bottleneck; consider async/non-blocking writes.
- User provides an extremely long email string — sanitise or truncate before persisting to avoid storage issues.
- Concurrent login attempts for the same account — log entries should be independent and not cause race conditions.
- Login attempt with no user-agent header (e.g. scripted requests) — store an empty string or a sentinel value rather than crashing.

## Acceptance Criteria
- A successful login produces exactly one log entry with `outcome: "success"` and the correct user identifier.
- A failed login (wrong password) produces exactly one log entry with `outcome: "failure"` and a populated `reason` field.
- A login attempt for a non-existent user produces a log entry with `outcome: "failure"` and `reason` indicating the account was not found.
- Log entries include a UTC timestamp accurate to at least the second.
- Log entries include the IP address and user-agent of the request.
- A logging-layer error does not return an error response to the client or alter the redirect behaviour.
- All acceptance criteria are covered by automated tests.

## Open Questions
- Where should logs be persisted? Options: dedicated Firestore collection, a separate logging service, or a structured server-side log file. Needs a decision before implementation begins.? separate logging service
- Should login logs be surfaced in any admin UI now, or is raw storage sufficient for this iteration? raw storage sufficient
- Is there a data-retention policy — how long should login logs be kept? forever
- Should repeated failed attempts from the same IP trigger any alert or rate-limit mechanism, or is that out of scope? yes

## Testing Guidelines
Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:
- Successful login writes a log entry with `outcome: "success"` and correct user identifier.
- Failed login (wrong credentials) writes a log entry with `outcome: "failure"` and a non-empty `reason`.
- Login for unknown user writes a log entry with `outcome: "failure"`.
- Log entry includes a timestamp, IP address, and user-agent.
- A thrown error inside the logging function does not cause the login route handler to return an error response.
