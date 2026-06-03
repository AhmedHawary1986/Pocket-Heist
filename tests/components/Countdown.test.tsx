import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import Countdown from "@/components/Countdown"

describe("Countdown", () => {
  it("renders a remaining-time value for a future deadline", () => {
    const deadline = new Date(Date.now() + 4 * 60 * 60 * 1000 + 42 * 60 * 1000)
    render(<Countdown deadline={deadline} />)
    expect(screen.getByText(/^\d+h \d+m$/)).toBeInTheDocument()
  })

  it("renders 'Expired' for a past deadline", () => {
    const deadline = new Date(Date.now() - 60 * 1000)
    render(<Countdown deadline={deadline} />)
    expect(screen.getByText("Expired")).toBeInTheDocument()
  })
})
