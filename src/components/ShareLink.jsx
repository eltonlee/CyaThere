import { useState } from 'react'

export default function ShareLink({ roomId }) {
  const url = `${window.location.origin}${import.meta.env.BASE_URL}room/${roomId}`
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <code style={{
        fontSize: 12, background: '#252525', padding: '5px 10px', borderRadius: 6,
        color: '#9ca3af', flex: '1 1 auto', overflow: 'hidden',
        textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260,
      }}>
        {url}
      </code>
      <button onClick={copy} style={{
        padding: '5px 12px', background: 'transparent', color: copied ? '#10b981' : '#9ca3af',
        border: `1px solid ${copied ? '#10b981' : '#383838'}`, borderRadius: 6,
        fontSize: 12, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s',
      }}>
        {copied ? '✓ copied' : 'copy link'}
      </button>
    </div>
  )
}
