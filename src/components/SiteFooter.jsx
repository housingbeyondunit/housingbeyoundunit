import React from 'react'

export default function SiteFooter({ onNavigate, onGoReservation, onContactClick }) {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <span className="site-footer-logo">Housing<span>Beyond</span>Unit</span>
          <p>An open framework for living — structure stays, the home is yours to shape.</p>
        </div>

        <div className="site-footer-links">
          <div className="site-footer-col">
            <h4>Explore</h4>
            <button onClick={() => onNavigate('about')}>Our Vision</button>
            <button onClick={() => onNavigate('spaces')}>Featured Spaces</button>
            <button onClick={() => onNavigate('gallery')}>Home Inspiration</button>
            <button onClick={() => onNavigate('library')}>Open Library</button>
            <button onClick={() => onNavigate('stories')}>Community Stories</button>
          </div>
          <div className="site-footer-col">
            <h4>Reserve</h4>
            <button onClick={onGoReservation}>Reservation Experience</button>
          </div>
          <div className="site-footer-col">
            <h4>Studio</h4>
            <button onClick={onContactClick}>Contact the Designer</button>
          </div>
        </div>
      </div>
      <div className="site-footer-bottom">
        <span>© {new Date().getFullYear()} Housing Beyond Unit. A thesis design demo.</span>
      </div>
    </footer>
  )
}
