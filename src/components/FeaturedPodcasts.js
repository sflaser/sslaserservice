import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Play, Clock, User, ArrowRight } from 'lucide-react';
import './FeaturedPodcasts.css';
export default function FeaturedPodcasts() {
    const [podcasts, setPodcasts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [playingId, setPlayingId] = useState(null);
    useEffect(() => {
        const fetchPodcasts = async () => {
            try {
                const { data, error } = await supabase
                    .from('podcasts')
                    .select('*')
                    .limit(3)
                    .order('published_at', { ascending: false });
                if (error)
                    throw error;
                setPodcasts(data || []);
            }
            catch (error) {
                console.error('Error fetching podcasts:', error);
            }
            finally {
                setLoading(false);
            }
        };
        fetchPodcasts();
    }, []);
    const formatDuration = (seconds) => {
        if (!seconds)
            return '';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0)
            return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };
    if (loading) {
        return (_jsx("section", { id: "podcasts", className: "section podcasts-section", children: _jsxs("div", { className: "container", children: [_jsxs("div", { className: "section-title", children: [_jsx("h2", { children: "Featured Podcasts" }), _jsx("p", { children: "Industry insights and expert conversations" })] }), _jsx("div", { className: "loading-skeleton" })] }) }));
    }
    return (_jsx("section", { id: "podcasts", className: "section podcasts-section", children: _jsxs("div", { className: "container", children: [_jsxs("div", { className: "section-title", children: [_jsx("h2", { children: "Featured Podcasts" }), _jsx("p", { children: "Industry insights and expert conversations" })] }), podcasts.length > 0 ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "podcasts-grid", children: podcasts.map((podcast) => (_jsxs("article", { className: "podcast-card", children: [podcast.image_url && (_jsxs("div", { className: "podcast-cover", children: [_jsx("img", { src: podcast.image_url, alt: podcast.title }), _jsx("button", { className: "play-button", onClick: () => setPlayingId(playingId === podcast.id ? null : podcast.id), "aria-label": "Play podcast", children: _jsx(Play, { size: 24, fill: "currentColor" }) })] })), _jsxs("div", { className: "podcast-info", children: [podcast.episode_number && (_jsxs("span", { className: "episode-number", children: ["Episode ", podcast.episode_number] })), _jsx("h3", { children: podcast.title }), podcast.guest_name && (_jsxs("div", { className: "guest-info", children: [_jsx(User, { size: 16 }), _jsx("span", { children: podcast.guest_name })] })), _jsx("p", { className: "description", children: podcast.description }), _jsxs("div", { className: "podcast-meta", children: [podcast.duration && (_jsxs("div", { className: "meta-item", children: [_jsx(Clock, { size: 16 }), _jsx("span", { children: formatDuration(podcast.duration) })] })), _jsx("div", { className: "meta-item", children: _jsx("span", { children: new Date(podcast.published_at).toLocaleDateString() }) })] })] }), playingId === podcast.id && (_jsx("div", { className: "podcast-player", children: _jsx("audio", { src: podcast.audio_url, controls: true, autoPlay: true, className: "audio-player" }) }))] }, podcast.id))) }), _jsx("div", { className: "section-footer", children: _jsxs("a", { href: "/podcasts", className: "button", children: ["View All Podcasts", _jsx(ArrowRight, { size: 20 })] }) })] })) : (_jsx("div", { className: "empty-state", children: _jsx("p", { children: "Podcasts coming soon. Subscribe to get notified!" }) }))] }) }));
}
