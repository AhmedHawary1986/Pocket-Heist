import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"

export async function login(email: string, password: string): Promise<string> {
  const credential = await signInWithEmailAndPassword(auth, email, password)
  return credential.user.displayName ?? "Agent"
}
