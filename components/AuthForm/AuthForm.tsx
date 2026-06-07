"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import styles from "./AuthForm.module.css"
import { signup } from "@/lib/auth/signup"
import { login } from "@/lib/auth/login"
import { logLoginAttempt } from "@/app/actions/logLoginAttempt"

interface AuthFormProps {
  mode: "login" | "signup"
}

function humanReadableError(err: unknown): string {
  const code = (err as { code?: string }).code
  if (code === "auth/email-already-in-use") return "An account with this email already exists."
  if (code === "auth/weak-password") return "Password must be at least 6 characters."
  if (code === "auth/invalid-email") return "Please enter a valid email address."
  if (code === "auth/invalid-login-credentials") return "Incorrect email or password."
  if (code === "auth/wrong-password") return "Incorrect email or password."
  if (code === "auth/user-not-found") return "No account found with that email."
  if (code === "auth/too-many-requests") return "Too many attempts. Please try again later."
  return "Something went wrong. Please try again."
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [successName, setSuccessName] = useState("")

  const isLogin = mode === "login"
  const heading = isLogin ? "Log in to Your Account" : "Signup for an Account"
  const submitLabel = isLogin ? "Log In" : "Sign Up"
  const switchText = isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"
  const switchHref = isLogin ? "/signup" : "/login"

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (mode === "signup") {
      setLoading(true)
      setError(null)
      try {
        await signup(email, password)
        router.push("/heists")
      } catch (err) {
        setError(humanReadableError(err))
      } finally {
        setLoading(false)
      }
    } else {
      setLoading(true)
      setError(null)
      try {
        const displayName = await login(email, password)
        setSuccessName(displayName)
        setSuccess(true)
        void logLoginAttempt(email, "success")
      } catch (err) {
        setError(humanReadableError(err))
        void logLoginAttempt(email, "failure", (err as { code?: string }).code ?? "unknown")
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className={styles.authForm}>
      <h1 className="form-title">{heading}</h1>
      <form onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="password">Password</label>
          <div className={styles.passwordWrapper}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
            <button
              type="button"
              className={styles.toggleBtn}
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword
                ? <EyeOff size={18} strokeWidth={2} />
                : <Eye size={18} strokeWidth={2} />
              }
            </button>
          </div>
        </div>
        {error && <p role="alert" className={styles.errorMsg}>{error}</p>}
        {success ? (
          <p role="status" className={styles.successMsg}>Welcome, {successName}.</p>
        ) : (
          <button type="submit" className={`btn ${styles.submitBtn}`} disabled={loading}>
            {loading ? (mode === "signup" ? "Signing up…" : "Logging in…") : submitLabel}
          </button>
        )}
      </form>
      <Link href={switchHref} className={styles.switchLink}>
        {switchText}
      </Link>
    </div>
  )
}
