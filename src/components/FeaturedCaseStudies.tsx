import React, { useState, useEffect } from 'react'
import { supabase, type CaseStudy } from '../lib/supabase'
import { ArrowRight } from 'lucide-react'
import './FeaturedCaseStudies.css'

export default function FeaturedCaseStudies() {
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCaseStudies = async () => {
      try {
        const { data, error } = await supabase
          .from('case_studies')
          .select('*')
          .eq('featured', true)
          .limit(3)
          .order('published_at', { ascending: false })

        if (error) throw error
        setCaseStudies(data || [])
      } catch (error) {
        console.error('Error fetching case studies:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCaseStudies()
  }, [])

  if (loading) {
    return (
      <section id="case-studies" className="section case-studies-section">
        <div className="container">
          <div className="section-title">
            <h2>Case Studies</h2>
            <p>Real-world examples of our expertise and success</p>
          </div>
          <div className="loading-skeleton"></div>
        </div>
      </section>
    )
  }

  return (
    <section id="case-studies" className="section case-studies-section">
      <div className="container">
        <div className="section-title">
          <h2>Case Studies</h2>
          <p>Real-world examples of our expertise and success</p>
        </div>

        {caseStudies.length > 0 ? (
          <>
            <div className="case-studies-grid">
              {caseStudies.map((study) => (
                <article key={study.id} className="case-study-card">
                  {study.image_url && (
                    <div className="case-study-image">
                      <img src={study.image_url} alt={study.title} />
                    </div>
                  )}
                  <div className="case-study-content">
                    <span className="case-study-badge">{study.industry}</span>
                    <h3>{study.title}</h3>
                    <p className="client-name">Client: {study.client_name}</p>
                    <p className="description">{study.description}</p>
                    {study.results && (
                      <div className="results">
                        <h4>Results</h4>
                        <ul>
                          {Object.entries(study.results).map(([key, value]) => (
                            <li key={key}>{key}: {String(value)}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <a href="#" className="read-more">
                      Read Full Case Study
                      <ArrowRight size={16} />
                    </a>
                  </div>
                </article>
              ))}
            </div>
            <div className="section-footer">
              <a href="/case-studies" className="button">
                View All Case Studies
                <ArrowRight size={20} />
              </a>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <p>Case studies coming soon. Check back later!</p>
          </div>
        )}
      </div>
    </section>
  )
}
