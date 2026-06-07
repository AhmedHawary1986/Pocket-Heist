import { render, screen, act, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect } from "vitest"
import UserProvider from "@/components/UserProvider"
import Navbar from "@/components/Navbar"

const { mockSignOut, mockUnsubscribe } = vi.hoisted(() => ({
  mockSignOut: vi.fn(),
  mockUnsubscribe: vi.fn(),
}))

let capturedCallback: ((user: unknown) => void) | null = null

vi.mock("firebase/auth", () => ({
  onAuthStateChanged: vi.fn((_auth: unknown, cb: (u: unknown) => void) => {
    capturedCallback = cb
    return mockUnsubscribe
  }),
  getAuth: vi.fn(() => ({})),
  signOut: mockSignOut,
}))

vi.mock("@/lib/firebase", () => ({ auth: {} }))

function renderWithProvider(ui: React.ReactElement) {
  return render(<UserProvider>{ui}</UserProvider>)
}

const mockUser = { uid: "123", email: "test@example.com" }

describe("Navbar", () => {
  beforeEach(() => {
    capturedCallback = null
    vi.clearAllMocks()
  })

  it("renders the main heading", () => {
    renderWithProvider(<Navbar />)
    const heading = screen.getByRole("heading", { level: 1 })
    expect(heading).toBeInTheDocument()
  })

  it("renders the Create Heist link", () => {
    renderWithProvider(<Navbar />)
    const createLink = screen.getByRole("link", { name: /create new heist/i })
    expect(createLink).toBeInTheDocument()
    expect(createLink).toHaveAttribute("href", "/heists/create")
  })

  it("shows logout button when user is logged in", () => {
    renderWithProvider(<Navbar />)
    act(() => { capturedCallback?.(mockUser) })
    expect(screen.getByRole("button", { name: /log out/i })).toBeInTheDocument()
  })

  it("hides logout button when user is not logged in", () => {
    renderWithProvider(<Navbar />)
    act(() => { capturedCallback?.(null) })
    expect(screen.queryByRole("button", { name: /log out/i })).not.toBeInTheDocument()
  })

  it("calls signOut when logout button is clicked", async () => {
    mockSignOut.mockResolvedValue(undefined)
    renderWithProvider(<Navbar />)
    act(() => { capturedCallback?.(mockUser) })
    await userEvent.click(screen.getByRole("button", { name: /log out/i }))
    expect(mockSignOut).toHaveBeenCalledOnce()
  })

  it("shows an alert when signOut fails", async () => {
    mockSignOut.mockRejectedValue(new Error("Network error"))
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {})
    renderWithProvider(<Navbar />)
    act(() => { capturedCallback?.(mockUser) })
    await userEvent.click(screen.getByRole("button", { name: /log out/i }))
    await waitFor(() => expect(alertSpy).toHaveBeenCalled())
    alertSpy.mockRestore()
  })
})
