import React, { useState, useEffect } from 'react'
import { supabase, type Podcast } from '../lib/supabase'
import { Play, Clock, User, ArrowRight } from 'lucide-react'
import './FeaturedPodcasts.css'

export default function FeaturedPodcasts() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([])
  const [loading, setLoading] = useState(true)
  const [playingId, setPlayingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchPodcasts = async () => {
      try {
        const { data, error } = await supabase
          .from('podcasts')
          .select('*')
          .limit(3)
          .order('published_at', { ascending: false })

        if (error) throw error
        setPodcasts(data || [])
      } catch (error) {
        console.error('Error fetching podcasts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPodcasts()
  }, [])

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return ''
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  if (loading) {
    return (
      <section id="podcasts" className="section podcasts-section">
        <div className="container">
          <div className="section-title">
            <h2>Featured Podcasts</h2>
            <p>Industry insights and expert conversations</p>
          </div>
          <div className="loading-skeleton"></div>
        </div>
      </section>
    )
  }

  return (
    <section id="podcasts" className="section podcasts-section">
      <div className="container">
        <div className="section-title">
          <h2>Featured Podcasts</h2>
          <p>Industry insights and expert conversations</p>
        </div>

        {podcasts.length > 0 ? (
          <>
            <div className="podcasts-grid">
              {podcasts.map((podcast) => (
                <article key={podcast.id} className="podcast-card">
                  {podcast.image_url && (
                    <div className="podcast-cover">
                      <img src={podcast.image_url} alt={podcast.title} />
                      <button
                        className="play-button"
                        onClick={() => setPlayingId(playingId === podcast.id ? null : podcast.id)}
                        aria-label="Play podcast"
                      >
                        <Play size={24} fill="currentColor" />
                      </button>
                    </div>
                  )}
                  <div className="podcast-info">
                    {podcast.episode_number && (
                      <span className="episode-number">Episode {podcast.episode_number}</span>
                    )}
                    <h3>{podcast.title}</h3>
                    {podcast.guest_name && (
                      <div className="guest-info">
                        <User size={16} />
                        <span>{podcast.guest_name}</span>
                      </div>
                    )}
                    <p className="description">{podcast.description}</p>
                    <div className="podcast-meta">
                      {podcast.duration && (
                        <div className="meta-item">
                          <Clock size={16} />
                          <span>{formatDuration(podcast.duration)}</span>
                        </div>
                      )}
                      <div className="meta-item">
                        <span>{new Date(podcast.published_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {playingId === podcast.id && (
                    <div className="podcast-player">
                      <audio
                        src={podcast.audio_url}
                        controls
                        autoPlay
                        className="audio-player"
                      />
                    </div>
                  )}
                </article>
              ))}
            </div>
            <div className="section-footer">
              <a href="/podcasts" className="button">
                View All Podcasts
                <ArrowRight size={20} />
              </a>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <p>Podcasts coming soon. Subscribe to get notified!</p>
          </div>
        )}
      </div>
    </section>
  )
}
