// ── THEME ──────────────────────────────────────────
function setTheme(t, e) {
  if (e) e.stopPropagation()
  document.documentElement.setAttribute('data-theme', t)
  localStorage.setItem('classconnect-theme', t)
}

function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme')
  setTheme(cur === 'dark' ? 'light' : 'dark')
}
const saved = localStorage.getItem('classconnect-theme')
if (saved) document.documentElement.setAttribute('data-theme', saved)

// ── CURSOR ──────────────────────────────────────────
const curEl = document.getElementById('cur')
if (curEl && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.addEventListener('mousemove', e => {
    curEl.style.left = e.clientX + 'px'
    curEl.style.top = e.clientY + 'px'
  })
  document.querySelectorAll('a,button,.theme-toggle').forEach(el => {
    el.addEventListener('mouseenter', () => curEl.classList.add('big'))
    el.addEventListener('mouseleave', () => curEl.classList.remove('big'))
  })
}

// ── MOBILE HAMBURGER MENU ───────────────────────────
const hamburger = document.getElementById('hamburger')
const mobileMenu = document.getElementById('mobile-menu')

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active')
    mobileMenu.classList.toggle('open')
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : ''
  })

  // Close menu when a link is clicked
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active')
      mobileMenu.classList.remove('open')
      document.body.style.overflow = ''
    })
  })
}

// ── LIVE LEADERBOARD ────────────────────────────────
const students = [{
    name: 'Aarav K.',
    std: 'Class 10',
    subject: 'Mathematics',
    rank: 5,
    score: 95.4
  },
  {
    name: 'Priya S.',
    std: 'Class 9',
    subject: 'Science',
    rank: 4,
    score: 92.1
  },
  {
    name: 'Rohan M.',
    std: 'Class 10',
    subject: 'English',
    rank: 5,
    score: 89.7
  },
  {
    name: 'Ananya P.',
    std: 'Class 8',
    subject: 'Mathematics',
    rank: 3,
    score: 87.3
  },
  {
    name: 'Dev T.',
    std: 'Class 9',
    subject: 'Hindi',
    rank: 2,
    score: 84.8
  },
]

function renderLW(list) {
  const b = document.getElementById('lw-body');
  if (!b) return;
  b.innerHTML = ''
  list.forEach((s, i) => {
    const d = document.createElement('div')
    d.className = 'lw-row' + (i === 0 ? ' top' : '')
    const scoreClass = i === 0 ? 'lw-score lw-score-top' : 'lw-score'
    d.innerHTML = `<span class="lw-pos">${i+1}</span><span class="lw-dot s${s.rank}"></span><div class="lw-info"><div class="lw-name">${s.name} · ${s.std}</div><div class="lw-subject">${s.subject}</div></div><span class="${scoreClass}">${s.score.toFixed(1)}%</span>`
    b.appendChild(d)
  })
}
renderLW(students)
setInterval(() => {
  const c = [...students]
  c.forEach(s => {
    s.score = Math.min(100, Math.max(70, s.score + (Math.random() - .48) * 1.8))
  })
  c.sort((a, b) => b.score - a.score);
  renderLW(c)
}, 3000)

// ── SCORE BAR ANIMATION ─────────────────────────────
const barObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting)
      e.target.querySelectorAll('.bar-inner').forEach((b, i) => {
        setTimeout(() => {
          b.style.width = b.dataset.w + '%'
        }, i * 140 + 200)
      })
  })
}, {
  threshold: .25
})
const scEl = document.getElementById('scorecard-card')
if (scEl) barObserver.observe(scEl)

// ── SCROLL REVEALS ──────────────────────────────────
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'none'
    }
  })
}, {
  threshold: .08
})
document.querySelectorAll('.section-h,.section-p,.feat-card,.int-step,.how-card,.platform-card,.trust-card,.testi-card,.narrative-content,.faq-item').forEach(el => {
  el.style.cssText += 'opacity:0;transform:translateY(28px);transition:opacity .8s ease,transform .8s ease'
  io.observe(el)
})
// Stagger cards
document.querySelectorAll('.feat-card').forEach((el, i) => {
  el.style.transitionDelay = (i * 0.07) + 's'
})
document.querySelectorAll('.how-card').forEach((el, i) => {
  el.style.transitionDelay = (i * 0.12) + 's'
})
document.querySelectorAll('.platform-card').forEach((el, i) => {
  el.style.transitionDelay = (i * 0.14) + 's'
})
document.querySelectorAll('.trust-card').forEach((el, i) => {
  el.style.transitionDelay = (i * 0.1) + 's'
})
document.querySelectorAll('.testi-card').forEach((el, i) => {
  el.style.transitionDelay = (i * 0.1) + 's'
})
document.querySelectorAll('.faq-item').forEach((el, i) => {
  el.style.transitionDelay = (i * 0.06) + 's'
})

// ── FAQ ACCORDION ───────────────────────────────────
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.parentElement
    const isOpen = item.classList.contains('active')
    // Close all others
    document.querySelectorAll('.faq-item.active').forEach(el => el.classList.remove('active'))
    // Toggle current
    if (!isOpen) item.classList.add('active')
    // Update aria
    btn.setAttribute('aria-expanded', !isOpen)
  })
})

// ── BACK TO TOP ─────────────────────────────────────
const btt = document.getElementById('back-to-top')
if (btt) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 600) {
      btt.classList.add('visible')
    } else {
      btt.classList.remove('visible')
    }
  })
  btt.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })
}

// ── CONTACT FORM ──────────────────────────────────
const contactForm = document.getElementById('contact-form')
const contactStatus = document.getElementById('contact-status')

// Check URL for success/error flags from standard fallback submission
if (window.location.search.includes('success=1') && contactStatus) {
  contactStatus.textContent = '✓ Request received. We will reach out within one business day.'
  // Clean up the URL
  window.history.replaceState(null, '', window.location.pathname);
} else if (window.location.search.includes('error=1') && contactStatus) {
  contactStatus.textContent = 'Something went wrong. Please try again.'
  window.history.replaceState(null, '', window.location.pathname);
}

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    // PREVENT the default page submission
    e.preventDefault()
    
    if (contactStatus) contactStatus.textContent = 'Sending...'
    const payload = Object.fromEntries(new FormData(contactForm).entries())
    
    try {
      const res = await fetch(contactForm.action, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      
      if (res.ok) {
        if (contactStatus) contactStatus.textContent = '✓ Request received. We will reach out within one business day.'
        contactForm.reset()
      } else {
        const data = await res.json().catch(() => null)
        if (contactStatus) contactStatus.textContent = data?.error || 'Something went wrong. Please email us directly.'
      }
    } catch (err) {
      if (contactStatus) contactStatus.textContent = 'Network error. Please email us directly.'
    }
  })
}