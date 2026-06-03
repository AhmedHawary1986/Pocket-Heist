"use client"

import { useMemo } from "react"
import { Archive, Target } from "lucide-react"
import HeistCard from "@/components/HeistCard"
import HeistHistoryRow from "@/components/HeistHistoryRow"
import { useHeists } from "@/hooks/useHeists"
import type { Heist } from "@/types/firestore/heist"

export default function HeistsPage() {
  const { heists: active } = useHeists("active")
  const { heists: assigned } = useHeists("assigned")
  const { heists: expired } = useHeists("expired")

  // Ongoing heists the current user is involved in — assigned to them and
  // created by them — merged, deduped by id, and ordered by soonest deadline.
  const assignedHeists = useMemo(() => {
    const byId = new Map<string, Heist>()
    for (const heist of [...active, ...assigned]) {
      byId.set(heist.id, heist)
    }
    return [...byId.values()].sort(
      (a, b) => a.deadline.getTime() - b.deadline.getTime()
    )
  }, [active, assigned])

  return (
    <div className="page-content flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <Target className="text-secondary" size={22} aria-hidden="true" />
          Assigned Heists
        </h2>
        {assignedHeists.length === 0 ? (
          <p className="text-body">No active heists assigned to you.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignedHeists.map((heist) => (
              <HeistCard key={heist.id} heist={heist} />
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <Archive className="text-body" size={22} aria-hidden="true" />
          Heist History
        </h2>
        {expired.length === 0 ? (
          <p className="text-body">No heist history yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {expired.map((heist) => (
              <HeistHistoryRow key={heist.id} heist={heist} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
