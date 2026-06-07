---
name: heist-ui-a11y-patterns
description: Recurring a11y patterns and known issues in pocket-heist heist dashboard components
metadata:
  type: project
---

Patterns observed while auditing the /heists redesign (HeistCard, HeistHistoryRow, StatusBadge, Countdown).

Good patterns to expect (reference implementations):
- lucide-react icons consistently carry `aria-hidden="true"` when decorative — this is the established convention here. Don't flag missing aria-hidden on lucide icons without checking; they usually have it.
- Heading hierarchy: dashboard `<main>` → page `<section>` with `<h2>` → card/row title `<h3>`. Correct and unskipped.

Known issue patterns to watch for:
- StatusBadge (`components/StatusBadge/StatusBadge.tsx`) renders the raw status string ("success"/"failure") with no `role`/`aria-label`; CSS-only uppercase. It is the ONLY programmatic outcome signal (the CheckCircle2/XCircle icons in HeistHistoryRow are aria-hidden). Needs a contextual accessible name.
- HeistCard uses `<dl>` but its date/countdown row has a `<dd>` with no `<dt>` — broken definition-list structure (1.3.1).
- Countdown (`components/Countdown/Countdown.tsx`) ticks every 1000ms but `formatCountdown` only has minute granularity — per-second interval is wasteful churn. It has no aria-live, which is correct (don't recommend adding it — would flood AT).
- Collections on heists/page.tsx are mapped into plain `<div>` containers, not `<ul>`/`role=list`.

See [[theme-contrast-ratios]] for verified contrast (not an issue area).

**Why:** Captures the recurring decorative-icon convention and the specific structural gaps so future reviews focus on what's actually broken.
**How to apply:** Use as a starting checklist when these components change again; re-verify against current file state before reporting.
