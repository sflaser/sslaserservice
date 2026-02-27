import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import PodcastForm from './PodcastForm';
import '../../styles/AdminForms.css';
export default function PodcastsAdmin() {
    const [podcasts, setPodcasts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    useEffect(() => {
        fetchPodcasts();
    }, []);
    const fetchPodcasts = async () => {
        try {
            const { data, error } = await supabase
                .from('podcasts')
                .select('*')
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
    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this podcast?'))
            return;
        try {
            const { error } = await supabase
                .from('podcasts')
                .delete()
                .eq('id', id);
            if (error)
                throw error;
            setPodcasts(prev => prev.filter(p => p.id !== id));
        }
        catch (error) {
            console.error('Error deleting podcast:', error);
            alert('Error deleting podcast');
        }
    };
    return (_jsxs("div", { className: "admin-section", children: [_jsxs("div", { className: "admin-section-header", children: [_jsx("h2", { children: "Podcasts" }), _jsxs("button", { className: "button", onClick: () => {
                            setEditingId(null);
                            setShowForm(!showForm);
                        }, children: [_jsx(Plus, { size: 20 }), "New Podcast"] })] }), showForm && (_jsx(PodcastForm, { editingId: editingId, onClose: () => {
                    setShowForm(false);
                    setEditingId(null);
                    fetchPodcasts();
                } })), loading ? (_jsx("div", { className: "loading", children: "Loading podcasts..." })) : podcasts.length === 0 ? (_jsx("div", { className: "empty-state", children: "No podcasts yet" })) : (_jsx("div", { className: "admin-table-container", children: _jsxs("table", { className: "admin-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Title" }), _jsx("th", { children: "Episode" }), _jsx("th", { children: "Guest" }), _jsx("th", { children: "Duration" }), _jsx("th", { children: "Published" }), _jsx("th", { children: "Actions" })] }) }), _jsx("tbody", { children: podcasts.map(podcast => (_jsxs("tr", { children: [_jsx("td", { children: podcast.title }), _jsx("td", { children: podcast.episode_number || '-' }), _jsx("td", { children: podcast.guest_name || '-' }), _jsx("td", { children: podcast.duration ? `${Math.floor(podcast.duration / 60)}m` : '-' }), _jsx("td", { children: new Date(podcast.published_at).toLocaleDateString() }), _jsx("td", { children: _jsxs("div", { className: "action-buttons", children: [_jsx("button", { className: "btn-edit", onClick: () => {
                                                        setEditingId(podcast.id);
                                                        setShowForm(true);
                                                    }, children: _jsx(Edit2, { size: 16 }) }), _jsx("button", { className: "btn-delete", onClick: () => handleDelete(podcast.id), children: _jsx(Trash2, { size: 16 }) })] }) })] }, podcast.id))) })] }) }))] }));
}
