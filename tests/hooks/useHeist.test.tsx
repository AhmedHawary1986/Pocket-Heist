import { renderHook, act } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { useHeist } from "@/hooks/useHeist"
import type { Heist } from "@/types/firestore/heist"

// --- Firestore mocks ---
const { mockDoc, mockOnSnapshot, mockUnsubscribe } = vi.hoisted(() => {
  const mockUnsubscribe = vi.fn()
  const mockWithConverter = vi.fn(() => ({ __ref: true }))
  return {
    mockDoc: vi.fn(() => ({ withConverter: mockWithConverter })),
    mockOnSnapshot: vi.fn(
      (_ref: unknown, _onNext: (snap: unknown) => void, _onError: (err: Error) => void) =>
        mockUnsubscribe
    ),
    mockUnsubscribe,
  }
})

vi.mock("firebase/firestore", () => ({
  doc: mockDoc,
  onSnapshot: mockOnSnapshot,
}))
vi.mock("@/lib/firebase", () => ({ db: {} }))

/** Emit a document snapshot through the most recent onSnapshot subscription. */
function emit(heist: Partial<Heist> | null) {
  const onNext = mockOnSnapshot.mock.calls.at(-1)![1] as (snap: unknown) => void
  act(() => {
    onNext({ exists: () => heist !== null, data: () => heist })
  })
}

/** Emit an error through the most recent onSnapshot subscription. */
function emitError(err: Error) {
  const onError = mockOnSnapshot.mock.calls.at(-1)![2] as (err: Error) => void
  act(() => {
    onError(err)
  })
}

describe("useHeist", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("subscribes to the heist document for the given id", () => {
    renderHook(() => useHeist("h1"))
    expect(mockDoc).toHaveBeenCalledWith({}, "heists", "h1")
    expect(mockOnSnapshot).toHaveBeenCalledOnce()
  })

  it("returns the heist when the snapshot emits, and updates on re-emit", () => {
    const { result } = renderHook(() => useHeist("h1"))
    expect(result.current.loading).toBe(true)

    emit({ id: "h1", title: "First Job" })
    expect(result.current.heist).toEqual({ id: "h1", title: "First Job" })
    expect(result.current.loading).toBe(false)

    emit({ id: "h1", title: "Renamed Job" })
    expect(result.current.heist?.title).toBe("Renamed Job")
  })

  it("returns null when the document does not exist", () => {
    const { result } = renderHook(() => useHeist("missing"))

    emit(null)
    expect(result.current.heist).toBeNull()
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it("returns the error when the subscription fails", () => {
    const { result } = renderHook(() => useHeist("h1"))

    const err = new Error("permission-denied")
    emitError(err)
    expect(result.current.heist).toBeNull()
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(err)
  })

  it("returns an empty result and never subscribes without an id", () => {
    const { result } = renderHook(() => useHeist(undefined))

    expect(result.current.heist).toBeNull()
    expect(result.current.loading).toBe(false)
    expect(mockOnSnapshot).not.toHaveBeenCalled()
  })

  it("unsubscribes from the snapshot listener on unmount", () => {
    const { unmount } = renderHook(() => useHeist("h1"))
    expect(mockOnSnapshot).toHaveBeenCalledOnce()

    unmount()
    expect(mockUnsubscribe).toHaveBeenCalledOnce()
  })
})
