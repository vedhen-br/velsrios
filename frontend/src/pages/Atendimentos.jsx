import React, { useState, useEffect, useRef, useCallback } from 'react'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import { useSocketEvent } from '../hooks/useSocket'
import { getApiUrl } from '../utils/env'

const API = getApiUrl()

export default function Atendimentos() {
  const { user, socket, isConnected } = useAuth()
  const [leads, setLeads] = useState([])
  const [selectedLead, setSelectedLead] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [filter, setFilter] = useState('all') // all, new, mine
  const [loading, setLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  // Fetch inicial
  useEffect(() => {
    fetchLeads()
  }, [filter])

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

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  async function fetchLeads() {
    try {
      const params = new URLSearchParams()
      if (filter === 'new') params.append('stage', 'new')
      if (filter === 'mine' && user.role !== 'admin') params.append('assignedTo', user.id)
      const res = await axios.get(`${API}/leads/atendimento?${params}`)
      setLeads(res.data)
    } catch (e) {
      console.error(e)
    }
  }

  async function fetchLeadDetails(leadId) {
    try {
      const res = await axios.get(`${API}/leads/${leadId}`)
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
  }, [selectedLead])

  // WebSocket: Novo lead
  const handleNewLead = useCallback((data) => {
    console.log('🆕 Novo lead:', data)
    if (data.userId === user.id || user.role === 'admin') {
      fetchLeads()
      // Mostrar notificação
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Novo lead WhatsApp!', {
          body: `${data.lead.name || data.lead.phone} iniciou uma conversa`,
          icon: '/logo.png'
        })
      }
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

  async function sendMessage(e) {
    e.preventDefault()
    if (!newMessage.trim() || !selectedLead) return

    setLoading(true)
    try {
      const res = await axios.post(`${API}/leads/${selectedLead.id}/messages`, { text: newMessage })
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
      await axios.patch(`${API}/leads/${selectedLead.id}`, { stage })
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
    switch(status) {
      case 'sent': return '✓'
      case 'delivered': return '✓✓'
      case 'read': return '✓✓'
      case 'failed': return '✗'
      default: return '○'
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Coluna 1: Lista de Conversas */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold">Atendimentos</h2>
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
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition ${
                selectedLead?.id === lead.id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">{lead.name || lead.phone}</h3>
                    {!lead.assignedTo && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">Novo</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1 truncate">
                    {lead.messages?.[lead.messages.length - 1]?.text || lead.interest || 'Sem mensagens'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      lead.priority === 'high' ? 'bg-red-100 text-red-700' :
                      lead.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {lead.priority}
                    </span>
                    <span className="text-xs text-gray-500">{lead.stage}</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500 ml-2">
                  {formatTime(lead.lastInteraction || lead.createdAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Coluna 2: Chat */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedLead ? (
          <>
            {/* Header do Chat */}
            <div className="bg-white p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-lg">{selectedLead.name || selectedLead.phone}</h2>
                <p className="text-sm text-gray-600">{selectedLead.phone}</p>
              </div>
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded text-xs ${
                  selectedLead.priority === 'high' ? 'bg-red-100 text-red-700' :
                  selectedLead.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {selectedLead.priority}
                </span>
                <span className="px-3 py-1 rounded text-xs bg-blue-100 text-blue-700">
                  {selectedLead.stage}
                </span>
              </div>
            </div>

            {/* Área de Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => {
                const isOutgoing = msg.direction === 'outgoing' || msg.sender === 'agent'
                const isBot = msg.sender === 'bot'
                const isCustomer = msg.sender === 'customer'
                
                return (
                  <div key={msg.id || idx} className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] ${isOutgoing ? 'order-2' : 'order-1'}`}>
                      <div className={`rounded-lg p-3 ${
                        isBot ? 'bg-green-100' :
                        isOutgoing ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200'
                      }`}>
                        {isCustomer && (
                          <p className="text-xs text-gray-500 mb-1">{msg.sender}</p>
                        )}
                        {isBot && (
                          <p className="text-xs text-green-700 mb-1 font-semibold">🤖 IA</p>
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
                        
                        <p className="text-sm whitespace-pre-wrap">{msg.text || msg.content}</p>
                        
                        <div className="flex items-center gap-2 mt-1">
                          <p className={`text-xs ${isOutgoing && !isBot ? 'text-blue-100' : 'text-gray-500'}`}>
                            {formatTime(msg.createdAt)}
                          </p>
                          {isOutgoing && !isBot && msg.status && (
                            <span className={`text-xs ${msg.status === 'read' ? 'text-blue-300' : 'text-blue-200'}`}>
                              {getStatusIcon(msg.status)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
              
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
  )
}
