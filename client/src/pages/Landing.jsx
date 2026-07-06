import { useEffect, useState } from 'react'
import Nav from '../components/Nav.jsx'

const FAQS = [
  ['How long does it take to set up ClassConnect?', 'Most institutes are fully operational within 24-48 hours. We handle the bulk upload of your student data, batch structure, and fee schedules — so you can start using the platform right away.'],
  ['Is ClassConnect suitable for small coaching classes?', 'Absolutely. Whether you manage 20 students or 2,000, ClassConnect scales to fit your institute. The platform is designed to eliminate admin overhead regardless of size.'],
  ['How do parents access the portal?', "Parents receive a unique login linked to their child's profile. They can view attendance, test scores, fee status, and performance analytics in real time — all from their phone or desktop."],
  ['Is my institute’s data secure?', 'Yes. All data is encrypted, backed up daily, and hosted on secure cloud infrastructure. We follow industry best practices to ensure your information is always protected and available.'],
  ['What does pricing look like?', 'We offer flexible plans tailored to your institute size and needs. Request a demo and our team will walk you through the options — there are zero hidden charges.'],
  ['Can teachers use it on their phones?', 'Yes. ClassConnect is fully responsive and works seamlessly on mobile, tablet, and desktop. Teachers can mark attendance, publish results, and manage their dashboard from anywhere.'],
]

const MARQUEE = [
  ['🏆', 'Award\nWinning'], ['500+', 'Students\nManaged'], ['24/7', 'Parent\nVisibility'], ['100%', 'Fee\nTransparency'],
  ['Live', 'Real-Time\nAnalytics'], ['3×', 'Faster\nAdmin Work'], ['₹0', 'Hidden\nCharges'], ['Secure', 'Data &\nBackups'],
]

function MarqueeItems() {
  return MARQUEE.map(([num, label], i) => (
    <div className="mq-item" key={i}>
      <div className="mq-num">{num}</div>
      <div className="mq-label">{label.split('\n').map((l, j) => <span key={j}>{l}<br /></span>)}</div>
    </div>
  ))
}

