import React from 'react'
import { Zap } from 'lucide-react'
import './Footer.css'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-section">
              <div className="footer-logo">
                <Zap size={24} />
                <span>Sky Fire Laser</span>
              </div>
              <p>Professional solid-state laser repair and manufacturing solutions.</p>
            </div>

            <div className="footer-section">
              <h4>Services</h4>
              <ul>
                <li><a href="#services">Laser Repair</a></li>
                <li><a href="#services">Emergency Support</a></li>
                <li><a href="#services">Custom Manufacturing</a></li>
                <li><a href="#services">Testing & Calibration</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Company</h4>
              <ul>
                <li><a href="#case-studies">Case Studies</a></li>
                <li><a href="#podcasts">Podcasts</a></li>
                <li><a href="#contact">Contact Us</a></li>
                <li><a href="/admin">Admin</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Contact</h4>
              <p className="contact-info">Email: contact@skyfirelaserservice.com</p>
              <p className="contact-info">Phone: +86 (0) XXX-XXXX-XXXX</p>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            <p>&copy; {currentYear} Sky Fire Laser. All rights reserved.</p>
            <div className="footer-links">
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
