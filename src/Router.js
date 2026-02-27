import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import App from './App';
import Admin from './pages/Admin';
import Login from './pages/Login';
export default function Router() {
    const [currentPage, setCurrentPage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const path = window.location.pathname;
        setCurrentPage(path);
        const handlePopState = () => {
            setCurrentPage(window.location.pathname);
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);
    if (isLoading) {
        setTimeout(() => setIsLoading(false), 100);
    }
    const path = currentPage || window.location.pathname;
    if (path === '/login') {
        return _jsx(Login, {});
    }
    if (path === '/admin') {
        return _jsx(Admin, {});
    }
    return _jsx(App, {});
}
