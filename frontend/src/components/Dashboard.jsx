import React from 'react'

export default function Dashboard() {
  // Mock data - depois virá da API
  const stats = {
    totalLeads: 247,
    leadsHoje: 12,
    leadsAtivos: 89,
    leadsConvertidos: 34,
    agentesOnline: 4,
    agentesTotal: 5
  }

  const recentLeads = [
    { id: 1, nome: 'João Silva', telefone: '11999887766', status: 'novo', horario: '10:30' },
    { id: 2, nome: 'Maria Santos', telefone: '11888776655', status: 'em_atendimento', horario: '10:15' },
    { id: 3, nome: 'Pedro Costa', telefone: '11777665544', status: 'qualificado', horario: '09:45' },
  ]

  const agentes = [
    { id: 'u2', nome: 'Ana Carolina', status: 'online', leads: 8, maxLeads: 15 },
    { id: 'u3', nome: 'Carlos Mendes', status: 'online', leads: 12, maxLeads: 15 },
    { id: 'u4', nome: 'Beatriz Lima', status: 'ocupado', leads: 15, maxLeads: 15 },
    { id: 'u5', nome: 'Roberto Silva', status: 'online', leads: 6, maxLeads: 15 },
    { id: 'u6', nome: 'Fernanda Costa', status: 'offline', leads: 3, maxLeads: 15 }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'novo': return 'bg-blue-100 text-blue-800'
      case 'em_atendimento': return 'bg-yellow-100 text-yellow-800'
      case 'qualificado': return 'bg-green-100 text-green-800'
      case 'online': return 'bg-green-100 text-green-800'
      case 'ocupado': return 'bg-yellow-100 text-yellow-800'
      case 'offline': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Visão geral do sistema de atendimento WhatsApp + IA
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">📊</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total de Leads</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalLeads}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">📱</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Leads Hoje</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.leadsHoje}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">👥</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Agentes Online</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.agentesOnline}/{stats.agentesTotal}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">⚡</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Em Atendimento</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.leadsAtivos}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-600 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">✅</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Convertidos</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.leadsConvertidos}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">🤖</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">IA Ativa</dt>
                  <dd className="text-lg font-medium text-gray-900">Funcionando</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Leads */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              📱 Leads Recentes (WhatsApp)
            </h3>
            <div className="space-y-3">
              {recentLeads.map(lead => (
                <div key={lead.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{lead.nome}</p>
                        <p className="text-sm text-gray-500">{lead.telefone}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                      {lead.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-500">{lead.horario}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <button className="w-full text-center text-sm text-blue-600 hover:text-blue-500">
                Ver todos os leads →
              </button>
            </div>
          </div>
        </div>

        {/* Agentes Status */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              👥 Status dos Agentes
            </h3>
            <div className="space-y-3">
              {agentes.map(agente => (
                <div key={agente.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      agente.status === 'online' ? 'bg-green-400' : 
                      agente.status === 'ocupado' ? 'bg-yellow-400' : 'bg-gray-400'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{agente.nome}</p>
                      <p className="text-xs text-gray-500">{agente.leads}/{agente.maxLeads} leads</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(agente.status)}`}>
                    {agente.status}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <button className="w-full text-center text-sm text-blue-600 hover:text-blue-500">
                Gerenciar agentes →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            ⚡ Ações Rápidas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
              📱 Novo Lead Manual
            </button>
            <button className="flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              🤖 Config IA
            </button>
            <button className="flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              📊 Relatório
            </button>
            <button className="flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              ⚙️ WhatsApp Config
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}