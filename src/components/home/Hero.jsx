import React, { useState, useEffect } from 'react'
import { hero } from '../../data/homeContent'

const SLIDE_INTERVAL = 6000

export default function Hero({ onNavigate }) {
  const [activeSlide, setActiveSlide] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setActiveSlide(i => (i + 1) % hero.images.length)
    }, SLIDE_INTERVAL)
    return () => clearInterval(id)
  }, [])

  return (
    <section className="hero">
      {hero.images.map((image, i) => (
        <div
          key={image}
          className={`hero-slide ${i === activeSlide ? 'hero-slide--active' : ''}`}
          style={{ backgroundImage: `url(${image})` }}
        />
      ))}
      <div className="hero-overlay" />
      <div className="hero-content">
        <span className="eyebrow eyebrow--light">{hero.eyebrow}</span>
        <h1 className="hero-title">{hero.title}</h1>
        <p className="hero-subtitle">{hero.subtitle}</p>
        <div className="hero-actions">
          <button className="btn btn--light" onClick={() => onNavigate(hero.primaryCta.target)}>
            {hero.primaryCta.label}
          </button>
          <button className="btn btn--ghost-light" onClick={() => onNavigate(hero.secondaryCta.target)}>
            {hero.secondaryCta.label}
          </button>
        </div>
      </div>
      <div className="hero-dots">
        {hero.images.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Show slide ${i + 1}`}
            className={`hero-dot ${i === activeSlide ? 'hero-dot--active' : ''}`}
            onClick={() => setActiveSlide(i)}
          />
        ))}
      </div>
    </section>
  )
}
