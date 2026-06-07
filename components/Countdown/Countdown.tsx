"use client"

import { useEffect, useState } from "react"
import { formatCountdown, isNearDeadline } from "@/lib/format/heistDate"

interface CountdownProps {
  deadline: Date
}

/** Live-ticking remaining-time label that updates every second. */
export default function Countdown({ deadline }: CountdownProps) {
  const [now, setNow] = useState(() => new Date())

  // The label only changes at minute granularity, so a 30s tick keeps it
  // current without re-rendering every second.
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])

  const label = formatCountdown(deadline, now)
  const expired = deadline.getTime() - now.getTime() <= 0
  const near = isNearDeadline(deadline, now)

  // Pink (secondary) when close to the deadline, purple (primary) when further
  // out, muted body grey once expired.
  const color = expired
    ? "var(--color-body)"
    : near
      ? "var(--color-secondary)"
      : "var(--color-primary)"

  return (
    <span style={{ color }} className="font-medium">
      {label}
    </span>
  )
}
