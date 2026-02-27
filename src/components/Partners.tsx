import React from 'react'
import './Partners.css'

const partners = [
  { name: 'Quantel', logo: '/images/logos/quantel laser logo.jpg' },
  { name: 'Lumibird', logo: '/images/logos/Lumibird laser logo1.jpg' },
  { name: 'Coherent', logo: '/images/logos/coherent laser logo2.jpg' },
  { name: 'JDSU', logo: '/images/logos/jdsu_laser_logo1.jpg' },
  { name: 'Amplitude', logo: '/images/logos/Amplitude-laser-logo-1.jpg' },
  { name: 'Agilent', logo: '/images/logos/agilent laser logo1.jpg' },
  { name: 'Spectra Physics', logo: '/images/logos/SPECTRA-PHYSICS-laser-logo-1.jpg' },
  { name: 'PI', logo: '/images/logos/PI-laser-logo-1.jpg' },
]

export default function Partners() {
  return (
    <section className="section partners-section">
      <div className="container">
        <div className="section-title">
          <h2>Trusted Partners</h2>
          <p>We service and support the world's leading laser manufacturers</p>
        </div>

        <div className="partners-grid">
          {partners.map((partner, index) => (
            <div key={index} className="partner-card">
              <img src={partner.logo} alt={partner.name} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
