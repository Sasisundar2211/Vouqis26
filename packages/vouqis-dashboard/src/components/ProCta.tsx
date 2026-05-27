'use client'

import Link from 'next/link'
import {useEffect, useState} from 'react'

export function ProCta() {
  const [plan, setPlan] = useState<'pro' | 'free' | null>(null)
  useEffect(() => {
    setPlan(localStorage.getItem('vouqis_plan') === 'pro' ? 'pro' : 'free')
  }, [])

  if (plan !== 'free') return null

  return (
    <Link
      href="/pro"
      className="shrink-0 rounded-lg px-4 py-2 text-xs font-semibold font-mono transition-opacity hover:opacity-80"
      style={{backgroundColor: '#052e16', color: '#4ade80', border: '1px solid #166534'}}
    >
      Get 90-day history → Pro
    </Link>
  )
}
