"use client"

import { useEffect, useState } from "react"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { heistConverter, type Heist } from "@/types/firestore/heist"

interface UseHeistResult {
  heist: Heist | null
  loading: boolean
  error: Error | null
}

/** Subscribes to a single heist document by id. `heist` is null while loading,
 *  when the document doesn't exist, or on error. */
export function useHeist(id: string | undefined): UseHeistResult {
  const [state, setState] = useState<UseHeistResult>({
    heist: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    if (!id) return

    const ref = doc(db, "heists", id).withConverter(heistConverter)

    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        setState({
          // The converter's `toFirestore` types its model as `Partial<Heist>`, so
          // `data()` is widened to that on reads; `fromFirestore` always yields a full Heist.
          heist: snapshot.exists() ? (snapshot.data() as Heist) : null,
          loading: false,
          error: null,
        })
      },
      (err) => {
        setState({ heist: null, loading: false, error: err })
      }
    )

    return unsubscribe
  }, [id])

  // No id to look up: nothing to subscribe to, return an empty result.
  if (!id) {
    return { heist: null, loading: false, error: null }
  }

  return state
}
