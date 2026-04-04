/** Returns sorted array of slot start times in 0.5 increments, e.g. [9.0, 9.5, ..., 20.5] */
export function buildTimeSlots(timeStart, timeEnd) {
  const slots = []
  for (let t = timeStart; t < timeEnd; t += 0.5) {
    slots.push(t)
  }
  return slots
}

/** Format a numeric hour (e.g. 14.5) to 12h AM/PM string (e.g. "2:30 PM") */
export function formatTime(t) {
  const h = Math.floor(t)
  const m = t % 1 === 0.5 ? '30' : '00'
  const normalizedH = h >= 24 ? h - 24 : h
  const period = normalizedH >= 12 ? 'PM' : 'AM'
  const h12 = normalizedH === 0 ? 12 : normalizedH > 12 ? normalizedH - 12 : normalizedH
  return `${h12}:${m} ${period}`
}

/** Format ISO date string to short display e.g. "Apr 15" */
export function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function hasSlot(slots, date, time) {
  return (slots[date] ?? []).includes(time)
}

export function addSlot(slots, date, time) {
  const existing = slots[date] ?? []
  if (existing.includes(time)) return slots
  return { ...slots, [date]: [...existing, time].sort((a, b) => a - b) }
}

export function removeSlot(slots, date, time) {
  const existing = slots[date] ?? []
  return { ...slots, [date]: existing.filter((t) => t !== time) }
}

/**
 * Counts how many participants have each slot selected.
 * Returns { [date]: { [time]: count } }
 */
export function countPerSlot(allAvailability, dates, times) {
  const counts = {}
  for (const date of dates) {
    counts[date] = {}
    for (const time of times) counts[date][time] = 0
  }
  for (const row of allAvailability) {
    const slotMap = row.slots ?? {}
    for (const date of dates) {
      for (const t of slotMap[date] ?? []) {
        if (counts[date]?.[t] !== undefined) counts[date][t]++
      }
    }
  }
  return counts
}

/**
 * Heatmap color for dark theme: dark navy (#1a2035) → teal (#10b981)
 */
export function slotColor(count, maxCount) {
  if (maxCount === 0 || count === 0) return { background: '#202020' }
  const t = count / maxCount
  // Interpolate from dark grey (#202020 = 32,32,32) → teal (#10b981 = 16,185,129)
  const r = Math.round(32 + t * (16 - 32))
  const g = Math.round(32 + t * (185 - 32))
  const b = Math.round(32 + t * (129 - 32))
  return { background: `rgb(${r},${g},${b})` }
}

/**
 * Returns top-5 best time blocks across all dates, sorted by count desc then duration desc.
 * counts = result of countPerSlot
 */
export function getBestTimes(counts, dates, times) {
  const blocks = []
  for (const date of dates) {
    let blockStart = null
    let blockMinCount = 0
    let blockLen = 0
    for (const time of [...times, null]) {
      const count = time !== null ? (counts[date]?.[time] ?? 0) : 0
      if (count > 0 && time !== null) {
        if (blockStart === null) { blockStart = time; blockMinCount = count; blockLen = 1 }
        else { blockMinCount = Math.min(blockMinCount, count); blockLen++ }
      } else if (blockStart !== null) {
        blocks.push({
          date,
          start: blockStart,
          end: blockStart + blockLen * 0.5,
          count: blockMinCount,
          duration: blockLen,
        })
        blockStart = null; blockLen = 0; blockMinCount = 0
      }
    }
  }
  return blocks.sort((a, b) => b.count - a.count || b.duration - a.duration).slice(0, 5)
}
