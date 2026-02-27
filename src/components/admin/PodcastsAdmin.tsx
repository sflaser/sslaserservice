import React, { useState, useEffect } from 'react'
import { supabase, type Podcast } from '../../lib/supabase'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import PodcastForm from './PodcastForm'
import '../../styles/AdminForms.css'

export default function PodcastsAdmin() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    fetchPodcasts()
  }, [])

  const fetchPodcasts = async () => {
    try {
      const { data, error } = await supabase
        .from('podcasts')
        .select('*')
        .order('published_at', { ascending: false })

      if (error) throw error
      setPodcasts(data || [])
    } catch (error) {
      console.error('Error fetching podcasts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this podcast?')) return

    try {
      const { error } = await supabase
        .from('podcasts')
        .delete()
        .eq('id', id)

      if (error) throw error
      setPodcasts(prev => prev.filter(p => p.id !== id))
    } catch (error) {
      console.error('Error deleting podcast:', error)
      alert('Error deleting podcast')
    }
  }

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>Podcasts</h2>
        <button
          className="button"
          onClick={() => {
            setEditingId(null)
            setShowForm(!showForm)
          }}
        >
          <Plus size={20} />
          New Podcast
        </button>
      </div>

      {showForm && (
        <PodcastForm
          editingId={editingId}
          onClose={() => {
            setShowForm(false)
            setEditingId(null)
            fetchPodcasts()
          }}
        />
      )}

      {loading ? (
        <div className="loading">Loading podcasts...</div>
      ) : podcasts.length === 0 ? (
        <div className="empty-state">No podcasts yet</div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Episode</th>
                <th>Guest</th>
                <th>Duration</th>
                <th>Published</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {podcasts.map(podcast => (
                <tr key={podcast.id}>
                  <td>{podcast.title}</td>
                  <td>{podcast.episode_number || '-'}</td>
                  <td>{podcast.guest_name || '-'}</td>
                  <td>{podcast.duration ? `${Math.floor(podcast.duration / 60)}m` : '-'}</td>
                  <td>{new Date(podcast.published_at).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-edit"
                        onClick={() => {
                          setEditingId(podcast.id)
                          setShowForm(true)
                        }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(podcast.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
