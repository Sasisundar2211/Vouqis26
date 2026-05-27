export function ScoreSparkline({scores}: {scores: number[]}) {
  if (scores.length < 2) return null
  const W = 60
  const H = 20
  const min = 0
  const max = 100
  const pts = scores
    .map((s, i) => {
      const x = (i / (scores.length - 1)) * W
      const y = H - ((s - min) / (max - min)) * H
      return `${x},${y}`
    })
    .join(' ')

  const last = scores[scores.length - 1]
  const color = last >= 80 ? '#4ade80' : last >= 50 ? '#facc15' : '#f87171'

  return (
    <svg width={W} height={H} className="shrink-0">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}
