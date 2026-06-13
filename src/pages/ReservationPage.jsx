import React, { useState } from 'react'
import BookingWizard from '../components/BookingWizard'
import { avatarColor } from '../utils/avatar'

export default function ReservationPage({ levels, hallways, onUpdateUnit, currentUser, setCurrentUser, existingUsers, resetApp }) {
  return (
    <div className="reservation-page">
      <section className="reservation-intro">
        <span className="eyebrow">Reservation Experience</span>
        <h1 className="section-title">Choose Your Date, Then Your Home</h1>
        <p className="section-description">
          Pick the date you'd like your reservation to begin. The floor plan below updates automatically to
          show what's available for that date — only then will you choose your unit.
        </p>
      </section>

      {!currentUser && (
        <UserSelector existingUsers={existingUsers} onSetUser={setCurrentUser} />
      )}

      <BookingWizard levels={levels} hallways={hallways} onUpdateUnit={onUpdateUnit} currentUser={currentUser} resetApp={resetApp} />
    </div>
  )
}

// ── Full selector shown when no user is logged in ───────────────────────────
function UserSelector({ existingUsers, onSetUser }) {
  const [newName, setNewName] = useState('')

  const handleJoin = () => {
    const name = newName.trim()
    if (name) { onSetUser(name); setNewName('') }
  }

  return (
    <div className="user-selector">
      {existingUsers.length > 0 && (
        <div className="user-selector-section">
          <span className="user-selector-label">Login as existing user</span>
          <div className="user-card-list">
            {existingUsers.map(u => (
              <button key={u.name} className="user-card" onClick={() => onSetUser(u.name)}>
                <span className="user-avatar user-avatar--sm" style={{ background: avatarColor(u.name) }}>
                  {u.name[0].toUpperCase()}
                </span>
                <span className="user-card-name">{u.name}</span>
                <span className="user-card-count">{u.count} unit{u.count !== 1 ? 's' : ''}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="user-selector-divider">or join as new user</div>
      <div className="user-new-form">
        <input
          className="user-new-input"
          placeholder="Enter your name..."
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleJoin()}
          autoFocus
        />
        <button onClick={handleJoin} disabled={!newName.trim()}>Join</button>
      </div>
    </div>
  )
}
