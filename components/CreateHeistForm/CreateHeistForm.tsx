"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useUser } from "@/components/UserProvider"
import type { FirestoreUser } from "@/types/firestore/user"
import type { CreateHeistInput } from "@/types/firestore/heist"
import styles from "./CreateHeistForm.module.css"

export default function CreateHeistForm() {
  const router = useRouter()
  const { user } = useUser()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [assignedTo, setAssignedTo] = useState("")
  const [assignedToCodeName, setAssignedToCodeName] = useState("")
  const [users, setUsers] = useState<FirestoreUser[]>([])
  const [createdByCodeName, setCreatedByCodeName] = useState("")
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function fetchUsers() {
      try {
        const snapshot = await getDocs(collection(db, "users"))
        const fetched: FirestoreUser[] = snapshot.docs.map((doc) => doc.data() as FirestoreUser)
        setUsers(fetched)

        const currentUserDoc = fetched.find((u) => u.id === user?.uid)
        if (!currentUserDoc) {
          setError("Your operative profile was not found. Please contact support.")
        } else {
          setCreatedByCodeName(currentUserDoc.codename)
        }
      } catch {
        setError("Failed to load operatives. Please refresh and try again.")
      } finally {
        setLoadingUsers(false)
      }
    }

    if (user) fetchUsers()
  }, [user])

  function handleAssigneeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const selectedId = e.target.value
    const selected = users.find((u) => u.id === selectedId)
    setAssignedTo(selectedId)
    setAssignedToCodeName(selected?.codename ?? "")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!title.trim()) { setError("Mission title is required."); return }
    if (!description.trim()) { setError("Mission briefing is required."); return }
    if (!assignedTo) { setError("You must assign this heist to an operative."); return }
    if (!createdByCodeName) { setError("Your operative profile was not found."); return }

    setSubmitting(true)
    setError(null)

    try {
      const payload: CreateHeistInput = {
        title: title.trim(),
        description: description.trim(),
        createdBy: user!.uid,
        createdByCodeName,
        assignedTo,
        assignedToCodeName,
        deadline: new Date(Date.now() + 48 * 60 * 60 * 1000),
        finalStatus: null,
        createdAt: serverTimestamp(),
      }

      await addDoc(collection(db, "heists"), payload)
      router.push("/heists")
    } catch {
      setError("Mission submission failed. Check your connection and try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const isDisabled = submitting || loadingUsers

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <h2 className="form-title">Plan a New Heist</h2>

      <div className={styles.field}>
        <label htmlFor="title">Mission Title</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. The Diamond Exchange"
          disabled={isDisabled}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="description">Mission Briefing</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the objective, entry points, and contingencies…"
          disabled={isDisabled}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="assignedTo">Assigned Operative</label>
        <select
          id="assignedTo"
          value={assignedTo}
          onChange={handleAssigneeChange}
          disabled={isDisabled}
        >
          <option value="">— Select an operative —</option>
          {users.length === 0 && !loadingUsers
            ? <option disabled>No operatives found</option>
            : users.map((u) => (
                <option key={u.id} value={u.id}>{u.codename}</option>
              ))
          }
        </select>
      </div>

      {error && <p role="alert" className={styles.errorMsg}>{error}</p>}

      <button type="submit" className={`btn ${styles.submitBtn}`} disabled={isDisabled}>
        {submitting ? "Submitting…" : "Submit Mission"}
      </button>
    </form>
  )
}
