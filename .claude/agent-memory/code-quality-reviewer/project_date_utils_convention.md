---
name: project-date-utils-convention
description: Pocket Heist favors pure date/format utilities with an injectable `now` param for testability
metadata:
  type: project
---

Date/format utilities in `lib/format/` are written as pure functions that accept an injectable `now: Date = new Date()` parameter (e.g. `formatCountdown(deadline, now)`, `isNearDeadline(deadline, now)`). This makes time-dependent logic unit-testable without fake timers.

**Why:** Observed across the `/heists` dashboard redesign — the team unit-tests these utils directly with controlled `now` values rather than mocking `Date`.

**How to apply:** In reviews, reinforce this pattern (praise it when present); flag time-dependent logic that reads `new Date()` internally with no injection seam as a testability concern. Related: watch for locale/timezone-dependent assertions — `Intl.DateTimeFormat` without an explicit `timeZone` produces runner-dependent output and flaky exact-string test assertions.
