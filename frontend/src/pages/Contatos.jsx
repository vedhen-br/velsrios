  // Modal de transferência
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [transferLead, setTransferLead] = useState(null)
  const [transferUserId, setTransferUserId] = useState('')
  const [transferSearch, setTransferSearch] = useState('')
  const [transferLoading, setTransferLoading] = useState(false)
  const openTransferModal = (lead) => {
    setTransferLead(lead)
    setTransferUserId('')
    setTransferSearch('')
    setShowTransferModal(true)
  }
  const closeTransferModal = () => {
    setShowTransferModal(false)
    setTransferLead(null)
    setTransferUserId('')
    setTransferSearch('')
  }
  const handleTransfer = async () => {
    if (!transferLead || !transferUserId) return
    setTransferLoading(true)
    try {
      await axios.patch(`${API_URL}/leads/${transferLead.id}`, { assignedTo: transferUserId }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      closeTransferModal()
      fetchLeads()
      alert('Lead transferido com sucesso!')
    } catch (error) {
      alert('Erro ao transferir lead')
    }
    setTransferLoading(false)
  }
import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'

export default function Contatos() {
  const { user, token } = useAuth()
  const [leads, setLeads] = useState([])
  const [users, setUsers] = useState([])
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedLeads, setSelectedLeads] = useState([])
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStage, setFilterStage] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [filterAssignedTo, setFilterAssignedTo] = useState('')
  
  // Modal
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('create') // create | edit | bulk
  const [selectedLead, setSelectedLead] = useState(null)
  
  // Novo Lead
  const [newLead, setNewLead] = useState({
    name: '',
    phone: '',
    email: '',
    interest: '',
    origin: 'manual'
  })

  const API_URL = 'http://localhost:4000/api'

  useEffect(() => {
    fetchLeads()
    fetchUsers()
    fetchTags()
  }, [filterStage, filterPriority, filterAssignedTo])

  const fetchLeads = async () => {
    setLoading(true)
    try {
      // Só buscar leads criados manualmente pelo usuário logado
      const params = {
        origin: 'manual',
        createdBy: user.id
      }
      if (filterStage) params.stage = filterStage
      if (filterPriority) params.priority = filterPriority
      // Admin pode filtrar por usuário
      if (user?.role === 'admin' && filterAssignedTo) params.assignedTo = filterAssignedTo
      const res = await axios.get(`${API_URL}/leads`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      })
      setLeads(res.data)
    } catch (error) {
      console.error('Erro ao buscar leads:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUsers(res.data)
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
    }
  }

  const fetchTags = async () => {
    try {
      const res = await axios.get(`${API_URL}/tags`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTags(res.data)
    } catch (error) {
      console.error('Erro ao buscar tags:', error)
    }
  }

  const createLead = async () => {
    try {
      // Garante que o lead é manual e do usuário logado
      const payload = { ...newLead, origin: 'manual', createdBy: user.id }
      await axios.post(`${API_URL}/leads`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setShowModal(false)
      setNewLead({ name: '', phone: '', email: '', interest: '', origin: 'manual' })
      fetchLeads()
      alert('Lead criado com sucesso!')
    } catch (error) {
      console.error('Erro ao criar lead:', error)
      alert('Erro ao criar lead')
    }
  }

  const deleteLead = async (leadId) => {
    if (!confirm('Deseja realmente excluir este lead?')) return
    try {
      await axios.delete(`${API_URL}/leads/${leadId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchLeads()
      alert('Lead excluído com sucesso!')
    } catch (error) {
      console.error('Erro ao excluir lead:', error)
      alert('Erro ao excluir lead')
    }
  }

  // Remove bulkDelete para usuários comuns

  // Remove bulkAssign para usuários comuns

  // Remove exportCSV para usuários comuns

  // Remove seleção em massa para usuários comuns

  // Remove selectAll para usuários comuns

  // Filtro de busca local
  const filteredLeads = leads.filter(lead => {
    const searchLower = searchTerm.toLowerCase()
    return (
      (lead.name?.toLowerCase().includes(searchLower)) ||
      (lead.phone?.includes(searchTerm)) ||
      (lead.email?.toLowerCase().includes(searchLower))
    )
  })

  const getPriorityColor = (priority) => {
    if (priority === 'high') return 'bg-red-100 text-red-800'
    if (priority === 'medium') return 'bg-yellow-100 text-yellow-800'
    return 'bg-gray-100 text-gray-800'
  }

  const getStageLabel = (stage) => {
    const stages = {
      new: 'Novo',
      contacted: 'Contactado',
      qualified: 'Qualificado',
      proposal: 'Proposta',
      negotiation: 'Negociação',
      closed: 'Fechado'
    }
    return stages[stage] || stage
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">📇 Contatos</h1>
              <p className="text-gray-600">Gerencie seus próprios contatos</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setModalMode('create')
                  setShowModal(true)
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                ➕ Novo Contato
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="🔍 Buscar por nome, telefone ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="col-span-2 px-4 py-2 border rounded-lg"
            />
            <select
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="">Todos os Estágios</option>
              <option value="new">Novo</option>
              <option value="contacted">Contactado</option>
              <option value="qualified">Qualificado</option>
              <option value="proposal">Proposta</option>
              <option value="negotiation">Negociação</option>
              <option value="closed">Fechado</option>
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="">Todas as Prioridades</option>
              <option value="high">Alta</option>
              <option value="medium">Média</option>
              <option value="low">Baixa</option>
            </select>
          </div>
        </div>

        {/* Remove ações em massa para usuários comuns */}

        {/* Tabela */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-2 text-gray-600">Carregando...</p>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Nenhum contato encontrado
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nome</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Telefone</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Prioridade</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Estágio</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Mensagens</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Criado</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredLeads.map(lead => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{lead.name || '-'}</td>
                      <td className="px-4 py-3 text-gray-600">{lead.phone}</td>
                      <td className="px-4 py-3 text-gray-600">{lead.email || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(lead.priority)}`}>
                          {lead.priority || 'low'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {getStageLabel(lead.stage)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {lead._count?.messages || 0}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-sm">
                        {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => deleteLead(lead.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            🗑️
                          </button>
                          {/* Botão Transferir para admin, apenas leads do CRM principal */}
                          {user?.role === 'admin' && lead.origin === 'whatsapp' && lead.assignedUser?.role === 'admin' && (
                            <button
                              onClick={() => openTransferModal(lead)}
                              className="text-indigo-600 hover:text-indigo-800 text-sm border border-indigo-200 rounded px-2 py-1"
                            >
                              🔄 Transferir
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-gray-600 text-sm">Total de Leads</p>
            <p className="text-2xl font-bold text-gray-900">{filteredLeads.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-gray-600 text-sm">Alta Prioridade</p>
            <p className="text-2xl font-bold text-red-600">
              {filteredLeads.filter(l => l.priority === 'high').length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-gray-600 text-sm">Novos</p>
            <p className="text-2xl font-bold text-blue-600">
              {filteredLeads.filter(l => l.stage === 'new').length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-gray-600 text-sm">Fechados</p>
            <p className="text-2xl font-bold text-green-600">
              {filteredLeads.filter(l => l.stage === 'closed').length}
            </p>
          </div>
        </div>
      </div>

      {/* Modal Criar Lead */}
      {/* Modal Transferência Lead */}
      {showTransferModal && transferLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">🔄 Transferir Lead</h2>
            <p className="mb-2 text-gray-700">Lead: <span className="font-semibold">{transferLead.name || transferLead.phone}</span></p>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Buscar usuário..."
                value={transferSearch}
                onChange={e => setTransferSearch(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg mb-2"
              />
              <div className="max-h-40 overflow-y-auto border rounded-lg">
                {users
                  .filter(u => u.role === 'user' && (u.name.toLowerCase().includes(transferSearch.toLowerCase()) || u.email.toLowerCase().includes(transferSearch.toLowerCase())))
                  .map(u => (
                    <div
                      key={u.id}
                      className={`px-3 py-2 cursor-pointer flex items-center justify-between ${transferUserId === u.id ? 'bg-indigo-100' : 'hover:bg-gray-50'}`}
                      onClick={() => setTransferUserId(u.id)}
                    >
                      <span className="font-medium">{u.name}</span>
                      <span className="text-xs text-gray-500">{u.email}</span>
                      {transferUserId === u.id && <span className="ml-2 text-indigo-600 font-bold">✔</span>}
                    </div>
                  ))}
                {users.filter(u => u.role === 'user' && (u.name.toLowerCase().includes(transferSearch.toLowerCase()) || u.email.toLowerCase().includes(transferSearch.toLowerCase()))).length === 0 && (
                  <div className="px-3 py-2 text-gray-400">Nenhum usuário encontrado</div>
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={closeTransferModal}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                disabled={transferLoading}
              >
                Cancelar
              </button>
              <button
                onClick={handleTransfer}
                className={`flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 ${!transferUserId ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!transferUserId || transferLoading}
              >
                {transferLoading ? 'Transferindo...' : 'Transferir'}
              </button>
            </div>
          </div>
        </div>
      )}
      {showModal && modalMode === 'create' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">➕ Novo Lead</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  value={newLead.name}
                  onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
                <input
                  type="text"
                  value={newLead.phone}
                  onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="5511999999999"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newLead.email}
                  onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Interesse</label>
                <input
                  type="text"
                  value={newLead.interest}
                  onChange={(e) => setNewLead({ ...newLead, interest: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Apartamento 2 quartos"
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={createLead}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                disabled={!newLead.phone}
              >
                Criar Lead
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
