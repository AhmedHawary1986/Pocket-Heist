import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, afterEach } from "vitest"
import AuthForm from "@/components/AuthForm"

describe("AuthForm", () => {
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

  it("logs email and password to console on submit", async () => {
    const user = userEvent.setup()
    const spy = vi.spyOn(console, "log")
    render(<AuthForm mode="login" />)

    await user.type(screen.getByLabelText(/email/i), "test@example.com")
    await user.type(screen.getByLabelText("Password"), "secret123")
    await user.click(screen.getByRole("button", { name: /log in/i }))

    expect(spy).toHaveBeenCalledWith({ email: "test@example.com", password: "secret123" })
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
})
