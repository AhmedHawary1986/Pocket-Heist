import { render, screen } from "@testing-library/react"
import PublicLayout from "@/app/(public)/layout"

const { mockReplace } = vi.hoisted(() => ({ mockReplace: vi.fn() }))

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
}))

vi.mock("@/components/UserProvider/UserProvider", () => ({
  useUser: vi.fn(),
}))

vi.mock("@/components/Footer", () => ({
  default: () => <footer data-testid="footer" />,
}))

import { useUser } from "@/components/UserProvider/UserProvider"

const mockUser = { uid: "u1", email: "agent@test.com" }

beforeEach(() => {
  vi.clearAllMocks()
  Object.defineProperty(window, "location", {
    value: { search: "" },
    writable: true,
  })
})

it("shows spinner and redirects to /heists when authenticated", () => {
  vi.mocked(useUser).mockReturnValue({ user: mockUser, loading: false })
  render(<PublicLayout>login form</PublicLayout>)
  expect(screen.getByRole("status")).toBeInTheDocument()
  expect(screen.queryByText("login form")).not.toBeInTheDocument()
  expect(mockReplace).toHaveBeenCalledWith("/heists")
})

it("redirects to ?redirect= param when authenticated and param is present", () => {
  vi.mocked(useUser).mockReturnValue({ user: mockUser, loading: false })
  Object.defineProperty(window, "location", {
    value: { search: "?redirect=%2Fheists%2Fcreate" },
    writable: true,
  })
  render(<PublicLayout>login form</PublicLayout>)
  expect(mockReplace).toHaveBeenCalledWith("/heists/create")
})

it("renders children when not authenticated", () => {
  vi.mocked(useUser).mockReturnValue({ user: null, loading: false })
  render(<PublicLayout>login form</PublicLayout>)
  expect(screen.getByText("login form")).toBeInTheDocument()
  expect(screen.queryByRole("status")).not.toBeInTheDocument()
  expect(mockReplace).not.toHaveBeenCalled()
})

it("shows spinner while auth is loading", () => {
  vi.mocked(useUser).mockReturnValue({ user: null, loading: true })
  render(<PublicLayout>login form</PublicLayout>)
  expect(screen.getByRole("status")).toBeInTheDocument()
  expect(screen.queryByText("login form")).not.toBeInTheDocument()
  expect(mockReplace).not.toHaveBeenCalled()
})
