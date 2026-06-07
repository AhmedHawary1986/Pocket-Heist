"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Navbar from "@/components/Navbar"
import Spinner from "@/components/Spinner"
import { useUser } from "@/components/UserProvider/UserProvider"

export default function HeistsLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { user, loading } = useUser()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?redirect=" + encodeURIComponent(pathname))
    }
  }, [loading, user, pathname, router])

  if (loading || !user) {
    return <Spinner />
  }

  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  )
}
