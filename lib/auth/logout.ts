import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"

export async function logout(): Promise<void> {
  await signOut(auth)
}
