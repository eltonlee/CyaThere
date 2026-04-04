import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ParticipantProvider } from './context/ParticipantContext'
import Home from './pages/Home'
import Room from './pages/Room'

export default function App() {
  return (
    <ParticipantProvider>
      <BrowserRouter basename="/CyaThere">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/room/:roomId" element={<Room />} />
        </Routes>
      </BrowserRouter>
    </ParticipantProvider>
  )
}
