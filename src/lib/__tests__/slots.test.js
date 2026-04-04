import { describe, it, expect } from 'vitest'
import {
  buildTimeSlots,
  formatTime,
  formatDate,
  hasSlot,
  addSlot,
  removeSlot,
  selectAllSlots,
  clearAllSlots,
  countPerSlot,
  getBestTimes,
} from '../slots'

describe('buildTimeSlots', () => {
  it('generates slots from 6 to 22 in 0.5 increments', () => {
    const slots = buildTimeSlots(6, 22)
    expect(slots).toEqual([6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13, 13.5, 14, 14.5, 15, 15.5, 16, 16.5, 17, 17.5, 18, 18.5, 19, 19.5, 20, 20.5, 21, 21.5])
  })

  it('generates slots from 0 to 24 (full day)', () => {
    const slots = buildTimeSlots(0, 24)
    expect(slots[0]).toBe(0)
    expect(slots[slots.length - 1]).toBe(23.5)
    expect(slots.length).toBe(48)
  })

  it('generates slots from 6 to 30 (24h starting 6am)', () => {
    const slots = buildTimeSlots(6, 30)
    expect(slots[0]).toBe(6)
    expect(slots[slots.length - 1]).toBe(29.5)
    expect(slots.length).toBe(48)
  })

  it('handles single hour range', () => {
    const slots = buildTimeSlots(9, 10)
    expect(slots).toEqual([9, 9.5])
  })

  it('returns empty array when start >= end', () => {
    expect(buildTimeSlots(10, 10)).toEqual([])
    expect(buildTimeSlots(12, 8)).toEqual([])
  })
})

describe('formatTime', () => {
  it('formats midnight as 12:00 AM', () => {
    expect(formatTime(0)).toBe('12:00 AM')
  })

  it('formats noon as 12:00 PM', () => {
    expect(formatTime(12)).toBe('12:00 PM')
  })

  it('formats morning hours correctly', () => {
    expect(formatTime(6)).toBe('6:00 AM')
    expect(formatTime(6.5)).toBe('6:30 AM')
    expect(formatTime(9)).toBe('9:00 AM')
    expect(formatTime(11.5)).toBe('11:30 AM')
  })

  it('formats afternoon/evening hours correctly', () => {
    expect(formatTime(13)).toBe('1:00 PM')
    expect(formatTime(13.5)).toBe('1:30 PM')
    expect(formatTime(18)).toBe('6:00 PM')
    expect(formatTime(21.5)).toBe('9:30 PM')
  })

  it('formats next-day hours correctly (past 24)', () => {
    expect(formatTime(24)).toBe('12:00 AM')
    expect(formatTime(25.5)).toBe('1:30 AM')
    expect(formatTime(29.5)).toBe('5:30 AM')
  })

  it('formats 11:59 range correctly', () => {
    expect(formatTime(23)).toBe('11:00 PM')
    expect(formatTime(23.5)).toBe('11:30 PM')
  })
})

describe('formatDate', () => {
  it('formats ISO date to short display', () => {
    expect(formatDate('2026-04-15')).toBe('Apr 15')
  })

  it('handles January dates', () => {
    expect(formatDate('2026-01-01')).toBe('Jan 1')
  })

  it('handles December dates', () => {
    expect(formatDate('2026-12-31')).toBe('Dec 31')
  })
})

describe('hasSlot', () => {
  it('returns true when slot exists', () => {
    const slots = { '2026-04-15': [9, 9.5, 10] }
    expect(hasSlot(slots, '2026-04-15', 9)).toBe(true)
    expect(hasSlot(slots, '2026-04-15', 10)).toBe(true)
  })

  it('returns false when slot does not exist', () => {
    const slots = { '2026-04-15': [9, 9.5, 10] }
    expect(hasSlot(slots, '2026-04-15', 11)).toBe(false)
  })

  it('returns false for missing date', () => {
    const slots = { '2026-04-15': [9] }
    expect(hasSlot(slots, '2026-04-16', 9)).toBe(false)
  })

  it('returns false for empty slots', () => {
    expect(hasSlot({}, '2026-04-15', 9)).toBe(false)
  })
})

describe('addSlot', () => {
  it('adds a new slot to an empty date', () => {
    const result = addSlot({}, '2026-04-15', 9)
    expect(result).toEqual({ '2026-04-15': [9] })
  })

  it('adds a slot to existing date', () => {
    const slots = { '2026-04-15': [9] }
    const result = addSlot(slots, '2026-04-15', 10)
    expect(result).toEqual({ '2026-04-15': [9, 10] })
  })

  it('keeps slots sorted', () => {
    const slots = { '2026-04-15': [10, 11] }
    const result = addSlot(slots, '2026-04-15', 9)
    expect(result['2026-04-15']).toEqual([9, 10, 11])
  })

  it('does not duplicate existing slot', () => {
    const slots = { '2026-04-15': [9, 10] }
    const result = addSlot(slots, '2026-04-15', 9)
    expect(result['2026-04-15']).toEqual([9, 10])
  })

  it('does not mutate original object', () => {
    const slots = { '2026-04-15': [9] }
    addSlot(slots, '2026-04-15', 10)
    expect(slots).toEqual({ '2026-04-15': [9] })
  })
})

