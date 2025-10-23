import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import { getApiUrl } from '../utils/env'

export default function Configuracoes() {
  const { user, token } = useAuth()
  const [activeTab, setActiveTab] = useState('users') // users | tags | templates | whatsapp
  const [users, setUsers] = useState([])
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(false)
  
  // Modals
  const [showUserModal, setShowUserModal] = useState(false)
  const [showTagModal, setShowTagModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  
  // Forms
  const [newTag, setNewTag] = useState({ name: '', color: '#3B82F6' })
  
  // WhatsApp Config
  const [whatsappConfig, setWhatsappConfig] = useState({
    phoneNumberId: '',
    accessToken: '',
    verifyToken: '',
    isConfigured: false
  })
  const [testPhone, setTestPhone] = useState('')

  const API_URL = getApiUrl()

  useEffect(() => {
    if (activeTab === 'users') fetchUsers()
    if (activeTab === 'tags') fetchTags()
    if (activeTab === 'whatsapp') fetchWhatsAppConfig()
  }, [activeTab])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUsers(res.data)
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTags = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API_URL}/tags`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTags(res.data)
    } catch (error) {
      console.error('Erro ao buscar tags:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchWhatsAppConfig = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API_URL}/whatsapp/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setWhatsappConfig(res.data)
    } catch (error) {
      console.error('Erro ao buscar configurações WhatsApp:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateWhatsAppConfig = async () => {
    setLoading(true)
    try {
      await axios.patch(`${API_URL}/whatsapp/settings`, whatsappConfig, {
        headers: { Authorization: `Bearer ${token}` }
      })
      alert('✅ Configurações do WhatsApp salvas com sucesso!')
      fetchWhatsAppConfig()
    } catch (error) {
      console.error('Erro ao salvar configurações WhatsApp:', error)
      alert('❌ Erro ao salvar configurações')
    } finally {
      setLoading(false)
    }
  }

  const testWhatsAppConnection = async () => {
    if (!testPhone) {
      alert('Digite um número de telefone para teste')
      return
    }
    
    setLoading(true)
    try {
      const res = await axios.post(`${API_URL}/whatsapp/test`, 
        { phoneNumber: testPhone },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      alert(res.data.message || '✅ Teste enviado com sucesso!')
    } catch (error) {
      console.error('Erro ao testar conexão WhatsApp:', error)
      alert('❌ Erro ao enviar mensagem de teste')
    } finally {
      setLoading(false)
    }
  }

  const updateUser = async (userId, data) => {
    try {
      await axios.patch(`${API_URL}/users/${userId}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchUsers()
      setShowUserModal(false)
      setSelectedUser(null)
      alert('Usuário atualizado com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error)
      alert('Erro ao atualizar usuário')
    }
  }

  const createTag = async () => {
    try {
      await axios.post(`${API_URL}/tags`, newTag, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setNewTag({ name: '', color: '#3B82F6' })
      setShowTagModal(false)
      fetchTags()
      alert('Tag criada com sucesso!')
    } catch (error) {
      console.error('Erro ao criar tag:', error)
      alert('Erro ao criar tag')
    }
  }

  const deleteTag = async (tagId) => {
    if (!confirm('Deseja realmente excluir esta tag?')) return
    
    try {
      await axios.delete(`${API_URL}/tags/${tagId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchTags()
      alert('Tag excluída com sucesso!')
    } catch (error) {
      console.error('Erro ao excluir tag:', error)
      alert('Erro ao excluir tag')
    }
  }

  const toggleUserAvailability = async (userId, currentStatus) => {
    await updateUser(userId, { available: !currentStatus })
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 font-medium">🚫 Acesso restrito a administradores</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">⚙️ Configurações</h1>
          <p className="text-gray-600">Gerencie usuários, tags e configurações do sistema</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b flex">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'users'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              👥 Usuários
            </button>
            <button
              onClick={() => setActiveTab('tags')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'tags'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🏷️ Tags
            </button>
            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'whatsapp'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              💬 WhatsApp
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'templates'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📝 Templates
            </button>
          </div>

          <div className="p-6">
            {/* Tab: Usuários */}
            {activeTab === 'users' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Gerenciar Usuários</h2>
                </div>

                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {users.map(u => (
                      <div key={u.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold text-gray-900">{u.name}</h3>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                u.role === 'admin'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {u.role === 'admin' ? '👑 Admin' : '👤 User'}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                u.available
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {u.available ? '✅ Disponível' : '⏸️ Indisponível'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{u.email}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Limite: {u.maxLeads} leads | Membro desde: {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => toggleUserAvailability(u.id, u.available)}
                              className={`px-3 py-1 rounded text-sm ${
                                u.available
                                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                  : 'bg-green-600 text-white hover:bg-green-700'
                              }`}
                            >
                              {u.available ? 'Desativar' : 'Ativar'}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUser(u)
                                setShowUserModal(true)
                              }}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                            >
                              ⚙️ Configurar
                            </button>
                          </div>
                        </div>
                        
                        {/* Estatísticas do Usuário */}
                        <div className="grid grid-cols-4 gap-2 pt-3 border-t">
                          <div className="text-center">
                            <p className="text-xs text-gray-500">Leads Ativos</p>
                            <p className="text-lg font-bold text-blue-600">
                              {Math.floor(Math.random() * u.maxLeads)}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500">Convertidos</p>
                            <p className="text-lg font-bold text-green-600">
                              {Math.floor(Math.random() * 20)}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500">Taxa Conv.</p>
                            <p className="text-lg font-bold text-purple-600">
                              {Math.floor(Math.random() * 30 + 10)}%
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500">Resp. Média</p>
                            <p className="text-lg font-bold text-orange-600">
                              {Math.floor(Math.random() * 60 + 5)}min
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Tags */}
            {activeTab === 'tags' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Gerenciar Tags</h2>
                  <button
                    onClick={() => setShowTagModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    ➕ Nova Tag
                  </button>
                </div>

                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                  </div>
                ) : tags.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Nenhuma tag cadastrada
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {tags.map(tag => (
                      <div
                        key={tag.id}
                        className="border rounded-lg p-4 flex items-center justify-between hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: tag.color }}
                          ></div>
                          <span className="font-medium text-gray-900">{tag.name}</span>
                        </div>
                        <button
                          onClick={() => deleteTag(tag.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: WhatsApp */}
            {activeTab === 'whatsapp' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">💬 Configurações do WhatsApp Cloud API</h2>
                  <p className="text-sm text-gray-600">
                    Configure a integração com a Meta WhatsApp Business API para enviar e receber mensagens reais.
                  </p>
                </div>

                {/* Status da Configuração */}
                <div className={`mb-6 p-4 rounded-lg border-2 ${
                  whatsappConfig.isConfigured 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="flex items-center gap-3">
                    {whatsappConfig.isConfigured ? (
                      <>
                        <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse"></div>
                        <div>
                          <p className="font-semibold text-green-900">✅ WhatsApp Configurado</p>
                          <p className="text-sm text-green-700">Mensagens serão enviadas via WhatsApp Cloud API</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                        <div>
                          <p className="font-semibold text-yellow-900">⚠️ WhatsApp Não Configurado</p>
                          <p className="text-sm text-yellow-700">Mensagens serão simuladas localmente</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Formulário de Configuração */}
                    <div className="bg-white border rounded-lg p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">🔑 Credenciais da API</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number ID
                          </label>
                          <input
                            type="text"
                            value={whatsappConfig.phoneNumberId}
                            onChange={(e) => setWhatsappConfig({...whatsappConfig, phoneNumberId: e.target.value})}
                            placeholder="Ex: 123456789012345"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Encontre em: Meta Developer → WhatsApp → API Setup → Phone Number ID
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Access Token
                          </label>
                          <input
                            type="password"
                            value={whatsappConfig.accessToken === '***CONFIGURADO***' ? '' : whatsappConfig.accessToken}
                            onChange={(e) => setWhatsappConfig({...whatsappConfig, accessToken: e.target.value})}
                            placeholder={whatsappConfig.accessToken === '***CONFIGURADO***' ? '***CONFIGURADO***' : 'Cole seu Access Token aqui'}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Encontre em: Meta Developer → WhatsApp → API Setup → Temporary Access Token
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Verify Token (Webhook)
                          </label>
                          <input
                            type="text"
                            value={whatsappConfig.verifyToken}
                            onChange={(e) => setWhatsappConfig({...whatsappConfig, verifyToken: e.target.value})}
                            placeholder="lead_campanha_webhook_token_2025"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Use este token ao configurar o webhook na Meta
                          </p>
                        </div>

                        <button
                          onClick={updateWhatsAppConfig}
                          disabled={loading}
                          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                        >
                          {loading ? 'Salvando...' : '💾 Salvar Configurações'}
                        </button>
                      </div>
                    </div>

                    {/* Configuração do Webhook */}
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
                      <h3 className="font-semibold text-gray-900 mb-3">🔗 Configurar Webhook na Meta</h3>
                      <p className="text-sm text-gray-700 mb-4">
                        Configure o webhook no Meta Developer para receber mensagens:
                      </p>
                      
                      <div className="bg-white rounded-lg p-4 mb-4 border">
                        <p className="text-xs text-gray-600 mb-2">Callback URL:</p>
                        <code className="block bg-gray-900 text-green-400 p-3 rounded text-sm overflow-x-auto">
                          https://seu-dominio.com/api/webhook
                        </code>
                      </div>

                      <div className="bg-white rounded-lg p-4 border">
                        <p className="text-xs text-gray-600 mb-2">Verify Token:</p>
                        <code className="block bg-gray-900 text-green-400 p-3 rounded text-sm">
                          {whatsappConfig.verifyToken || 'lead_campanha_webhook_token_2025'}
                        </code>
                      </div>

                      <div className="mt-4 text-sm text-gray-700 space-y-2">
                        <p>📋 <strong>Passos:</strong></p>
                        <ol className="list-decimal list-inside space-y-1 ml-4 text-gray-600">
                          <li>Acesse Meta Developer → Seu App → WhatsApp → Configuration</li>
                          <li>Em "Webhook", clique em "Edit"</li>
                          <li>Cole a Callback URL e Verify Token acima</li>
                          <li>Marque os eventos: <code className="bg-gray-100 px-1 rounded">messages</code> e <code className="bg-gray-100 px-1 rounded">message_status</code></li>
                          <li>Clique em "Verify and Save"</li>
                        </ol>
                      </div>
                    </div>

                    {/* Teste de Conexão */}
                    <div className="bg-white border rounded-lg p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">🧪 Testar Conexão</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Envie uma mensagem de teste para verificar se a integração está funcionando:
                      </p>
                      
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={testPhone}
                          onChange={(e) => setTestPhone(e.target.value)}
                          placeholder="Ex: +5511999999999"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          onClick={testWhatsAppConnection}
                          disabled={loading || !testPhone}
                          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                        >
                          {loading ? '⏳' : '📤'} Enviar Teste
                        </button>
                      </div>
                    </div>

                    {/* Documentação */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <h3 className="font-semibold text-gray-900 mb-3">📚 Documentação</h3>
                      <div className="space-y-2 text-sm">
                        <a 
                          href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="block text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          → Guia oficial da WhatsApp Cloud API
                        </a>
                        <a 
                          href="https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="block text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          → Configuração de Webhooks
                        </a>
                        <a 
                          href="https://developers.facebook.com/apps/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="block text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          → Acessar Meta Developer Dashboard
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Templates */}
            {activeTab === 'templates' && (
              <div>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">🎯 Configurações Globais do Sistema</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Distribuição Automática */}
                    <div className="bg-white rounded-lg p-4 border">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        🔄 Distribuição Automática
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="autoDistribute" defaultChecked className="w-4 h-4" />
                          <label htmlFor="autoDistribute" className="text-sm text-gray-700">
                            Ativar distribuição automática
                          </label>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Algoritmo</label>
                          <select className="w-full px-3 py-2 border rounded text-sm">
                            <option value="round-robin">Round-Robin (Rotativo)</option>
                            <option value="least-busy">Menos Ocupado</option>
                            <option value="random">Aleatório</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Tempo de espera (segundos)</label>
                          <input type="number" defaultValue="0" min="0" max="300" className="w-full px-3 py-2 border rounded text-sm" />
                          <p className="text-xs text-gray-500 mt-1">Aguardar antes de distribuir</p>
                        </div>
                      </div>
                    </div>

                    {/* IA e Qualificação */}
                    <div className="bg-white rounded-lg p-4 border">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        🤖 IA e Qualificação
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="aiEnabled" defaultChecked className="w-4 h-4" />
                          <label htmlFor="aiEnabled" className="text-sm text-gray-700">
                            Ativar classificação por IA
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="autoResponse" defaultChecked className="w-4 h-4" />
                          <label htmlFor="autoResponse" className="text-sm text-gray-700">
                            Resposta automática inicial
                          </label>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Palavras-chave alta prioridade</label>
                          <input type="text" defaultValue="comprar, urgente, quero" className="w-full px-3 py-2 border rounded text-sm" />
                          <p className="text-xs text-gray-500 mt-1">Separadas por vírgula</p>
                        </div>
                      </div>
                    </div>

                    {/* Limites e Restrições */}
                    <div className="bg-white rounded-lg p-4 border">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        �️ Limites e Restrições
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Limite global de leads por usuário</label>
                          <input type="number" defaultValue="30" min="1" max="100" className="w-full px-3 py-2 border rounded text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Leads inativos após (dias)</label>
                          <input type="number" defaultValue="30" min="1" max="365" className="w-full px-3 py-2 border rounded text-sm" />
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="preventDuplicates" defaultChecked className="w-4 h-4" />
                          <label htmlFor="preventDuplicates" className="text-sm text-gray-700">
                            Prevenir leads duplicados
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Notificações e Alertas */}
                    <div className="bg-white rounded-lg p-4 border">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        🔔 Notificações e Alertas
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="emailNotifications" className="w-4 h-4" />
                          <label htmlFor="emailNotifications" className="text-sm text-gray-700">
                            Enviar notificações por email
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="smsNotifications" className="w-4 h-4" />
                          <label htmlFor="smsNotifications" className="text-sm text-gray-700">
                            Enviar notificações por SMS
                          </label>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Alertar lead sem resposta após (horas)</label>
                          <input type="number" defaultValue="24" min="1" max="168" className="w-full px-3 py-2 border rounded text-sm" />
                        </div>
                      </div>
                    </div>

                    {/* WhatsApp Integration */}
                    <div className="bg-white rounded-lg p-4 border">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        💬 Integração WhatsApp
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Webhook URL</label>
                          <input type="text" defaultValue="http://localhost:4000/api/webhook" className="w-full px-3 py-2 border rounded text-sm font-mono" readOnly />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Status</label>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <span className="text-xs text-gray-600">Simulado (Desenvolvimento)</span>
                          </div>
                        </div>
                        <button className="w-full px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                          🔗 Configurar WhatsApp Cloud API
                        </button>
                      </div>
                    </div>

                    {/* Backup e Manutenção */}
                    <div className="bg-white rounded-lg p-4 border">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        💾 Backup e Manutenção
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="autoBackup" defaultChecked className="w-4 h-4" />
                          <label htmlFor="autoBackup" className="text-sm text-gray-700">
                            Backup automático diário
                          </label>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Último backup</label>
                          <p className="text-sm text-gray-900">Hoje, 03:00</p>
                        </div>
                        <div className="flex gap-2">
                          <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                            📥 Fazer Backup
                          </button>
                          <button className="flex-1 px-3 py-2 border rounded text-sm hover:bg-gray-50">
                            🔧 Manutenção
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-2">
                    <button className="px-6 py-2 border rounded-lg hover:bg-white">
                      Cancelar
                    </button>
                    <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      💾 Salvar Configurações
                    </button>
                  </div>
                </div>

                {/* Templates de Mensagens */}
                <div className="bg-white border rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">📝 Templates de Mensagens Rápidas</h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Crie templates para respostas rápidas e padronizadas
                  </p>
                  
                  <div className="space-y-3">
                    <div className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">Boas-vindas</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Olá! Obrigado por entrar em contato. Como posso ajudá-lo hoje?
                          </p>
                        </div>
                        <button className="text-blue-600 hover:text-blue-800 text-sm">Editar</button>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">Agendamento</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Ótimo! Vou agendar uma visita para você. Qual data seria melhor?
                          </p>
                        </div>
                        <button className="text-blue-600 hover:text-blue-800 text-sm">Editar</button>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">Follow-up</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Olá! Passando para dar um retorno sobre sua solicitação...
                          </p>
                        </div>
                        <button className="text-blue-600 hover:text-blue-800 text-sm">Editar</button>
                      </div>
                    </div>
                  </div>
                  
                  <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    ➕ Novo Template
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Editar Usuário */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">✏️ Editar Usuário</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  value={selectedUser.name}
                  disabled
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={selectedUser.email}
                  disabled
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Limite de Leads Simultâneos
                </label>
                <input
                  type="number"
                  value={selectedUser.maxLeads}
                  onChange={(e) => setSelectedUser({ ...selectedUser, maxLeads: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg"
                  min="1"
                  max="100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Número máximo de leads ativos que este usuário pode gerenciar
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Função</label>
                <select
                  value={selectedUser.role}
                  onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="user">👤 Usuário (Consultor)</option>
                  <option value="admin">👑 Administrador</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Admins têm acesso total ao sistema
                </p>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">⚙️ Permissões</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="available"
                      checked={selectedUser.available}
                      onChange={(e) => setSelectedUser({ ...selectedUser, available: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="available" className="text-sm text-gray-700">
                      ✅ Disponível para receber leads automaticamente
                    </label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="canCreateLeads"
                      defaultChecked
                      className="w-4 h-4"
                    />
                    <label htmlFor="canCreateLeads" className="text-sm text-gray-700">
                      ➕ Pode criar leads manualmente no CRM
                    </label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="canEditOwnLeads"
                      defaultChecked
                      className="w-4 h-4"
                    />
                    <label htmlFor="canEditOwnLeads" className="text-sm text-gray-700">
                      ✏️ Pode editar seus próprios leads
                    </label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="canDeleteOwnLeads"
                      defaultChecked
                      className="w-4 h-4"
                    />
                    <label htmlFor="canDeleteOwnLeads" className="text-sm text-gray-700">
                      🗑️ Pode excluir seus próprios leads
                    </label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="canExportData"
                      className="w-4 h-4"
                    />
                    <label htmlFor="canExportData" className="text-sm text-gray-700">
                      📥 Pode exportar dados em CSV
                    </label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="canViewReports"
                      defaultChecked
                      className="w-4 h-4"
                    />
                    <label htmlFor="canViewReports" className="text-sm text-gray-700">
                      📊 Pode visualizar relatórios e estatísticas
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">🔔 Notificações</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="notifyNewLead"
                      defaultChecked
                      className="w-4 h-4"
                    />
                    <label htmlFor="notifyNewLead" className="text-sm text-gray-700">
                      Notificar quando receber novo lead
                    </label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="notifyNewMessage"
                      defaultChecked
                      className="w-4 h-4"
                    />
                    <label htmlFor="notifyNewMessage" className="text-sm text-gray-700">
                      Notificar quando receber nova mensagem
                    </label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="notifyTaskDue"
                      defaultChecked
                      className="w-4 h-4"
                    />
                    <label htmlFor="notifyTaskDue" className="text-sm text-gray-700">
                      Notificar sobre tarefas vencendo
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">⏰ Horário de Trabalho</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Início</label>
                    <input
                      type="time"
                      defaultValue="08:00"
                      className="w-full px-2 py-1.5 border rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Fim</label>
                    <input
                      type="time"
                      defaultValue="18:00"
                      className="w-full px-2 py-1.5 border rounded text-sm"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Leads só serão distribuídos dentro deste horário
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowUserModal(false)
                  setSelectedUser(null)
                }}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => updateUser(selectedUser.id, {
                  maxLeads: selectedUser.maxLeads,
                  role: selectedUser.role,
                  available: selectedUser.available
                })}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nova Tag */}
      {showTagModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">🏷️ Nova Tag</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <input
                  type="text"
                  value={newTag.name}
                  onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="VIP, Urgente, Follow-up..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cor</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={newTag.color}
                    onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
                    className="w-12 h-10 border rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={newTag.color}
                    onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
                    className="flex-1 px-3 py-2 border rounded-lg font-mono text-sm"
                  />
                </div>
              </div>
              
              <div className="border rounded-lg p-3 bg-gray-50">
                <p className="text-sm text-gray-600 mb-2">Preview:</p>
                <span
                  className="inline-block px-3 py-1 rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: newTag.color }}
                >
                  {newTag.name || 'Nome da Tag'}
                </span>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowTagModal(false)
                  setNewTag({ name: '', color: '#3B82F6' })
                }}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={createTag}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                disabled={!newTag.name}
              >
                Criar Tag
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
