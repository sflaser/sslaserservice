import React, { useState, useEffect } from 'react'
import { supabase, type CaseStudy } from '../../lib/supabase'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import CaseStudyForm from './CaseStudyForm'
import '../../styles/AdminForms.css'

export default function CaseStudiesAdmin() {
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    fetchCaseStudies()
  }, [])

  const fetchCaseStudies = async () => {
    try {
      const { data, error } = await supabase
        .from('case_studies')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCaseStudies(data || [])
    } catch (error) {
      console.error('Error fetching case studies:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this case study?')) return

    try {
      const { error } = await supabase
        .from('case_studies')
        .delete()
        .eq('id', id)

      if (error) throw error
      setCaseStudies(prev => prev.filter(cs => cs.id !== id))
    } catch (error) {
      console.error('Error deleting case study:', error)
      alert('Error deleting case study')
    }
  }

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>Case Studies</h2>
        <button
          className="button"
          onClick={() => {
            setEditingId(null)
            setShowForm(!showForm)
          }}
        >
          <Plus size={20} />
          New Case Study
        </button>
      </div>

      {showForm && (
        <CaseStudyForm
          editingId={editingId}
          onClose={() => {
            setShowForm(false)
            setEditingId(null)
            fetchCaseStudies()
          }}
        />
      )}

      {loading ? (
        <div className="loading">Loading case studies...</div>
      ) : caseStudies.length === 0 ? (
        <div className="empty-state">No case studies yet</div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Client</th>
                <th>Industry</th>
                <th>Featured</th>
                <th>Published</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {caseStudies.map(study => (
                <tr key={study.id}>
                  <td>{study.title}</td>
                  <td>{study.client_name}</td>
                  <td>{study.industry}</td>
                  <td>{study.featured ? 'Yes' : 'No'}</td>
                  <td>{new Date(study.published_at).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-edit"
                        onClick={() => {
                          setEditingId(study.id)
                          setShowForm(true)
                        }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(study.id)}
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
