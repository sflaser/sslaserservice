import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { LogOut } from 'lucide-react';
import CaseStudiesAdmin from '../components/admin/CaseStudiesAdmin';
import PodcastsAdmin from '../components/admin/PodcastsAdmin';
import '../styles/Admin.css';
export default function Admin() {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('case-studies');
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    window.location.href = '/login';
                    return;
                }
                setUser(session.user);
            }
            catch (error) {
                console.error('Auth error:', error);
                window.location.href = '/login';
            }
            finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);
    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/login';
    };
    if (loading)
        return _jsx("div", { className: "loading", children: "Loading..." });
    if (!user)
        return null;
    return (_jsxs("div", { className: "admin-container", children: [_jsx("header", { className: "admin-header", children: _jsxs("div", { className: "admin-header-content", children: [_jsx("h1", { children: "Admin Dashboard" }), _jsxs("button", { className: "logout-btn", onClick: handleLogout, children: [_jsx(LogOut, { size: 20 }), "Logout"] })] }) }), _jsxs("div", { className: "admin-tabs", children: [_jsx("button", { className: `tab ${activeTab === 'case-studies' ? 'active' : ''}`, onClick: () => setActiveTab('case-studies'), children: "Case Studies" }), _jsx("button", { className: `tab ${activeTab === 'podcasts' ? 'active' : ''}`, onClick: () => setActiveTab('podcasts'), children: "Podcasts" })] }), _jsxs("div", { className: "admin-content", children: [activeTab === 'case-studies' && _jsx(CaseStudiesAdmin, {}), activeTab === 'podcasts' && _jsx(PodcastsAdmin, {})] })] }));
}
