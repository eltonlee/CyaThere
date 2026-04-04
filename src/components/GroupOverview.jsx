import { useState, useMemo } from 'react'
import { countPerSlot, getBestTimes, formatDate, formatTime } from '../lib/slots'
import AvailabilityGrid from './AvailabilityGrid'
import HeatmapLegend from './HeatmapLegend'

export default function GroupOverview({ room, times, allAvailability, loading }) {
  const [excluded, setExcluded] = useState(new Set())

  // Derive the union of all dates anyone has marked availability for
  const allDates = useMemo(
    () => [...new Set(allAvailability.flatMap((r) => Object.keys(r.slots ?? {})))].sort(),
    [allAvailability]
  )

  const filtered = useMemo(
    () => allAvailability.filter((r) => !excluded.has(r.participant)),
    [allAvailability, excluded]
  )
  const total = filtered.length

  const counts = useMemo(
    () => countPerSlot(filtered, allDates, times),
    [filtered, allDates, times]
  )

  const everyoneFreeCount = useMemo(() => {
    if (total === 0) return 0
    let n = 0
    for (const date of allDates) {
      for (const time of times) {
        if ((counts[date]?.[time] ?? 0) >= total) n++
      }
    }
    return n
  }, [counts, allDates, times, total])

  const bestTimes = useMemo(
    () => getBestTimes(counts, allDates, times),
    [counts, allDates, times]
  )

  function toggleExclude(participant) {
    setExcluded((prev) => {
      const next = new Set(prev)
      if (next.has(participant)) next.delete(participant)
      else next.add(participant)
      return next
    })
  }

  if (loading) return <p style={{ color: '#6b7280', padding: '32px 0' }}>Loading…</p>

  return (
    <div style={{ padding: '24px 0' }}>
      {/* Stats */}
      <div style={{ display: 'flex', gap: 32, marginBottom: 28 }}>
        <Stat value={allAvailability.length} label="people" />
        <Stat value={allDates.length} label="dates" />
        <Stat value={everyoneFreeCount} label="slots everyone's free" />
      </div>

      {/* Participant filter chips */}
      {allAvailability.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 24 }}>
          {allAvailability.map((row) => {
            const isExcluded = excluded.has(row.participant)
            return (
              <button
                key={row.id}
                onClick={() => toggleExclude(row.participant)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '5px 10px',
                  background: isExcluded ? 'transparent' : '#252525',
                  border: `1px solid ${isExcluded ? '#383838' : '#484848'}`,
                  borderRadius: 20,
                  color: isExcluded ? '#484848' : '#d1d5db',
                  fontSize: 13, cursor: 'pointer',
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: isExcluded ? '#383838' : '#10b981', flexShrink: 0 }} />
                {row.participant}
                {isExcluded && <span style={{ fontSize: 11, opacity: 0.6 }}> ×</span>}
              </button>
            )
          })}
        </div>
      )}

      {allAvailability.length === 0 ? (
        <p style={{ color: '#6b7280', fontSize: 14 }}>No one has submitted availability yet.</p>
      ) : allDates.length === 0 ? (
        <p style={{ color: '#6b7280', fontSize: 14 }}>No dates selected yet.</p>
      ) : (
        <>
          {/* Best times */}
          {bestTimes.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <p style={sectionLabel}>BEST TIMES</p>
              {bestTimes.map((b, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '10px 0', borderBottom: '1px solid #252525' }}>
                  <span style={{ color: '#e2e8f0', fontSize: 14, minWidth: 200 }}>
                    {formatDate(b.date)}, {formatTime(b.start)} – {formatTime(b.end)}
                  </span>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1, height: 6, background: '#252525', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${(b.count / total) * 100}%`, height: '100%', background: '#10b981', borderRadius: 3 }} />
                    </div>
                    <span style={{ color: '#6b7280', fontSize: 13, whiteSpace: 'nowrap' }}>{b.count} of {total}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Heatmap */}
          <p style={{ ...sectionLabel, marginBottom: 10 }}>darker = more people free</p>
          <AvailabilityGrid
            dates={allDates}
            times={times}
            mySlots={{}}
            allAvailability={filtered}
            onSlotsChange={() => {}}
            editMode={false}
          />
          <div style={{ marginTop: 14 }}>
            <HeatmapLegend maxCount={total} />
          </div>
        </>
      )}
    </div>
  )
}

function Stat({ value, label }) {
  return (
    <div>
      <div style={{ fontSize: 32, fontWeight: 700, color: '#f9fafb', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{label}</div>
    </div>
  )
}

const sectionLabel = {
  fontSize: 11, fontWeight: 600, color: '#6b7280',
  textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12,
}
