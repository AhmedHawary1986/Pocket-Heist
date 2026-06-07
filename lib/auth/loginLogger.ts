import { collection, addDoc, query, where, getDocs, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

export interface LoginLogEntry {
  email: string
  outcome: "success" | "failure"
  reason?: string
  timestamp: Date
  ip: string
  userAgent: string
  suspicious?: boolean
}

const FAILURE_THRESHOLD = 5
const WINDOW_MINUTES = 15

export async function writeLoginLog(entry: LoginLogEntry): Promise<void> {
  const doc: Record<string, unknown> = {
    email: entry.email.slice(0, 254),
    outcome: entry.outcome,
    timestamp: Timestamp.fromDate(entry.timestamp),
    ip: entry.ip,
    userAgent: entry.userAgent,
  }
  if (entry.reason !== undefined) doc.reason = entry.reason
  if (entry.suspicious !== undefined) doc.suspicious = entry.suspicious
  await addDoc(collection(db, "loginLogs"), doc)
}

export async function isSuspiciousIp(ip: string): Promise<boolean> {
  if (!ip) return false
  const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000)
  const q = query(
    collection(db, "loginLogs"),
    where("ip", "==", ip),
    where("outcome", "==", "failure"),
    where("timestamp", ">=", Timestamp.fromDate(windowStart))
  )
  const snap = await getDocs(q)
  return snap.size >= FAILURE_THRESHOLD
}
