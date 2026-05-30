import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import UserProvider from "@/components/UserProvider"
import Navbar from "@/components/Navbar"

vi.mock("firebase/auth", () => ({
  onAuthStateChanged: vi.fn(() => vi.fn()),
  getAuth: vi.fn(() => ({})),
}))

vi.mock("@/lib/firebase", () => ({ auth: {} }))

function renderWithProvider(ui: React.ReactElement) {
  return render(<UserProvider>{ui}</UserProvider>)
}

describe("Navbar", () => {
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
})
