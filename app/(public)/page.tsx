// this page should be used only as a splash page to decide where a user should be navigated to
// when logged in --> to /heists
// when not logged in --> to /login

import { Clock8 } from "lucide-react"

export default function Home() {
  return (
    <div className="center-content">
      <div className="page-content">
        <h1>
          P<Clock8 className="logo" strokeWidth={2.75} />cket Heist
        </h1>
        <div>Steal the day. Own the office.</div>
        <p className="mt-4 text-sm text-gray-400 max-w-sm text-center">
          Welcome to Pocket Heist — your hub for sneaky workplace challenges.
          Complete missions, outsmart your colleagues, and climb the ranks of
          office infamy. Every great heist starts with a single step.
        </p>
      </div>
    </div>
  )
}
