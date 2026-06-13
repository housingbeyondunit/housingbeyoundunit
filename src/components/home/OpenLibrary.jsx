import React from 'react'
import { FURNITURE_ITEMS, FurnitureIcon } from '../FurnitureGrid'
import { openLibrary } from '../../data/homeContent'

export default function OpenLibrary({ onGoReservation }) {
  return (
    <section id="library" className="section library-section">
      <div className="section-header">
        <span className="eyebrow">{openLibrary.eyebrow}</span>
        <h2 className="section-title">{openLibrary.title}</h2>
        <p className="section-description">{openLibrary.description}</p>
      </div>
      <div className="library-grid">
        {FURNITURE_ITEMS.map(item => (
          <div key={item.id} className="library-item">
            <FurnitureIcon id={item.id} className="library-item-icon" />
            <span className="library-item-label">{item.label}</span>
          </div>
        ))}
      </div>
      <div className="library-cta">
        <button className="btn btn--dark" onClick={onGoReservation}>{openLibrary.cta.label}</button>
      </div>
    </section>
  )
}
