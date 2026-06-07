import { render, screen } from "@testing-library/react"
import { describe, it, expect, beforeEach, vi } from "vitest"
import HeistsPage from "@/app/(dashboard)/heists/page"
import type { Heist } from "@/types/firestore/heist"
import type { HeistFilter } from "@/hooks/useHeists"

// --- useHeists mock: returns fixtures keyed by the filter argument ---
const { mockUseHeists } = vi.hoisted(() => ({ mockUseHeists: vi.fn() }))

vi.mock("@/hooks/useHeists", () => ({
  useHeists: (filter: HeistFilter) => mockUseHeists(filter),
}))

function makeHeist(overrides: Partial<Heist> = {}): Heist {
  return {
    id: "h1",
    title: "A Heist",
    description: "",
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

const empty = { heists: [], loading: false, error: null }

function mockBuckets(buckets: Partial<Record<HeistFilter, Heist[]>>) {
  mockUseHeists.mockImplementation((filter: HeistFilter) => ({
    heists: buckets[filter] ?? [],
    loading: false,
    error: null,
  }))
}

describe("HeistsPage", () => {
  beforeEach(() => {
    mockUseHeists.mockReset()
    mockUseHeists.mockReturnValue(empty)
  })

  it("renders both section headings", () => {
    mockBuckets({})
    render(<HeistsPage />)
    expect(screen.getByText("Assigned Heists")).toBeInTheDocument()
    expect(screen.getByText("Heist History")).toBeInTheDocument()
  })

  it("renders assigned cards merged from active + assigned, deduped by id", () => {
    const a = makeHeist({ id: "h1", title: "Assigned To Me" })
    const b = makeHeist({ id: "h2", title: "Created By Me" })
    // h1 appears in both buckets — should render once.
    mockBuckets({ active: [a], assigned: [a, b] })

    render(<HeistsPage />)

    expect(screen.getByText("Assigned To Me")).toBeInTheDocument()
    expect(screen.getByText("Created By Me")).toBeInTheDocument()
    expect(screen.getAllByText("Assigned To Me")).toHaveLength(1)
  })

  it("renders history rows with status badges", () => {
    mockBuckets({
      expired: [
        makeHeist({ id: "e1", title: "Old Win", finalStatus: "success" }),
        makeHeist({ id: "e2", title: "Old Loss", finalStatus: "failure" }),
      ],
    })

    render(<HeistsPage />)

    expect(screen.getByText("Old Win")).toBeInTheDocument()
    expect(screen.getByText("Old Loss")).toBeInTheDocument()
    expect(screen.getByText("success")).toBeInTheDocument()
    expect(screen.getByText("failure")).toBeInTheDocument()
  })

  it("shows empty states when a section has no data", () => {
    mockBuckets({})
    render(<HeistsPage />)
    expect(screen.getByText("No active heists assigned to you.")).toBeInTheDocument()
    expect(screen.getByText("No heist history yet.")).toBeInTheDocument()
  })
})
