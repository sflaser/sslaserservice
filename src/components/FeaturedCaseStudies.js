import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowRight } from 'lucide-react';
import './FeaturedCaseStudies.css';
export default function FeaturedCaseStudies() {
    const [caseStudies, setCaseStudies] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchCaseStudies = async () => {
            try {
                const { data, error } = await supabase
                    .from('case_studies')
                    .select('*')
                    .eq('featured', true)
                    .limit(3)
                    .order('published_at', { ascending: false });
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
        fetchCaseStudies();
    }, []);
    if (loading) {
        return (_jsx("section", { id: "case-studies", className: "section case-studies-section", children: _jsxs("div", { className: "container", children: [_jsxs("div", { className: "section-title", children: [_jsx("h2", { children: "Case Studies" }), _jsx("p", { children: "Real-world examples of our expertise and success" })] }), _jsx("div", { className: "loading-skeleton" })] }) }));
    }
    return (_jsx("section", { id: "case-studies", className: "section case-studies-section", children: _jsxs("div", { className: "container", children: [_jsxs("div", { className: "section-title", children: [_jsx("h2", { children: "Case Studies" }), _jsx("p", { children: "Real-world examples of our expertise and success" })] }), caseStudies.length > 0 ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "case-studies-grid", children: caseStudies.map((study) => (_jsxs("article", { className: "case-study-card", children: [study.image_url && (_jsx("div", { className: "case-study-image", children: _jsx("img", { src: study.image_url, alt: study.title }) })), _jsxs("div", { className: "case-study-content", children: [_jsx("span", { className: "case-study-badge", children: study.industry }), _jsx("h3", { children: study.title }), _jsxs("p", { className: "client-name", children: ["Client: ", study.client_name] }), _jsx("p", { className: "description", children: study.description }), study.results && (_jsxs("div", { className: "results", children: [_jsx("h4", { children: "Results" }), _jsx("ul", { children: Object.entries(study.results).map(([key, value]) => (_jsxs("li", { children: [key, ": ", String(value)] }, key))) })] })), _jsxs("a", { href: "#", className: "read-more", children: ["Read Full Case Study", _jsx(ArrowRight, { size: 16 })] })] })] }, study.id))) }), _jsx("div", { className: "section-footer", children: _jsxs("a", { href: "/case-studies", className: "button", children: ["View All Case Studies", _jsx(ArrowRight, { size: 20 })] }) })] })) : (_jsx("div", { className: "empty-state", children: _jsx("p", { children: "Case studies coming soon. Check back later!" }) }))] }) }));
}
