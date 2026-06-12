"use client"

import { useParams } from "next/navigation"
import { Calendar, Clock, FileText, User } from "lucide-react"
import Avatar from "@/components/Avatar"
import Countdown from "@/components/Countdown"
import Spinner from "@/components/Spinner"
import StatusBadge from "@/components/StatusBadge"
import { formatHeistDate } from "@/lib/format/heistDate"
import { useHeist } from "@/hooks/useHeist"

export default function HeistDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const { heist, loading, error } = useHeist(id)

  if (loading) {
    return <Spinner />
  }

  if (error || !heist) {
    return (
      <div className="page-content flex flex-col gap-2">
        <h2 className="text-xl font-semibold">Heist not found</h2>
        <p className="text-body">
          This heist doesn&apos;t exist or you don&apos;t have access to it.
        </p>
      </div>
    )
  }

  return (
    <div className="page-content flex flex-col gap-8">
      <header className="flex items-start justify-between gap-4">
        <h2 className="text-2xl font-bold leading-snug break-words">
          {heist.title}
        </h2>
        {heist.finalStatus ? (
          <StatusBadge status={heist.finalStatus} />
        ) : (
          <Clock className="text-primary shrink-0 mt-1" size={22} aria-hidden="true" />
        )}
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-lighter rounded-xl p-5 flex items-center gap-4">
          <Avatar name={heist.assignedToCodeName} />
          <div className="flex flex-col">
            <span className="flex items-center gap-1 text-sm text-body">
              <User size={14} aria-hidden="true" />
              Assigned to
            </span>
            <span className="text-primary font-medium">
              @{heist.assignedToCodeName}
            </span>
          </div>
        </div>

        <div className="bg-lighter rounded-xl p-5 flex items-center gap-4">
          <Avatar name={heist.createdByCodeName} />
          <div className="flex flex-col">
            <span className="flex items-center gap-1 text-sm text-body">
              <User size={14} aria-hidden="true" />
              Created by
            </span>
            <span className="text-secondary font-medium">
              @{heist.createdByCodeName}
            </span>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <FileText className="text-primary" size={18} aria-hidden="true" />
          Details
        </h3>
        <p className="text-body whitespace-pre-wrap">
          {heist.description || "No details provided."}
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <Calendar className="text-primary" size={18} aria-hidden="true" />
          Deadline
        </h3>
        <p className="flex items-center gap-2">
          {formatHeistDate(heist.deadline)}
          <span className="text-body">•</span>
          <Countdown deadline={heist.deadline} />
        </p>
      </section>
    </div>
  )
}
