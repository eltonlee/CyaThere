export default function ParticipantList({ allAvailability, myName }) {
  if (allAvailability.length === 0) return null
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
        Participants ({allAvailability.length})
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {allAvailability.map((row) => (
          <span key={row.id} style={{
            padding: '4px 10px', borderRadius: 20, fontSize: 13,
            background: row.participant === myName ? '#10b981' : '#252525',
            color: row.participant === myName ? '#fff' : '#9ca3af',
            fontWeight: row.participant === myName ? 600 : 400,
          }}>
            {row.participant}
          </span>
        ))}
      </div>
    </div>
  )
}
