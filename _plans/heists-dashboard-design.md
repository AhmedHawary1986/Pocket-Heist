# Plan: Heists Dashboard Design

**Spec:** `_specs/heists-dashboard-design.md`  
**Branch:** `claude/feature/heists-dashboard-design`

## Context

The `/heists` page (`app/(dashboard)/heists/page.tsx`) currently renders a bare `<ul>` of heist titles across three plain sections. The spec and reference screenshot call for a styled dashboard with two sections:

1. **Assigned Heists** — a 2-column responsive card grid of ongoing heists, each card showing title, a live-ticking countdown to the deadline, the To/By operatives, and the scheduled datetime.
2. **Heist History** — a full-width list of completed heists, each row showing a success/failure icon, title, To/By operatives, datetime, and a status badge.

**Confirmed decisions:**
- *Assigned Heists* = **both** ongoing buckets merged — heists assigned to me **and** heists I created for others (`finalStatus === null`), deduped by id.
- *Heist History* = **all** completed heists globally (existing `"expired"` filter), badged with both **SUCCESS** (green) and **FAILURE** (red).
- Countdown is **live-ticking** (client-side interval).
- `finalStatus` distinguishes assigned vs. history; operative names come denormalized from the heist document (`createdByCodeName`, `assignedToCodeName`).

The data layer (`hooks/useHeists.ts`, `types/firestore/heist.ts`) already provides everything needed — **no Firestore/schema changes**. This is a presentation rebuild plus small pure utilities.

---

## Step 1 — Date/countdown utilities

Create `lib/format/heistDate.ts` — two pure functions, native `Intl`/arithmetic (no new deps):

- `formatHeistDate(date: Date): string` → `"Dec 7, 02:00 PM"` via `Intl.DateTimeFormat` (month short, day numeric, 2-digit hour/minute, 12h).
- `formatCountdown(deadline: Date, now?: Date): string` → `"Expired"` when `deadline <= now`; `"{d}d {h}h"` when ≥ 24h remain; else `"{h}h {m}m"`. `now` defaults to `new Date()` for testability.

---

## Step 2 — `StatusBadge` component

`components/StatusBadge/` (folder convention: `index.ts` barrel, `StatusBadge.tsx`, `StatusBadge.module.css`).

- Props: `status: HeistFinalStatus` (`'success' | 'failure'`).
- Renders `SUCCESS` (`success` token, green) or `FAILURE` (`error` token, red), uppercase, rounded pill.
- Returns `null` if status is null.

---

## Step 3 — `Countdown` component

`components/Countdown/`.

- Props: `deadline: Date`.
- `useEffect` + `setInterval` (1s tick); cleans up the interval on unmount.
- Uses `formatCountdown` for the label.
- Color via theme token: `secondary` (pink) when under near-deadline threshold (< 24h), else `primary` (purple); `body` gray when expired.

---

## Step 4 — `HeistCard` component

`components/HeistCard/`. Props: `heist: Heist`. Layout per screenshot:

- Title (bold, `heading`) with a `Clock` icon (lucide-react) top-right.
- `User` icon + `To:` + `@{assignedToCodeName}` in `primary` (purple).
- `User` icon + `By:` + `@{createdByCodeName}` in `secondary` (pink).
- `Calendar` icon + `formatHeistDate(deadline)` + ` • ` + `<Countdown deadline={heist.deadline} />`.
- Card surface uses `lighter`/`light` token, rounded corners, padding (mirror `Skeleton.module.css` `.card`). Long titles wrap.
- Omit the To or By row if its codename is missing (no `@undefined`).

---

## Step 5 — `HeistHistoryRow` component

`components/HeistHistoryRow/`. Props: `heist: Heist`. Layout:

- Left: green `CheckCircle2` for success / red `XCircle` for failure.
- Title (`heading`); below it `To: @… By: @…` inline with `User` icons (To purple, By pink).
- Right: `Calendar` icon + `formatHeistDate(deadline)`, then `<StatusBadge status={heist.finalStatus} />`.

---

## Step 6 — Rewrite the page

Update `app/(dashboard)/heists/page.tsx` (keep `"use client"`, reuse `useHeists` as-is):

```ts
const { heists: active }   = useHeists("active")    // assigned TO me, not yet due
const { heists: assigned } = useHeists("assigned")  // created BY me, not yet due
const { heists: expired }  = useHeists("expired")   // all completed (history)
```

- **Assigned grid data**: `useMemo` → merge `active` + `assigned`, dedupe by `heist.id`, sort by `deadline` asc.
- **History data**: use `expired` directly.
- Two `<section>`s, each with an icon + `<h2>` heading: `Target` + "Assigned Heists", `Archive` + "Heist History" (headings inline — no separate component).
- Assigned: `grid grid-cols-1 md:grid-cols-2 gap-4` of `<HeistCard>`; empty state `"No active heists assigned to you."`.
- History: `flex flex-col gap-3` of `<HeistHistoryRow>`; empty state `"No heist history yet."`.
- Optional polish: render existing `Skeleton` while a bucket is loading and empty.
- Remove the old `HeistTitles` helper.

All colors via theme tokens — no hard-coded hex; use `@/` imports.

---

## Step 7 — Tests

Mirror existing Vitest conventions (`vi.hoisted` / `vi.mock`, role/text queries). Use a `makeHeist(overrides)` factory per test file.

- `tests/lib/heistDate.test.ts` — `formatHeistDate` formats a known date; `formatCountdown` → `"Expired"` (past), `"Nd Nh"` (≥1 day), `"Nh Nm"` (<1 day), with explicit `now`.
- `tests/components/StatusBadge.test.tsx` — `SUCCESS` for `'success'`, `FAILURE` for `'failure'`, nothing for `null`.
- `tests/components/Countdown.test.tsx` — renders a value for a future deadline; `"Expired"` for a past one.
- `tests/components/HeistCard.test.tsx` — shows title, both codenames, formatted datetime, and a countdown value.
- `tests/components/HeistHistoryRow.test.tsx` — shows title, To/By codenames, datetime, SUCCESS badge (and FAILURE variant).
- `tests/pages/HeistsPage.test.tsx` — `vi.mock("@/hooks/useHeists")` returning fixtures keyed by filter arg. Assert both headings render; assigned cards render and dedupe across active+assigned; history rows render with badges; empty states render when a bucket is empty.

---

## Verification

1. `npx vitest run` — all new + existing tests pass.
2. `npm run lint` — clean (no hard-coded hex; `@/` imports).
3. `npm run dev`, sign in, visit `/heists`:
   - Assigned cards in a 2-col grid (collapsing to 1 col when narrow), countdown ticks live, To purple / By pink.
   - History rows show success/failure icon + matching badge.
   - Empty states appear when a section has no data.
