import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import NotificationsBell from './NotificationsBell'

export default function Layout({ children, currentPage }) {
  const { user, logout } = useAuth()
  const [showCrmMenu, setShowCrmMenu] = useState(false)
  const [showAppsMenu, setShowAppsMenu] = useState(false)
  const [showRelatoriosMenu, setShowRelatoriosMenu] = useState(false)
  const [showAjustesMenu, setShowAjustesMenu] = useState(false)

  const menuItems = [
    { id: 'atendimentos', label: 'Atendimentos', icon: '💬' },
    {
      id: 'crm',
      label: 'CRM',
      icon: '📊',
      submenu: [
        { id: 'contatos', label: 'Contatos' },
        { id: 'kanban', label: 'Kanban' }
      ]
    },
    {
      id: 'apps',
      label: 'Apps',
      icon: '⚙️',
      submenu: [
        { id: 'tarefas', label: 'Tarefas' },
        { id: 'gestao', label: 'Gestão +' },
        { id: 'campanhas', label: 'Campanhas' },
        { id: 'chatbot', label: 'Chatbot' },
        { id: 'automacoes', label: 'Automações' },
        { id: 'agenda', label: 'Agenda' },
        { id: 'checklist', label: 'Checklist' }
      ]
    },
    {
      id: 'relatorios',
      label: 'Relatórios',
      icon: '📈',
      submenu: [
        { id: 'relatorios', label: 'Indicadores' },
        { id: 'atendimentos-report', label: 'Atendimentos' }
      ]
    }
  ]

  if (user?.role === 'admin') {
    menuItems.push({
      id: 'ajustes',
      label: 'Ajustes',
      icon: '⚙️',
      submenu: [
        { id: 'configuracoes', label: 'Configurações' },
        { id: 'conta', label: 'Conta' },
        { id: 'equipes', label: 'Equipes' },
        { id: 'templates', label: 'Templates' },
        { id: 'usuarios', label: 'Usuários' }
      ]
    })
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center text-white font-bold">
              LC
            </div>
            <span className="font-bold text-lg">Lead Campanha</span>
          </div>

          {/* Menu */}
          <nav className="flex items-center gap-1">
            {menuItems.map(item => (
              <div key={item.id} className="relative">
                {item.submenu ? (
                  <div
                    className={`px-4 py-2 rounded hover:bg-gray-100 cursor-pointer flex items-center gap-1 ${currentPage === item.id ? 'bg-green-100' : ''
                      }`}
                    onClick={() => {
                      if (item.id === 'crm') setShowCrmMenu(!showCrmMenu)
                      if (item.id === 'apps') setShowAppsMenu(!showAppsMenu)
                      if (item.id === 'relatorios') setShowRelatoriosMenu(!showRelatoriosMenu)
                      if (item.id === 'ajustes') setShowAjustesMenu(!showAjustesMenu)
                    }}
                  >
                    <span>{item.label}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                ) : (
                  <a
                    href={`#${item.id}`}
                    className={`px-4 py-2 rounded hover:bg-gray-100 cursor-pointer block ${currentPage === item.id ? 'bg-green-100' : ''
                      }`}
                  >
                    {item.label}
                  </a>
                )}

                {/* Submenu Dropdown */}
                {item.submenu && (
                  <>
                    {((item.id === 'crm' && showCrmMenu) ||
                      (item.id === 'apps' && showAppsMenu) ||
                      (item.id === 'relatorios' && showRelatoriosMenu) ||
                      (item.id === 'ajustes' && showAjustesMenu)) && (
                        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50 min-w-[180px]">
                          {item.submenu.map(subitem => (
                            <a
                              key={subitem.id}
                              href={`#${subitem.id}`}
                              className="block px-4 py-2 hover:bg-gray-50 text-sm"
                            >
                              {subitem.label}
                            </a>
                          ))}
                        </div>
                      )}
                  </>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-4">
          <NotificationsBell />

          <a href="#perfil" className="flex items-center gap-3 hover:bg-gray-100 rounded px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.role === 'admin' ? 'Admin' : 'Consultor'}</p>
            </div>
          </a>

          <button
            onClick={logout}
            className="p-2 hover:bg-gray-100 rounded text-red-600"
            title="Sair"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
