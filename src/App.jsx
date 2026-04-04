import { HashRouter, Routes, Route } from 'react-router-dom'
import { ParticipantProvider } from './context/ParticipantContext'
import Home from './pages/Home'
import Room from './pages/Room'

export default function App() {
  return (
    <ParticipantProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/room/:roomId" element={<Room />} />
        </Routes>
      </HashRouter>
    </ParticipantProvider>
  )
}
