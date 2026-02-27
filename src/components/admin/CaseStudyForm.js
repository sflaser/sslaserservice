import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { X } from 'lucide-react';
import '../../styles/AdminForms.css';
export default function CaseStudyForm({ editingId, onClose }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        client_name: '',
        industry: '',
        image_url: '',
        featured: false,
        results: {},
    });
    const [resultKey, setResultKey] = useState('');
    const [resultValue, setResultValue] = useState('');
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (editingId) {
            const fetchCaseStudy = async () => {
                try {
                    const { data, error } = await supabase
                        .from('case_studies')
                        .select('*')
                        .eq('id', editingId)
                        .maybeSingle();
                    if (error)
                        throw error;
                    if (data) {
                        setFormData({
                            title: data.title,
                            description: data.description,
                            client_name: data.client_name,
                            industry: data.industry,
                            image_url: data.image_url || '',
                            featured: data.featured,
                            results: data.results || {},
                        });
                    }
                }
                catch (error) {
                    console.error('Error fetching case study:', error);
                }
            };
            fetchCaseStudy();
        }
    }, [editingId]);
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? e.target.checked : value,
        }));
    };
    const addResult = () => {
        if (resultKey && resultValue) {
            setFormData(prev => ({
                ...prev,
                results: {
                    ...prev.results,
                    [resultKey]: resultValue,
                },
            }));
            setResultKey('');
            setResultValue('');
        }
    };
    const removeResult = (key) => {
        setFormData(prev => ({
            ...prev,
            results: Object.fromEntries(Object.entries(prev.results).filter(([k]) => k !== key)),
        }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingId) {
                const { error } = await supabase
                    .from('case_studies')
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
                    .from('case_studies')
                    .insert([formData]);
                if (error)
                    throw error;
            }
            onClose();
        }
        catch (error) {
            console.error('Error saving case study:', error);
            alert('Error saving case study');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "form-modal", children: _jsxs("div", { className: "form-modal-content", children: [_jsxs("div", { className: "form-header", children: [_jsx("h3", { children: editingId ? 'Edit Case Study' : 'New Case Study' }), _jsx("button", { className: "close-btn", onClick: onClose, children: _jsx(X, { size: 20 }) })] }), _jsxs("form", { onSubmit: handleSubmit, className: "admin-form", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Title *" }), _jsx("input", { type: "text", name: "title", value: formData.title, onChange: handleChange, required: true })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Description *" }), _jsx("textarea", { name: "description", value: formData.description, onChange: handleChange, rows: 4, required: true })] }), _jsxs("div", { className: "form-row", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Client Name *" }), _jsx("input", { type: "text", name: "client_name", value: formData.client_name, onChange: handleChange, required: true })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Industry *" }), _jsx("input", { type: "text", name: "industry", value: formData.industry, onChange: handleChange, required: true })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Image URL" }), _jsx("input", { type: "url", name: "image_url", value: formData.image_url, onChange: handleChange, placeholder: "https://example.com/image.jpg" })] }), _jsx("div", { className: "form-group checkbox", children: _jsxs("label", { children: [_jsx("input", { type: "checkbox", name: "featured", checked: formData.featured, onChange: handleChange }), "Feature on homepage"] }) }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Results" }), _jsx("div", { className: "results-list", children: Object.entries(formData.results).map(([key, value]) => (_jsxs("div", { className: "result-item", children: [_jsxs("span", { children: [key, ": ", String(value)] }), _jsx("button", { type: "button", onClick: () => removeResult(key), className: "remove-btn", children: "\u00D7" })] }, key))) }), _jsxs("div", { className: "add-result", children: [_jsx("input", { type: "text", placeholder: "Key", value: resultKey, onChange: e => setResultKey(e.target.value) }), _jsx("input", { type: "text", placeholder: "Value", value: resultValue, onChange: e => setResultValue(e.target.value) }), _jsx("button", { type: "button", onClick: addResult, className: "button-small", children: "Add" })] })] }), _jsxs("div", { className: "form-actions", children: [_jsx("button", { type: "button", onClick: onClose, className: "button secondary", children: "Cancel" }), _jsx("button", { type: "submit", disabled: loading, className: "button", children: loading ? 'Saving...' : 'Save Case Study' })] })] })] }) }));
}
