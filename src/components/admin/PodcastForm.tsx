import React, { useState, useEffect } from 'react'
import { supabase, type Podcast } from '../../lib/supabase'
import { X } from 'lucide-react'
import '../../styles/AdminForms.css'

interface Props {
  editingId: string | null
  onClose: () => void
}

export default function PodcastForm({ editingId, onClose }: Props) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    audio_url: '',
    image_url: '',
    episode_number: null as number | null,
    guest_name: '',
    duration: null as number | null,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (editingId) {
      const fetchPodcast = async () => {
        try {
          const { data, error } = await supabase
            .from('podcasts')
            .select('*')
            .eq('id', editingId)
            .maybeSingle()

          if (error) throw error
          if (data) {
            setFormData({
              title: data.title,
              description: data.description,
              audio_url: data.audio_url,
              image_url: data.image_url || '',
              episode_number: data.episode_number,
              guest_name: data.guest_name || '',
              duration: data.duration,
            })
          }
        } catch (error) {
          console.error('Error fetching podcast:', error)
        }
      }
      fetchPodcast()
    }
  }, [editingId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value ? parseInt(value) : null) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingId) {
        const { error } = await supabase
          .from('podcasts')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('podcasts')
          .insert([formData])

        if (error) throw error
      }

      onClose()
    } catch (error) {
      console.error('Error saving podcast:', error)
      alert('Error saving podcast')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-modal">
      <div className="form-modal-content">
        <div className="form-header">
          <h3>{editingId ? 'Edit Podcast' : 'New Podcast'}</h3>
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

          <div className="form-group">
            <label>Audio URL *</label>
            <input
              type="url"
              name="audio_url"
              value={formData.audio_url}
              onChange={handleChange}
              required
              placeholder="https://example.com/podcast.mp3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Episode Number</label>
              <input
                type="number"
                name="episode_number"
                value={formData.episode_number || ''}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Duration (seconds)</label>
              <input
                type="number"
                name="duration"
                value={formData.duration || ''}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Guest Name</label>
            <input
              type="text"
              name="guest_name"
              value={formData.guest_name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Cover Image URL</label>
            <input
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              placeholder="https://example.com/cover.jpg"
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="button secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="button">
              {loading ? 'Saving...' : 'Save Podcast'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
