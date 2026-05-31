"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Footer from "@/components/Footer"
import Spinner from "@/components/Spinner"
import { useUser } from "@/components/UserProvider/UserProvider"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { user, loading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      const params = new URLSearchParams(window.location.search)
      const redirect = params.get("redirect")
      const target = redirect && redirect.startsWith("/") ? redirect : "/heists"
      router.replace(target)
    }
  }, [loading, user, router])

  if (loading || user) {
    return <Spinner />
  }

  return (
    <>
      <main className="public">
        {children}
      </main>
      <Footer />
    </>
  )
}
