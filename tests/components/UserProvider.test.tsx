import { act, renderHook } from "@testing-library/react"
import { onAuthStateChanged } from "firebase/auth"
import UserProvider, { useUser } from "@/components/UserProvider"

const { unsubscribe } = vi.hoisted(() => ({ unsubscribe: vi.fn() }))

let registeredCallback: ((user: unknown) => void) | null = null

vi.mock("firebase/auth", () => ({
  onAuthStateChanged: vi.fn((_auth: unknown, cb: (u: unknown) => void) => {
    registeredCallback = cb
    return unsubscribe
  }),
  getAuth: vi.fn(() => ({})),
}))

vi.mock("@/lib/firebase", () => ({ auth: {} }))

beforeEach(() => {
  registeredCallback = null
  vi.clearAllMocks()
})

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <UserProvider>{children}</UserProvider>
)

describe("useUser", () => {
  it("starts with loading:true and user:null before the first callback", () => {
    const { result } = renderHook(() => useUser(), { wrapper })
    expect(result.current.loading).toBe(true)
    expect(result.current.user).toBeNull()
  })

  it("sets loading:false after the first callback fires", async () => {
    const { result } = renderHook(() => useUser(), { wrapper })
    await act(() => { registeredCallback!(null) })
    expect(result.current.loading).toBe(false)
  })

  it("returns null user when logged out", async () => {
    const { result } = renderHook(() => useUser(), { wrapper })
    await act(() => { registeredCallback!(null) })
    expect(result.current.user).toBeNull()
  })

  it("returns mapped AppUser when logged in", async () => {
    const { result } = renderHook(() => useUser(), { wrapper })
    await act(() => {
      registeredCallback!({ uid: "u1", email: "a@b.com", displayName: "Ann", extra: "drop" })
    })
    expect(result.current.user).toEqual({ uid: "u1", email: "a@b.com" })
  })

  it("registers exactly one listener on mount", () => {
    renderHook(() => useUser(), { wrapper })
    expect(onAuthStateChanged).toHaveBeenCalledTimes(1)
  })

  it("calls unsubscribe on unmount", () => {
    const { unmount } = renderHook(() => useUser(), { wrapper })
    unmount()
    expect(unsubscribe).toHaveBeenCalledTimes(1)
  })

  it("throws a clear error when used outside a UserProvider", () => {
    expect(() => renderHook(() => useUser())).toThrow(
      "useUser must be used within a UserProvider"
    )
  })
})
