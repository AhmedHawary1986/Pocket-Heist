import { render, screen } from "@testing-library/react"
import { describe, it, expect, beforeEach, vi } from "vitest"
import HeistDetailsPage from "@/app/(dashboard)/heists/[id]/page"
import type { Heist } from "@/types/firestore/heist"

// --- next/navigation mock: the page reads the heist id from the route ---
vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "h1" }),
}))

// --- useHeist mock ---
const { mockUseHeist } = vi.hoisted(() => ({ mockUseHeist: vi.fn() }))

vi.mock("@/hooks/useHeist", () => ({
  useHeist: (id: string) => mockUseHeist(id),
}))

function makeHeist(overrides: Partial<Heist> = {}): Heist {
  return {
    id: "h1",
    title: "The Louvre Job",
    description: "In through the skylight, out through the gift shop.",
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

describe("HeistDetailsPage", () => {
  beforeEach(() => {
    mockUseHeist.mockReset()
  })

  it("requests the heist matching the route id", () => {
    mockUseHeist.mockReturnValue({ heist: makeHeist(), loading: false, error: null })
    render(<HeistDetailsPage />)
    expect(mockUseHeist).toHaveBeenCalledWith("h1")
  })

  it("renders the title, agents, details, and time remaining", () => {
    mockUseHeist.mockReturnValue({ heist: makeHeist(), loading: false, error: null })
    render(<HeistDetailsPage />)

    expect(screen.getByText("The Louvre Job")).toBeInTheDocument()
    expect(screen.getByText("Assigned to")).toBeInTheDocument()
    expect(screen.getByText("@KeySmash")).toBeInTheDocument()
    expect(screen.getByText("Created by")).toBeInTheDocument()
    expect(screen.getByText("@SecretSauceAgent")).toBeInTheDocument()
    expect(
      screen.getByText("In through the skylight, out through the gift shop.")
    ).toBeInTheDocument()
    // ~5h from now → the live countdown renders "4h 59m"/"5h 0m"-style remaining time.
    expect(screen.getByText(/^4h 5\dm$|^5h 0m$/)).toBeInTheDocument()
  })

  it("renders a status badge instead of a countdown accent for finished heists", () => {
    mockUseHeist.mockReturnValue({
      heist: makeHeist({ finalStatus: "success", deadline: new Date(Date.now() - 1000) }),
      loading: false,
      error: null,
    })
    render(<HeistDetailsPage />)

    expect(screen.getByText("success")).toBeInTheDocument()
    expect(screen.getByText("Expired")).toBeInTheDocument()
  })

  it("shows a fallback for a missing description", () => {
    mockUseHeist.mockReturnValue({
      heist: makeHeist({ description: "" }),
      loading: false,
      error: null,
    })
    render(<HeistDetailsPage />)
    expect(screen.getByText("No details provided.")).toBeInTheDocument()
  })

  it("shows a spinner while loading", () => {
    mockUseHeist.mockReturnValue({ heist: null, loading: true, error: null })
    render(<HeistDetailsPage />)
    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument()
  })

  it("shows a not-found message when the heist is missing", () => {
    mockUseHeist.mockReturnValue({ heist: null, loading: false, error: null })
    render(<HeistDetailsPage />)
    expect(screen.getByText("Heist not found")).toBeInTheDocument()
  })

  it("shows the not-found message on error", () => {
    mockUseHeist.mockReturnValue({
      heist: null,
      loading: false,
      error: new Error("permission-denied"),
    })
    render(<HeistDetailsPage />)
    expect(screen.getByText("Heist not found")).toBeInTheDocument()
  })
})
