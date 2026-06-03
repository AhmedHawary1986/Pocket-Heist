"use client"

import { useEffect, useState } from "react"
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  type QueryConstraint,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useUser } from "@/components/UserProvider"
import { heistConverter, type Heist } from "@/types/firestore/heist"

export type HeistFilter = "active" | "assigned" | "expired"

interface UseHeistsResult {
  heists: Heist[]
  loading: boolean
  error: Error | null
}

function buildConstraints(filter: HeistFilter, uid: string): QueryConstraint[] {
  const now = new Date()

  switch (filter) {
    case "active":
      return [
        where("assignedTo", "==", uid),
        where("deadline", ">", now),
        orderBy("deadline", "asc"),
      ]
    case "assigned":
      return [
        where("createdBy", "==", uid),
        where("deadline", ">", now),
        orderBy("deadline", "asc"),
      ]
    case "expired":
      return [
        where("finalStatus", "!=", null),
        where("deadline", "<", now),
        orderBy("finalStatus"),
        orderBy("deadline", "desc"),
      ]
  }
}

export function useHeists(filter: HeistFilter): UseHeistsResult {
  const { user } = useUser()
  const uid = user?.uid

  const [state, setState] = useState<UseHeistsResult>({
    heists: [],
    loading: true,
    error: null,
  })

  useEffect(() => {
    if (!uid) return

    const ref = collection(db, "heists").withConverter(heistConverter)
    const q = query(ref, ...buildConstraints(filter, uid))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setState({
          // The converter's `toFirestore` types its model as `Partial<Heist>`, so
          // `data()` is widened to that on reads; `fromFirestore` always yields a full Heist.
          heists: snapshot.docs.map((doc) => doc.data() as Heist),
          loading: false,
          error: null,
        })
      },
      (err) => {
        setState({ heists: [], loading: false, error: err })
      }
    )

    return unsubscribe
  }, [filter, uid])

  // No signed-in user: nothing to subscribe to, return an empty result.
  if (!uid) {
    return { heists: [], loading: false, error: null }
  }

  return state
}
