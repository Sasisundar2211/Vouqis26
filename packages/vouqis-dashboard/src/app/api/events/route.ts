import {NextRequest} from 'next/server'
import {supabaseAdmin} from '@/lib/supabase-admin'

// POST /api/events — ingest a single AuditEvent from the proxy CLI
export async function POST(request: NextRequest) {
  const ingestKey = process.env.VOUQIS_INGEST_KEY
  if (ingestKey) {
    const auth = request.headers.get('authorization') ?? ''
    const provided = auth.startsWith('Bearer ') ? auth.slice(7) : ''
    if (provided !== ingestKey) {
      return Response.json({error: 'Unauthorized'}, {status: 401})
    }
  }

  let event: {
    ts: string
    upstream: string
    method: string
    requestId?: string | number | null
    decision: string
    latencyMs: number
    reason?: string
    attempt: number
  }

  try {
    event = await request.json()
  } catch {
    return Response.json({error: 'Invalid JSON'}, {status: 400})
  }

  if (!event.ts || !event.upstream || !event.method || !event.decision) {
    return Response.json({error: 'Missing required fields'}, {status: 400})
  }

  const {error} = await supabaseAdmin.from('traces').insert({
    tool_name: event.method,
    server_url: event.upstream,
    latency_ms: event.latencyMs,
    success: event.decision === 'allow',
    error: event.reason ?? null,
    project_id: '__proxy__',
    params: {decision: event.decision, attempt: event.attempt, requestId: event.requestId ?? null},
    response: null,
    created_at: event.ts,
  })

  if (error) {
    return Response.json({error: error.message}, {status: 500})
  }

  return Response.json({ok: true}, {status: 201})
}

// GET /api/events — return recent proxy events for the live dashboard page
export async function GET() {
  const {data, error} = await supabaseAdmin
    .from('traces')
    .select('id, tool_name, server_url, latency_ms, success, error, params, created_at')
    .eq('project_id', '__proxy__')
    .order('created_at', {ascending: false})
    .limit(200)

  if (error) {
    return Response.json({error: error.message}, {status: 500})
  }

  return Response.json(data ?? [])
}
