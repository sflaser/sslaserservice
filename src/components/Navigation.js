import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import './Navigation.css';
export default function Navigation() {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setIsOpen(false);
        }
    };
    return (_jsx("nav", { className: `navbar ${isScrolled ? 'scrolled' : ''}`, children: _jsxs("div", { className: "navbar-container", children: [_jsxs("div", { className: "navbar-logo", children: [_jsx("div", { className: "logo-icon", children: "\u26A1" }), _jsx("span", { children: "Sky Fire Laser" })] }), _jsx("button", { className: "mobile-toggle", onClick: () => setIsOpen(!isOpen), children: isOpen ? _jsx(X, { size: 24 }) : _jsx(Menu, { size: 24 }) }), _jsxs("div", { className: `navbar-menu ${isOpen ? 'active' : ''}`, children: [_jsx("a", { href: "#services", onClick: (e) => {
                                e.preventDefault();
                                scrollToSection('services');
                            }, children: "Services" }), _jsx("a", { href: "#case-studies", onClick: (e) => {
                                e.preventDefault();
                                scrollToSection('case-studies');
                            }, children: "Case Studies" }), _jsx("a", { href: "#podcasts", onClick: (e) => {
                                e.preventDefault();
                                scrollToSection('podcasts');
                            }, children: "Podcasts" }), _jsx("a", { href: "#contact", onClick: (e) => {
                                e.preventDefault();
                                scrollToSection('contact');
                            }, children: "Contact" }), _jsx("a", { href: "/admin", className: "admin-link", children: "Admin" })] })] }) }));
}
