import { useState, useRef, useCallback } from 'react'
import GridCell from './GridCell'
import { hasSlot, addSlot, removeSlot, countPerSlot, formatDate, formatTime } from '../lib/slots'

const COL_WIDTH = 90
const ROW_LABEL_WIDTH = 75
const CELL_HEIGHT = 20

export default function AvailabilityGrid({
  dates,
  times,
  mySlots,
  allAvailability,
  onSlotsChange,
  editMode = true,
}) {
  const [pendingSlots, setPendingSlots] = useState(null)
  const dragMode = useRef(null)
  const painted = useRef(new Set())
  const isDragging = useRef(false)

  const effectiveSlots = pendingSlots ?? mySlots
  const heatmapCounts = countPerSlot(allAvailability, dates, times)
  const participantCount = allAvailability.length

  function cellFromPoint(x, y) {
    const el = document.elementFromPoint(x, y)
    if (!el) return null
    const target = el.closest('[data-date]') ?? (el.dataset?.date ? el : null)
    if (!target) return null
    return { date: target.dataset.date, time: Number(target.dataset.time) }
  }

  function startDrag(x, y) {
    const cell = cellFromPoint(x, y)
    if (!cell || !cell.date || isNaN(cell.time)) return
    const base = pendingSlots ?? mySlots
    dragMode.current = hasSlot(base, cell.date, cell.time) ? 'remove' : 'add'
    isDragging.current = true
    painted.current = new Set([`${cell.date}|${cell.time}`])
    const next = dragMode.current === 'add'
      ? addSlot(base, cell.date, cell.time)
      : removeSlot(base, cell.date, cell.time)
    setPendingSlots(next)
  }

  function moveDrag(x, y) {
    if (!isDragging.current) return
    const cell = cellFromPoint(x, y)
    if (!cell || !cell.date || isNaN(cell.time)) return
    const key = `${cell.date}|${cell.time}`
    if (painted.current.has(key)) return
    painted.current.add(key)
    setPendingSlots((prev) => {
      const base = prev ?? mySlots
      return dragMode.current === 'add'
        ? addSlot(base, cell.date, cell.time)
        : removeSlot(base, cell.date, cell.time)
    })
  }

  function endDrag() {
    if (!isDragging.current) return
    isDragging.current = false
    dragMode.current = null
    painted.current = new Set()
    setPendingSlots((final) => {
      if (final) queueMicrotask(() => onSlotsChange(final))
      return null
    })
  }

  const onMouseDown = useCallback((e) => {
    if (!editMode) return
    e.preventDefault()
    startDrag(e.clientX, e.clientY)
    const onMove = (e) => moveDrag(e.clientX, e.clientY)
    const onUp = () => { endDrag(); window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [editMode, mySlots, pendingSlots]) // eslint-disable-line

  const onTouchStart = useCallback((e) => {
    if (!editMode) return
    e.preventDefault()
    const t = e.touches[0]
    startDrag(t.clientX, t.clientY)
  }, [editMode, mySlots, pendingSlots]) // eslint-disable-line

  const onTouchMove = useCallback((e) => {
    if (!editMode) return
    e.preventDefault()
    const t = e.touches[0]
    moveDrag(t.clientX, t.clientY)
  }, [editMode])

  const onTouchEnd = useCallback(() => {
    if (!editMode) return
    endDrag()
  }, [editMode])

  return (
    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <div
        style={{
          display: 'inline-block',
          minWidth: ROW_LABEL_WIDTH + dates.length * COL_WIDTH,
          touchAction: editMode ? 'none' : 'auto',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Column headers */}
        <div style={{ display: 'flex', marginBottom: 4 }}>
          <div style={{ width: ROW_LABEL_WIDTH, flexShrink: 0 }} />
          {dates.map((date) => (
            <div key={date} style={{ width: COL_WIDTH, flexShrink: 0, textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#999' }}>
              {formatDate(date)}
            </div>
          ))}
        </div>

        {/* Time rows — no wrapper borders; GridCell owns all borders including hour lines */}
        {times.map((time) => {
          const isHour = time % 1 === 0
          return (
            <div key={time} style={{ display: 'flex' }}>
              <div style={{
                width: ROW_LABEL_WIDTH,
                flexShrink: 0,
                textAlign: 'right',
                paddingRight: 8,
                fontSize: 11,
                color: '#666',
                height: CELL_HEIGHT,
                lineHeight: `${CELL_HEIGHT}px`,
              }}>
                {isHour ? formatTime(time) : ''}
              </div>
              {dates.map((date) => (
                <div key={date} style={{ width: COL_WIDTH, flexShrink: 0 }}>
                  <GridCell
                    date={date}
                    time={time}
                    mySelected={hasSlot(effectiveSlots, date, time)}
                    count={heatmapCounts[date]?.[time] ?? 0}
                    maxCount={participantCount}
                    editMode={editMode}
                    isHour={isHour}
                  />
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
