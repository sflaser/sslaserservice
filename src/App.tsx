import React, { useState, useEffect } from 'react'
import Navigation from './components/Navigation'
import Hero from './components/Hero'
import Services from './components/Services'
import FeaturedCaseStudies from './components/FeaturedCaseStudies'
import FeaturedPodcasts from './components/FeaturedPodcasts'
import Partners from './components/Partners'
import Contact from './components/Contact'
import Footer from './components/Footer'
import './App.css'

function App() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="app">
      <Navigation />
      <Hero />
      <Services />
      <FeaturedCaseStudies />
      <FeaturedPodcasts />
      <Partners />
      <Contact />
      <Footer />
    </div>
  )
}

export default App
