import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import HeistCard from "@/components/HeistCard"
import type { Heist } from "@/types/firestore/heist"

function makeHeist(overrides: Partial<Heist> = {}): Heist {
  return {
    id: "h1",
    title: "Swap the keyboard keys on a colleague's desk",
    description: "A classic.",
    createdBy: "u1",
    createdByCodeName: "SecretSauceAgent",
    assignedTo: "u2",
    assignedToCodeName: "KeySmash",
    deadline: new Date(Date.now() + 5 * 60 * 60 * 1000),
    finalStatus: null,
    createdAt: new Date(),
    ...overrides,
  }
}

describe("HeistCard", () => {
  it("shows the title, operatives, datetime, and a countdown", () => {
    render(<HeistCard heist={makeHeist()} />)

    expect(
      screen.getByText("Swap the keyboard keys on a colleague's desk")
    ).toBeInTheDocument()
    expect(screen.getByText("@KeySmash")).toBeInTheDocument()
    expect(screen.getByText("@SecretSauceAgent")).toBeInTheDocument()
    // Countdown renders an "Nh Nm" value for a deadline within the day.
    expect(screen.getByText(/^\d+h \d+m$/)).toBeInTheDocument()
  })

  it("omits the assignee row when there is no assignee codename", () => {
    render(<HeistCard heist={makeHeist({ assignedToCodeName: "" })} />)
    expect(screen.queryByText("To:")).not.toBeInTheDocument()
    expect(screen.getByText("@SecretSauceAgent")).toBeInTheDocument()
  })
})
