import * as fs from 'node:fs'
import chalk from 'chalk'
import type {AuditEvent} from './types.js'

export class AuditLogger {
  private readonly stream: fs.WriteStream
  private readonly dashboardUrl: string | null
  private readonly apiKey: string | null

  constructor(logFile: string, dashboardUrl?: string, apiKey?: string) {
    this.stream = fs.createWriteStream(logFile, {flags: 'a'})
    this.dashboardUrl = dashboardUrl ?? null
    this.apiKey = apiKey ?? null
  }

  log(event: AuditEvent): void {
    const line = JSON.stringify(event)
    this.stream.write(line + '\n')
    this.printToStderr(event)
    if (this.dashboardUrl && this.apiKey) {
      this.uploadToDashboard(event)
    }
  }

  close(): void {
    this.stream.end()
  }

  private uploadToDashboard(event: AuditEvent): void {
    fetch(`${this.dashboardUrl}/api/events`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(event),
      signal: AbortSignal.timeout(4000),
    }).catch(() => {
      // fire-and-forget — never affect proxy behaviour
    })
  }

  private printToStderr(event: AuditEvent): void {
    const prefix = this.formatPrefix(event.decision)
    process.stderr.write(prefix + ' ' + JSON.stringify(event) + '\n')
  }

  private formatPrefix(decision: AuditEvent['decision']): string {
    switch (decision) {
      case 'block':   return chalk.red('[block]  ')
      case 'retry':   return chalk.yellow('[retry]  ')
      case 'rewrite': return chalk.yellow('[rewrite]')
      default:        return chalk.dim('[allow]  ')
    }
  }
}
