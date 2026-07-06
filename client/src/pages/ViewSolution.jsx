import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import DOMPurify from 'dompurify'
import './viewer.css'

function safeUrl(url) {
  if (!url || typeof url !== 'string') return ''
  try {
    const u = new URL(url, window.location.origin)
    if (u.protocol === 'http:' || u.protocol === 'https:') return u.href
  } catch { /* fall through */ }
  return ''
}

const ordinal = n => {
  const num = parseInt(n, 10)
  if (isNaN(num)) return n
  const suffix = [11, 12, 13].includes(num % 100) ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[num % 10] || 'th')
  return num + suffix
}

export default function ViewSolution() {
  const { slug } = useParams()
  const [searchParams] = useSearchParams()
  const [sol, setSol] = useState(null)
  const [state, setState] = useState('loading') // loading | ready | error

  useEffect(() => {
    // The server injects window.__SOLUTION_ID__ into the shell for /solutions/:slug so
    // the crawler-visible meta and the client render agree; fall back to the slug API
    // or the legacy ?id= param when it's absent (dev server, client-side nav).
    const injectedId = typeof window.__SOLUTION_ID__ === 'string' ? window.__SOLUTION_ID__ : null
    const legacyId = searchParams.get('id')
    const url = injectedId || legacyId
      ? `/api/solutions/${injectedId || legacyId}`
      : slug
        ? `/api/solutions/slug/${encodeURIComponent(slug)}`
        : null
    if (!url) { setState('error'); return }
    delete window.__SOLUTION_ID__ // never reuse across client-side navigations
    fetch(url)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) {
          setSol(d.data)
          setState('ready')
          document.title = `${d.data.title} - ClassConnect Solutions`
        } else setState('error')
      })
      .catch(() => setState('error'))
  }, [slug, searchParams])

  if (state === 'loading') return <div className="viewer-status">Initializing Document Environment...</div>
  if (state === 'error') return <div className="viewer-status error">Solution not found or invalid format.</div>

  const pdfUrl = safeUrl(sol.pdfUrl)
  const driveLink = safeUrl(sol.driveLink)
  const embedUrl = driveLink.includes('/view') ? driveLink.replace('/view', '/preview') : driveLink
  const isHtml = sol.formatType === 'HTML'
  const external = sol.formatType === 'PDF' ? pdfUrl : sol.formatType === 'DriveLink' ? embedUrl : ''
  if (!isHtml && !external) return <div className="viewer-status error">Solution not found or invalid format.</div>

  const headerParts = ['ClassConnect Solutions']
  if (sol.subject) headerParts.push(sol.subject)
  if (sol.classLevel) headerParts.push(ordinal(sol.classLevel))

  return (
    <div className="viewer-body">
      <aside className="viewer-sidebar">
        <Link to="/" className="viewer-brand">
          <img src="/assets/logo.svg" alt="Logo" width="40" height="40" />
          Class<span>Connect</span>
        </Link>

        <div className="viewer-sol-title">{sol.title}</div>

        <div className="meta-group"><div className="meta-label">Subject</div><div className="meta-val">{sol.subject || '-'}</div></div>
        <div className="meta-group"><div className="meta-label">Class Level</div><div className="meta-val">{sol.classLevel ? `Class ${sol.classLevel}` : '-'}</div></div>
        <div className="meta-group"><div className="meta-label">Board</div><div className="meta-val">{sol.board || '-'}</div></div>
        <div className="meta-group"><div className="meta-label">Chapter</div><div className="meta-val">{sol.chapter || '-'}</div></div>

        {isHtml ? (
          <button className="action-btn" onClick={() => window.print()}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            Print Solution
          </button>
        ) : (
          <a className="action-btn" href={sol.formatType === 'PDF' ? pdfUrl : driveLink} target="_blank" rel="noopener noreferrer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            {sol.formatType === 'PDF' ? 'Download PDF' : 'Open Drive Link'}
          </a>
        )}
      </aside>

      <main className="viewer-main">
        <div className={`paper-wrapper${isHtml ? ' branded' : ' bare'}`}>
          {isHtml ? (
            <>
              <div className="doc-header">
                <img src="/assets/logo.svg" alt="ClassConnect Logo" />
                <div>
                  <div className="doc-header-title">{headerParts.join(' – ')}</div>
                  <a className="doc-header-link" href="/">{window.location.host}</a>
                </div>
              </div>
              {sol.chapter && (
                <h1 className="doc-chapter">{sol.chapterNumber ? `Chapter ${sol.chapterNumber}: ${sol.chapter}` : sol.chapter}</h1>
              )}
              <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(sol.htmlContent || '') }} />
              <div className="paper-footer">Verified solution via <strong style={{ color: '#7c3aed' }}>ClassConnect</strong></div>
            </>
          ) : (
            <iframe src={external} className="external-iframe" title={sol.title} />
          )}
        </div>
      </main>
    </div>
  )
}
