import React from 'react'
import { Wrench, Zap, Package, BarChart3, Microscope, Shield } from 'lucide-react'
import './Services.css'

const services = [
  {
    icon: Wrench,
    title: 'Laser Repair',
    description: 'Expert repair and maintenance for all major solid-state laser brands with quick turnaround times.'
  },
  {
    icon: Zap,
    title: 'Emergency Support',
    description: '24/7 emergency support to minimize your downtime and keep operations running smoothly.'
  },
  {
    icon: Package,
    title: 'Custom Manufacturing',
    description: 'Precision custom laser manufacturing tailored to your specific industrial requirements.'
  },
  {
    icon: BarChart3,
    title: 'PCB Processing',
    description: 'Advanced laser processing for PCB manufacturing with micron-level precision.'
  },
  {
    icon: Microscope,
    title: 'Testing & Calibration',
    description: 'Comprehensive testing and calibration services to ensure optimal performance.'
  },
  {
    icon: Shield,
    title: 'Maintenance Plans',
    description: 'Preventive maintenance plans designed to extend equipment lifespan and reliability.'
  }
]

export default function Services() {
  return (
    <section id="services" className="section services-section">
      <div className="container">
        <div className="section-title">
          <h2>Our Services</h2>
          <p>Comprehensive laser solutions for industrial applications</p>
        </div>

        <div className="services-grid">
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <div key={index} className="service-card">
                <div className="service-icon">
                  <Icon size={32} />
                </div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <a href="#" className="service-link">
                  Learn more →
                </a>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
