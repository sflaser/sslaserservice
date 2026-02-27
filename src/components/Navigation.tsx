import React, { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import './Navigation.css'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setIsOpen(false)
    }
  }

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <div className="navbar-logo">
          <div className="logo-icon">⚡</div>
          <span>Sky Fire Laser</span>
        </div>

        <button
          className="mobile-toggle"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`navbar-menu ${isOpen ? 'active' : ''}`}>
          <a href="#services" onClick={(e) => {
            e.preventDefault()
            scrollToSection('services')
          }}>Services</a>
          <a href="#case-studies" onClick={(e) => {
            e.preventDefault()
            scrollToSection('case-studies')
          }}>Case Studies</a>
          <a href="#podcasts" onClick={(e) => {
            e.preventDefault()
            scrollToSection('podcasts')
          }}>Podcasts</a>
          <a href="#contact" onClick={(e) => {
            e.preventDefault()
            scrollToSection('contact')
          }}>Contact</a>
          <a href="/admin" className="admin-link">Admin</a>
        </div>
      </div>
    </nav>
  )
}
