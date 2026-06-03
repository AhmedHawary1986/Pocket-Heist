import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import HeistHistoryRow from "@/components/HeistHistoryRow"
import type { Heist } from "@/types/firestore/heist"

function makeHeist(overrides: Partial<Heist> = {}): Heist {
  return {
    id: "h1",
    title: "Reorganize the snack drawer by color",
    description: "Aesthetic sabotage.",
    createdBy: "u1",
    createdByCodeName: "WhisperKing",
    assignedTo: "u2",
    assignedToCodeName: "SilentNinja",
    deadline: new Date(Date.UTC(2025, 11, 3, 14, 30)),
    finalStatus: "success",
    createdAt: new Date(),
    ...overrides,
  }
}

describe("HeistHistoryRow", () => {
  it("shows title, operatives, datetime, and a SUCCESS badge", () => {
    render(<HeistHistoryRow heist={makeHeist()} />)

    expect(
      screen.getByText("Reorganize the snack drawer by color")
    ).toBeInTheDocument()
    expect(screen.getByText("@SilentNinja")).toBeInTheDocument()
    expect(screen.getByText("@WhisperKing")).toBeInTheDocument()
    expect(screen.getByText("Dec 3, 02:30 PM")).toBeInTheDocument()
    expect(screen.getByText("success")).toBeInTheDocument()
  })

  it("shows a FAILURE badge for a failed heist", () => {
    render(<HeistHistoryRow heist={makeHeist({ finalStatus: "failure" })} />)
    expect(screen.getByText("failure")).toBeInTheDocument()
  })
})
