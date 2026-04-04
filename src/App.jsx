import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import { ParticipantProvider } from './context/ParticipantContext'
import Home from './pages/Home'
import Room from './pages/Room'

function RedirectHandler() {
  const navigate = useNavigate()
  if (typeof window !== 'undefined') {
    const redirect = sessionStorage.getItem('redirect')
    if (redirect) {
      sessionStorage.removeItem('redirect')
      const path = redirect.replace(/^\/CyaThere/, '') || '/'
      navigate(path, { replace: true })
    }
  }
  return null
}

export default function App() {
  return (
    <ParticipantProvider>
      <BrowserRouter basename="/CyaThere">
        <RedirectHandler />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/room/:roomId" element={<Room />} />
        </Routes>
      </BrowserRouter>
    </ParticipantProvider>
  )
}
