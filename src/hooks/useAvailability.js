import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useAvailability(roomId, participantName) {
  const [allAvailability, setAllAvailability] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const channelRef = useRef(null)

  const fetchAll = useCallback(async () => {
    if (!roomId) return
    const { data, error: err } = await supabase
      .from('availability')
      .select('*')
      .eq('room_id', roomId)

    if (err) {
      console.error('fetch availability error:', err)
      setError(err.message)
    } else {
      setAllAvailability(data ?? [])
      setError(null)
    }
  }, [roomId])

  useEffect(() => {
    if (!roomId) return
    setLoading(true)

    fetchAll().finally(() => setLoading(false))

    const channel = supabase
      .channel(`availability:${roomId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'availability', filter: `room_id=eq.${roomId}` },
        (payload) => {
          const row = payload.new
          if (!row) return
          setAllAvailability((prev) => {
            const idx = prev.findIndex((r) => r.id === row.id)
            if (idx >= 0) {
              const next = [...prev]
              next[idx] = row
              return next
            }
            return [...prev, row]
          })
        }
      )
      .subscribe()

    channelRef.current = channel
    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current) }
  }, [roomId, fetchAll])

  const mySlots = useMemo(
    () => allAvailability.find((r) => r.participant === participantName)?.slots ?? {},
    [allAvailability, participantName]
  )

  async function saveSlots(newSlots, participantOverride) {
    const p = participantOverride ?? participantName
    if (!p) return { error: 'No participant name provided.' }

    console.log('saveSlots →', { room_id: roomId, participant: p, slots: newSlots })

    const { error: err } = await supabase
      .from('availability')
      .upsert(
        { room_id: roomId, participant: p, slots: newSlots },
        { onConflict: 'room_id,participant' }
      )

    if (err) {
      console.error('saveSlots error:', err)
      return { error: err.message }
    }

    console.log('saveSlots success')
    // Refetch so allAvailability is up to date even if realtime isn't enabled
    await fetchAll()
    return { error: null }
  }

  return { allAvailability, mySlots, saveSlots, refetch: fetchAll, loading, error }
}
