'use client'

import {useRouter, useSearchParams, usePathname} from 'next/navigation'
import {useCallback} from 'react'

export function EvalsFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams],
  )

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <input
        type="text"
        placeholder="Filter by server URL…"
        defaultValue={searchParams.get('url') ?? ''}
        onChange={(e) => update('url', e.target.value)}
        className="h-8 rounded-md border bg-background px-3 text-xs font-mono w-64 focus:outline-none focus:ring-1 focus:ring-ring"
      />
      <select
        defaultValue={searchParams.get('verdict') ?? ''}
        onChange={(e) => update('verdict', e.target.value)}
        className="h-8 rounded-md border bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
      >
        <option value="">All verdicts</option>
        <option value="APPROVED">✓ Approved (≥80)</option>
        <option value="RISKY">⚠ Risky (50–79)</option>
        <option value="DNI">✗ Do Not Integrate (&lt;50)</option>
      </select>
      <input
        type="date"
        defaultValue={searchParams.get('from') ?? ''}
        onChange={(e) => update('from', e.target.value)}
        className="h-8 rounded-md border bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
      />
      {(searchParams.get('url') || searchParams.get('verdict') || searchParams.get('from')) && (
        <button
          onClick={() => router.push(pathname)}
          className="h-8 px-3 text-xs rounded-md border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
