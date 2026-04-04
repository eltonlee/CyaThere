import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import ShareLink from '../ShareLink'

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}))

beforeEach(() => {
  Object.defineProperty(window, 'location', {
    value: { origin: 'http://localhost:3000', pathname: '/CyaThere/' },
    writable: true,
  })
  globalThis.navigator.clipboard = {
    writeText: vi.fn().mockResolvedValue(undefined),
  }
})

describe('ShareLink', () => {
  it('renders the share URL with room id', () => {
    render(<ShareLink roomId="abc123" />)
    const code = screen.getByText(/#/i)
    expect(code.textContent).toContain('abc123')
  })

  it('renders the copy link button', () => {
    render(<ShareLink roomId="abc123" />)
    expect(screen.getByRole('button', { name: /copy link/i })).toBeInTheDocument()
  })

  it('shows copied state after clicking', async () => {
    render(<ShareLink roomId="abc123" />)
    const button = screen.getByRole('button', { name: /copy link/i })
    button.click()
    const copiedBtn = await screen.findByRole('button', { name: /copied/i })
    expect(copiedBtn).toBeInTheDocument()
  })
})
