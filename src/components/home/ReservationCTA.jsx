import React from 'react'
import { reservationExperience } from '../../data/homeContent'

export default function ReservationCTA({ onGoReservation }) {
  return (
    <section id="reservation-flow" className="section reservation-cta-section">
      <div className="section-header">
        <span className="eyebrow eyebrow--light">{reservationExperience.eyebrow}</span>
        <h2 className="section-title section-title--light">{reservationExperience.title}</h2>
        <p className="section-description section-description--light">{reservationExperience.description}</p>
      </div>
      <ol className="reservation-steps">
        {reservationExperience.steps.map((step, i) => (
          <li key={step.label} className="reservation-step">
            <span className="reservation-step-number">{i + 1}</span>
            <div>
              <h3>{step.label}</h3>
              <p>{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="reservation-cta-action">
        <button className="btn btn--light" onClick={onGoReservation}>{reservationExperience.cta.label}</button>
      </div>
    </section>
  )
}
