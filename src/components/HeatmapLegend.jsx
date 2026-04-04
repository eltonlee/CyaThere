import { slotColor } from '../lib/slots'

export default function HeatmapLegend({ maxCount }) {
  if (maxCount === 0) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#6b7280' }}>
      <span>fewer</span>
      <div style={{ display: 'flex', height: 12, borderRadius: 3, overflow: 'hidden', flex: '0 0 100px' }}>
        {Array.from({ length: 20 }, (_, i) => {
          const count = Math.round((i / 19) * maxCount)
          const style = slotColor(count, maxCount)
          return <div key={i} style={{ ...style, flex: 1 }} />
        })}
      </div>
      <span>more people free</span>
    </div>
  )
}
