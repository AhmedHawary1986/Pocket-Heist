import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { generateCodename } from "@/lib/auth/generateCodename"

export async function signup(email: string, password: string): Promise<void> {
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  const codename = generateCodename()
  await updateProfile(credential.user, { displayName: codename })
  await setDoc(doc(db, "users", credential.user.uid), { id: credential.user.uid, codename })
}
