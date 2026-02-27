import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Wrench, Zap, Package, BarChart3, Microscope, Shield } from 'lucide-react';
import './Services.css';
const services = [
    {
        icon: Wrench,
        title: 'Laser Repair',
        description: 'Expert repair and maintenance for all major solid-state laser brands with quick turnaround times.'
    },
    {
        icon: Zap,
        title: 'Emergency Support',
        description: '24/7 emergency support to minimize your downtime and keep operations running smoothly.'
    },
    {
        icon: Package,
        title: 'Custom Manufacturing',
        description: 'Precision custom laser manufacturing tailored to your specific industrial requirements.'
    },
    {
        icon: BarChart3,
        title: 'PCB Processing',
        description: 'Advanced laser processing for PCB manufacturing with micron-level precision.'
    },
    {
        icon: Microscope,
        title: 'Testing & Calibration',
        description: 'Comprehensive testing and calibration services to ensure optimal performance.'
    },
    {
        icon: Shield,
        title: 'Maintenance Plans',
        description: 'Preventive maintenance plans designed to extend equipment lifespan and reliability.'
    }
];
export default function Services() {
    return (_jsx("section", { id: "services", className: "section services-section", children: _jsxs("div", { className: "container", children: [_jsxs("div", { className: "section-title", children: [_jsx("h2", { children: "Our Services" }), _jsx("p", { children: "Comprehensive laser solutions for industrial applications" })] }), _jsx("div", { className: "services-grid", children: services.map((service, index) => {
                        const Icon = service.icon;
                        return (_jsxs("div", { className: "service-card", children: [_jsx("div", { className: "service-icon", children: _jsx(Icon, { size: 32 }) }), _jsx("h3", { children: service.title }), _jsx("p", { children: service.description }), _jsx("a", { href: "#", className: "service-link", children: "Learn more \u2192" })] }, index));
                    }) })] }) }));
}
