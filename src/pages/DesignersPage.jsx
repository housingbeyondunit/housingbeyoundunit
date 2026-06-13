import React from 'react'
import { designersIntro, designers } from '../data/designers'

export default function DesignersPage() {
  return (
    <div className="designers-page page-container">
      <section className="designers-intro">
        <span className="eyebrow">{designersIntro.eyebrow}</span>
        <h1 className="section-title">{designersIntro.title}</h1>
        <p className="section-description">{designersIntro.description}</p>
      </section>

      <div className="designers-list">
        {designers.map(designer => (
          <article key={designer.name} className="designer-card">
            <div className="designer-header">
              <img className="designer-avatar" src={designer.avatar} alt="" />
              <div className="designer-info">
                <h3 className="designer-name">{designer.name}</h3>
                <span className="designer-role">{designer.role}</span>
                <p className="designer-bio">{designer.bio}</p>
                <div className="designer-contact">
                  <a className="btn btn--small btn--dark" href={`mailto:${designer.email}`}>Email</a>
                  <span className="designer-phone">{designer.phone}</span>
                </div>
              </div>
            </div>

            <div className="designer-portfolio">
              {designer.portfolio.map(item => (
                <figure key={item.title} className="portfolio-item">
                  <div className="portfolio-thumb" style={{ backgroundImage: `url(${item.image})` }} />
                  <figcaption>{item.title}</figcaption>
                </figure>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
