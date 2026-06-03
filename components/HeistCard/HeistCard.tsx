import { Calendar, Clock, User } from "lucide-react"
import Countdown from "@/components/Countdown"
import { formatHeistDate } from "@/lib/format/heistDate"
import type { Heist } from "@/types/firestore/heist"
import styles from "./HeistCard.module.css"

interface HeistCardProps {
  heist: Heist
}

export default function HeistCard({ heist }: HeistCardProps) {
  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <h3 className={styles.title}>{heist.title}</h3>
        <Clock className={styles.clock} size={18} aria-hidden="true" />
      </header>

      <dl className={styles.meta}>
        {heist.assignedToCodeName && (
          <div className={styles.row}>
            <User size={14} aria-hidden="true" />
            <dt>To:</dt>
            <dd className={styles.to}>@{heist.assignedToCodeName}</dd>
          </div>
        )}
        {heist.createdByCodeName && (
          <div className={styles.row}>
            <User size={14} aria-hidden="true" />
            <dt>By:</dt>
            <dd className={styles.by}>@{heist.createdByCodeName}</dd>
          </div>
        )}
        <div className={styles.row}>
          <Calendar size={14} aria-hidden="true" />
          <dt className="sr-only">Deadline:</dt>
          <dd className={styles.deadline}>
            {formatHeistDate(heist.deadline)}
            <span className={styles.separator}>•</span>
            <Countdown deadline={heist.deadline} />
          </dd>
        </div>
      </dl>
    </article>
  )
}
