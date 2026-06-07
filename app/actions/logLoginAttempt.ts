"use server"

import { headers } from "next/headers"
import { writeLoginLog, isSuspiciousIp } from "@/lib/auth/loginLogger"

export async function logLoginAttempt(
  email: string,
  outcome: "success" | "failure",
  reason?: string
): Promise<void> {
  try {
    const hdrs = await headers()
    const ip =
      hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      hdrs.get("x-real-ip") ??
      ""
    const userAgent = hdrs.get("user-agent") ?? ""

    const suspicious = outcome === "failure" ? await isSuspiciousIp(ip) : false

    await writeLoginLog({
      email,
      outcome,
      reason,
      timestamp: new Date(),
      ip,
      userAgent,
      suspicious,
    })
  } catch {
    console.warn("[loginLog] Failed to write login log")
  }
}
