import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useRoom(roomId) {
  const [room, setRoom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!roomId) return
    setLoading(true)
    setError(null)

    supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single()
      .then(({ data, error: err }) => {
        if (err) setError(err.message)
        else setRoom(data)
        setLoading(false)
      })
  }, [roomId])

  return { room, loading, error }
}
