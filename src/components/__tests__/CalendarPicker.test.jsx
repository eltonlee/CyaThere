import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CalendarPicker from '../CalendarPicker'

describe('CalendarPicker', () => {
  const defaultProps = {
    selectedDates: new Set(),
    onToggle: vi.fn(),
  }

  it('renders the calendar with month label', () => {
    render(<CalendarPicker {...defaultProps} />)
    const monthLabel = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    expect(screen.getByText(monthLabel)).toBeInTheDocument()
  })

  it('renders day headers', () => {
    render(<CalendarPicker {...defaultProps} />)
    expect(screen.getByText('Su')).toBeInTheDocument()
    expect(screen.getByText('Mo')).toBeInTheDocument()
    expect(screen.getByText('Sa')).toBeInTheDocument()
  })

  it('calls onToggle when clicking a future date', () => {
    const onToggle = vi.fn()
    render(
      <CalendarPicker
        selectedDates={new Set()}
        onToggle={onToggle}
        initialIso="2027-01-15"
      />
    )
    const day3 = screen.getByRole('button', { name: '3' })
    fireEvent.click(day3)
    expect(onToggle).toHaveBeenCalled()
  })

  it('disables past dates', () => {
    const onToggle = vi.fn()
    render(<CalendarPicker {...defaultProps} onToggle={onToggle} />)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    const yesterdayBtn = screen.queryByRole('button', { name: yesterday.getDate().toString() })
    if (yesterdayBtn) {
      expect(yesterdayBtn).toBeDisabled()
    }
  })

  it('highlights selected dates', () => {
    const onToggle = vi.fn()
    const selected = new Set(['2026-04-15'])
    render(
      <CalendarPicker
        selectedDates={selected}
        onToggle={onToggle}
        initialIso="2026-04-15"
      />
    )
    const day15 = screen.getByRole('button', { name: '15' })
    expect(day15).toHaveStyle({ background: '#10b981' })
  })

  it('navigates to next month', () => {
    const onToggle = vi.fn()
    render(<CalendarPicker {...defaultProps} onToggle={onToggle} />)
    const nextBtn = screen.getAllByRole('button').find(btn => btn.textContent === '›')
    fireEvent.click(nextBtn)
    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    const expectedLabel = nextMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    expect(screen.getByText(expectedLabel)).toBeInTheDocument()
  })

  it('does not navigate before current month in non-readonly mode', () => {
    const onToggle = vi.fn()
    render(<CalendarPicker {...defaultProps} onToggle={onToggle} />)
    const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    const prevBtn = screen.getAllByRole('button').find(btn => btn.textContent === '‹')
    fireEvent.click(prevBtn)
    expect(screen.getByText(currentMonth)).toBeInTheDocument()
  })

  it('navigates to previous month when in readonly mode', () => {
    const onToggle = vi.fn()
    render(
      <CalendarPicker
        selectedDates={new Set()}
        onToggle={onToggle}
        readOnly={true}
        initialIso="2026-04-15"
      />
    )
    const prevBtn = screen.getAllByRole('button').find(btn => btn.textContent === '‹')
    fireEvent.click(prevBtn)
    expect(screen.getByText('March 2026')).toBeInTheDocument()
  })
})
