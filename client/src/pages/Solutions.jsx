import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import './solutions.css'

// Only allow http(s) URLs as link targets — blocks javascript:/data: etc.
function safeUrl(url) {
  if (!url || typeof url !== 'string') return ''
  try {
    const u = new URL(url, window.location.origin)
    if (u.protocol === 'http:' || u.protocol === 'https:') return u.href
  } catch { /* fall through */ }
  return ''
}

function Skeletons() {
  return Array.from({ length: 6 }, (_, i) => (
    <div className="skeleton-card" key={i}>
      <div className="skel-line" style={{ height: 20, width: '60%' }}></div>
      <div className="skel-line" style={{ height: 35, width: '90%', marginTop: 10 }}></div>
      <div className="skel-line" style={{ height: 35, width: '70%' }}></div>
      <div className="skel-line" style={{ height: 20, width: '40%', marginTop: 20 }}></div>
      <div style={{ display: 'flex', gap: 10, marginTop: 'auto' }}>
        <div className="skel-line" style={{ height: 45, flex: 1 }}></div>
      </div>
    </div>
  ))
}

function SolutionCard({ sol }) {
  const detailUrl = sol.slug ? `/solutions/${encodeURIComponent(sol.slug)}` : `/view_solution?id=${encodeURIComponent(sol._id)}`
  const youtubeLink = safeUrl(sol.youtubeLink)
  const label = sol.formatType === 'PDF' ? 'View PDF' : sol.formatType === 'DriveLink' ? 'Open Drive' : 'Read Solution'
  return (
    <div className="solution-card">
      <div className="solution-card-glow"></div>
      <div className="sol-meta">
        {sol.playlist && <span className="sol-tag sol-tag-playlist">{sol.playlist}</span>}
        <span className="sol-tag">{sol.subject}</span>
        {sol.classLevel && <span className="sol-tag">Class {sol.classLevel}</span>}
        {sol.board && <span className="sol-tag">{sol.board}</span>}
      </div>
      <div className="sol-title">{sol.title}</div>
      <div className="sol-chapter">{sol.chapter || 'Comprehensive Solution'}</div>
      <div className="sol-actions">
        <Link to={detailUrl} className="btn-sol btn-sol-main">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg> {label}
        </Link>
        {youtubeLink && (
          <a href={youtubeLink} target="_blank" rel="noopener noreferrer" className="btn-sol btn-sol-yt" title="Watch Video Solution">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.015 3.015 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.376.55 9.376.55s7.505 0 9.377-.55a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
          </a>
        )}
      </div>
    </div>
  )
}

export default function Solutions() {
  const [filters, setFilters] = useState({ boards: [], classLevels: [], subjects: [], playlists: [] })
  const [query, setQuery] = useState({ search: '', board: '', classLevel: '', subject: '', playlist: '' })
  const [solutions, setSolutions] = useState(null) // null = loading
  const [error, setError] = useState(false)
  const debounceRef = useRef(null)

  useEffect(() => {
    document.title = 'Solutions Hub | ClassConnect'
    fetch('/api/solutions/filters')
      .then(r => r.json())
      .then(d => { if (d.success) setFilters(d.data) })
      .catch(() => {})
  }, [])

  // Fetch on any query change; text search is debounced, dropdowns fire immediately.
  useEffect(() => {
    const run = () => {
      setSolutions(null)
      setError(false)
      const params = new URLSearchParams()
      Object.entries(query).forEach(([k, v]) => { if (v) params.append(k === 'search' ? 'search' : k, v) })
      fetch(`/api/solutions?${params.toString()}`)
        .then(r => r.json())
        .then(d => setSolutions(d.data || []))
        .catch(() => setError(true))
    }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(run, query.search ? 400 : 0)
    return () => clearTimeout(debounceRef.current)
  }, [query])

  const set = (key) => (e) => setQuery(q => ({ ...q, [key]: e.target.value }))

  return (
    <div className="page">
      <Nav variant="solutions" />

      <section className="search-hero">
        <div className="hero-glow-ring" style={{ top: -200, opacity: 0.6 }}></div>
        <div className="hero-glow-ring" style={{ top: 200, right: -200, left: 'auto', opacity: 0.3, width: 600, height: 600, background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 60%)' }}></div>

        <div className="hero-kicker" style={{ marginBottom: 20, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <span className="kicker-dot"></span>100% Free · Premium Resources
        </div>
        <h1 style={{ fontFamily: "'Unbounded',sans-serif", fontSize: 'clamp(3rem, 6vw, 5.5rem)', margin: 0, lineHeight: 1.1 }}>
          The <span className="stroke">Ultimate</span><br />
          Solutions <span className="lime">Hub.</span>
        </h1>
        <p style={{ color: 'var(--fdd)', maxWidth: 600, margin: '25px auto', fontSize: '1.15rem', lineHeight: 1.7 }}>
          Access world-class, verified textbook solutions instantly. Stop struggling, start mastering.
        </p>

        <div className="search-bar-container">
          <input type="text" className="search-bar" placeholder="Search by topic, chapter, or book..." value={query.search} onChange={set('search')} />
          <div className="filters">
            <select className="filter-select" value={query.board} onChange={set('board')}>
              <option value="">All Boards</option>
              {filters.boards.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <select className="filter-select" value={query.classLevel} onChange={set('classLevel')}>
              <option value="">All Classes</option>
              {filters.classLevels.map(c => <option key={c} value={c}>Class {c}</option>)}
            </select>
            <select className="filter-select" value={query.subject} onChange={set('subject')}>
              <option value="">All Subjects</option>
              {filters.subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select className="filter-select" value={query.playlist} onChange={set('playlist')}>
              <option value="">All Playlists</option>
              {filters.playlists.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
      </section>

      <div className="solutions-grid">
        {error ? (
          <div className="no-results" style={{ color: 'var(--rt)', borderColor: 'var(--rt)' }}>System Error: Failed to retrieve resources.</div>
        ) : solutions === null ? (
          <Skeletons />
        ) : solutions.length === 0 ? (
          <div className="no-results">No resources found matching the specified parameters.</div>
        ) : (
          solutions.map(sol => <SolutionCard sol={sol} key={sol._id} />)
        )}
      </div>

      <footer style={{ marginTop: 'auto' }}>
        <div className="f-logo">CLASSCONNECT</div>
        <div className="f-meta">Empowering students with elite educational infrastructure.</div>
      </footer>
    </div>
  )
}
