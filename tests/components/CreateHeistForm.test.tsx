import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import CreateHeistForm from "@/components/CreateHeistForm"

// --- Firestore mocks ---
const { mockGetDocs, mockAddDoc, mockCollection, mockServerTimestamp } = vi.hoisted(() => ({
  mockGetDocs: vi.fn(),
  mockAddDoc: vi.fn(),
  mockCollection: vi.fn(),
  mockServerTimestamp: vi.fn(() => ({ _type: "serverTimestamp" })),
}))
vi.mock("firebase/firestore", () => ({
  getDocs: mockGetDocs,
  addDoc: mockAddDoc,
  collection: mockCollection,
  serverTimestamp: mockServerTimestamp,
}))
vi.mock("@/lib/firebase", () => ({ db: {} }))

// --- Router mock ---
const { mockPush } = vi.hoisted(() => ({ mockPush: vi.fn() }))
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mockPush }) }))

// --- UserProvider mock ---
const { mockUseUser } = vi.hoisted(() => ({
  mockUseUser: vi.fn(() => ({ user: { uid: "user-1", email: "a@b.com" }, loading: false })),
}))
vi.mock("@/components/UserProvider", () => ({ useUser: mockUseUser }))

// --- Helpers ---
const fakeUsers = [
  { id: "user-1", codename: "SilentFox" },
  { id: "user-2", codename: "NightVault" },
]

function makeSnapshot(users: typeof fakeUsers) {
  return { docs: users.map((u) => ({ data: () => u })) }
}

describe("CreateHeistForm", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetDocs.mockResolvedValue(makeSnapshot(fakeUsers))
    mockAddDoc.mockResolvedValue({ id: "new-heist-id" })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("renders title input, description textarea, and assignee dropdown", async () => {
    render(<CreateHeistForm />)
    expect(screen.getByLabelText(/mission title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/mission briefing/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/assigned operative/i)).toBeInTheDocument()
  })

  it("populates the dropdown with users from Firestore", async () => {
    render(<CreateHeistForm />)
    await waitFor(() => {
      expect(screen.getByRole("option", { name: "SilentFox" })).toBeInTheDocument()
      expect(screen.getByRole("option", { name: "NightVault" })).toBeInTheDocument()
    })
  })

  it("selecting an assignee updates the dropdown value", async () => {
    const user = userEvent.setup()
    render(<CreateHeistForm />)
    await waitFor(() => screen.getByRole("option", { name: "NightVault" }))

    await user.selectOptions(screen.getByLabelText(/assigned operative/i), "user-2")
    expect((screen.getByRole("option", { name: "NightVault" }) as HTMLOptionElement).selected).toBe(true)
  })

  it("shows a validation error and does not call addDoc when fields are empty", async () => {
    const user = userEvent.setup()
    render(<CreateHeistForm />)
    await waitFor(() => screen.getByRole("option", { name: "SilentFox" }))

    await user.click(screen.getByRole("button", { name: /submit mission/i }))

    expect(await screen.findByRole("alert")).toBeInTheDocument()
    expect(mockAddDoc).not.toHaveBeenCalled()
  })

  it("calls addDoc with the correct payload and redirects on success", async () => {
    const user = userEvent.setup()
    render(<CreateHeistForm />)
    await waitFor(() => screen.getByRole("option", { name: "NightVault" }))

    await user.type(screen.getByLabelText(/mission title/i), "The Diamond Exchange")
    await user.type(screen.getByLabelText(/mission briefing/i), "Steal the gem from vault B.")
    await user.selectOptions(screen.getByLabelText(/assigned operative/i), "user-2")
    await user.click(screen.getByRole("button", { name: /submit mission/i }))

    await waitFor(() => expect(mockAddDoc).toHaveBeenCalledOnce())

    const payload = mockAddDoc.mock.calls[0][1]
    expect(payload.title).toBe("The Diamond Exchange")
    expect(payload.description).toBe("Steal the gem from vault B.")
    expect(payload.createdBy).toBe("user-1")
    expect(payload.createdByCodeName).toBe("SilentFox")
    expect(payload.assignedTo).toBe("user-2")
    expect(payload.assignedToCodeName).toBe("NightVault")
    expect(payload.finalStatus).toBeNull()
    expect(payload.deadline).toBeInstanceOf(Date)

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/heists"))
  })

  it("shows an inline error and does not navigate when addDoc rejects", async () => {
    mockAddDoc.mockRejectedValueOnce(new Error("permission-denied"))
    const user = userEvent.setup()
    render(<CreateHeistForm />)
    await waitFor(() => screen.getByRole("option", { name: "SilentFox" }))

    await user.type(screen.getByLabelText(/mission title/i), "The Diamond Exchange")
    await user.type(screen.getByLabelText(/mission briefing/i), "Steal the gem from vault B.")
    await user.selectOptions(screen.getByLabelText(/assigned operative/i), "user-1")
    await user.click(screen.getByRole("button", { name: /submit mission/i }))

    expect(await screen.findByRole("alert")).toHaveTextContent(/failed/i)
    expect(mockPush).not.toHaveBeenCalled()
  })
})
