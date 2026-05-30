"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { mapFirebaseUser } from "@/lib/auth/mapUser"
import type { UserContextValue } from "@/lib/auth/types"

const UserContext = createContext<UserContextValue | undefined>(undefined)

export default function UserProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<UserContextValue>({ user: null, loading: true })

  useEffect(() => {
    return onAuthStateChanged(auth, (fbUser) => {
      setState({ user: mapFirebaseUser(fbUser), loading: false })
    })
  }, [])

  return <UserContext.Provider value={state}>{children}</UserContext.Provider>
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext)
  if (ctx === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return ctx
}
