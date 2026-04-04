import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { nanoid } from '../lib/nanoid'

export default function Home() {
  const navigate = useNavigate()
  const [roomName, setRoomName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!roomName.trim()) return setError('Please enter a name.')
    setError(null)
    setSubmitting(true)
    const roomId = nanoid(8)
    const { error: dbError } = await supabase.from('rooms').insert({
      id: roomId,
      name: roomName.trim(),
      time_start: 6,
      time_end: 30,
    })
    if (dbError) { setError(dbError.message); setSubmitting(false); return }
    navigate(`/room/${roomId}`)
  }

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: '80px 20px' }}>
      <header style={{ textAlign: 'center', marginBottom: 48 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#f9fafb', letterSpacing: '-0.5px' }}>
          CyaThere
        </h1>
        <p style={{ color: '#6b7280', marginTop: 6, fontSize: 14 }}>
          GUYS I JUST WANT TO WATCH FIREREN
        </p>
      </header>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          type="text"
          value={roomName}
          onChange={(e) => { setRoomName(e.target.value); setError(null) }}
          placeholder="Event name…"
          maxLength={80}
          autoFocus
          style={{
            width: '100%',
            padding: '12px 14px',
            border: '1px solid #383838',
            borderRadius: 8,
            fontSize: 16,
            background: '#252525',
            color: '#f9fafb',
            outline: 'none',
          }}
        />
        {error && <p style={{ color: '#f87171', fontSize: 13 }}>{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: '12px',
            background: '#10b981',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 600,
            cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.7 : 1,
          }}
        >
          {submitting ? 'Creating…' : 'Create room →'}
        </button>
      </form>
    </div>
  )
}
