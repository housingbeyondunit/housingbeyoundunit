import React from 'react'
import { communityStories } from '../../data/homeContent'

export default function CommunityStories() {
  return (
    <section id="stories" className="section stories-section">
      <div className="section-header">
        <span className="eyebrow">{communityStories.eyebrow}</span>
        <h2 className="section-title">{communityStories.title}</h2>
        <p className="section-description">{communityStories.description}</p>
      </div>
      <div className="stories-grid">
        {communityStories.stories.map(story => (
          <article key={story.name} className="story-card">
            <p className="story-quote">{story.quote}</p>
            <div className="story-author">
              <img className="story-avatar" src={story.avatar} alt="" />
              <div className="story-author-info">
                <span className="story-name">{story.name}</span>
                <span className="story-unit">{story.unit}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
