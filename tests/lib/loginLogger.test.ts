import { describe, it, expect, vi, beforeEach } from "vitest"

const { mockAddDoc, mockGetDocs } = vi.hoisted(() => ({
  mockAddDoc: vi.fn(),
  mockGetDocs: vi.fn(),
}))

vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  addDoc: mockAddDoc,
  query: vi.fn(),
  where: vi.fn(),
  getDocs: mockGetDocs,
  Timestamp: {
    fromDate: (d: Date) => ({ seconds: Math.floor(d.getTime() / 1000) }),
  },
}))

vi.mock("@/lib/firebase", () => ({ db: {} }))

import { writeLoginLog, isSuspiciousIp } from "@/lib/auth/loginLogger"

const baseEntry = {
  email: "agent@heist.com",
  outcome: "success" as const,
  timestamp: new Date("2026-06-07T10:00:00Z"),
  ip: "1.2.3.4",
  userAgent: "Mozilla/5.0",
}

beforeEach(() => vi.clearAllMocks())

describe("writeLoginLog", () => {
  it("writes a success entry with correct fields", async () => {
    mockAddDoc.mockResolvedValue({})
    await writeLoginLog(baseEntry)
    expect(mockAddDoc).toHaveBeenCalledOnce()
    const [, doc] = mockAddDoc.mock.calls[0]
    expect(doc.email).toBe("agent@heist.com")
    expect(doc.outcome).toBe("success")
    expect(doc.ip).toBe("1.2.3.4")
    expect(doc.userAgent).toBe("Mozilla/5.0")
    expect(doc.timestamp).toBeDefined()
  })

  it("writes a failure entry with a reason field", async () => {
    mockAddDoc.mockResolvedValue({})
    await writeLoginLog({ ...baseEntry, outcome: "failure", reason: "auth/wrong-password" })
    const [, doc] = mockAddDoc.mock.calls[0]
    expect(doc.outcome).toBe("failure")
    expect(doc.reason).toBe("auth/wrong-password")
  })

  it("writes a failure entry for unknown user with a reason", async () => {
    mockAddDoc.mockResolvedValue({})
    await writeLoginLog({ ...baseEntry, outcome: "failure", reason: "auth/user-not-found" })
    const [, doc] = mockAddDoc.mock.calls[0]
    expect(doc.outcome).toBe("failure")
    expect(doc.reason).toBe("auth/user-not-found")
  })

  it("omits reason field when not provided", async () => {
    mockAddDoc.mockResolvedValue({})
    await writeLoginLog(baseEntry)
    const [, doc] = mockAddDoc.mock.calls[0]
    expect("reason" in doc).toBe(false)
  })

  it("truncates email to 254 characters", async () => {
    mockAddDoc.mockResolvedValue({})
    await writeLoginLog({ ...baseEntry, email: "a".repeat(300) + "@heist.com" })
    const [, doc] = mockAddDoc.mock.calls[0]
    expect(doc.email.length).toBe(254)
  })

  it("stores an empty userAgent without throwing", async () => {
    mockAddDoc.mockResolvedValue({})
    await writeLoginLog({ ...baseEntry, userAgent: "" })
    const [, doc] = mockAddDoc.mock.calls[0]
    expect(doc.userAgent).toBe("")
  })

  it("propagates Firestore errors to the caller", async () => {
    mockAddDoc.mockRejectedValue(new Error("Firestore unavailable"))
    await expect(writeLoginLog(baseEntry)).rejects.toThrow("Firestore unavailable")
  })
})

describe("isSuspiciousIp", () => {
  it("returns true when recent failure count meets the threshold", async () => {
    mockGetDocs.mockResolvedValue({ size: 5 })
    expect(await isSuspiciousIp("1.2.3.4")).toBe(true)
  })

  it("returns false when recent failure count is below the threshold", async () => {
    mockGetDocs.mockResolvedValue({ size: 4 })
    expect(await isSuspiciousIp("1.2.3.4")).toBe(false)
  })

  it("returns false without querying Firestore for an empty IP", async () => {
    expect(await isSuspiciousIp("")).toBe(false)
    expect(mockGetDocs).not.toHaveBeenCalled()
  })
})
