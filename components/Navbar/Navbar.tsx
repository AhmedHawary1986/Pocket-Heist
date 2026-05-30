"use client"

import { Clock8 } from "lucide-react"
import Link from "next/link"
import Avatar from "@/components/Avatar"
import { useUser } from "@/components/UserProvider"
import styles from "./Navbar.module.css"

export default function Navbar() {
  const { user, loading } = useUser()

  return (
    <div className={styles.siteNav}>
      <nav>
        <header>
          <h1>
            <Link href="/heists">
              P<Clock8 className={styles.logo} size={14} strokeWidth={2.75} />
              cket Heist
            </Link>
          </h1>
          <div>Tiny missions. Big office mischief.</div>
        </header>
        <ul>
          <li>
            <Link href="/heists/create" className="btn"><span>+</span> Create New Heist</Link>
          </li>
          <li>
            {loading && (
              <div className={styles.avatarPlaceholder} aria-hidden="true" />
            )}
            {!loading && user && (
              <Avatar name={user.email ?? "?"} />
            )}
          </li>
        </ul>
      </nav>
    </div>
  )
}
