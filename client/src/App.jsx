import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { ThemeProvider } from './theme.jsx'
import Cursor from './components/Cursor.jsx'
import Landing from './pages/Landing.jsx'
import Solutions from './pages/Solutions.jsx'
import ViewSolution from './pages/ViewSolution.jsx'
import Admin from './pages/Admin.jsx'

// Scrolls to top on route change, but honors in-page #anchors.
function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash)
      if (el) { el.scrollIntoView({ behavior: 'smooth' }); return }
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

export default function App() {
  return (
    <ThemeProvider>
      <Cursor />
      <ScrollManager />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/solutions" element={<Solutions />} />
        <Route path="/solutions/:slug" element={<ViewSolution />} />
        <Route path="/view_solution" element={<ViewSolution />} />
        <Route path="/admin" element={<Admin />} />
        {/* Unknown paths fall back to the landing page, same as the old site */}
        <Route path="*" element={<Landing />} />
      </Routes>
    </ThemeProvider>
  )
}
