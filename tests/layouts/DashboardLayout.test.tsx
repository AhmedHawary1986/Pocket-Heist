import { render, screen, act } from "@testing-library/react"
import DashboardLayout from "@/app/(dashboard)/layout"

const { mockReplace } = vi.hoisted(() => ({ mockReplace: vi.fn() }))

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => "/heists",
}))

vi.mock("@/components/UserProvider/UserProvider", () => ({
  useUser: vi.fn(),
}))

vi.mock("@/components/Navbar", () => ({
  default: () => <nav data-testid="navbar" />,
}))

import { useUser } from "@/components/UserProvider/UserProvider"

const mockUser = { uid: "u1", email: "agent@test.com" }

beforeEach(() => {
  vi.clearAllMocks()
})

it("shows spinner and redirects to /login when not authenticated", async () => {
  vi.mocked(useUser).mockReturnValue({ user: null, loading: false })
  render(<DashboardLayout>secret</DashboardLayout>)
  expect(screen.getByRole("status")).toBeInTheDocument()
  expect(screen.queryByText("secret")).not.toBeInTheDocument()
  expect(mockReplace).toHaveBeenCalledWith("/login?redirect=%2Fheists")
})

it("renders children when authenticated", () => {
  vi.mocked(useUser).mockReturnValue({ user: mockUser, loading: false })
  render(<DashboardLayout>mission content</DashboardLayout>)
  expect(screen.getByText("mission content")).toBeInTheDocument()
  expect(screen.queryByRole("status")).not.toBeInTheDocument()
  expect(mockReplace).not.toHaveBeenCalled()
})

it("shows spinner while auth is loading", () => {
  vi.mocked(useUser).mockReturnValue({ user: null, loading: true })
  render(<DashboardLayout>secret</DashboardLayout>)
  expect(screen.getByRole("status")).toBeInTheDocument()
  expect(screen.queryByText("secret")).not.toBeInTheDocument()
  expect(mockReplace).not.toHaveBeenCalled()
})
