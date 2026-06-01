'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-sm w-full space-y-4 text-center">
          <p className="text-sm font-semibold">Check your email</p>
          <p className="text-sm text-muted-foreground">
            We sent a magic link to{' '}
            <span className="font-mono text-foreground">{email}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Click the link in the email to sign in. It expires in 1 hour.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-sm w-full space-y-6">
        <div>
          <Link href="/" className="text-xs text-muted-foreground font-mono hover:text-foreground transition-colors">
            ← Vouqis
          </Link>
          <h1 className="text-xl font-semibold tracking-tight mt-4">Sign in</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Enter your email — we&apos;ll send a magic link.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-3">
          <input
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm font-mono outline-none focus:ring-1 focus:ring-ring"
          />
          {error && (
            <p className="text-xs text-red-500 font-mono">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading || !email}
            className="w-full rounded-md px-4 py-2.5 text-sm font-semibold bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {loading ? 'Sending link…' : 'Send magic link →'}
          </button>
        </form>

        <p className="text-xs text-muted-foreground text-center">
          No password needed — magic links work for new and returning users.
        </p>
      </div>
    </main>
  )
}
