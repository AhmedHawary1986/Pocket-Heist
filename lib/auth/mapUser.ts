import type { User } from "firebase/auth"
import type { AppUser } from "./types"

export function mapFirebaseUser(user: User | null): AppUser | null {
  if (!user) return null
  return { uid: user.uid, email: user.email }
}
