import { describe, it, expect } from "vitest"
import {
  formatHeistDate,
  formatCountdown,
  isNearDeadline,
} from "@/lib/format/heistDate"

describe("formatHeistDate", () => {
  it("formats a date as 'MMM D, hh:mm AM/PM'", () => {
    // Dec 7 2025, 14:00 UTC — the formatter is pinned to UTC.
    const date = new Date(Date.UTC(2025, 11, 7, 14, 0))
    expect(formatHeistDate(date)).toBe("Dec 7, 02:00 PM")
  })
})

describe("formatCountdown", () => {
  const now = new Date(2025, 11, 7, 12, 0)

  it("returns 'Expired' for a past deadline", () => {
    const past = new Date(now.getTime() - 60 * 1000)
    expect(formatCountdown(past, now)).toBe("Expired")
  })

  it("returns 'Expired' exactly at the deadline", () => {
    expect(formatCountdown(now, now)).toBe("Expired")
  })

  it("uses 'Nd Nh' when a day or more remains", () => {
    const deadline = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000)
    expect(formatCountdown(deadline, now)).toBe("2d 3h")
  })

  it("uses 'Nh Nm' when less than a day remains", () => {
    const deadline = new Date(now.getTime() + 4 * 60 * 60 * 1000 + 42 * 60 * 1000)
    expect(formatCountdown(deadline, now)).toBe("4h 42m")
  })
})

describe("isNearDeadline", () => {
  const now = new Date(2025, 11, 7, 12, 0)

  it("is true within 24h", () => {
    const deadline = new Date(now.getTime() + 3 * 60 * 60 * 1000)
    expect(isNearDeadline(deadline, now)).toBe(true)
  })

  it("is false beyond 24h", () => {
    const deadline = new Date(now.getTime() + 30 * 60 * 60 * 1000)
    expect(isNearDeadline(deadline, now)).toBe(false)
  })

  it("is false once expired", () => {
    const deadline = new Date(now.getTime() - 60 * 1000)
    expect(isNearDeadline(deadline, now)).toBe(false)
  })
})
