import React, { useState, useEffect } from 'react'
import { supabase, type CaseStudy } from '../../lib/supabase'
import { X } from 'lucide-react'
import '../../styles/AdminForms.css'

interface Props {
  editingId: string | null
  onClose: () => void
}

export default function CaseStudyForm({ editingId, onClose }: Props) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    client_name: '',
    industry: '',
    image_url: '',
    featured: false,
    results: {} as Record<string, unknown>,
  })
  const [resultKey, setResultKey] = useState('')
  const [resultValue, setResultValue] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (editingId) {
      const fetchCaseStudy = async () => {
        try {
          const { data, error } = await supabase
            .from('case_studies')
            .select('*')
            .eq('id', editingId)
            .maybeSingle()

          if (error) throw error
          if (data) {
            setFormData({
              title: data.title,
              description: data.description,
              client_name: data.client_name,
              industry: data.industry,
              image_url: data.image_url || '',
              featured: data.featured,
              results: data.results || {},
            })
          }
        } catch (error) {
          console.error('Error fetching case study:', error)
        }
      }
      fetchCaseStudy()
    }
  }, [editingId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const addResult = () => {
    if (resultKey && resultValue) {
      setFormData(prev => ({
        ...prev,
        results: {
          ...prev.results,
          [resultKey]: resultValue,
        },
      }))
      setResultKey('')
      setResultValue('')
    }
  }

  const removeResult = (key: string) => {
    setFormData(prev => ({
      ...prev,
      results: Object.fromEntries(
        Object.entries(prev.results).filter(([k]) => k !== key)
      ),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingId) {
        const { error } = await supabase
          .from('case_studies')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('case_studies')
          .insert([formData])

        if (error) throw error
      }

      onClose()
    } catch (error) {
      console.error('Error saving case study:', error)
      alert('Error saving case study')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-modal">
      <div className="form-modal-content">
        <div className="form-header">
          <h3>{editingId ? 'Edit Case Study' : 'New Case Study'}</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Client Name *</label>
              <input
                type="text"
                name="client_name"
                value={formData.client_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Industry *</label>
              <input
                type="text"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Image URL</label>
            <input
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
              />
              Feature on homepage
            </label>
          </div>

          <div className="form-group">
            <label>Results</label>
            <div className="results-list">
              {Object.entries(formData.results).map(([key, value]) => (
                <div key={key} className="result-item">
                  <span>{key}: {String(value)}</span>
                  <button
                    type="button"
                    onClick={() => removeResult(key)}
                    className="remove-btn"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="add-result">
              <input
                type="text"
                placeholder="Key"
                value={resultKey}
                onChange={e => setResultKey(e.target.value)}
              />
              <input
                type="text"
                placeholder="Value"
                value={resultValue}
                onChange={e => setResultValue(e.target.value)}
              />
              <button type="button" onClick={addResult} className="button-small">
                Add
              </button>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="button secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="button">
              {loading ? 'Saving...' : 'Save Case Study'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
