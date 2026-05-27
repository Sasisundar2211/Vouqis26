'use client'

import {useEffect, useState} from 'react'
import Link from 'next/link'

export function PlanBadge() {
  const [plan, setPlan] = useState<'pro' | 'free' | null>(null)

  useEffect(() => {
    setPlan(localStorage.getItem('vouqis_plan') === 'pro' ? 'pro' : 'free')
  }, [])

  if (plan === null) return null

  if (plan === 'pro') {
    return (
      <span
        className="ml-auto flex items-center gap-1 text-xs font-mono font-bold px-2 py-0.5 rounded-full"
        style={{backgroundColor: '#052e16', color: '#4ade80', border: '1px solid #166534'}}
      >
        ⚡ Pro
      </span>
    )
  }

  return (
    <Link
      href="/pro"
      className="ml-auto text-xs font-semibold px-3 py-1 rounded-full transition-opacity hover:opacity-80"
      style={{backgroundColor: '#1e1a00', color: '#facc15', border: '1px solid #713f12'}}
    >
      Free Plan — Upgrade to Pro →
    </Link>
  )
}
