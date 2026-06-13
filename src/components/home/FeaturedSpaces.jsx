import React from 'react'
import { featuredSpaces } from '../../data/homeContent'

export default function FeaturedSpaces() {
  return (
    <section id="spaces" className="section spaces-section">
      <div className="section-header">
        <span className="eyebrow">{featuredSpaces.eyebrow}</span>
        <h2 className="section-title">{featuredSpaces.title}</h2>
      </div>
      <div className="spaces-grid">
        {featuredSpaces.items.map(item => (
          <figure key={item.title} className="space-card">
            <div className="space-card-image" style={{ backgroundImage: `url(${item.image})` }} />
            <figcaption>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
