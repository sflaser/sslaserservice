import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import CaseStudyForm from './CaseStudyForm';
import '../../styles/AdminForms.css';
export default function CaseStudiesAdmin() {
    const [caseStudies, setCaseStudies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    useEffect(() => {
        fetchCaseStudies();
    }, []);
    const fetchCaseStudies = async () => {
        try {
            const { data, error } = await supabase
                .from('case_studies')
                .select('*')
                .order('created_at', { ascending: false });
            if (error)
                throw error;
            setCaseStudies(data || []);
        }
        catch (error) {
            console.error('Error fetching case studies:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this case study?'))
            return;
        try {
            const { error } = await supabase
                .from('case_studies')
                .delete()
                .eq('id', id);
            if (error)
                throw error;
            setCaseStudies(prev => prev.filter(cs => cs.id !== id));
        }
        catch (error) {
            console.error('Error deleting case study:', error);
            alert('Error deleting case study');
        }
    };
    return (_jsxs("div", { className: "admin-section", children: [_jsxs("div", { className: "admin-section-header", children: [_jsx("h2", { children: "Case Studies" }), _jsxs("button", { className: "button", onClick: () => {
                            setEditingId(null);
                            setShowForm(!showForm);
                        }, children: [_jsx(Plus, { size: 20 }), "New Case Study"] })] }), showForm && (_jsx(CaseStudyForm, { editingId: editingId, onClose: () => {
                    setShowForm(false);
                    setEditingId(null);
                    fetchCaseStudies();
                } })), loading ? (_jsx("div", { className: "loading", children: "Loading case studies..." })) : caseStudies.length === 0 ? (_jsx("div", { className: "empty-state", children: "No case studies yet" })) : (_jsx("div", { className: "admin-table-container", children: _jsxs("table", { className: "admin-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Title" }), _jsx("th", { children: "Client" }), _jsx("th", { children: "Industry" }), _jsx("th", { children: "Featured" }), _jsx("th", { children: "Published" }), _jsx("th", { children: "Actions" })] }) }), _jsx("tbody", { children: caseStudies.map(study => (_jsxs("tr", { children: [_jsx("td", { children: study.title }), _jsx("td", { children: study.client_name }), _jsx("td", { children: study.industry }), _jsx("td", { children: study.featured ? 'Yes' : 'No' }), _jsx("td", { children: new Date(study.published_at).toLocaleDateString() }), _jsx("td", { children: _jsxs("div", { className: "action-buttons", children: [_jsx("button", { className: "btn-edit", onClick: () => {
                                                        setEditingId(study.id);
                                                        setShowForm(true);
                                                    }, children: _jsx(Edit2, { size: 16 }) }), _jsx("button", { className: "btn-delete", onClick: () => handleDelete(study.id), children: _jsx(Trash2, { size: 16 }) })] }) })] }, study.id))) })] }) }))] }));
}
