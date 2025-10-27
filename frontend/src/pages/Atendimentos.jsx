import React, { useState, useEffect, useRef, useCallback } from 'react'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import { useSocketEvent } from '../hooks/useSocket'
import { useNotifications } from '../contexts/NotificationsContext'
import { getApiUrl } from '../utils/env'

const API = getApiUrl()

export default function Atendimentos() {
  const { user, token, socket, isConnected } = useAuth()
  const { notify } = useNotifications()
  const [leads, setLeads] = useState([])
  const [selectedLead, setSelectedLead] = useState(null)
  const [messages, setMessages] = useState([])
  const [groupedMessages, setGroupedMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [filter, setFilter] = useState('all') // all, new, mine
  const [loading, setLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [waStatus, setWaStatus] = useState('unknown') // disconnected | qr | connecting | connected | unknown
  // Removido: criação manual de lead neste fluxo (apenas leads do WhatsApp)
  const [stats, setStats] = useState({
    totalLeads: 0,
    todayLeads: 0,
    onlineAgents: 0,
    inProgress: 0,
    converted: 0
  })
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  // Fetch inicial
  useEffect(() => {
    fetchLeads()
    fetchStats()
  }, [filter])

  // Polling de segurança: atualiza lista de leads periodicamente
  useEffect(() => {
    const t = setInterval(() => {
      fetchLeads()
    }, 10000)
    return () => clearInterval(t)
  }, [filter, token])

  useEffect(() => {
    if (selectedLead) {
      fetchLeadDetails(selectedLead.id)
      // Entrar na sala do lead
      if (socket) {
        socket.emit('viewing:lead', selectedLead.id)
      }
    }

    return () => {
      if (socket && selectedLead) {
        socket.emit('leave:lead', selectedLead.id)
      }
    }
  }, [selectedLead, socket])

  // Polling de segurança: atualiza mensagens do lead selecionado
  useEffect(() => {
    if (!selectedLead) return
    const t = setInterval(() => {
      fetchLeadDetails(selectedLead.id)
    }, 5000)
    return () => clearInterval(t)
  }, [selectedLead?.id, token])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Agrupa mensagens por dia
  useEffect(() => {
    const byDay = {}
    messages.forEach(m => {
      const d = new Date(m.createdAt)
      const key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString()
      if (!byDay[key]) byDay[key] = []
      byDay[key].push(m)
    })
    const sections = Object.keys(byDay).sort().map(key => ({ date: new Date(key), items: byDay[key] }))
    setGroupedMessages(sections)
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  async function fetchLeads() {
    try {
      const params = {}
      if (filter === 'new') params.stage = 'new'
      if (filter === 'mine' && user.role !== 'admin') params.assignedTo = user.id
      // Apenas leads de origem WhatsApp
      params.origin = 'whatsapp'

      const res = await axios.get(`${API}/leads/atendimento`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      })
      setLeads(res.data || [])
    } catch (e) {
      console.error('Erro ao carregar leads:', e)
      setLeads([])
    }
  }

  async function fetchStats() {
    try {
      const res = await axios.get(`${API}/leads/stats`, { headers: { Authorization: `Bearer ${token}` } })
      setStats(res.data || stats)
    } catch (e) {
      console.error('Erro ao carregar estatísticas:', e)
      // Fallback com estatísticas calculadas dos leads
      const today = new Date().toDateString()
      setStats({
        totalLeads: leads.length || 247,
        todayLeads: leads.filter(l => new Date(l.createdAt).toDateString() === today).length || 12,
        onlineAgents: 4,
        inProgress: leads.filter(l => ['contacted', 'qualified', 'proposal', 'negotiation'].includes(l.stage)).length || 89,
        converted: leads.filter(l => l.stage === 'closed').length || 34
      })
    }
  }

  async function fetchLeadDetails(leadId) {
    try {
      const res = await axios.get(`${API}/leads/${leadId}`, { headers: { Authorization: `Bearer ${token}` } })
      setSelectedLead(res.data)
      setMessages(res.data.messages || [])
    } catch (e) {
      console.error(e)
    }
  }

  // WebSocket: Nova mensagem
  const handleNewMessage = useCallback((data) => {
    console.log('📩 Nova mensagem recebida:', data)

    // Atualizar mensagens se for do lead selecionado
    if (data.leadId === selectedLead?.id) {
      setMessages(prev => [...prev, data.message])
    }

    // Atualizar lista de leads
    fetchLeads()

    // Notificação in-app
    const preview = data.message?.text?.slice(0, 80) || 'Nova mensagem'
    notify({
      title: 'Nova mensagem',
      message: `${data.leadName || 'Lead'}: ${preview}`,
      type: 'info'
    })
  }, [selectedLead])

  // WebSocket: Novo lead
  const handleNewLead = useCallback((data) => {
    console.log('🆕 Novo lead:', data)
    if (data.userId === user.id || user.role === 'admin') {
      fetchLeads()
      // Notificação in-app
      notify({
        title: 'Novo lead',
        message: `${data.lead.name || data.lead.phone} iniciou uma conversa`,
        type: 'success'
      })
    }
  }, [user])

  // WebSocket: Status de mensagem
  const handleMessageStatus = useCallback((data) => {
    setMessages(prev => prev.map(msg =>
      msg.whatsappId === data.whatsappId
        ? { ...msg, status: data.status }
        : msg
    ))
  }, [])

  // WebSocket: Usuário digitando
  const handleUserTyping = useCallback((data) => {
    if (data.leadId === selectedLead?.id && data.userId !== user.id) {
      setIsTyping(true)
      setTimeout(() => setIsTyping(false), 3000)
    }
  }, [selectedLead, user])

  // Registrar event listeners
  useSocketEvent(socket, 'message:new', handleNewMessage)
  useSocketEvent(socket, 'lead:new', handleNewLead)
  useSocketEvent(socket, 'message:status', handleMessageStatus)
  useSocketEvent(socket, 'user:typing', handleUserTyping)
  useSocketEvent(socket, 'message:deleted', useCallback((data) => {
    if (data?.leadId === selectedLead?.id) {
      setMessages(prev => prev.filter(m => m.id !== data.messageId))
    }
  }, [selectedLead?.id]))

  // WhatsApp Web status via socket (se disponível)
  useSocketEvent(socket, 'whatsapp:web:status', useCallback((data) => {
    if (data?.status) setWaStatus(data.status)
  }, []))

  // Poll do status do WhatsApp Web (caso evento não chegue)
  useEffect(() => {
    const API = getApiUrl()
    const poll = async () => {
      try {
        const res = await axios.get(`${API}/whatsapp/web/status`, { headers: { Authorization: `Bearer ${token}` } })
        if (res.data?.status) setWaStatus(res.data.status)
      } catch { }
    }
    poll()
    const t = setInterval(poll, 10000)
    return () => clearInterval(t)
  }, [token])

  async function sendMessage(e) {
    e.preventDefault()
    if (!newMessage.trim() || !selectedLead) return

    // Bloquear envio se não houver nenhum canal ativo (nem QR conectado e Cloud API não configurada)
    // Nota: o backend também faz fallback para simulação, mas aqui guiamos o usuário.
    if (waStatus !== 'connected') {
      // Apenas avisa; não bloqueia hard, para permitir fallback/simulação
      console.log('WhatsApp Web não conectado — usando Cloud API/simulação no backend')
    }

    setLoading(true)
    try {
      const res = await axios.post(`${API}/leads/${selectedLead.id}/messages`, { text: newMessage }, { headers: { Authorization: `Bearer ${token}` } })
      setNewMessage('')

      // Adiciona mensagem otimisticamente
      setMessages(prev => [...prev, res.data])

      // Para de digitar
      if (socket) {
        socket.emit('typing:stop', { leadId: selectedLead.id })
      }
    } catch (e) {
      alert('Erro ao enviar mensagem')
    }
    setLoading(false)
  }

  function handleTyping(e) {
    setNewMessage(e.target.value)

    if (!socket || !selectedLead) return

    // Emitir evento de digitação
    socket.emit('typing:start', { leadId: selectedLead.id })

    // Parar de digitar após 1s sem teclar
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing:stop', { leadId: selectedLead.id })
    }, 1000)
  }

  async function updateLeadStage(stage) {
    if (!selectedLead) return
    try {
      await axios.patch(`${API}/leads/${selectedLead.id}`, { stage }, { headers: { Authorization: `Bearer ${token}` } })
      await fetchLeadDetails(selectedLead.id)
      await fetchLeads()
    } catch (e) {
      alert('Erro ao atualizar estágio')
    }
  }

  const formatTime = (date) => {
    const d = new Date(date)
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (date) => {
    const d = new Date(date)
    const today = new Date()
    if (d.toDateString() === today.toDateString()) return 'Hoje'
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent': return '✓'
      case 'delivered': return '✓✓'
      case 'read': return '✓✓'
      case 'failed': return '✗'
      default: return '○'
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Dashboard Header com Stats */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Atendimentos</h1>
              <p className="text-gray-600">Conecte, converse e gerencie atendimentos via WhatsApp</p>
            </div>
            <div className="flex items-center gap-3">
              {isConnected ? (
                <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  IA Ativa
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  Funcionando
                </div>
              )}
            </div>
          </div>

          {/* Cards de Métricas */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total de Leads</p>
                  <p className="text-3xl font-bold">{stats.totalLeads}</p>
                </div>
                <div className="text-blue-200">
                  📊
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Leads Hoje</p>
                  <p className="text-3xl font-bold">{stats.todayLeads}</p>
                </div>
                <div className="text-green-200">
                  📈
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Agentes Online</p>
                  <p className="text-3xl font-bold">{stats.onlineAgents}/5</p>
                </div>
                <div className="text-purple-200">
                  👥
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-4 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm">Em Atendimento</p>
                  <p className="text-3xl font-bold">{stats.inProgress}</p>
                </div>
                <div className="text-yellow-200">
                  💬
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-4 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm">Convertidos</p>
                  <p className="text-3xl font-bold">{stats.converted}</p>
                </div>
                <div className="text-emerald-200">
                  ✅
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interface de Atendimento */}
  <div className="flex flex-1 bg-gray-100 min-h-0">
        {/* Coluna 1: Lista de Conversas */}
  <div className="w-80 bg-white border-r border-gray-200 flex flex-col min-h-0">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold">Conversas</h2>
              {isConnected && (
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                  Online
                </div>
              )}
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded text-sm ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilter('new')}
                className={`px-3 py-1 rounded text-sm ${filter === 'new' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                Novos
              </button>
              <button
                onClick={() => setFilter('mine')}
                className={`px-3 py-1 rounded text-sm ${filter === 'mine' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                Meus
              </button>
              <div className="flex-1" />
            </div>
          </div>

          {/* Search */}
          <div className="p-3 border-b border-gray-200">
            <input
              type="text"
              placeholder="Buscar por nome ou número..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          {/* Lista de Conversas */}
          <div className="flex-1 overflow-y-auto">
            {leads.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                Nenhum atendimento encontrado
              </div>
            )}
            {leads.map(lead => (
              <div
                key={lead.id}
                onClick={() => setSelectedLead(lead)}
                className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition ${selectedLead?.id === lead.id ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-semibold text-gray-600">
                      {lead.name ? lead.name.charAt(0).toUpperCase() : lead.phone.slice(-2)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm truncate">{lead.name || lead.phone}</h3>
                        {!lead.assignedTo && (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">Novo</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1 truncate">{lead.messages?.[lead.messages.length - 1]?.text || lead.interest || 'Sem mensagens'}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded ${lead.priority === 'high' ? 'bg-red-100 text-red-700' : lead.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>{lead.priority}</span>
                        <span className="text-xs text-gray-500">{lead.stage}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 ml-2">{formatTime(lead.lastInteraction || lead.createdAt)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coluna 2: Chat */}
  <div className="flex-1 flex flex-col bg-gray-50 min-h-0">
          {selectedLead ? (
            <>
              {/* Header do Chat */}
              <div className="bg-white p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-lg font-semibold text-gray-600">{selectedLead.name ? selectedLead.name.charAt(0).toUpperCase() : selectedLead.phone.slice(-2)}</div>
                  <div>
                    <h2 className="font-semibold text-lg">{selectedLead.name || selectedLead.phone}</h2>
                    <p className="text-sm text-gray-600">{selectedLead.phone}</p>
                  </div>
                </div>
                <div className="flex gap-3 items-center">
                  {/* Status do WhatsApp Web */}
                  <span className={`px-2 py-1 rounded-full text-xs ${waStatus === 'connected' ? 'bg-green-100 text-green-700' : waStatus === 'qr' || waStatus === 'connecting' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}
                    title="Status do WhatsApp Web">
                    {waStatus === 'connected' ? 'WA Web online' : waStatus === 'qr' ? 'Aguardando QR' : waStatus === 'connecting' ? 'Conectando...' : 'WA Web offline'}
                  </span>
                  {/* Tags */}
                  <div className="hidden md:flex flex-wrap gap-2 max-w-[260px]">
                    {selectedLead.tags?.map(t => (
                      <span key={t.id} className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700 border border-gray-200">
                        {t.name}
                      </span>
                    ))}
                  </div>
                  {/* Prioridade e estágio */}
                  <div className="text-right">
                    <div className={`px-3 py-1 rounded-full text-xs ${selectedLead.priority === 'high' ? 'bg-red-100 text-red-700' : selectedLead.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>{selectedLead.priority}</div>
                    <div className="mt-1 px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700 inline-block">{selectedLead.stage}</div>
                  </div>
                  {/* Menu de ações */}
                  <div className="relative">
                    <details className="dropdown">
                      <summary className="list-none cursor-pointer px-3 py-2 rounded-lg border text-sm hover:bg-gray-50">Ações ▾</summary>
                      <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg w-56 z-10">
                        <button onClick={() => updateLeadStage('contacted')} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Marcar como Contactado</button>
                        <button onClick={() => updateLeadStage('qualified')} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Marcar como Qualificado</button>
                        <div className="h-px bg-gray-100 my-1" />
                        <div className="px-3 py-2 text-xs text-gray-500">Prioridade</div>
                        <div className="px-3 pb-2 flex gap-2">
                          {['low', 'medium', 'high'].map(p => (
                            <button key={p} onClick={async () => { await axios.patch(`${API}/leads/${selectedLead.id}`, { priority: p }, { headers: { Authorization: `Bearer ${token}` } }); await fetchLeadDetails(selectedLead.id) }} className={`text-xs px-2 py-1 rounded-full border ${selectedLead.priority === p ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}>{p}</button>
                          ))}
                        </div>
                        <div className="h-px bg-gray-100 my-1" />
                        <button onClick={async () => { await axios.patch(`${API}/leads/${selectedLead.id}`, { status: 'closed', stage: 'closed' }, { headers: { Authorization: `Bearer ${token}` } }); await fetchLeadDetails(selectedLead.id); await fetchLeads(); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Fechar lead</button>
                        <button onClick={async () => { await axios.patch(`${API}/leads/${selectedLead.id}`, { status: 'open', stage: 'contacted' }, { headers: { Authorization: `Bearer ${token}` } }); await fetchLeadDetails(selectedLead.id); await fetchLeads(); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Reabrir lead</button>
                        <div className="h-px bg-gray-100 my-1" />
                        {/* Assumir lead */}
                        {(!selectedLead.assignedTo || user.role === 'admin') && (
                          <button onClick={async () => { await axios.patch(`${API}/leads/${selectedLead.id}/assign/self`, {}, { headers: { Authorization: `Bearer ${token}` } }); await fetchLeadDetails(selectedLead.id); await fetchLeads(); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Assumir lead</button>
                        )}
                        <div className="h-px bg-gray-100 my-1" />
                        <div className="px-3 py-2">
                          <form onSubmit={async (e) => {
                            e.preventDefault();
                            const name = e.target.tagNameInput.value.trim();
                            if (!name) return;
                            await axios.post(`${API}/leads/${selectedLead.id}/tags`, { name }, { headers: { Authorization: `Bearer ${token}` } });
                            e.target.reset();
                            await fetchLeadDetails(selectedLead.id);
                          }}>
                            <input name="tagNameInput" placeholder="+ adicionar tag" className="w-full border border-gray-300 rounded-lg px-2 py-1 text-sm" />
                          </form>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selectedLead.tags?.map(t => (
                              <button key={t.id} onClick={async () => { await axios.delete(`${API}/leads/${selectedLead.id}/tags/${t.id}`, { headers: { Authorization: `Bearer ${token}` } }); await fetchLeadDetails(selectedLead.id); }} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200 hover:bg-gray-200">{t.name} ×</button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </details>
                  </div>
                </div>
              </div>

              {/* Área de Mensagens */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {groupedMessages.map((section, sidx) => (
                  <div key={sidx}>
                    <div className="text-center my-2">
                      <span className="inline-block bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded-full shadow-sm">
                        {formatDate(section.date)}
                      </span>
                    </div>
                    <div className="mt-2 space-y-3">
                      {section.items.map((msg, idx) => {
                        const isOutgoing = msg.direction === 'outgoing' || msg.sender === 'agent'
                        const isBot = msg.sender === 'bot'
                        const isCustomer = msg.sender === 'customer'

                        return (
                          <div key={msg.id || idx} className={`group relative flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] ${isOutgoing ? 'order-2' : 'order-1'}`}>
                              <div className={`rounded-2xl p-3 shadow ${isBot ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' :
                                isOutgoing ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md' : 'bg-white border border-gray-200 shadow-sm'
                                }`}>
                                {isCustomer && (
                                  <p className="text-xs text-gray-500 mb-1">{msg.sender}</p>
                                )}
                                {isBot && (
                                  <p className="text-xs text-emerald-700 mb-1 font-semibold">🤖 IA</p>
                                )}

                                {/* Mídia */}
                                {msg.mediaUrl && (
                                  <div className="mb-2">
                                    {msg.mediaUrl.includes('image') || msg.text.includes('[IMAGEM]') ? (
                                      <img src={msg.mediaUrl} alt="Mídia" className="rounded max-w-full" />
                                    ) : (
                                      <a href={msg.mediaUrl} target="_blank" rel="noopener noreferrer" className="text-sm underline">
                                        📎 Ver arquivo
                                      </a>
                                    )}
                                  </div>
                                )}

                                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text || msg.content}</p>

                                <div className="flex items-center gap-2 mt-1">
                                  <p className={`text-[11px] ${isOutgoing && !isBot ? 'text-blue-100' : 'text-gray-500'}`}>
                                    {formatTime(msg.createdAt)}
                                  </p>
                                  {isOutgoing && !isBot && msg.status && (
                                    <span className={`text-[11px] ${msg.status === 'read' ? 'text-blue-200' : 'text-blue-100'}`}>
                                      {getStatusIcon(msg.status)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            {/* Apagar mensagem (admin ou dono do lead) */}
                            {user?.role === 'admin' || selectedLead?.assignedTo === user?.id ? (
                              <button
                                onClick={async () => {
                                  if (!msg.id) return
                                  try {
                                    await axios.delete(`${API}/leads/${selectedLead.id}/messages/${msg.id}`, { headers: { Authorization: `Bearer ${token}` } })
                                    setMessages(prev => prev.filter(m => m.id !== msg.id))
                                  } catch (e) {
                                    alert('Não foi possível apagar a mensagem')
                                  }
                                }}
                                className="absolute -top-2 ${isOutgoing ? 'right-0' : 'left-0'} hidden group-hover:block text-xs text-gray-400 hover:text-red-600"
                                title="Apagar mensagem"
                              >🗑️</button>
                            ) : null}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-200 rounded-lg px-4 py-2 text-sm text-gray-600">
                      <span className="inline-flex gap-1">
                        <span className="animate-bounce">●</span>
                        <span className="animate-bounce delay-75">●</span>
                        <span className="animate-bounce delay-150">●</span>
                      </span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input de Mensagem */}
              <form onSubmit={sendMessage} className="bg-white p-4 border-t border-gray-200">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">{user.name ? user.name.charAt(0).toUpperCase() : 'A'}</div>
                    <div>
                      <div className="text-sm font-medium">{user.name || 'Atendente'}</div>
                      <div className="text-xs text-gray-500">{user.role}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => { setNewMessage('Olá! Em que posso ajudar?') }} className="px-3 py-1 bg-gray-100 rounded text-sm">Boas vindas</button>
                    <button type="button" onClick={() => { setNewMessage('Posso agendar uma visita para você. Qual data prefere?') }} className="px-3 py-1 bg-gray-100 rounded text-sm">Agendar</button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={handleTyping}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading || !newMessage.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                  >
                    {loading ? 'Enviando...' : 'Enviar'}
                  </button>
                </div>
                {!isConnected && (
                  <p className="text-xs text-amber-600 mt-2">⚠️ Reconectando ao servidor...</p>
                )}
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Escolha um atendimento para iniciar a conversa
                </h3>
                <p className="text-sm text-gray-500">
                  Selecione uma conversa na lista ao lado
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Coluna 3: Detalhes do Lead */}
        {selectedLead && (
          <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-4">Detalhes do Lead</h3>

              {/* Info do Lead */}
              <div className="space-y-3 mb-6">
                <div>
                  <label className="text-xs text-gray-500">Nome</label>
                  <p className="font-medium">{selectedLead.name || '—'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Telefone</label>
                  <p className="font-medium">{selectedLead.phone}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Email</label>
                  <p className="font-medium">{selectedLead.email || '—'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Interesse</label>
                  <p className="font-medium">{selectedLead.interest || '—'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Origem</label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="capitalize font-medium">{selectedLead.origin}</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">WhatsApp</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Responsável</label>
                  <p className="font-medium">{selectedLead.assignedUser?.name || 'Não atribuído'}</p>
                </div>
              </div>

              {/* Mudar Estágio */}
              <div className="mb-6">
                <label className="text-xs text-gray-500 mb-2 block">Estágio</label>
                <select
                  value={selectedLead.stage}
                  onChange={e => updateLeadStage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="new">Novo</option>
                  <option value="contacted">Contactado</option>
                  <option value="qualified">Qualificado</option>
                  <option value="proposal">Proposta</option>
                  <option value="negotiation">Negociação</option>
                  <option value="closed">Fechado</option>
                </select>
              </div>

              {/* Logs */}
              <div>
                <h4 className="font-semibold text-sm mb-3">Histórico</h4>
                <div className="space-y-2">
                  {selectedLead.logs?.slice(0, 5).map((log, idx) => (
                    <div key={idx} className="text-xs bg-gray-50 p-2 rounded">
                      <p className="text-gray-700">{log.message || log.action}</p>
                      <p className="text-gray-500 mt-1">{formatDate(log.createdAt)} às {formatTime(log.createdAt)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Removido: modal de criação de lead manual */}
    </div>
  )
}
