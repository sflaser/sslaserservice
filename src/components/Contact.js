import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import './Contact.css';
export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        message: '',
    });
    const [status, setStatus] = useState('idle');
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                setStatus('success');
                setFormData({ name: '', email: '', phone: '', company: '', message: '' });
                setTimeout(() => setStatus('idle'), 3000);
            }
            else {
                setStatus('error');
            }
        }
        catch (error) {
            setStatus('error');
        }
    };
    return (_jsx("section", { id: "contact", className: "section contact-section", children: _jsx("div", { className: "container", children: _jsxs("div", { className: "contact-content", children: [_jsxs("div", { className: "contact-info", children: [_jsx("h2", { children: "Get in Touch" }), _jsx("p", { children: "Have questions about our services? We're here to help. Contact us today for a consultation." }), _jsxs("div", { className: "info-items", children: [_jsxs("div", { className: "info-item", children: [_jsx(Phone, { size: 24 }), _jsxs("div", { children: [_jsx("h4", { children: "Phone" }), _jsx("p", { children: "+86 (0) XXX-XXXX-XXXX" })] })] }), _jsxs("div", { className: "info-item", children: [_jsx(Mail, { size: 24 }), _jsxs("div", { children: [_jsx("h4", { children: "Email" }), _jsx("p", { children: "contact@skyfirelaserservice.com" })] })] }), _jsxs("div", { className: "info-item", children: [_jsx(MapPin, { size: 24 }), _jsxs("div", { children: [_jsx("h4", { children: "Location" }), _jsx("p", { children: "China" })] })] })] })] }), _jsxs("form", { className: "contact-form", onSubmit: handleSubmit, children: [_jsx("div", { className: "form-group", children: _jsx("input", { type: "text", name: "name", placeholder: "Your Name", value: formData.name, onChange: handleChange, required: true }) }), _jsx("div", { className: "form-group", children: _jsx("input", { type: "email", name: "email", placeholder: "Your Email", value: formData.email, onChange: handleChange, required: true }) }), _jsx("div", { className: "form-group", children: _jsx("input", { type: "tel", name: "phone", placeholder: "Phone Number", value: formData.phone, onChange: handleChange }) }), _jsx("div", { className: "form-group", children: _jsx("input", { type: "text", name: "company", placeholder: "Company Name", value: formData.company, onChange: handleChange }) }), _jsx("div", { className: "form-group", children: _jsx("textarea", { name: "message", placeholder: "Your Message", rows: 5, value: formData.message, onChange: handleChange, required: true }) }), _jsxs("button", { type: "submit", className: "button", disabled: status === 'loading', children: [status === 'loading' ? 'Sending...' : 'Send Message', _jsx(Send, { size: 20 })] }), status === 'success' && (_jsx("p", { className: "message success", children: "Message sent successfully! We'll get back to you soon." })), status === 'error' && (_jsx("p", { className: "message error", children: "Error sending message. Please try again." }))] })] }) }) }));
}
