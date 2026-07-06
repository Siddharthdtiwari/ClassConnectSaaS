import { useCallback, useEffect, useRef, useState } from 'react'
import { Editor } from '@tinymce/tinymce-react'
import Nav from '../components/Nav.jsx'
import { useTheme } from '../theme.jsx'
import './admin.css'

const TINYMCE_SRC = 'https://cdn.jsdelivr.net/npm/tinymce@6/tinymce.min.js'

const EMPTY_FORM = {
  editId: '', playlistSelect: '', newPlaylistName: '', classLevel: '', subject: '',
  chapterNumber: '', chapter: '', youtubeLink: '', formatType: 'PDF', driveLink: '',
}

function autoTitle(f) {
  const std = f.classLevel ? `Class ${f.classLevel}` : ''
  return [f.chapterNumber.trim(), f.chapter.trim(), f.subject.trim(), std].filter(Boolean).join(' - ')
}

export default function Admin() {
  const { theme } = useTheme()
  const [creds, setCreds] = useState({
    user: localStorage.getItem('classconnect_admin_user') || '',
    key: localStorage.getItem('classconnect_admin_key') || '',
  })
  const [loggedIn, setLoggedIn] = useState(false)
  const [loginError, setLoginError] = useState(false)
  const [solutions, setSolutions] = useState([])
  const [playlists, setPlaylists] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [currentPdf, setCurrentPdf] = useState('')
  const [saving, setSaving] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiBusy, setAiBusy] = useState(false)
  const editorRef = useRef(null)
  const fileRef = useRef(null)

  const authHeaders = useCallback(
    (extra = {}) => ({ 'x-admin-user': creds.user, 'x-admin-key': creds.key, ...extra }),
    [creds]
  )

  const refresh = useCallback(async (c = creds) => {
    const headers = { 'x-admin-user': c.user, 'x-admin-key': c.key }
    const res = await fetch('/api/admin/solutions', { headers })
    if (!res.ok) return false
    const data = await res.json()
    setSolutions(data.data)
    fetch('/api/admin/playlists', { headers })
      .then(r => r.json())
      .then(d => { if (d.success) setPlaylists(d.data) })
      .catch(() => {})
    return true
  }, [creds])

  async function login(user, key, auto = false) {
    try {
      const ok = await refresh({ user, key })
      if (ok) {
        localStorage.setItem('classconnect_admin_user', user)
        localStorage.setItem('classconnect_admin_key', key)
        setCreds({ user, key })
        setLoggedIn(true)
        setLoginError(false)
      } else {
        if (!auto) setLoginError(true)
        localStorage.removeItem('classconnect_admin_user')
        localStorage.removeItem('classconnect_admin_key')
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    document.title = 'Solutions Manager | ClassConnect OS'
    if (creds.user && creds.key) login(creds.user, creds.key, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))
  const isNewPlaylist = form.playlistSelect === '__new__'
  const playlistOptions = form.playlistSelect && form.playlistSelect !== '__new__' && !playlists.includes(form.playlistSelect)
    ? [...playlists, form.playlistSelect]
    : playlists

  function resetForm() {
    setForm(EMPTY_FORM)
    setCurrentPdf('')
    setAiPrompt('')
    if (fileRef.current) fileRef.current.value = ''
    editorRef.current?.setContent('')
  }

  function editSolution(sol) {
    setForm({
      editId: sol._id,
      playlistSelect: sol.playlist || '',
      newPlaylistName: '',
      classLevel: sol.classLevel || '',
      subject: sol.subject || '',
      chapterNumber: sol.chapterNumber || '',
      chapter: sol.chapter || '',
      youtubeLink: sol.youtubeLink || '',
      formatType: sol.formatType,
      driveLink: sol.driveLink || '',
    })
    setCurrentPdf(sol.formatType === 'PDF' ? sol.pdfUrl || '' : '')
    if (sol.formatType === 'HTML') {
      // Editor may still be mounting; retry once it exists.
      const apply = () => editorRef.current
        ? editorRef.current.setContent(sol.htmlContent || '')
        : setTimeout(apply, 150)
      apply()
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function deleteSolution(id) {
    if (!window.confirm('WARNING: Confirm deletion of this resource?')) return
    try {
      const res = await fetch(`/api/admin/solutions/${id}`, { method: 'DELETE', headers: authHeaders() })
      const data = await res.json()
      if (data.success) refresh()
    } catch (err) {
      console.error(err)
    }
  }

  async function saveSolution(e) {
    e.preventDefault()
    const fd = new FormData()
    const playlist = isNewPlaylist ? form.newPlaylistName.trim() : form.playlistSelect
    fd.append('title', autoTitle(form))
    fd.append('playlist', playlist)
    fd.append('classLevel', form.classLevel)
    fd.append('subject', form.subject)
    fd.append('chapterNumber', form.chapterNumber)
    fd.append('chapter', form.chapter)
    fd.append('youtubeLink', form.youtubeLink)
    fd.append('formatType', form.formatType)

    if (form.formatType === 'PDF') {
      const file = fileRef.current?.files[0]
      if (file) fd.append('pdfFile', file)
      else if (!form.editId) { alert('System requires PDF payload.'); return }
    } else if (form.formatType === 'DriveLink') {
      if (!form.driveLink.trim()) { alert('Drive URL is required for this deployment format.'); return }
      fd.append('driveLink', form.driveLink.trim())
    } else if (form.formatType === 'HTML') {
      const html = editorRef.current?.getContent() || ''
      if (!html.trim()) { alert('Document canvas is empty — write or generate content before deploying.'); return }
      fd.append('htmlContent', html)
    }

    setSaving(true)
    try {
      const url = form.editId ? `/api/admin/solutions/${form.editId}` : '/api/admin/solutions'
      const res = await fetch(url, { method: form.editId ? 'PUT' : 'POST', headers: authHeaders(), body: fd })
      const data = await res.json()
      if (data.success) {
        resetForm()
        refresh()
      } else {
        alert(data.message || data.error)
      }
    } catch (err) {
      console.error(err)
      alert('System fault occurred.')
    }
    setSaving(false)
  }

  async function generateWithAI() {
    const title = autoTitle(form)
    if (!title) return alert('Please fill out the fields above first so the AI knows what to generate!')
    let fullPrompt = `Write a detailed textbook solution for Title: ${title}, Chapter: ${form.chapter}, Subject: ${form.subject}.`
    if (aiPrompt) fullPrompt += ` Additional Instructions: ${aiPrompt}`

    setAiBusy(true)
    try {
      const res = await fetch('/api/admin/generate-solution', {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ prompt: fullPrompt }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        editorRef.current?.setContent(data.html)
        document.querySelector('.tox-tinymce')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      } else {
        alert('Error: ' + (data.error || data.message))
      }
    } catch {
      alert('Network error generating solution.')
    }
    setAiBusy(false)
  }

  function submitLogin(e) {
    e.preventDefault()
    const fd = new FormData(e.target)
    login(fd.get('user'), fd.get('key'))
  }

  const isDark = theme !== 'light'

  return (
    <div className="admin-page">
      {!loggedIn && (
        <div id="login-overlay">
          <form className="login-box" onSubmit={submitLogin}>
            <h2>System <span style={{ color: 'var(--pt)' }}>Auth</span></h2>
            <p style={{ color: 'var(--afdd)', fontSize: '0.9rem', marginTop: 10, fontFamily: "'Space Mono',monospace" }}>SECURE ADMIN GATEWAY</p>
            <input type="text" name="user" placeholder="Admin ID" autoComplete="username" defaultValue={creds.user} />
            <input type="password" name="key" placeholder="••••••••••••" autoComplete="current-password" defaultValue={creds.key} />
            <button className="btn-main" type="submit" style={{ width: '100%', padding: 15, fontFamily: "'Space Mono',monospace", fontSize: '0.9rem' }}>INITIALIZE SESSION</button>
            {loginError && <p style={{ color: 'var(--rt)', fontSize: '0.8rem', marginTop: 15, fontFamily: "'Space Mono',monospace" }}>[!] ACCESS DENIED</p>}
          </form>
        </div>
      )}

      <Nav variant="admin" />

      <div className="admin-container" style={{ marginTop: 40 }}>
        <div className="admin-header">
          <h1><img src="/assets/logo.svg" alt="Logo" width="40" height="40" /> Class<span>Connect</span> <span className="header-badge">Admin Gateway</span></h1>
        </div>

        <div className="dashboard-grid">
          {/* Create/Edit Form */}
          <div className="form-panel">
            <div className="panel-glow"></div>
            <h3 className="panel-title">Deploy Resource</h3>
            <form onSubmit={saveSolution}>
              <div className="form-group">
                <label>Title (Auto-Generated)</label>
                <input type="text" readOnly value={autoTitle(form)} placeholder="Fill in the fields below to generate a title" style={{ color: 'var(--afdd)', cursor: 'not-allowed' }} />
              </div>

              <div className="form-group">
                <label>Playlist</label>
                <select value={form.playlistSelect} onChange={set('playlistSelect')}>
                  <option value="">-- No Playlist --</option>
                  {playlistOptions.map(p => <option key={p} value={p}>{p}</option>)}
                  <option value="__new__">+ Create New Playlist</option>
                </select>
                {isNewPlaylist && (
                  <input type="text" placeholder="e.g. NCERT Class 10 Full Course" style={{ marginTop: 10 }} value={form.newPlaylistName} onChange={set('newPlaylistName')} />
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                <div className="form-group">
                  <label>Std</label>
                  <select required value={form.classLevel} onChange={set('classLevel')}>
                    <option value="">-- Select Std --</option>
                    {['5', '6', '7', '8', '9', '10'].map(c => <option key={c} value={c}>Class {c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Subject</label>
                  <input type="text" required placeholder="e.g. Mathematics" value={form.subject} onChange={set('subject')} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 15 }}>
                <div className="form-group">
                  <label>Chapter Number</label>
                  <input type="text" placeholder="e.g. 3" value={form.chapterNumber} onChange={set('chapterNumber')} />
                </div>
                <div className="form-group">
                  <label>Chapter Name</label>
                  <input type="text" placeholder="e.g. Integration" value={form.chapter} onChange={set('chapter')} />
                </div>
              </div>

              <div className="form-group">
                <label>YouTube Asset (Optional)</label>
                <input type="url" placeholder="https://youtube.com/..." value={form.youtubeLink} onChange={set('youtubeLink')} />
              </div>

              <div className="form-group" style={{ marginTop: 30 }}>
                <label>Deployment Format</label>
                <select required value={form.formatType} onChange={set('formatType')}>
                  <option value="PDF">Direct PDF Upload</option>
                  <option value="DriveLink">Google Drive Reference</option>
                  <option value="HTML">Rich Document Editor</option>
                </select>
              </div>

              {form.formatType === 'PDF' && (
                <div className="format-section">
                  <label style={{ fontSize: '0.7rem', display: 'block', marginBottom: 10, fontFamily: "'Space Mono',monospace", color: 'var(--afdd)', letterSpacing: 1 }}>ATTACH PDF DOCUMENT</label>
                  <input type="file" ref={fileRef} accept="application/pdf" style={{ padding: 10, width: '100%', color: 'var(--afg)' }} />
                  {currentPdf && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--lt)', marginTop: 10, fontFamily: "'Space Mono',monospace", wordBreak: 'break-all' }}>[CONNECTED] {currentPdf}</p>
                  )}
                </div>
              )}

              {form.formatType === 'DriveLink' && (
                <div className="format-section">
                  <label style={{ fontSize: '0.7rem', display: 'block', marginBottom: 10, fontFamily: "'Space Mono',monospace", color: 'var(--afdd)', letterSpacing: 1 }}>DRIVE URL REFERENCE</label>
                  <input type="url" placeholder="https://drive.google.com/.../view" style={{ width: '100%', padding: 14, background: 'var(--well-bg-strong)', border: '1px solid var(--abd)', color: 'var(--afg)', borderRadius: 8 }} value={form.driveLink} onChange={set('driveLink')} />
                </div>
              )}

              <button type="submit" className="btn-main" disabled={saving} style={{ width: '100%', padding: 16, marginTop: 30, fontFamily: "'Space Mono',monospace", letterSpacing: 1 }}>
                {saving ? 'PROCESSING...' : form.editId ? 'UPDATE RESOURCE' : 'EXECUTE DEPLOYMENT'}
              </button>
              {form.editId && (
                <button type="button" className="btn-out" style={{ width: '100%', padding: 12, marginTop: 15, fontFamily: "'Space Mono',monospace" }} onClick={resetForm}>ABORT EDIT</button>
              )}
            </form>
          </div>

          {/* Right column: editor dock + resource table */}
          <div className="list-panel">
            <div className="panel-glow" style={{ right: 'auto', left: -50 }}></div>

            {/* The Rich Document Editor renders here (the wide column) when selected.
                It stays mounted but hidden on other formats so typed content survives
                format switching — remount only on theme change (skin swap). */}
            <div style={{ display: form.formatType === 'HTML' ? 'block' : 'none', marginBottom: 30 }}>
              <div className="ai-chat-panel">
                <div className="ai-chat-header">
                  <div className="ai-bot-avatar">✨</div>
                  <div>
                    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.75rem', color: 'var(--pt)', fontWeight: 'bold' }}>Solution Bot <span style={{ fontSize: '0.6rem', color: 'var(--afdd)', fontWeight: 'normal', marginLeft: 5 }}>online</span></div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--afdd)' }}>Automated Context Processor</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, marginBottom: 15 }}>
                  <div className="ai-bot-avatar" style={{ width: 24, height: 24, flexShrink: 0 }}></div>
                  <div className="ai-chat-bubble">
                    Hello! I am ready to generate a textbook solution. I will automatically use the Title, Subject, and Chapter you entered, or you can provide extra context below!
                  </div>
                </div>

                {aiBusy && (
                  <div className="ai-typing-loader">
                    <div className="ai-bot-avatar" style={{ width: 24, height: 24, flexShrink: 0 }}></div>
                    <div className="ai-chat-bubble" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px' }}>
                      <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.65rem', color: 'var(--pt)' }}>Processing context</span>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <div className="ai-dot"></div><div className="ai-dot"></div><div className="ai-dot"></div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="ai-prompt-box">
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.65rem', color: 'var(--pt)', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>Custom Instructions (Optional)</div>
                  <textarea placeholder="E.g. Focus specifically on the calculus formulas, format the final answer in bold..." value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} />
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="button" disabled={aiBusy} onClick={generateWithAI} style={{ background: 'var(--pt)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 6, fontSize: '0.75rem', fontFamily: "'Space Mono',monospace", cursor: 'pointer', boxShadow: '0 0 15px rgba(124,58,237,0.4)' }}>
                      {aiBusy ? 'GENERATING...' : 'INITIALIZE GENERATION'}
                    </button>
                  </div>
                </div>
              </div>

              <label style={{ fontSize: '0.7rem', marginBottom: 10, display: 'block', fontFamily: "'Space Mono',monospace", color: 'var(--afdd)', letterSpacing: 1 }}>DOCUMENT CANVAS</label>
              <Editor
                key={theme}
                tinymceScriptSrc={TINYMCE_SRC}
                onInit={(_evt, editor) => { editorRef.current = editor }}
                init={{
                  height: 650,
                  plugins: 'table lists link code',
                  toolbar: 'undo redo | bold italic | bullist numlist | code',
                  menubar: false,
                  font_family_formats: 'Inter=Inter,sans-serif; Space Mono=Space Mono,monospace;',
                  skin: isDark ? 'oxide-dark' : 'oxide',
                  content_css: isDark ? 'dark' : 'default',
                  content_style: isDark
                    ? 'body { font-family: Inter, sans-serif; font-size: 14px; background: #0a0a0f; color: #fff; }'
                    : 'body { font-family: Inter, sans-serif; font-size: 14px; background: #ffffff; color: #0C0C0C; }',
                }}
              />
            </div>

            <h3 className="panel-title">Active Resources</h3>
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Identifier (Title)</th>
                    <th>Playlist</th>
                    <th>Subject</th>
                    <th>Format</th>
                    <th>Operations</th>
                  </tr>
                </thead>
                <tbody>
                  {solutions.map(sol => (
                    <tr key={sol._id}>
                      <td style={{ fontWeight: 500 }}>{sol.title}</td>
                      <td>{sol.playlist || <span style={{ color: 'var(--afdd)' }}>—</span>}</td>
                      <td>{sol.subject}</td>
                      <td><span className="format-pill">{sol.formatType}</span></td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <button className="btn-small btn-edit" onClick={() => editSolution(sol)}>EDIT</button>
                        <button className="btn-small btn-delete" onClick={() => deleteSolution(sol._id)}>DEL</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
