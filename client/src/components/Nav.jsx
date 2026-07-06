import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../theme.jsx'

function ThemeToggle() {
  const { setTheme, toggleTheme } = useTheme()
  return (
    <div className="theme-toggle" onClick={toggleTheme} title="Toggle theme" role="button" tabIndex={0} aria-label="Toggle dark/light theme">
      <button className="tt-btn" data-t="dark" onClick={e => { e.stopPropagation(); setTheme('dark') }} aria-label="Set dark mode">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </button>
      <button className="tt-btn" data-t="light" onClick={e => { e.stopPropagation(); setTheme('light') }} aria-label="Set light mode">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      </button>
    </div>
  )
}

// Shared top navigation + mobile hamburger menu. `variant` picks the link set:
// "landing" (in-page anchors), "solutions" (anchors back to /), or "admin" (badge only).
export default function Nav({ variant = 'landing' }) {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const close = () => setMenuOpen(false)
  const anchorPrefix = variant === 'landing' ? '' : '/'
  const midLinks = (
    <>
      <a href={`${anchorPrefix}#features`} onClick={close}>Features</a>
      <a href={`${anchorPrefix}#how`} onClick={close}>How It Works</a>
      <a href={`${anchorPrefix}#platform`} onClick={close}>Portals</a>
      <a href={`${anchorPrefix}#testimonials`} onClick={close}>Reviews</a>
      <a href={`${anchorPrefix}#faq`} onClick={close}>FAQ</a>
    </>
  )

  return (
    <>
      <nav style={variant === 'admin' ? { position: 'relative', zIndex: 1000, borderBottom: '1px solid var(--bd)' } : undefined}>
        <Link to="/" className="logo" onClick={close}>
          <div className="logo-mark">
            <img src="/assets/logo.svg" alt="ClassConnect Logo" width="40" height="40" style={{ display: 'block' }} />
          </div>
          <div className="logo-wordmark">
            <div className="logo-name">Class<span>Connect</span></div>
          </div>
        </Link>

        <div className="nav-mid">
          {variant === 'admin'
            ? <span className="header-badge" style={{ marginLeft: 10 }}>OS / SOLUTIONS</span>
            : midLinks}
        </div>

        <div className="nav-cta">
          {variant === 'admin' ? (
            <Link to="/solutions" target="_blank" className="btn-out" style={{ padding: '10px 20px', fontSize: '.58rem' }}>Launch Portal ↗</Link>
          ) : variant === 'solutions' ? (
            <>
              <Link to="/solutions" className="btn-out" style={{ padding: '10px 20px', fontSize: '.58rem', color: 'var(--pt)', borderColor: 'var(--pt)' }}>Solutions Hub</Link>
              <a href="/#contact" className="btn-main" style={{ padding: '10px 20px', fontSize: '.58rem' }}>Request Demo →</a>
            </>
          ) : (
            <>
              <Link to="/solutions" className="btn-out" style={{ padding: '10px 20px', fontSize: '.58rem' }}>Free Solutions</Link>
              <a href="#contact" className="btn-main" style={{ padding: '10px 20px', fontSize: '.58rem' }}>Request Demo →</a>
            </>
          )}
          <ThemeToggle />
          {variant !== 'admin' && (
            <button className={`hamburger${menuOpen ? ' active' : ''}`} onClick={() => setMenuOpen(o => !o)} aria-label="Open menu">
              <span></span><span></span><span></span>
            </button>
          )}
        </div>
      </nav>

      {variant !== 'admin' && (
        <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
          {midLinks}
          <Link to="/solutions" className="btn-out" style={{ marginTop: 20, textAlign: 'center' }} onClick={close}>Free Solutions</Link>
          <a href={`${anchorPrefix}#contact`} className="btn-main" style={{ marginTop: 10, textAlign: 'center' }} onClick={close}>Request Demo →</a>
        </div>
      )}
    </>
  )
}
