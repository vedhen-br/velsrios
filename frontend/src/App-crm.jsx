import React, { useState } from 'react'
import Dashboard from '../components/Dashboard'

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [email, setEmail] = useState('admin@leadcampanha.com')
  const [password, setPassword] = useState('admin123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState('dashboard')

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        localStorage.setItem('token', data.token)
        setIsLoggedIn(true)
      } else {
        setError(data.error || 'Erro ao fazer login')
      }
    } catch (err) {
      setError('Erro de conexão com o servidor')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setIsLoggedIn(false)
    setCurrentPage('dashboard')
  }

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              🎯 Lead Campanha CRM
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Sistema de Atendimento WhatsApp + IA
            </p>
          </div>
          <div className="mt-8 space-y-6">
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="relative block w-full px-3 py-2 border border-gray-300 rounded-t-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Senha"
                  className="relative block w-full px-3 py-2 border border-gray-300 rounded-b-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <button
                onClick={handleLogin}
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </div>
            
            {error && (
              <div className="text-red-600 text-sm text-center">
                {error}
              </div>
            )}
            
            <div className="text-center">
              <p className="text-xs text-gray-500">
                ✅ WhatsApp + IA Integration Ready<br/>
                🔧 admin@leadcampanha.com / admin123
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main App with Sidebar
  const menuItems = [
    { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
    { id: 'leads', label: '📱 Leads WhatsApp', icon: '📱' },
    { id: 'atendimentos', label: '💬 Atendimentos', icon: '💬' },
    { id: 'agentes', label: '👥 Agentes', icon: '👥' },
    { id: 'ia-config', label: '🤖 Config IA', icon: '🤖' },
    { id: 'whatsapp', label: '📞 WhatsApp Config', icon: '📞' },
    { id: 'relatorios', label: '📊 Relatórios', icon: '📊' },
  ]

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />
      case 'leads':
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📱 Leads WhatsApp</h2>
            <p className="text-gray-600">Em desenvolvimento - Lista e gestão de leads</p>
          </div>
        )
      case 'atendimentos':
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">💬 Central de Atendimentos</h2>
            <p className="text-gray-600">Em desenvolvimento - Chat integrado com WhatsApp</p>
          </div>
        )
      case 'agentes':
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">👥 Gestão de Agentes</h2>
            <p className="text-gray-600">Em desenvolvimento - Gerenciar 5 usuários do sistema</p>
          </div>
        )
      case 'ia-config':
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">🤖 Configuração da IA</h2>
            <p className="text-gray-600">Em desenvolvimento - Qualificação automática de leads</p>
          </div>
        )
      case 'whatsapp':
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📞 WhatsApp Business API</h2>
            <p className="text-gray-600">Em desenvolvimento - Webhooks e integração</p>
          </div>
        )
      case 'relatorios':
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Relatórios e Analytics</h2>
            <p className="text-gray-600">Em desenvolvimento - Métricas e performance</p>
          </div>
        )
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">Lead Campanha</h1>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  currentPage === item.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
          
          {/* User Menu */}
          <div className="px-4 py-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Administrador</p>
                <p className="text-xs text-gray-500">admin@leadcampanha.com</p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-2 text-sm text-gray-500 hover:text-gray-700"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}