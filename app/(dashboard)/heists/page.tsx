"use client"

import { useHeists } from "@/hooks/useHeists"
import type { Heist } from "@/types/firestore/heist"

function HeistTitles({ heists }: { heists: Heist[] }) {
  return (
    <ul>
      {heists.map((heist) => (
        <li key={heist.id}>{heist.title}</li>
      ))}
    </ul>
  )
}

export default function HeistsPage() {
  const { heists: active } = useHeists("active")
  const { heists: assigned } = useHeists("assigned")
  const { heists: expired } = useHeists("expired")

  return (
    <div className="page-content">
      <div className="active-heists">
        <h2>Your Active Heists</h2>
        <HeistTitles heists={active} />
      </div>
      <div className="assigned-heists">
        <h2>Heists You&apos;ve Assigned</h2>
        <HeistTitles heists={assigned} />
      </div>
      <div className="expired-heists">
        <h2>All Expired Heists</h2>
        <HeistTitles heists={expired} />
      </div>
    </div>
  )
}
