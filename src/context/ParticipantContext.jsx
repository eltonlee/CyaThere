import { createContext, useContext, useState } from 'react'

const ParticipantContext = createContext(null)

export function ParticipantProvider({ children }) {
  const [name, setNameState] = useState(() => localStorage.getItem('cyathere_name') ?? '')

  function setName(value) {
    setNameState(value)
    if (value) {
      localStorage.setItem('cyathere_name', value)
    } else {
      localStorage.removeItem('cyathere_name')
    }
  }

  return (
    <ParticipantContext.Provider value={{ name, setName }}>
      {children}
    </ParticipantContext.Provider>
  )
}

export function useParticipant() {
  return useContext(ParticipantContext)
}
