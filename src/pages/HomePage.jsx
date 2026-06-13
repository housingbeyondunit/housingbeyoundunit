import React, { useEffect } from 'react'
import Hero from '../components/home/Hero'
import AboutConcept from '../components/home/AboutConcept'
import FeaturedSpaces from '../components/home/FeaturedSpaces'
import InspirationGallery from '../components/home/InspirationGallery'
import OpenLibrary from '../components/home/OpenLibrary'
import CommunityStories from '../components/home/CommunityStories'
import ReservationCTA from '../components/home/ReservationCTA'

export default function HomePage({ pendingScroll, clearPendingScroll, onGoReservation, onNavigate }) {
  useEffect(() => {
    if (!pendingScroll) return
    const el = document.getElementById(pendingScroll)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    clearPendingScroll()
  }, [pendingScroll, clearPendingScroll])

  return (
    <div className="home-page">
      <Hero onNavigate={onNavigate} />
      <AboutConcept />
      <FeaturedSpaces />
      <InspirationGallery />
      <OpenLibrary onGoReservation={onGoReservation} />
      <CommunityStories />
      <ReservationCTA onGoReservation={onGoReservation} />
    </div>
  )
}
