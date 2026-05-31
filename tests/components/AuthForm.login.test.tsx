import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect } from "vitest"
import AuthForm from "@/components/AuthForm"

const { mockLogin } = vi.hoisted(() => ({ mockLogin: vi.fn() }))
vi.mock("@/lib/auth/login", () => ({ login: mockLogin }))
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock("@/lib/firebase", () => ({ auth: {} }))
vi.mock("firebase/auth", () => ({ getAuth: vi.fn(() => ({})) }))

beforeEach(() => vi.clearAllMocks())

async function fillAndSubmit(email = "agent@heist.com", password = "password123") {
  await userEvent.type(screen.getByLabelText("Email"), email)
  await userEvent.type(screen.getByLabelText("Password"), password)
  await userEvent.click(screen.getByRole("button", { name: /log in/i }))
}

describe("AuthForm (login mode)", () => {
  it("renders email and password fields", () => {
    render(<AuthForm mode="login" />)
    expect(screen.getByLabelText("Email")).toBeInTheDocument()
    expect(screen.getByLabelText("Password")).toBeInTheDocument()
  })

  it("disables the button and shows 'Logging in…' while pending", async () => {
    let resolve: (v: string) => void
    mockLogin.mockReturnValue(new Promise<string>((r) => { resolve = r }))
    render(<AuthForm mode="login" />)
    await fillAndSubmit()
    const btn = screen.getByRole("button", { name: /logging in/i })
    expect(btn).toBeDisabled()
    resolve!("GhostFox")
  })

  it("replaces the form with a success message on successful login", async () => {
    mockLogin.mockResolvedValue("GhostFox")
    render(<AuthForm mode="login" />)
    await fillAndSubmit()
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("Welcome, GhostFox.")
    )
    expect(screen.queryByRole("button", { name: /log in/i })).not.toBeInTheDocument()
  })

  it("shows a human-readable error for a known Firebase error code", async () => {
    mockLogin.mockRejectedValue({ code: "auth/invalid-login-credentials" })
    render(<AuthForm mode="login" />)
    await fillAndSubmit()
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Incorrect email or password.")
    )
  })

  it("shows a generic error for an unknown Firebase error code", async () => {
    mockLogin.mockRejectedValue({ code: "auth/unknown-code" })
    render(<AuthForm mode="login" />)
    await fillAndSubmit()
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong. Please try again.")
    )
  })
})
