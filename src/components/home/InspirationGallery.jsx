import React from 'react'
import { inspirationGallery } from '../../data/homeContent'

export default function InspirationGallery() {
  return (
    <section id="gallery" className="section gallery-section">
      <div className="section-header">
        <span className="eyebrow">{inspirationGallery.eyebrow}</span>
        <h2 className="section-title">{inspirationGallery.title}</h2>
        <p className="section-description">{inspirationGallery.description}</p>
      </div>
      <div className="gallery-grid">
        {inspirationGallery.items.map(item => (
          <figure key={item.title} className="gallery-card">
            <div className="gallery-card-image" style={{ backgroundImage: `url(${item.image})` }} />
            <figcaption>
              <h3>{item.title}</h3>
              <p>{item.caption}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
