import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { LogOut } from 'lucide-react'
import CaseStudiesAdmin from '../components/admin/CaseStudiesAdmin'
import PodcastsAdmin from '../components/admin/PodcastsAdmin'
import '../styles/Admin.css'

export default function Admin() {
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'case-studies' | 'podcasts'>('case-studies')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          window.location.href = '/login'
          return
        }
        setUser(session.user)
      } catch (error) {
        console.error('Auth error:', error)
        window.location.href = '/login'
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (loading) return <div className="loading">Loading...</div>

  if (!user) return null

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="admin-header-content">
          <h1>Admin Dashboard</h1>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </header>

      <div className="admin-tabs">
        <button
          className={`tab ${activeTab === 'case-studies' ? 'active' : ''}`}
          onClick={() => setActiveTab('case-studies')}
        >
          Case Studies
        </button>
        <button
          className={`tab ${activeTab === 'podcasts' ? 'active' : ''}`}
          onClick={() => setActiveTab('podcasts')}
        >
          Podcasts
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'case-studies' && <CaseStudiesAdmin />}
        {activeTab === 'podcasts' && <PodcastsAdmin />}
      </div>
    </div>
  )
}
