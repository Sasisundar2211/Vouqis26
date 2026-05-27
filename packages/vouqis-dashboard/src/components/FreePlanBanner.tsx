'use client'

import Link from 'next/link'
import {useEffect, useState} from 'react'

export function FreePlanBanner() {
  const [plan, setPlan] = useState<'pro' | 'free' | null>(null)
  useEffect(() => {
    setPlan(localStorage.getItem('vouqis_plan') === 'pro' ? 'pro' : 'free')
  }, [])

  if (plan !== 'free') return null

  return (
    <div
      className="rounded-lg border px-4 py-3 text-sm flex items-center justify-between gap-4"
      style={{backgroundColor: '#1c1400', borderColor: '#92400e', color: '#fbbf24'}}
    >
      <span>
        <strong>Free Plan</strong> — showing last 7 days only. Pro unlocks 90-day history,
        team sharing, and private report links.
      </span>
      <Link
        href="/pro"
        className="shrink-0 rounded px-3 py-1 text-xs font-semibold font-mono hover:opacity-80 transition-opacity"
        style={{backgroundColor: '#92400e', color: '#fef3c7'}}
      >
        Upgrade → Pro
      </Link>
    </div>
  )
}
