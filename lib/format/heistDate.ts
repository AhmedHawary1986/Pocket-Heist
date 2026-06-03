/**
 * Formatting helpers for heist deadlines.
 *
 * Heist `deadline`/`createdAt` are native `Date`s (see the Firestore converter
 * in `types/firestore/heist.ts`). These helpers keep date/countdown rendering
 * pure and testable, with `now` injectable for the countdown.
 */

// Locale and timezone are pinned so formatted output is deterministic across
// environments (and test runners) rather than depending on the host settings.
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
  timeZone: "UTC",
})

/** Formats a deadline like `"Dec 7, 02:00 PM"`. */
export function formatHeistDate(date: Date): string {
  return dateFormatter.format(date)
}

const MS_PER_MINUTE = 60 * 1000
const MS_PER_HOUR = 60 * MS_PER_MINUTE
const MS_PER_DAY = 24 * MS_PER_HOUR

/**
 * Formats the time remaining until `deadline`.
 * - `"Expired"` once the deadline has passed
 * - `"{d}d {h}h"` when a day or more remains
 * - `"{h}h {m}m"` otherwise
 */
export function formatCountdown(deadline: Date, now: Date = new Date()): string {
  const diff = deadline.getTime() - now.getTime()
  if (diff <= 0) return "Expired"

  if (diff >= MS_PER_DAY) {
    const days = Math.floor(diff / MS_PER_DAY)
    const hours = Math.floor((diff % MS_PER_DAY) / MS_PER_HOUR)
    return `${days}d ${hours}h`
  }

  const hours = Math.floor(diff / MS_PER_HOUR)
  const minutes = Math.floor((diff % MS_PER_HOUR) / MS_PER_MINUTE)
  return `${hours}h ${minutes}m`
}

/** Whether a deadline is within the "near" window (< 24h) used to accent the countdown. */
export function isNearDeadline(deadline: Date, now: Date = new Date()): boolean {
  const diff = deadline.getTime() - now.getTime()
  return diff > 0 && diff < MS_PER_DAY
}
