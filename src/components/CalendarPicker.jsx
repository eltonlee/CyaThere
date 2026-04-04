import { useState } from 'react'

const DAY_HEADERS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function isoDate(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export default function CalendarPicker({ selectedDates, onToggle, readOnly = false, initialIso }) {
  const startFrom = initialIso ? new Date(initialIso + 'T12:00:00') : new Date()
  const [viewYear, setViewYear] = useState(startFrom.getFullYear())
  const [viewMonth, setViewMonth] = useState(startFrom.getMonth())

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  function prev() {
    if (!readOnly) {
      const t = new Date()
      if (viewYear === t.getFullYear() && viewMonth === t.getMonth()) return
    }
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }

  function next() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  return (
    <div style={{ maxWidth: 320 }}>
      {/* Month nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <button onClick={prev} style={navBtn}>‹</button>
        <span style={{ fontSize: 15, fontWeight: 600, color: '#e2e8f0' }}>{monthLabel}</span>
        <button onClick={next} style={navBtn}>›</button>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
        {DAY_HEADERS.map((h) => (
          <div key={h} style={{ textAlign: 'center', fontSize: 11, color: '#6b7280', padding: '2px 0' }}>{h}</div>
        ))}
      </div>

      {/* Day cells */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} />
          const iso = isoDate(viewYear, viewMonth, day)
          const isPast = !readOnly && new Date(viewYear, viewMonth, day) < today
          const selected = selectedDates.has(iso)
          return (
            <button
              key={iso}
              onClick={() => !isPast && !readOnly && onToggle(iso)}
              disabled={isPast}
              style={{
                padding: '8px 0',
                border: selected ? '2px solid #10b981' : '2px solid transparent',
                borderRadius: 6,
                cursor: (isPast || readOnly) ? 'default' : 'pointer',
                background: selected ? '#10b981' : 'transparent',
                color: isPast ? '#383838' : selected ? '#fff' : '#e2e8f0',
                fontWeight: selected ? 700 : 400,
                fontSize: 14,
              }}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

const navBtn = {
  background: 'none',
  border: '1px solid #383838',
  borderRadius: 4,
  padding: '3px 10px',
  cursor: 'pointer',
  fontSize: 18,
  color: '#9ca3af',
  lineHeight: 1,
}
