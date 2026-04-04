import { slotColor } from '../lib/slots'

export default function GridCell({ date, time, mySelected, count, maxCount, editMode = true, isHour = false }) {
  const style = editMode
    ? { background: mySelected ? '#10b981' : '#202020' }
    : slotColor(count, maxCount)

  return (
    <div
      data-date={date}
      data-time={time}
      style={{
        ...style,
        borderRight: '1px solid #2a2a2a',
        borderBottom: '1px solid #2a2a2a',
        borderTop: isHour ? '1px solid #3a3a3a' : 'none',
        height: 20,
        cursor: editMode ? 'pointer' : 'default',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        flexShrink: 0,
      }}
    />
  )
}
