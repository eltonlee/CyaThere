import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import AvailabilityGrid from '../AvailabilityGrid'

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}))

describe('AvailabilityGrid', () => {
  const defaultProps = {
    dates: ['2026-04-15', '2026-04-16'],
    times: [9, 9.5, 10, 10.5],
    mySlots: {},
    allAvailability: [],
    onSlotsChange: vi.fn(),
    editMode: true,
  }

  it('renders the grid with date headers', () => {
    render(<AvailabilityGrid {...defaultProps} />)
    expect(screen.getByText('Apr 15')).toBeInTheDocument()
    expect(screen.getByText('Apr 16')).toBeInTheDocument()
  })

  it('renders time labels on hour rows', () => {
    render(<AvailabilityGrid {...defaultProps} />)
    expect(screen.getByText('9:00 AM')).toBeInTheDocument()
    expect(screen.getByText('10:00 AM')).toBeInTheDocument()
  })

  it('does not render time labels on half-hour rows', () => {
    const { container } = render(<AvailabilityGrid {...defaultProps} />)
    const allText = container.textContent
    expect(allText).not.toContain('9:30 AM')
    expect(allText).not.toContain('10:30 AM')
  })

  it('renders cells for each date-time combination', () => {
    const { container } = render(<AvailabilityGrid {...defaultProps} />)
    const cells = container.querySelectorAll('[data-date]')
    expect(cells.length).toBe(8)
  })

  it('renders in read-only mode when editMode is false', () => {
    render(<AvailabilityGrid {...defaultProps} editMode={false} />)
    expect(screen.getByText('Apr 15')).toBeInTheDocument()
  })

  it('shows heatmap colors when allAvailability is provided', () => {
    const allAvailability = [
      { participant: 'Alice', slots: { '2026-04-15': [9, 9.5] } },
      { participant: 'Bob', slots: { '2026-04-15': [9] } },
    ]
    render(<AvailabilityGrid {...defaultProps} allAvailability={allAvailability} />)
    const cells = document.querySelectorAll('[data-date]')
    expect(cells.length).toBeGreaterThan(0)
  })

  it('highlights my selected slots', () => {
    const mySlots = { '2026-04-15': [9, 9.5] }
    const { container } = render(<AvailabilityGrid {...defaultProps} mySlots={mySlots} />)
    const selectedCells = container.querySelectorAll('[data-date="2026-04-15"][data-time="9"]')
    expect(selectedCells.length).toBe(1)
  })
})
