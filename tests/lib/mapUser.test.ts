import type { User } from "firebase/auth"
import { mapFirebaseUser } from "@/lib/auth/mapUser"

describe("mapFirebaseUser", () => {
  it("returns null when given null", () => {
    expect(mapFirebaseUser(null)).toBeNull()
  })

  it("maps uid and email from a Firebase user object", () => {
    const fbUser = { uid: "u1", email: "a@b.com", displayName: "Ann", photoURL: "p.png" }
    expect(mapFirebaseUser(fbUser as unknown as User)).toEqual({ uid: "u1", email: "a@b.com" })
  })

  it("drops extra Firebase fields", () => {
    const fbUser = { uid: "u2", email: "x@y.com", extra: "drop", nested: { foo: 1 } }
    const result = mapFirebaseUser(fbUser as unknown as User)
    expect(result).not.toHaveProperty("extra")
    expect(result).not.toHaveProperty("nested")
  })

  it("passes through a null email", () => {
    const fbUser = { uid: "u3", email: null }
    expect(mapFirebaseUser(fbUser as unknown as User)).toEqual({ uid: "u3", email: null })
  })
})
