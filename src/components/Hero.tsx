import React from 'react'
import { ArrowRight, Zap } from 'lucide-react'
import './Hero.css'

export default function Hero() {
  return (
    <div className="hero">
      <div className="hero-content">
        <div className="hero-badge">
          <Zap size={16} />
          <span>Professional Laser Repair & Manufacturing</span>
        </div>

        <h1 className="hero-title">
          Elite Solid-State Laser Solutions
        </h1>

        <p className="hero-subtitle">
          Expert repair, custom manufacturing, and 24/7 emergency support for industrial solid-state laser systems. Trusted by leading manufacturers worldwide.
        </p>

        <div className="hero-buttons">
          <button className="button">
            Get Started
            <ArrowRight size={20} />
          </button>
          <button className="button outline">
            Learn More
          </button>
        </div>

        <div className="hero-stats">
          <div className="stat">
            <span className="stat-number">500+</span>
            <span className="stat-label">Systems Repaired</span>
          </div>
          <div className="stat">
            <span className="stat-number">99%</span>
            <span className="stat-label">Success Rate</span>
          </div>
          <div className="stat">
            <span className="stat-number">24/7</span>
            <span className="stat-label">Emergency Support</span>
          </div>
        </div>
      </div>

      <div className="hero-visual">
        <div className="hero-gradient"></div>
        <div className="laser-beam"></div>
      </div>
    </div>
  )
}
