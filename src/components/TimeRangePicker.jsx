function hourLabel(h) {
  if (h === 0) return '12:00 AM'
  if (h === 12) return '12:00 PM'
  return h < 12 ? `${h}:00 AM` : `${h - 12}:00 PM`
}

export default function TimeRangePicker({ timeStart, timeEnd, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
      <label style={labelStyle}>
        From
        <select value={timeStart} onChange={(e) => onChange(Number(e.target.value), timeEnd)} style={selectStyle}>
          {Array.from({ length: 24 }, (_, h) => (
            <option key={h} value={h} disabled={h >= timeEnd}>{hourLabel(h)}</option>
          ))}
        </select>
      </label>
      <label style={labelStyle}>
        To
        <select value={timeEnd} onChange={(e) => onChange(timeStart, Number(e.target.value))} style={selectStyle}>
          {Array.from({ length: 24 }, (_, h) => (
            <option key={h + 1} value={h + 1} disabled={h + 1 <= timeStart}>{hourLabel(h + 1)}</option>
          ))}
        </select>
      </label>
    </div>
  )
}

const labelStyle = { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14, fontWeight: 500, color: '#9ca3af' }
const selectStyle = {
  padding: '7px 10px', border: '1px solid #374151', borderRadius: 6,
  fontSize: 14, background: '#1f2937', color: '#e2e8f0', cursor: 'pointer',
}
