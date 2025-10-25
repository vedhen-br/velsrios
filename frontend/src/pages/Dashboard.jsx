import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import { getApiUrl } from '../utils/env'

const API = getApiUrl()

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [leads, setLeads] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedLead, setSelectedLead] = useState(null)
  const [filter, setFilter] = useState({ stage: '', priority: '', assignedTo: '' })
  const [newLeadForm, setNewLeadForm] = useState({ name: '', phone: '', interest: '' })

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [filter])

  async function fetchData() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter.stage) params.append('stage', filter.stage)
      if (filter.priority) params.append('priority', filter.priority)
      if (filter.assignedTo) params.append('assignedTo', filter.assignedTo)

      const [leadsRes, usersRes] = await Promise.all([
        axios.get(`${API}/leads?${params}`),
        axios.get(`${API}/users`)
      ])
      setLeads(leadsRes.data)
      setUsers(usersRes.data)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  async function createLead(e) {
    e.preventDefault()
    try {
      await axios.post(`${API}/leads`, newLeadForm)
      setNewLeadForm({ name: '', phone: '', interest: '' })
      fetchData()
    } catch (e) {
      alert('Erro ao criar lead')
    }
  }

  async function updateLeadStage(leadId, stage) {
    try {
      await axios.patch(`${API}/leads/${leadId}`, { stage })
      fetchData()
    } catch (e) {
      alert('Erro ao atualizar lead')
    }
  }

  async function distribute() {
    if (!confirm('Distribuir leads não atribuídos?')) return
    try {
      await axios.post(`${API}/distribute`)
      fetchData()
    } catch (e) {
      alert('Erro ao distribuir leads')
    }
  }

  const stages = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed']

  const myLeads = leads.filter(l => l.assignedTo === user.id)
  const unassigned = leads.filter(l => !l.assignedTo)

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-gray-600 text-sm">Total de Leads</div>
            <div className="text-3xl font-bold text-blue-600">{leads.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-gray-600 text-sm">Meus Leads</div>
            <div className="text-3xl font-bold text-green-600">{myLeads.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-gray-600 text-sm">Não Atribuídos</div>
            <div className="text-3xl font-bold text-yellow-600">{unassigned.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-gray-600 text-sm">Usuários</div>
            <div className="text-3xl font-bold text-purple-600">{users.length}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-3">Ações Rápidas</h2>
          <form onSubmit={createLead} className="flex gap-2">
            <input
              className="border px-3 py-2 rounded flex-1"
              placeholder="Nome"
              value={newLeadForm.name}
              onChange={e => setNewLeadForm({...newLeadForm, name: e.target.value})}
              required
            />
            <input
              className="border px-3 py-2 rounded flex-1"
              placeholder="Telefone"
              value={newLeadForm.phone}
              onChange={e => setNewLeadForm({...newLeadForm, phone: e.target.value})}
              required
            />
            <input
              className="border px-3 py-2 rounded flex-1"
              placeholder="Interesse"
              value={newLeadForm.interest}
              onChange={e => setNewLeadForm({...newLeadForm, interest: e.target.value})}
            />
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
              Criar Lead
            </button>
            {user.role === 'admin' && (
              <button type="button" onClick={distribute} className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
                Distribuir
              </button>
            )}
          </form>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h3 className="font-semibold mb-2">Filtros</h3>
          <div className="flex gap-2">
            <select
              className="border px-3 py-2 rounded"
              value={filter.stage}
              onChange={e => setFilter({...filter, stage: e.target.value})}
            >
              <option value="">Todos os Estágios</option>
              {stages.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
              className="border px-3 py-2 rounded"
              value={filter.priority}
              onChange={e => setFilter({...filter, priority: e.target.value})}
            >
              <option value="">Todas Prioridades</option>
              <option value="high">Alta</option>
              <option value="medium">Média</option>
              <option value="low">Baixa</option>
            </select>
            {user.role === 'admin' && (
              <select
                className="border px-3 py-2 rounded"
                value={filter.assignedTo}
                onChange={e => setFilter({...filter, assignedTo: e.target.value})}
              >
                <option value="">Todos Usuários</option>
                {users.filter(u => u.role !== 'admin').map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            )}
            <button
              onClick={() => setFilter({ stage: '', priority: '', assignedTo: '' })}
              className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
            >
              Limpar
            </button>
          </div>
        </div>

        {/* Kanban */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">CRM - Funil de Vendas</h2>
          <div className="grid grid-cols-6 gap-4">
            {stages.map(stage => (
              <div key={stage} className="bg-gray-100 p-3 rounded">
                <h3 className="font-semibold text-sm mb-2 capitalize">{stage}</h3>
                <div className="space-y-2">
                  {leads.filter(l => l.stage === stage).map(lead => (
                    <div
                      key={lead.id}
                      className="bg-white p-2 rounded shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition"
                      onClick={() => setSelectedLead(lead)}
                    >
                      <div className="font-medium text-sm">{lead.name || lead.phone}</div>
                      <div className="text-xs text-gray-600">{lead.interest}</div>
                      <div className="flex items-center justify-between mt-1">
                        <span className={`text-xs px-1 py-0.5 rounded ${
                          lead.priority === 'high' ? 'bg-red-100 text-red-700' :
                          lead.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {lead.priority}
                        </span>
                        <span className="text-xs text-gray-500">
                          {lead.assignedUser?.name || '—'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" onClick={() => setSelectedLead(null)}>
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4">{selectedLead.name || selectedLead.phone}</h2>
            <div className="space-y-2 mb-4">
              <p><strong>Telefone:</strong> {selectedLead.phone}</p>
              <p><strong>Interesse:</strong> {selectedLead.interest}</p>
              <p><strong>Prioridade:</strong> {selectedLead.priority}</p>
              <p><strong>Responsável:</strong> {selectedLead.assignedUser?.name || 'Não atribuído'}</p>
              <p><strong>Estágio:</strong> {selectedLead.stage}</p>
            </div>
            <div className="flex gap-2">
              {stages.map(stage => (
                <button
                  key={stage}
                  onClick={() => {
                    updateLeadStage(selectedLead.id, stage)
                    setSelectedLead(null)
                  }}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                >
                  {stage}
                </button>
              ))}
            </div>
            <button
              onClick={() => setSelectedLead(null)}
              className="mt-4 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
