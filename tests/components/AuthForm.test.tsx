import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest"
import AuthForm from "@/components/AuthForm"

const { mockSignup } = vi.hoisted(() => ({ mockSignup: vi.fn() }))
vi.mock("@/lib/auth/signup", () => ({ signup: mockSignup }))

const { mockLogin } = vi.hoisted(() => ({ mockLogin: vi.fn() }))
vi.mock("@/lib/auth/login", () => ({ login: mockLogin }))

const { mockPush } = vi.hoisted(() => ({ mockPush: vi.fn() }))
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mockPush }) }))

describe("AuthForm", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("renders the login heading when mode is login", () => {
    render(<AuthForm mode="login" />)
    expect(screen.getByRole("heading", { name: /log in to your account/i })).toBeInTheDocument()
  })

  it("renders the signup heading when mode is signup", () => {
    render(<AuthForm mode="signup" />)
    expect(screen.getByRole("heading", { name: /signup for an account/i })).toBeInTheDocument()
  })

  it("renders an email input", () => {
    render(<AuthForm mode="login" />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  })

  it("password input is initially obscured", () => {
    render(<AuthForm mode="login" />)
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password")
  })

  it("toggles password visibility when the show/hide button is clicked", async () => {
    const user = userEvent.setup()
    render(<AuthForm mode="login" />)
    const input = screen.getByLabelText("Password")
    const toggleBtn = screen.getByRole("button", { name: /show password/i })

    await user.click(toggleBtn)
    expect(input).toHaveAttribute("type", "text")

    await user.click(screen.getByRole("button", { name: /hide password/i }))
    expect(input).toHaveAttribute("type", "password")
  })

  it("calls login with email and password on submit", async () => {
    mockLogin.mockResolvedValue("SilentFox")
    const user = userEvent.setup()
    render(<AuthForm mode="login" />)

    await user.type(screen.getByLabelText("Email"), "test@example.com")
    await user.type(screen.getByLabelText("Password"), "secret123")
    await user.click(screen.getByRole("button", { name: /log in/i }))

    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith("test@example.com", "secret123"))
  })

  it("renders a link to /signup when mode is login", () => {
    render(<AuthForm mode="login" />)
    const link = screen.getByRole("link", { name: /sign up/i })
    expect(link).toHaveAttribute("href", "/signup")
  })

  it("renders a link to /login when mode is signup", () => {
    render(<AuthForm mode="signup" />)
    const link = screen.getByRole("link", { name: /log in/i })
    expect(link).toHaveAttribute("href", "/login")
  })

  it("shows an error message when signup fails", async () => {
    mockSignup.mockRejectedValueOnce({ code: "auth/email-already-in-use" })
    const user = userEvent.setup()
    render(<AuthForm mode="signup" />)
    await user.type(screen.getByLabelText(/email/i), "a@b.com")
    await user.type(screen.getByLabelText("Password"), "pass123")
    await user.click(screen.getByRole("button", { name: /sign up/i }))
    expect(await screen.findByRole("alert")).toHaveTextContent(/already exists/i)
  })

  it("disables the submit button and shows loading text while submitting", async () => {
    let resolve!: () => void
    mockSignup.mockReturnValueOnce(new Promise<void>((r) => { resolve = r }))
    const user = userEvent.setup()
    render(<AuthForm mode="signup" />)
    await user.type(screen.getByLabelText(/email/i), "a@b.com")
    await user.type(screen.getByLabelText("Password"), "pass123")
    await user.click(screen.getByRole("button", { name: /sign up/i }))
    const btn = screen.getByRole("button", { name: /signing up/i })
    expect(btn).toBeDisabled()
    resolve()
    await waitFor(() => expect(screen.getByRole("button", { name: /sign up/i })).not.toBeDisabled())
  })
})
