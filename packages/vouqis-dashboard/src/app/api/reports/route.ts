import {createClient} from '@supabase/supabase-js'
import {NextRequest} from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
  )

  let body: {
    serverUrl: string
    trustScore: number
    verdict: string
    passCount: number
    failCount: number
    latencyP50: number
    topFailures: Record<string, number>
    probeResults: unknown[]
  }

  try {
    body = await request.json()
  } catch {
    return Response.json({error: 'Invalid JSON body'}, {status: 400})
  }

  const {serverUrl, trustScore, verdict, passCount, failCount, latencyP50, topFailures, probeResults} = body

  if (!serverUrl || trustScore === undefined || !verdict) {
    return Response.json({error: 'Missing required fields'}, {status: 400})
  }

  const rawKey = request.headers.get('x-vouqis-api-key')
  const freeExpiryDays = parseInt(process.env.NEXT_PUBLIC_FREE_REPORT_EXPIRY_DAYS ?? '7')
  let expiryDays = freeExpiryDays
  let validatedApiKey: string | null = null

  if (rawKey) {
    try {
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_KEY!,
      )
      const {data: sub, error: lookupError} = await supabaseAdmin
        .from('subscriptions')
        .select('status, api_key')
        .eq('api_key', rawKey)
        .eq('status', 'active')
        .single()

      if (!lookupError && sub) {
        const proExpiryDays = parseInt(process.env.NEXT_PUBLIC_PRO_REPORT_HISTORY_DAYS ?? '90')
        expiryDays = proExpiryDays
        validatedApiKey = rawKey
      }
      // If lookup errors or finds nothing: silent fallback to free tier
    } catch {
      console.error('[api/reports] api_key lookup failed, falling back to free tier')
    }
  }

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + expiryDays)

  const {data, error} = await supabase
    .from('audit_reports')
    .insert({
      server_url: serverUrl,
      trust_score: trustScore,
      verdict,
      pass_count: passCount,
      fail_count: failCount,
      latency_p50: latencyP50,
      top_failures: topFailures,
      probe_results: probeResults,
      expires_at: expiresAt.toISOString(),
      user_api_key: validatedApiKey,
    })
    .select('id')
    .single()

  if (error || !data) {
    return Response.json({error: error?.message ?? 'Insert failed'}, {status: 500})
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const reportUrl = `${appUrl}/report/${data.id}`

  return Response.json({id: data.id, url: reportUrl, reportUrl})
}
