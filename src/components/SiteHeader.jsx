import React, { useState } from 'react'
import { avatarColor } from '../utils/avatar'

const NAV_ITEMS = [
  { id: 'about', label: 'Our Vision' },
  { id: 'spaces', label: 'Spaces' },
  { id: 'gallery', label: 'Inspiration' },
  { id: 'library', label: 'Open Library' },
  { id: 'stories', label: 'Community' },
]

export default function SiteHeader({
  page,
  currentUser,
  currentUserUnitCount,
  onLogout,
  onNavigate,
  onGoHome,
  onGoReservation,
  onContactClick,
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  const handleNavigate = sectionId => {
    setMenuOpen(false)
    onNavigate(sectionId)
  }

  const handleGoReservation = () => {
    setMenuOpen(false)
    onGoReservation()
  }

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <button className="site-logo" onClick={() => { setMenuOpen(false); onGoHome() }}>
          <span className="site-logo-mark"><span /><span /><span /><span /></span>
          Housing<span className="site-logo-accent">Beyond</span>Unit
        </button>

        <nav className={`site-nav ${menuOpen ? 'site-nav--open' : ''}`}>
          {NAV_ITEMS.map(item => (
            <button key={item.id} className="site-nav-link" onClick={() => handleNavigate(item.id)}>
              {item.label}
            </button>
          ))}
          <button className="site-nav-link site-nav-link--contact" onClick={() => { setMenuOpen(false); onContactClick() }}>
            Contact
          </button>
          <button
            className={`btn btn--small ${page === 'reservation' ? 'btn--dark' : 'btn--outline'}`}
            onClick={handleGoReservation}
          >
            Reserve
          </button>
          {currentUser && (
            <div className="site-user-badge">
              <span className="user-avatar user-avatar--sm" style={{ background: avatarColor(currentUser) }}>
                {currentUser[0].toUpperCase()}
              </span>
              <span className="site-user-name">{currentUser}</span>
              <span className="site-user-count">{currentUserUnitCount} unit{currentUserUnitCount !== 1 ? 's' : ''}</span>
              <button className="user-logout-btn" onClick={onLogout}>Logout</button>
            </div>
          )}
        </nav>

        <button className="site-nav-toggle" aria-label="Toggle navigation" onClick={() => setMenuOpen(o => !o)}>
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  )
}
