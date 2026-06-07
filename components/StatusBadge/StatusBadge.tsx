import type { HeistFinalStatus } from "@/types/firestore/heist"
import styles from "./StatusBadge.module.css"

interface StatusBadgeProps {
  status: HeistFinalStatus | null
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  if (!status) return null

  return (
    <span className={`${styles.badge} ${styles[status]}`} aria-label={`Heist ${status}`}>
      {status}
    </span>
  )
}
