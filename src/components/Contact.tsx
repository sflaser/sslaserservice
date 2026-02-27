import React, { useState } from 'react'
import { Mail, Phone, MapPin, Send } from 'lucide-react'
import './Contact.css'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setStatus('success')
        setFormData({ name: '', email: '', phone: '', company: '', message: '' })
        setTimeout(() => setStatus('idle'), 3000)
      } else {
        setStatus('error')
      }
    } catch (error) {
      setStatus('error')
    }
  }

  return (
    <section id="contact" className="section contact-section">
      <div className="container">
        <div className="contact-content">
          <div className="contact-info">
            <h2>Get in Touch</h2>
            <p>Have questions about our services? We're here to help. Contact us today for a consultation.</p>

            <div className="info-items">
              <div className="info-item">
                <Phone size={24} />
                <div>
                  <h4>Phone</h4>
                  <p>+86 (0) XXX-XXXX-XXXX</p>
                </div>
              </div>
              <div className="info-item">
                <Mail size={24} />
                <div>
                  <h4>Email</h4>
                  <p>contact@skyfirelaserservice.com</p>
                </div>
              </div>
              <div className="info-item">
                <MapPin size={24} />
                <div>
                  <h4>Location</h4>
                  <p>China</p>
                </div>
              </div>
            </div>
          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <input
                type="text"
                name="company"
                placeholder="Company Name"
                value={formData.company}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <textarea
                name="message"
                placeholder="Your Message"
                rows={5}
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <button type="submit" className="button" disabled={status === 'loading'}>
              {status === 'loading' ? 'Sending...' : 'Send Message'}
              <Send size={20} />
            </button>

            {status === 'success' && (
              <p className="message success">Message sent successfully! We'll get back to you soon.</p>
            )}
            {status === 'error' && (
              <p className="message error">Error sending message. Please try again.</p>
            )}
          </form>
        </div>
      </div>
    </section>
  )
}