export default function Landing() {
  const [openFaq, setOpenFaq] = useState(-1)
  const [contactStatus, setContactStatus] = useState('')
  const [showTop, setShowTop] = useState(false)

  // Scroll reveals — same selectors and stagger rhythm as the original main.js.
  useEffect(() => {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.opacity = '1'
          e.target.style.transform = 'none'
        }
      })
    }, { threshold: 0.08 })
    document.querySelectorAll('.section-h,.section-p,.feat-card,.int-step,.how-card,.platform-card,.trust-card,.testi-card,.narrative-content,.faq-item').forEach(el => {
      el.style.cssText += 'opacity:0;transform:translateY(28px);transition:opacity .8s ease,transform .8s ease'
      io.observe(el)
    })
    const stagger = (sel, step) => document.querySelectorAll(sel).forEach((el, i) => { el.style.transitionDelay = (i * step) + 's' })
    stagger('.feat-card', 0.07); stagger('.how-card', 0.12); stagger('.platform-card', 0.14)
    stagger('.trust-card', 0.1); stagger('.testi-card', 0.1); stagger('.faq-item', 0.06)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  async function submitContact(e) {
    e.preventDefault()
    setContactStatus('Sending...')
    const payload = Object.fromEntries(new FormData(e.target).entries())
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        setContactStatus('✓ Request received. We will reach out within one business day.')
        e.target.reset()
      } else {
        const data = await res.json().catch(() => null)
        setContactStatus(data?.error || 'Something went wrong. Please email us directly.')
      }
    } catch {
      setContactStatus('Network error. Please email us directly.')
    }
  }

  return (
    <>
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>

      <div className="page">
        <Nav variant="landing" />

        {/* ═══ HERO ═══ */}
        <section className="hero">
          <div className="hero-glow-ring"></div>
          <div className="ticker-wrap">
            <div className="ticker">
              <span>THE PREMIUM STANDARD FOR COACHING&nbsp;&nbsp;&nbsp;&nbsp;THE PREMIUM STANDARD FOR COACHING&nbsp;&nbsp;&nbsp;&nbsp;</span>
              <span>THE PREMIUM STANDARD FOR COACHING&nbsp;&nbsp;&nbsp;&nbsp;THE PREMIUM STANDARD FOR COACHING&nbsp;&nbsp;&nbsp;&nbsp;</span>
            </div>
          </div>
          <div className="hero-content">
            <div className="hero-left">
              <div className="hero-kicker">
                <span className="kicker-dot"></span>ClassConnect · Professional Coaching Operations · Mumbai Edition
              </div>
              <h1>
                <span className="stroke">The Premium</span><br />
                <span>Standard</span> <span className="accent">For</span><br />
                <span className="lime">Coaching.</span>
              </h1>
              <p className="hero-sub">Stop juggling spreadsheets. Start managing your institute with the clarity, speed, and precision that modern educators demand.</p>
              <div className="hero-cta" style={{ marginTop: 36 }}>
                <a href="#contact" className="btn-main">Request Your Demo →</a>
                <a href="#features" className="btn-out">Explore Features</a>
              </div>
            </div>
            <div className="hero-right">
              <div className="hero-award-badge">
                <span className="badge-icon">🏆</span>
                <span className="badge-text">Award-Winning Platform</span>
              </div>
            </div>
          </div>
          <div className="scroll-label">Scroll to explore</div>
        </section>

        {/* ═══ MARQUEE ═══ */}
        <div className="marquee-section">
          <div className="marquee-track">
            <MarqueeItems />
            <MarqueeItems />
          </div>
        </div>

        {/* ═══ TRUSTED BY ═══ */}
        <section className="customers-section">
          <div className="customers-label">Trusted by leading institutes</div>
          <div className="customers-logos">
            <a href="https://tuitionhub.vercel.app" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <div className="trusted-badge">
                <img src="/assets/tuitionhub-logo.ico" alt="TuitionHub" />
                <div className="trusted-info">
                  <span className="trusted-name">TuitionHub</span>
                  <span className="trusted-type">Education Center</span>
                </div>
              </div>
            </a>
          </div>
        </section>

        {/* ═══ THE PROBLEM / SOLUTION ═══ */}
        <section className="base-section problem-section">
          <div className="base-bg-text">PROBLEM</div>
          <div className="base-glow"></div>
          <div className="base-content" style={{ maxWidth: 800, margin: '0 auto' }}>
            <div className="section-number">01 — The Old Way</div>
            <h2 className="base-title" style={{ fontSize: 'clamp(2.5rem, 6vw, 6rem)' }}>
              <span className="stroke">Exhausting &</span><br />
              <span className="purple">Scattered</span>
            </h2>
            <p className="base-sub">Scattered spreadsheets, endless WhatsApp messages, chasing down fee payments manually, and compiling test results by hand. It's draining your energy and limiting your growth.</p>

            <div style={{ margin: '80px 0' }}></div>

            <div className="section-number">02 — The New Standard</div>
            <h2 className="base-title" style={{ fontSize: 'clamp(2.5rem, 6vw, 6rem)' }}>
              <span className="stroke">Unified &</span><br />
              <span className="lime">Intelligent</span>
            </h2>
            <p className="base-sub">A unified operating system built specifically for modern educators who want to focus on teaching, not administration.</p>
          </div>
        </section>

        {/* ═══ FEATURES ═══ */}
        <section className="base-section features-section" id="features">
          <div className="base-bg-text">FEATURES</div>
          <div className="base-glow"></div>
          <div className="base-content">
            <div className="section-number">03 — Core Arsenal</div>
            <h2 className="base-title">
              <span className="stroke">Total</span><br />
              <span className="purple">Control</span>
            </h2>
            <p className="base-sub">ClassConnect replaces manual follow-ups with one authoritative system — built for institutes that refuse to settle for average.</p>

            <div className="features-grid" style={{ maxWidth: 1400, margin: '0 auto', textAlign: 'left' }}>
              {[
                ['📊', 'Smart Dashboard', 'Centralized control. See your entire batch performance, fee status, and scheduling at a single commanding glance.', 'purple'],
                ['📝', 'Test Management', 'High-fidelity results. Publish scores instantly and track progress trends with surgical accuracy.', 'lime'],
                ['📅', 'Attendance Tracking', 'Zero-miss attendance. Automated logs that keep your operations lean, your data airtight, and parents informed in real time.', 'purple'],
                ['💰', 'Fee Management', 'Transparent finance. Automated reminders that protect your cash flow and keep parents informed without the friction.', 'lime'],
                ['📚', 'Study Materials', 'Organized, accessible, instant. Upload subject-specific notes and assignments that students can reach from anywhere.', 'purple'],
                ['🏆', 'Live Leaderboards', 'Engineered competition. Live rankings and performance milestones that motivate students to consistently raise their game.', 'lime'],
              ].map(([icon, name, desc, tone]) => (
                <div className="feat-card" key={name}>
                  <div className="feat-icon" style={{ background: tone === 'purple' ? 'rgba(124,58,237,.1)' : 'rgba(189,224,69,.1)' }}>{icon}</div>
                  <div className="feat-name">{name}</div>
                  <div className="feat-desc">{desc}</div>
                  <div className="feat-accent-line" style={{ background: `linear-gradient(90deg,var(--${tone}),transparent)` }}></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ HOW IT WORKS ═══ */}
        <section className="base-section how-section" id="how">
          <div className="base-bg-text">MINUTES</div>
          <div className="base-glow"></div>
          <div className="base-content">
            <div className="section-number">04 — Deployment</div>
            <h2 className="base-title">
              <span className="stroke">Live In</span><br />
              <span className="lime">Minutes</span>
            </h2>
            <p className="base-sub">No complex setup. No IT team required. Four steps from onboarding to full operational control.</p>

            <div className="how-grid" style={{ maxWidth: 1400, margin: '0 auto', textAlign: 'left' }}>
              {[
                ['01', '🏫', 'Onboard', 'Bulk-upload your students and institute structure. Define batches, subjects, and fee schedules in one session.', 'rgba(124,58,237,.12)'],
                ['02', '🔗', 'Integrate', 'Sync your tests and attendance workflow. Students get clean dashboards. Parents get immediate visibility.', 'rgba(189,224,69,.12)'],
                ['03', '⚡', 'Automate', 'Let the system handle reminders, notifications, and fee alerts. Your admin overhead drops to near zero.', 'rgba(124,58,237,.12)'],
                ['04', '📈', 'Optimize', 'Make strategic decisions based on real-time data. Better insights. Higher student success rates.', 'rgba(189,224,69,.12)'],
              ].map(([num, icon, title, desc, bg]) => (
                <div className="how-card" key={num}>
                  <div className="how-step-num">{num}</div>
                  <div className="how-icon" style={{ background: bg }}>{icon}</div>
                  <div className="how-title">{title}</div>
                  <div className="how-desc">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ PLATFORM PORTALS ═══ */}
        <section className="base-section platform-section" id="platform">
          <div className="base-bg-text">PORTALS</div>
          <div className="base-glow"></div>
          <div className="base-content">
            <div className="section-number">05 — Platform Access</div>
            <h2 className="base-title">
              <span className="stroke">One Hub.</span><br />
              <span className="purple">Every Role.</span>
            </h2>
            <p className="base-sub">Teachers command, students perform, parents stay informed. Three dedicated portals built for the people who matter most.</p>

            <div className="platform-grid" style={{ maxWidth: 1400, margin: '0 auto', textAlign: 'left' }}>
              <div className="platform-card">
                <div className="platform-card-glow"></div>
                <div className="platform-role">For Teachers</div>
                <span className="platform-icon">👩‍🏫</span>
                <div className="platform-title">Teacher Portal</div>
                <div className="platform-desc">Your complete classroom command centre. Everything from attendance to fee oversight — managed in one disciplined space.</div>
                <div className="platform-features">
                  <div className="pf-item">Mark & track attendance daily</div>
                  <div className="pf-item">Create tests & publish results instantly</div>
                  <div className="pf-item">Upload study materials by subject</div>
                  <div className="pf-item">Monitor fee collection & dues</div>
                  <div className="pf-item">View performance analytics per student</div>
                </div>
                <a href="#contact" className="platform-cta btn-main">Get Teacher Access →</a>
              </div>

              <div className="platform-card">
                <div className="platform-card-glow" style={{ background: 'radial-gradient(circle at 30% 30%, rgba(189,224,69,.1) 0%, transparent 60%)' }}></div>
                <div className="platform-role" style={{ color: 'var(--lime-text)' }}>For Students</div>
                <span className="platform-icon">🎓</span>
                <div className="platform-title">Student Portal</div>
                <div className="platform-desc">A personal academic command centre. Scores, rank, leaderboard, materials — everything a high-performer needs.</div>
                <div className="platform-features">
                  <div className="pf-item lime-dot">View test scores & live class rank</div>
                  <div className="pf-item lime-dot">Download study materials anytime</div>
                  <div className="pf-item lime-dot">Check attendance record & alerts</div>
                  <div className="pf-item lime-dot">Track fee payment history</div>
                  <div className="pf-item lime-dot">Live leaderboard — see where you stand</div>
                </div>
                <a href="#contact" className="platform-cta btn-lime">Get Student Access →</a>
              </div>

              <div className="platform-card">
                <div className="platform-card-glow"></div>
                <div className="platform-role">For Parents</div>
                <span className="platform-icon">👨‍👩‍👦</span>
                <div className="platform-title">Parent View</div>
                <div className="platform-desc">Stay connected to your child's academic journey without the daily follow-ups. Full transparency, zero friction.</div>
                <div className="platform-features">
                  <div className="pf-item">Real-time attendance notifications</div>
                  <div className="pf-item">Test result alerts via WhatsApp</div>
                  <div className="pf-item">Fee dues & payment reminders</div>
                  <div className="pf-item">Monthly performance summary</div>
                  <div className="pf-item">Direct message to teacher</div>
                </div>
                <a href="#contact" className="platform-cta btn-out" style={{ textAlign: 'center' }}>Access via Student Login →</a>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ FREE SOLUTIONS ═══ */}
        <section className="base-section problem-section" id="free-solutions">
          <div className="base-bg-text">SOLUTIONS</div>
          <div className="base-glow"></div>
          <div className="base-content" style={{ maxWidth: 800, margin: '0 auto' }}>
            <div className="section-number">06 — Free Solutions</div>
            <h2 className="base-title">
              <span className="stroke">Verified</span><br />
              <span className="purple">Textbook Solutions</span>
            </h2>
            <p className="base-sub">Access completely free, high-quality textbook solutions for Maharashtra State Board 5th to 10th standard. Stop struggling with tricky questions and start learning with clarity.</p>

            <div style={{ marginTop: 48, textAlign: 'center' }}>
              <a href="/solutions" className="btn-main" style={{ padding: '15px 30px', fontSize: '1rem' }}>Explore Free Solutions →</a>
            </div>
          </div>
        </section>

        {/* ═══ TESTIMONIALS ═══ */}
        <section className="base-section testimonials-section" id="testimonials">
          <div className="base-bg-text">VOICES</div>
          <div className="base-glow"></div>
          <div className="base-content">
            <div className="section-number">07 — Real Voices</div>
            <h2 className="base-title">
              <span className="stroke">Trusted By</span><br />
              <span className="lime">Faculty</span>
            </h2>
            <p className="base-sub">Don't just take our word for it. See how ClassConnect is transforming educational operations for institutes across the country.</p>

            <div className="testimonials-grid" style={{ textAlign: 'left' }}>
              {[
                ['"ClassConnect completely eliminated our manual fee tracking. We now spend our time actually focusing on students instead of spreadsheets."', 'RJ', 'Rajesh Joshi', 'Director, Pinnacle Coaching', 'var(--purple-mid)', undefined],
                ['"The live leaderboards have gamified our test series. Our students are more engaged and competitive than ever before."', 'AP', 'Anita Patel', 'Head of Academics, Excel Academy', 'var(--lime-text)', '#000'],
                ['"Parents used to call us constantly asking for updates. Now they check the portal themselves. It\'s saved us hours every single week."', 'SM', 'Sneha Mishra', 'Co-Founder, BrightMinds Academy', 'var(--purple)', undefined],
              ].map(([quote, initials, name, role, bg, color]) => (
                <div className="testi-card" key={name}>
                  <div className="testi-quote">{quote}</div>
                  <div className="testi-author">
                    <div className="ta-avatar" style={{ background: bg, color }}>{initials}</div>
                    <div className="ta-info">
                      <div className="ta-name">{name}</div>
                      <div className="ta-role">{role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ TRUST STRIP ═══ */}
        <section className="trust-section" style={{ padding: '60px 48px', borderTop: '1px solid var(--border-dim)', borderBottom: '1px solid var(--border-dim)', background: 'var(--bg-card)' }}>
          <div className="trust-inner">
            {[
              ['🏆', 'Award-Winning', 'Recognised with the Best Project Award for excellence in streamlining academic management operations.', 'rgba(245,200,66,.1)'],
              ['⚡', 'Built for Speed', 'Admin tasks that took hours now take minutes. Less friction means more time teaching.', 'rgba(124,58,237,.1)'],
              ['🔒', 'Trusted Data', "Secure, backed-up, and always available. Your institute's data is protected and accessible exactly when you need it.", 'rgba(189,224,69,.1)'],
            ].map(([icon, title, desc, bg]) => (
              <div className="trust-card" key={title}>
                <div className="trust-icon-wrap" style={{ background: bg }}>{icon}</div>
                <div>
                  <div className="trust-title">{title}</div>
                  <div className="trust-desc">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ FAQ ═══ */}
        <section className="base-section faq-section" id="faq">
          <div className="base-bg-text">ANSWERS</div>
          <div className="base-glow"></div>
          <div className="base-content">
            <div className="section-number">08 — FAQ</div>
            <h2 className="base-title">
              <span className="stroke">Got</span><br />
              <span className="purple">Questions?</span>
            </h2>
            <p className="base-sub">Everything you need to know about getting started with ClassConnect.</p>

            <div className="faq-list" style={{ textAlign: 'left', maxWidth: 800, margin: '56px auto 0' }}>
              {FAQS.map(([q, a], i) => (
                <div className={`faq-item${openFaq === i ? ' active' : ''}`} key={i}>
                  <button className="faq-q" aria-expanded={openFaq === i} onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                    {q}<span className="faq-icon">+</span>
                  </button>
                  <div className="faq-a"><p>{a}</p></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ CTA / CONTACT ═══ */}
        <section className="base-section" id="contact">
          <div className="base-bg-text">CLASSCONNECT</div>
          <div className="base-glow"></div>
          <div className="base-content">
            <h2 className="base-title">
              <span className="stroke">Ready to</span><br />
              <span className="purple">Upgrade</span><br />
              <span className="lime">Your Institute?</span>
            </h2>
            <p className="base-sub">Tell us about your institute and we will tailor a live demo around your batch size, subjects, and workflow.</p>

            <div className="contact-grid" style={{ maxWidth: 1000, margin: '48px auto 0', textAlign: 'left' }}>
              <div className="contact-card">
                <h3>Get in Touch</h3>
                <p>Reach us directly or submit a request and we will respond within one business day with a personalised demo.</p>
                <div className="contact-list">
                  <div><span>Phone / WhatsApp</span>8451826909</div>
                  <div><span>Email</span>classconnectsupport@gmail.com</div>
                  <div><span>Location</span>Andheri East, Mumbai</div>
                </div>
                <div className="contact-award">
                  <span className="contact-award-icon">🏆</span>
                  <div className="contact-award-text">
                    <strong>Award-Winning Platform</strong><br />
                    Best Project — Excellence in Academic Management
                  </div>
                </div>
              </div>

              <form className="contact-card contact-form" onSubmit={submitContact}>
                <div className="form-row">
                  <div>
                    <label htmlFor="name" className="sr-only">Full Name</label>
                    <input className="input" id="name" name="name" placeholder="Full Name" maxLength={200} required />
                  </div>
                  <div>
                    <label htmlFor="phone" className="sr-only">Phone / WhatsApp</label>
                    <input className="input" id="phone" name="phone" type="tel" placeholder="Phone / WhatsApp" maxLength={200} required />
                  </div>
                </div>
                <div className="form-row">
                  <div>
                    <label htmlFor="email" className="sr-only">Email Address</label>
                    <input className="input" id="email" type="email" name="email" placeholder="Email Address" maxLength={200} required />
                  </div>
                  <div>
                    <label htmlFor="institute" className="sr-only">Institute Name</label>
                    <input className="input" id="institute" name="institute" placeholder="Institute Name" maxLength={200} required />
                  </div>
                </div>
                <button className="btn-main" type="submit" style={{ width: '100%', padding: 15, fontSize: '.7rem' }}>Request Your Demo →</button>
                <div className="form-status">{contactStatus}</div>
                <div className="form-note">By submitting, you agree to receive a call or email from ClassConnect. No spam, ever.</div>
              </form>
            </div>
          </div>
        </section>

        {/* ═══ FOOTER ═══ */}
        <footer>
          <div className="f-logo">CLASSCONNECT</div>
          <div className="f-meta">Andheri East · Mumbai · 8451826909 · 🏆 Award-Winning Platform</div>
          <div className="f-links">
            <a href="#features">Features</a>
            <a href="#how">How It Works</a>
            <a href="#platform">Portals</a>
            <a href="/solutions">Free Solutions</a>
            <a href="#faq">FAQ</a>
            <a href="#contact">Contact</a>
          </div>
        </footer>
      </div>

      <button
        className={`back-to-top${showTop ? ' visible' : ''}`}
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >↑</button>
    </>
  )
}
