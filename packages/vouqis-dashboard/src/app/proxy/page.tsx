'use client'

import {useEffect, useRef, useState} from 'react'
import {Badge} from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface ProxyEvent {
  id: string
  tool_name: string
  server_url: string
  latency_ms: number
  success: boolean
  error: string | null
  params: {decision: string; attempt: number; requestId?: string | number | null}
  created_at: string
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 5) return 'just now'
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  return `${Math.floor(m / 60)}h ago`
}

function DecisionBadge({decision}: {decision: string}) {
  if (decision === 'allow') {
    return (
      <Badge className="bg-green-500/10 text-green-600 border-green-500/30 dark:text-green-400">
        ✓ allow
      </Badge>
    )
  }
  if (decision === 'block') {
    return <Badge variant="destructive">✗ block</Badge>
  }
  if (decision === 'retry') {
    return (
      <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30 dark:text-yellow-400">
        ↺ retry
      </Badge>
    )
  }
  return (
    <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30 dark:text-yellow-400">
      ~ rewrite
    </Badge>
  )
}

function LatencyCell({ms}: {ms: number}) {
  const cls =
    ms < 200
      ? 'text-green-600 dark:text-green-400'
      : ms < 1000
        ? 'text-yellow-600 dark:text-yellow-400'
        : 'text-red-500'
  return <span className={`font-mono text-xs ${cls}`}>{ms}ms</span>
}

export default function ProxyPage() {
  const [events, setEvents] = useState<ProxyEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [live, setLive] = useState(true)
  const knownIds = useRef(new Set<string>())
  const [newIds, setNewIds] = useState(new Set<string>())

  async function fetchEvents() {
    const res = await fetch('/api/events', {cache: 'no-store'})
    if (!res.ok) return
    const data: ProxyEvent[] = await res.json()

    const incoming = new Set(data.map((e) => e.id))
    const added = data.filter((e) => !knownIds.current.has(e.id)).map((e) => e.id)

    if (added.length > 0) {
      setNewIds(new Set(added))
      setTimeout(() => setNewIds(new Set()), 1500)
    }

    for (const id of incoming) knownIds.current.add(id)
    setEvents(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    if (!live) return
    const id = setInterval(fetchEvents, 3000)
    return () => clearInterval(id)
  }, [live])

  const counts = events.reduce(
    (acc, e) => {
      const d = e.params?.decision ?? (e.success ? 'allow' : 'block')
      acc[d] = (acc[d] ?? 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Proxy Events</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Live stream from <code className="font-mono text-xs">vouqis proxy</code>
            </p>
          </div>
          <button
            onClick={() => setLive((v) => !v)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <span
              className={`inline-block w-2 h-2 rounded-full ${live ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground'}`}
            />
            {live ? 'Live' : 'Paused'}
          </button>
        </div>

        {/* Stats bar */}
        <div className="flex gap-6 text-sm">
          <span>
            <span className="text-muted-foreground">Total</span>{' '}
            <span className="font-medium font-mono">{events.length}</span>
          </span>
          {(['allow', 'block', 'retry', 'rewrite'] as const).map((d) =>
            counts[d] ? (
              <span key={d}>
                <span className="text-muted-foreground">{d}</span>{' '}
                <span className="font-medium font-mono">{counts[d]}</span>
              </span>
            ) : null,
          )}
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : events.length === 0 ? (
          <div className="rounded-lg border border-dashed p-12 text-center space-y-3">
            <p className="text-muted-foreground text-sm">No events yet.</p>
            <p className="text-xs text-muted-foreground font-mono">
              vouqis proxy --upstream https://your-mcp-server.com --api-key YOUR_KEY
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Decision</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Upstream</TableHead>
                <TableHead>Latency</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((e) => {
                const decision = e.params?.decision ?? (e.success ? 'allow' : 'block')
                const isNew = newIds.has(e.id)
                return (
                  <TableRow
                    key={e.id}
                    className={isNew ? 'bg-primary/5 transition-colors duration-1000' : ''}
                  >
                    <TableCell>
                      <DecisionBadge decision={decision} />
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs">{e.tool_name}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs text-muted-foreground truncate max-w-[200px] block">
                        {e.server_url}
                      </span>
                    </TableCell>
                    <TableCell>
                      <LatencyCell ms={e.latency_ms} />
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground truncate max-w-[240px] block">
                        {e.error ?? '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">{timeAgo(e.created_at)}</span>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </main>
  )
}
