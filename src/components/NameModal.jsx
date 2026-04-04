import { useState } from 'react'
import { useParticipant } from '../context/ParticipantContext'

export default function NameModal() {
  const { setName } = useParticipant()
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return setError('Please enter your name.')
    setName(trimmed)
  }

  return (
    <div style={overlayStyle}>
      <div style={cardStyle}>
        <h2 style={{ marginBottom: 8, fontSize: 22 }}>What's your name?</h2>
        <p style={{ color: '#666', marginBottom: 24, fontSize: 14 }}>
          Others will see this next to your availability.
        </p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            autoFocus
            type="text"
            value={value}
            onChange={(e) => { setValue(e.target.value); setError('') }}
            placeholder="Your name"
            maxLength={40}
            style={inputStyle}
          />
          {error && <p style={{ color: '#dc2626', fontSize: 13 }}>{error}</p>}
          <button type="submit" style={btnStyle}>Join room →</button>
        </form>
      </div>
    </div>
  )
}

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.45)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 100,
  padding: 20,
}

const cardStyle = {
  background: '#fff',
  borderRadius: 12,
  padding: '32px 28px',
  width: '100%',
  maxWidth: 380,
  boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
}

const inputStyle = {
  padding: '10px 12px',
  border: '1px solid #ddd',
  borderRadius: 8,
  fontSize: 16,
  outline: 'none',
  width: '100%',
}

const btnStyle = {
  padding: '11px',
  background: '#3b82f6',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  fontSize: 15,
  fontWeight: 600,
  cursor: 'pointer',
}
