import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import Services from './components/Services';
import FeaturedCaseStudies from './components/FeaturedCaseStudies';
import FeaturedPodcasts from './components/FeaturedPodcasts';
import Partners from './components/Partners';
import Contact from './components/Contact';
import Footer from './components/Footer';
import './App.css';
function App() {
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        setIsLoading(false);
    }, []);
    if (isLoading) {
        return (_jsx("div", { className: "loading-screen", children: _jsx("div", { className: "spinner" }) }));
    }
    return (_jsxs("div", { className: "app", children: [_jsx(Navigation, {}), _jsx(Hero, {}), _jsx(Services, {}), _jsx(FeaturedCaseStudies, {}), _jsx(FeaturedPodcasts, {}), _jsx(Partners, {}), _jsx(Contact, {}), _jsx(Footer, {})] }));
}
export default App;
