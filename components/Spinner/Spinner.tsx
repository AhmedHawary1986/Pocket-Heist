"use client"

export default function Spinner() {
  return (
    <div className="center-content">
      <div
        className="w-10 h-10 rounded-full border-4 border-transparent animate-spin"
        style={{ borderTopColor: "var(--color-primary)" }}
        role="status"
        aria-label="Loading"
      />
    </div>
  )
}
