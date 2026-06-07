import { renderHook, act } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { useHeists } from "@/hooks/useHeists"
import type { Heist } from "@/types/firestore/heist"

// --- Firestore mocks ---
const {
  mockCollection,
  mockQuery,
  mockWhere,
  mockOrderBy,
  mockOnSnapshot,
  mockUnsubscribe,
} = vi.hoisted(() => {
  const mockUnsubscribe = vi.fn()
  const mockWithConverter = vi.fn(() => ({ __ref: true }))
  return {
    mockCollection: vi.fn(() => ({ withConverter: mockWithConverter })),
    mockQuery: vi.fn((...args: unknown[]) => ({ __query: args })),
    mockWhere: vi.fn((field: string, op: string, value: unknown) => ({ field, op, value })),
    mockOrderBy: vi.fn((field: string, dir?: string) => ({ orderBy: field, dir })),
    mockOnSnapshot: vi.fn(
      (_q: unknown, _onNext: (snap: unknown) => void, _onError: (err: Error) => void) =>
        mockUnsubscribe
    ),
    mockUnsubscribe,
  }
})

vi.mock("firebase/firestore", () => ({
  collection: mockCollection,
  query: mockQuery,
  where: mockWhere,
  orderBy: mockOrderBy,
  onSnapshot: mockOnSnapshot,
}))
vi.mock("@/lib/firebase", () => ({ db: {} }))

// --- UserProvider mock ---
const { mockUseUser } = vi.hoisted(() => ({
  mockUseUser: vi.fn(
    (): { user: { uid: string; email: string } | null; loading: boolean } => ({
      user: { uid: "user-1", email: "a@b.com" },
      loading: false,
    })
  ),
}))
vi.mock("@/components/UserProvider", () => ({ useUser: mockUseUser }))

// --- Helpers ---
type WhereCall = { field: string; op: string; value: unknown }

function whereCalls(): WhereCall[] {
  return mockWhere.mock.calls.map(([field, op, value]) => ({ field, op, value }) as WhereCall)
}

/** Emit a snapshot through the most recent onSnapshot subscription. */
function emit(heists: Partial<Heist>[]) {
  const onNext = mockOnSnapshot.mock.calls.at(-1)![1] as (snap: unknown) => void
  act(() => {
    onNext({ docs: heists.map((h) => ({ data: () => h })) })
  })
}

describe("useHeists", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseUser.mockReturnValue({ user: { uid: "user-1", email: "a@b.com" }, loading: false })
  })

  it("builds the active query: assignedTo == uid and a future deadline", () => {
    renderHook(() => useHeists("active"))
    const calls = whereCalls()
    expect(calls).toContainEqual({ field: "assignedTo", op: "==", value: "user-1" })
    expect(calls).toContainEqual(expect.objectContaining({ field: "deadline", op: ">" }))
  })

  it("builds the assigned query: createdBy == uid and a future deadline", () => {
    renderHook(() => useHeists("assigned"))
    const calls = whereCalls()
    expect(calls).toContainEqual({ field: "createdBy", op: "==", value: "user-1" })
    expect(calls).toContainEqual(expect.objectContaining({ field: "deadline", op: ">" }))
  })

  it("builds the expired query: finalStatus != null and a passed deadline", () => {
    renderHook(() => useHeists("expired"))
    const calls = whereCalls()
    expect(calls).toContainEqual({ field: "finalStatus", op: "!=", value: null })
    expect(calls).toContainEqual(expect.objectContaining({ field: "deadline", op: "<" }))
  })

  it("returns mapped heists when the snapshot emits, and updates on re-emit", () => {
    const { result } = renderHook(() => useHeists("active"))

    emit([{ id: "h1", title: "First Job" }])
    expect(result.current.heists).toEqual([{ id: "h1", title: "First Job" }])
    expect(result.current.loading).toBe(false)

    emit([
      { id: "h1", title: "First Job" },
      { id: "h2", title: "Second Job" },
    ])
    expect(result.current.heists.map((h) => h.title)).toEqual(["First Job", "Second Job"])
  })

  it("returns an empty array and never subscribes when there is no user", () => {
    mockUseUser.mockReturnValue({ user: null, loading: false })
    const { result } = renderHook(() => useHeists("active"))

    expect(result.current.heists).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(mockOnSnapshot).not.toHaveBeenCalled()
  })

  it("unsubscribes from the snapshot listener on unmount", () => {
    const { unmount } = renderHook(() => useHeists("active"))
    expect(mockOnSnapshot).toHaveBeenCalledOnce()

    unmount()
    expect(mockUnsubscribe).toHaveBeenCalledOnce()
  })
})
