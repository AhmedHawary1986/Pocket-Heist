"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import styles from "./AuthForm.module.css"

interface AuthFormProps {
  mode: "login" | "signup"
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const isLogin = mode === "login"
  const heading = isLogin ? "Log in to Your Account" : "Signup for an Account"
  const submitLabel = isLogin ? "Log In" : "Sign Up"
  const switchText = isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"
  const switchHref = isLogin ? "/signup" : "/login"

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    console.log({ email, password })
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
        <button type="submit" className={`btn ${styles.submitBtn}`}>
          {submitLabel}
        </button>
      </form>
      <Link href={switchHref} className={styles.switchLink}>
        {switchText}
      </Link>
    </div>
  )
}
