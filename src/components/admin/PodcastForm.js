import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { X } from 'lucide-react';
import '../../styles/AdminForms.css';
export default function PodcastForm({ editingId, onClose }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        audio_url: '',
        image_url: '',
        episode_number: null,
        guest_name: '',
        duration: null,
    });
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (editingId) {
            const fetchPodcast = async () => {
                try {
                    const { data, error } = await supabase
                        .from('podcasts')
                        .select('*')
                        .eq('id', editingId)
                        .maybeSingle();
                    if (error)
                        throw error;
                    if (data) {
                        setFormData({
                            title: data.title,
                            description: data.description,
                            audio_url: data.audio_url,
                            image_url: data.image_url || '',
                            episode_number: data.episode_number,
                            guest_name: data.guest_name || '',
                            duration: data.duration,
                        });
                    }
                }
                catch (error) {
                    console.error('Error fetching podcast:', error);
                }
            };
            fetchPodcast();
        }
    }, [editingId]);
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? (value ? parseInt(value) : null) : value,
        }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingId) {
                const { error } = await supabase
                    .from('podcasts')
                    .update({
                    ...formData,
                    updated_at: new Date().toISOString(),
                })
                    .eq('id', editingId);
                if (error)
                    throw error;
            }
            else {
                const { error } = await supabase
                    .from('podcasts')
                    .insert([formData]);
                if (error)
                    throw error;
            }
            onClose();
        }
        catch (error) {
            console.error('Error saving podcast:', error);
            alert('Error saving podcast');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "form-modal", children: _jsxs("div", { className: "form-modal-content", children: [_jsxs("div", { className: "form-header", children: [_jsx("h3", { children: editingId ? 'Edit Podcast' : 'New Podcast' }), _jsx("button", { className: "close-btn", onClick: onClose, children: _jsx(X, { size: 20 }) })] }), _jsxs("form", { onSubmit: handleSubmit, className: "admin-form", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Title *" }), _jsx("input", { type: "text", name: "title", value: formData.title, onChange: handleChange, required: true })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Description *" }), _jsx("textarea", { name: "description", value: formData.description, onChange: handleChange, rows: 4, required: true })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Audio URL *" }), _jsx("input", { type: "url", name: "audio_url", value: formData.audio_url, onChange: handleChange, required: true, placeholder: "https://example.com/podcast.mp3" })] }), _jsxs("div", { className: "form-row", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Episode Number" }), _jsx("input", { type: "number", name: "episode_number", value: formData.episode_number || '', onChange: handleChange })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Duration (seconds)" }), _jsx("input", { type: "number", name: "duration", value: formData.duration || '', onChange: handleChange })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Guest Name" }), _jsx("input", { type: "text", name: "guest_name", value: formData.guest_name, onChange: handleChange })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Cover Image URL" }), _jsx("input", { type: "url", name: "image_url", value: formData.image_url, onChange: handleChange, placeholder: "https://example.com/cover.jpg" })] }), _jsxs("div", { className: "form-actions", children: [_jsx("button", { type: "button", onClick: onClose, className: "button secondary", children: "Cancel" }), _jsx("button", { type: "submit", disabled: loading, className: "button", children: loading ? 'Saving...' : 'Save Podcast' })] })] })] }) }));
}
