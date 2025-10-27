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
import VersionBadge from './components/VersionBadge'

function AppContent() {
  const { user, loading } = useAuth()
  const [currentPage, setCurrentPage] = useState('atendimentos')
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [latestInfo, setLatestInfo] = useState(null)

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1)
      if (hash) setCurrentPage(hash)
    }

    window.addEventListener('hashchange', handleHashChange)
    handleHashChange()

    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  // Verifica periodicamente se há nova versão no ar
  useEffect(() => {
    let timer
    const currentCommit = typeof __APP_BUILD_INFO__ !== 'undefined' ? (__APP_BUILD_INFO__.commit || '') : ''

    const checkVersion = async () => {
      try {
        const res = await fetch(`/version.json?ts=${Date.now()}`, { cache: 'no-store' })
        if (!res.ok) return
        const info = await res.json()
        setLatestInfo(info)
        if (info?.commit && currentCommit && info.commit !== currentCommit) {
          setUpdateAvailable(true)
        }
      } catch (e) {
        // silencioso
      }
    }

    // checa ao montar e depois a cada 15s
    checkVersion()
    timer = setInterval(checkVersion, 15000)
    return () => timer && clearInterval(timer)
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
      {updateAvailable && (
        <div style={{
          position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)',
          background: '#111827', color: '#fff', padding: '10px 14px', borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)', display: 'flex', gap: 12, alignItems: 'center', zIndex: 9999
        }}>
          <span>Nova versão disponível</span>
          {latestInfo?.commit && (
            <span style={{ opacity: 0.8 }}>({latestInfo.commit.slice(0, 7)})</span>
          )}
          <button
            onClick={() => window.location.reload()}
            style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 6, cursor: 'pointer' }}
          >Atualizar</button>
        </div>
      )}
      <VersionBadge />
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
