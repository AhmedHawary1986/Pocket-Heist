import { Calendar, CheckCircle2, User, XCircle } from "lucide-react"
import StatusBadge from "@/components/StatusBadge"
import { formatHeistDate } from "@/lib/format/heistDate"
import type { Heist } from "@/types/firestore/heist"
import styles from "./HeistHistoryRow.module.css"

interface HeistHistoryRowProps {
  heist: Heist
}

export default function HeistHistoryRow({ heist }: HeistHistoryRowProps) {
  const succeeded = heist.finalStatus === "success"

  return (
    <article className={styles.row}>
      <div className={styles.icon}>
        {succeeded ? (
          <CheckCircle2 className={styles.success} size={20} aria-hidden="true" />
        ) : (
          <XCircle className={styles.failure} size={20} aria-hidden="true" />
        )}
      </div>

      <div className={styles.main}>
        <h3 className={styles.title}>{heist.title}</h3>
        <div className={styles.operatives}>
          {heist.assignedToCodeName && (
            <span className={styles.operative}>
              <User size={14} aria-hidden="true" />
              To: <span className={styles.to}>@{heist.assignedToCodeName}</span>
            </span>
          )}
          {heist.createdByCodeName && (
            <span className={styles.operative}>
              <User size={14} aria-hidden="true" />
              By: <span className={styles.by}>@{heist.createdByCodeName}</span>
            </span>
          )}
        </div>
      </div>

      <div className={styles.aside}>
        <span className={styles.date}>
          <Calendar size={14} aria-hidden="true" />
          {formatHeistDate(heist.deadline)}
        </span>
        <StatusBadge status={heist.finalStatus} />
      </div>
    </article>
  )
}
