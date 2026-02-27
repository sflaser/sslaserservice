import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { LogIn } from 'lucide-react';
import '../styles/Auth.css';
export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (signInError)
                throw signInError;
            window.location.href = '/admin';
        }
        catch (err) {
            setError(err.message || 'Failed to login');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "auth-container", children: _jsxs("div", { className: "auth-card", children: [_jsxs("div", { className: "auth-header", children: [_jsx(LogIn, { size: 32 }), _jsx("h1", { children: "Admin Login" })] }), error && _jsx("div", { className: "error-message", children: error }), _jsxs("form", { onSubmit: handleLogin, className: "auth-form", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Email" }), _jsx("input", { type: "email", value: email, onChange: e => setEmail(e.target.value), required: true })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Password" }), _jsx("input", { type: "password", value: password, onChange: e => setPassword(e.target.value), required: true })] }), _jsx("button", { type: "submit", disabled: loading, className: "button", children: loading ? 'Logging in...' : 'Login' })] }), _jsx("p", { className: "auth-footer", children: "Protected admin area. Only authorized users can access." })] }) }));
}
