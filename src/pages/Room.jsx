import { useState, useEffect, useRef, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useRoom } from '../hooks/useRoom'
import { useAvailability } from '../hooks/useAvailability'
import { useParticipant } from '../context/ParticipantContext'
import { buildTimeSlots, formatDate, selectAllSlots, clearAllSlots } from '../lib/slots'
import CalendarPicker from '../components/CalendarPicker'
import AvailabilityGrid from '../components/AvailabilityGrid'
import GroupOverview from '../components/GroupOverview'
import ShareLink from '../components/ShareLink'
import { useIsMobile } from '../hooks/useIsMobile'

export default function Room() {
  const { roomId } = useParams()
  const { name, setName } = useParticipant()
  const { room, loading: roomLoading, error: roomError } = useRoom(roomId)
  const { allAvailability, mySlots, saveSlots, refetch, loading: availLoading, error: availError } = useAvailability(roomId, name)

  const [tab, setTab] = useState('mine')
  const [nameInput, setNameInput] = useState(name || '')
  const [localSlots, setLocalSlots] = useState(null)   // null = not yet initialized
  const [selectedDates, setSelectedDates] = useState(null) // null = not yet initialized
  const [isDirty, setIsDirty] = useState(false)
  const initialized = useRef(false)
  const isMobile = useIsMobile()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState(null)

  const times = useMemo(
    () => (room ? buildTimeSlots(room.time_start, room.time_end) : []),
    [room]
  )

  // Reset initialization when name changes so slots re-populate
  useEffect(() => {
    initialized.current = false
  }, [name])

  // Seed local state from existing slots exactly once after the initial load
  useEffect(() => {
    if (!availLoading && !initialized.current) {
      initialized.current = true
      setLocalSlots(mySlots)
      setSelectedDates(new Set(Object.keys(mySlots)))
    }
  }, [availLoading, mySlots])

  // Pre-fill name input from context after page refresh
  useEffect(() => {
    if (name && !nameInput) setNameInput(name)
  }, [name])

  function toggleDate(iso) {
    setSelectedDates((prev) => {
      const next = new Set(prev ?? [])
      if (next.has(iso)) {
        next.delete(iso)
        // Drop any slots already marked for this date
        setLocalSlots((ls) => {
          const n = { ...(ls ?? {}) }
          delete n[iso]
          return n
        })
      } else {
        next.add(iso)
      }
      return next
    })
    setIsDirty(true)
    setSaved(false)
  }

  function handleSelectAll() {
    setLocalSlots((ls) => selectAllSlots(ls ?? {}, sortedDates, times))
    setIsDirty(true)
    setSaved(false)
  }

  function handleClearAll() {
    setLocalSlots((ls) => clearAllSlots(ls ?? {}, sortedDates))
    setIsDirty(true)
    setSaved(false)
  }

  async function handleSave() {
    const trimmed = nameInput.trim()
    if (!trimmed) return
    setSaving(true)
    setSaveError(null)
    setName(trimmed)
    const { error } = await saveSlots(localSlots ?? {}, trimmed)
    setSaving(false)
    if (error) {
      setSaveError(error)
      return
    }
    setIsDirty(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  if (roomLoading) return <div style={centerStyle}>Loading…</div>
  if (roomError) return <div style={centerStyle}>Room not found.</div>
  if (!room) return null

  const sortedDates = [...(selectedDates ?? [])].sort()
  const firstDate = sortedDates[0] ?? null

  return (
    <div style={pageStyle}>
      {/* Top bar */}
      <div style={topBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <Link to="/" style={{ color: '#6b7280', fontSize: 13, textDecoration: 'none', flexShrink: 0 }}>←</Link>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#f9fafb', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {room.name}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <TabBtn active={tab === 'mine'} onClick={() => setTab('mine')}>My Availability</TabBtn>
          <TabBtn active={tab === 'group'} onClick={() => { setTab('group'); refetch() }}>Group Overview</TabBtn>
        </div>
      </div>

      {tab === 'mine' ? (
        <div>
          {/* Name + save */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 28, alignItems: 'center' }}>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => { setNameInput(e.target.value); setSaved(false) }}
              placeholder="Your name"
              maxLength={40}
              style={nameInputStyle}
            />
            <button
              onClick={handleSave}
              disabled={saving || !nameInput.trim()}
              style={{
                padding: '9px 18px',
                background: saved ? '#065f46' : '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: nameInput.trim() ? 'pointer' : 'not-allowed',
                opacity: nameInput.trim() ? 1 : 0.4,
                whiteSpace: 'nowrap',
                transition: 'background 0.2s',
              }}
            >
              {saving ? 'Saving…' : saved ? '✓ saved' : 'save'}
            </button>
          </div>

          {/* Returning user quick-select — only shown when name field is empty */}
          {!nameInput.trim() && allAvailability.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ ...sectionLabel, marginBottom: 6 }}>returning? pick your name</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {allAvailability.map((row) => (
                  <button
                    key={row.participant}
                    onClick={() => { setNameInput(row.participant); setName(row.participant) }}
                    style={dateChipBtn}
                  >
                    {row.participant}
                  </button>
                ))}
              </div>
            </div>
          )}

          {saveError && (
            <p style={{ color: '#f87171', fontSize: 13, marginBottom: 16 }}>
              Save failed: {saveError}
            </p>
          )}

          {/* Main layout: calendar + grid on left, share link on right (stacked on mobile) */}
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 24 : 32, alignItems: 'flex-start' }}>
            <div style={{ flex: 1, minWidth: 0, width: '100%' }}>
              {/* Interactive date picker */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <p style={{ ...sectionLabel, marginBottom: 0 }}>SELECT DATES</p>
                  {sortedDates.length > 0 && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={handleSelectAll} style={actionBtnStyle}>Select All</button>
                      <button onClick={handleClearAll} style={actionBtnStyle}>Clear All</button>
                    </div>
                  )}
                </div>
                <CalendarPicker
                  selectedDates={selectedDates ?? new Set()}
                  onToggle={toggleDate}
                  initialIso={firstDate ?? undefined}
                />
                {/* Selected date chips */}
                {sortedDates.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                    {sortedDates.map((d) => (
                      <button
                        key={d}
                        onClick={() => toggleDate(d)}
                        style={dateChipBtn}
                      >
                        {formatDate(d)} ×
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Availability grid */}
              {sortedDates.length > 0 && (
                <>
                  <p style={{ ...sectionLabel, marginBottom: 10 }}>drag to mark when you're free</p>
                  {availLoading ? (
                    <p style={{ color: '#6b7280', fontSize: 14 }}>Loading…</p>
                  ) : (
                    <AvailabilityGrid
                      dates={sortedDates}
                      times={times}
                      mySlots={localSlots ?? {}}
                      allAvailability={[]}
                      onSlotsChange={(newSlots) => {
                        setLocalSlots(newSlots)
                        setIsDirty(true)
                        setSaved(false)
                      }}
                      editMode={true}
                    />
                  )}

                  {/* Legend */}
                  <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Legend color="#10b981" label="free" />
                    <Legend color="#1a2035" border label="unavailable" />
                  </div>
                </>
              )}
            </div>

            {/* Share link sidebar */}
            <div style={{ flexShrink: 0, width: isMobile ? '100%' : 220 }}>
              <ShareLink roomId={roomId} />
            </div>
          </div>

          {/* Unsaved changes nudge */}
          {isDirty && !saved && sortedDates.length > 0 && (
            <p style={{ marginTop: 10, fontSize: 12, color: '#f59e0b' }}>
              Unsaved changes — hit save when done.
            </p>
          )}
        </div>
      ) : (
        <>
          {availError && (
            <p style={{ color: '#f87171', fontSize: 13, marginBottom: 16 }}>
              Could not load availability: {availError}
            </p>
          )}
          <GroupOverview
            room={room}
            times={times}
            allAvailability={allAvailability}
            loading={availLoading}
          />
        </>
      )}
    </div>
  )
}

function TabBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding: '7px 14px',
      background: active ? '#fff' : 'transparent',
      color: active ? '#111827' : '#9ca3af',
      border: `1px solid ${active ? '#fff' : '#383838'}`,
      borderRadius: 6, fontSize: 13,
      fontWeight: active ? 600 : 400,
      cursor: 'pointer', transition: 'all 0.15s',
    }}>
      {children}
    </button>
  )
}

function Legend({ color, border, label }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#6b7280' }}>
      <span style={{
        width: 14, height: 14, background: color,
        border: border ? '1px solid #2d3748' : 'none',
        borderRadius: 2, display: 'inline-block', flexShrink: 0,
      }} />
      {label}
    </span>
  )
}

const pageStyle = { maxWidth: 1400, margin: '0 auto', padding: '24px 20px 80px' }
const topBar = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 28, flexWrap: 'wrap' }
const centerStyle = { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#6b7280', fontSize: 16 }
const nameInputStyle = { flex: '1 1 160px', maxWidth: 220, padding: '9px 12px', border: '1px solid #383838', borderRadius: 8, fontSize: 15, background: '#252525', color: '#f9fafb', outline: 'none' }
const sectionLabel = { fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }
const dateChipBtn = { padding: '4px 10px', background: '#252525', border: '1px solid #383838', borderRadius: 20, color: '#9ca3af', fontSize: 12, cursor: 'pointer' }
const actionBtnStyle = { padding: '4px 12px', background: 'transparent', color: '#9ca3af', border: '1px solid #383838', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 500 }
