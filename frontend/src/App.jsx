import React, { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { NotificationsProvider } from './contexts/NotificationsContext'
import Login from './pages/Login'
import Atendimentos from './pages/Atendimentos'
import Dashboard from './pages/Dashboard'
import Contatos from './pages/Contatos'
import Tarefas from './pages/Tarefas'
import Relatorios from './pages/Relatorios'
import Configuracoes from './pages/Configuracoes'
import Perfil from './pages/Perfil'
import Layout from './components/Layout'
import ErrorBoundary from './components/ErrorBoundary'
import DebugBar from './components/DebugBar'

function AppContent() {
  const { user, loading } = useAuth()
  const [currentPage, setCurrentPage] = useState('atendimentos')

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1)
      if (hash) setCurrentPage(hash)
    }

    window.addEventListener('hashchange', handleHashChange)
    handleHashChange()

    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) return <Login />

  const renderPage = () => {
    switch (currentPage) {
      case 'atendimentos':
        return <Atendimentos />
      case 'kanban':
        return <Dashboard />
      case 'contatos':
        return <Contatos />
      case 'tarefas':
        return <Tarefas />
      case 'relatorios':
      case 'indicadores':
        return <Relatorios />
      case 'configuracoes':
      case 'ajustes':
        return <Configuracoes />
      case 'perfil':
        return <Perfil />
      default:
        return <Atendimentos />
    }
  }

  return (
    <ErrorBoundary>
      <Layout currentPage={currentPage}>
        {renderPage()}
      </Layout>
      <DebugBar />
    </ErrorBoundary>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationsProvider>
        <AppContent />
      </NotificationsProvider>
    </AuthProvider>
  )
}