describe('removeSlot', () => {
  it('removes an existing slot', () => {
    const slots = { '2026-04-15': [9, 9.5, 10] }
    const result = removeSlot(slots, '2026-04-15', 9.5)
    expect(result).toEqual({ '2026-04-15': [9, 10] })
  })

  it('removes date entry when last slot is removed', () => {
    const slots = { '2026-04-15': [9] }
    const result = removeSlot(slots, '2026-04-15', 9)
    expect(result).toEqual({ '2026-04-15': [] })
  })

  it('does nothing for missing slot', () => {
    const slots = { '2026-04-15': [9, 10] }
    const result = removeSlot(slots, '2026-04-15', 11)
    expect(result).toEqual({ '2026-04-15': [9, 10] })
  })

  it('does not mutate original object', () => {
    const slots = { '2026-04-15': [9, 10] }
    removeSlot(slots, '2026-04-15', 9)
    expect(slots).toEqual({ '2026-04-15': [9, 10] })
  })
})

describe('selectAllSlots', () => {
  it('selects all times for all dates', () => {
    const dates = ['2026-04-15', '2026-04-16']
    const times = [9, 9.5, 10]
    const result = selectAllSlots({}, dates, times)
    expect(result['2026-04-15']).toEqual([9, 9.5, 10])
    expect(result['2026-04-16']).toEqual([9, 9.5, 10])
  })

  it('preserves existing slots for other dates', () => {
    const dates = ['2026-04-15']
    const times = [9, 10]
    const slots = { '2026-04-14': [8, 9] }
    const result = selectAllSlots(slots, dates, times)
    expect(result['2026-04-14']).toEqual([8, 9])
    expect(result['2026-04-15']).toEqual([9, 10])
  })
})

describe('clearAllSlots', () => {
  it('clears all slots for specified dates', () => {
    const dates = ['2026-04-15', '2026-04-16']
    const slots = { '2026-04-15': [9, 10], '2026-04-16': [8, 9], '2026-04-17': [10] }
    const result = clearAllSlots(slots, dates)
    expect(result['2026-04-15']).toBeUndefined()
    expect(result['2026-04-16']).toBeUndefined()
    expect(result['2026-04-17']).toEqual([10])
  })

  it('does not mutate original object', () => {
    const dates = ['2026-04-15']
    const slots = { '2026-04-15': [9, 10] }
    clearAllSlots(slots, dates)
    expect(slots).toEqual({ '2026-04-15': [9, 10] })
  })
})

describe('countPerSlot', () => {
  it('counts participants per slot correctly', () => {
    const allAvailability = [
      { participant: 'Alice', slots: { '2026-04-15': [9, 10] } },
      { participant: 'Bob', slots: { '2026-04-15': [9, 9.5] } },
    ]
    const dates = ['2026-04-15']
    const times = [9, 9.5, 10]
    const result = countPerSlot(allAvailability, dates, times)
    expect(result['2026-04-15'][9]).toBe(2)
    expect(result['2026-04-15'][9.5]).toBe(1)
    expect(result['2026-04-15'][10]).toBe(1)
  })

  it('returns zero counts when no participants', () => {
    const dates = ['2026-04-15']
    const times = [9, 10]
    const result = countPerSlot([], dates, times)
    expect(result['2026-04-15'][9]).toBe(0)
    expect(result['2026-04-15'][10]).toBe(0)
  })

  it('ignores times not in the times array', () => {
    const allAvailability = [
      { participant: 'Alice', slots: { '2026-04-15': [9, 11] } },
    ]
    const dates = ['2026-04-15']
    const times = [9, 10]
    const result = countPerSlot(allAvailability, dates, times)
    expect(result['2026-04-15'][9]).toBe(1)
    expect(result['2026-04-15'][10]).toBe(0)
  })
})

describe('getBestTimes', () => {
  it('returns top time blocks sorted by count then duration', () => {
    const counts = {
      '2026-04-15': { 9: 3, 9.5: 3, 10: 3, 11: 2, 11.5: 2 },
    }
    const dates = ['2026-04-15']
    const times = [9, 9.5, 10, 11, 11.5]
    const result = getBestTimes(counts, dates, times)
    expect(result.length).toBe(1)
    expect(result[0]).toMatchObject({ date: '2026-04-15', start: 9, end: 11.5, count: 2, duration: 5 })
  })

  it('returns empty array when no counts', () => {
    const counts = { '2026-04-15': { 9: 0, 10: 0 } }
    const result = getBestTimes(counts, ['2026-04-15'], [9, 10])
    expect(result).toEqual([])
  })

  it('limits to top 5 blocks', () => {
    const counts = {
      '2026-04-15': { 9: 5, 10: 5, 11: 4, 12: 4, 13: 3, 14: 3, 15: 2, 16: 2 },
    }
    const dates = ['2026-04-15']
    const times = [9, 10, 11, 12, 13, 14, 15, 16]
    const result = getBestTimes(counts, dates, times)
    expect(result.length).toBeLessThanOrEqual(5)
  })

  it('handles multiple dates', () => {
    const counts = {
      '2026-04-15': { 9: 3, 10: 3 },
      '2026-04-16': { 9: 4, 10: 4 },
    }
    const dates = ['2026-04-15', '2026-04-16']
    const times = [9, 10]
    const result = getBestTimes(counts, dates, times)
    expect(result[0].date).toBe('2026-04-16')
    expect(result[0].count).toBe(4)
  })
})
