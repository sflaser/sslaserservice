import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import './Partners.css';
const partners = [
    { name: 'Quantel', logo: '/images/logos/quantel laser logo.jpg' },
    { name: 'Lumibird', logo: '/images/logos/Lumibird laser logo1.jpg' },
    { name: 'Coherent', logo: '/images/logos/coherent laser logo2.jpg' },
    { name: 'JDSU', logo: '/images/logos/jdsu_laser_logo1.jpg' },
    { name: 'Amplitude', logo: '/images/logos/Amplitude-laser-logo-1.jpg' },
    { name: 'Agilent', logo: '/images/logos/agilent laser logo1.jpg' },
    { name: 'Spectra Physics', logo: '/images/logos/SPECTRA-PHYSICS-laser-logo-1.jpg' },
    { name: 'PI', logo: '/images/logos/PI-laser-logo-1.jpg' },
];
export default function Partners() {
    return (_jsx("section", { className: "section partners-section", children: _jsxs("div", { className: "container", children: [_jsxs("div", { className: "section-title", children: [_jsx("h2", { children: "Trusted Partners" }), _jsx("p", { children: "We service and support the world's leading laser manufacturers" })] }), _jsx("div", { className: "partners-grid", children: partners.map((partner, index) => (_jsx("div", { className: "partner-card", children: _jsx("img", { src: partner.logo, alt: partner.name }) }, index))) })] }) }));
}
