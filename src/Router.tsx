import React, { useEffect, useState } from 'react'
import App from './App'
import Admin from './pages/Admin'
import Login from './pages/Login'
import { supabase } from './lib/supabase'

export default function Router() {
  const [currentPage, setCurrentPage] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const path = window.location.pathname
    setCurrentPage(path)

    const handlePopState = () => {
      setCurrentPage(window.location.pathname)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  if (isLoading) {
    setTimeout(() => setIsLoading(false), 100)
  }

  const path = currentPage || window.location.pathname

  if (path === '/login') {
    return <Login />
  }

  if (path === '/admin') {
    return <Admin />
  }

  return <App />
}
