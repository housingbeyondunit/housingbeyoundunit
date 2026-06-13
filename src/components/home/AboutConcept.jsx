import React from 'react'
import { aboutConcept } from '../../data/homeContent'

export default function AboutConcept() {
  return (
    <section id="about" className="section about-section">
      <div className="about-grid">
        <div className="about-copy">
          <span className="eyebrow">{aboutConcept.eyebrow}</span>
          <h2 className="about-title">{aboutConcept.title}</h2>
          {aboutConcept.paragraphs.map((p, i) => (
            <p key={i} className="about-paragraph">{p}</p>
          ))}
        </div>
        <div className="about-image" style={{ backgroundImage: `url(${aboutConcept.image})` }} />
      </div>
      <div className="about-stats">
        {aboutConcept.stats.map(s => (
          <div key={s.label} className="about-stat">
            <span className="about-stat-value">{s.value}</span>
            <span className="about-stat-label">{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
