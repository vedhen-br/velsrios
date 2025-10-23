import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'

export default function Perfil() {
  const { user, token, updateUser } = useAuth()
  const [activeTab, setActiveTab] = useState('profile') // profile | security | notifications | preferences
  const [loading, setLoading] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  
  // Profile data
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: '',
    bio: '',
    timezone: 'America/Sao_Paulo'
  })
  
  // Security data
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  // Notifications
  const [notifications, setNotifications] = useState({
    emailNewLead: true,
    emailNewMessage: true,
    emailTaskDue: true,
    pushNewLead: true,
    pushNewMessage: true,
    soundEnabled: true
  })
  
  // Preferences
  const [preferences, setPreferences] = useState({
    theme: 'light', // light | dark
    language: 'pt-BR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    autoRefresh: true,
    refreshInterval: 5
  })

  const API_URL = 'http://localhost:4000/api'

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
        bio: user.bio || '',
        timezone: user.timezone || 'America/Sao_Paulo'
      })
    }
  }, [user])

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Convert to base64 for preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileData({ ...profileData, avatar: reader.result })
      }
      reader.readAsDataURL(file)
    }
  }

  const saveProfile = async () => {
    setLoading(true)
    setSaveSuccess(false)
    try {
      const res = await axios.patch(`${API_URL}/users/profile`, profileData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      // Update user context
      if (updateUser) {
        updateUser(res.data)
      }
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error('Erro ao salvar perfil:', error)
      alert('Erro ao salvar perfil')
    } finally {
      setLoading(false)
    }
  }

  const changePassword = async () => {
    if (securityData.newPassword !== securityData.confirmPassword) {
      alert('As senhas não coincidem')
      return
    }
    if (securityData.newPassword.length < 6) {
      alert('A senha deve ter no mínimo 6 caracteres')
      return
    }
    
    setLoading(true)
    try {
      await axios.post(`${API_URL}/users/change-password`, {
        currentPassword: securityData.currentPassword,
        newPassword: securityData.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      alert('Senha alterada com sucesso!')
      setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      console.error('Erro ao alterar senha:', error)
      alert(error.response?.data?.error || 'Erro ao alterar senha')
    } finally {
      setLoading(false)
    }
  }

  const saveNotifications = async () => {
    setLoading(true)
    setSaveSuccess(false)
    try {
      await axios.patch(`${API_URL}/users/notifications`, notifications, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error('Erro ao salvar notificações:', error)
      alert('Erro ao salvar notificações')
    } finally {
      setLoading(false)
    }
  }

  const savePreferences = async () => {
    setLoading(true)
    setSaveSuccess(false)
    try {
      await axios.patch(`${API_URL}/users/preferences`, preferences, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error('Erro ao salvar preferências:', error)
      alert('Erro ao salvar preferências')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                {profileData.avatar ? (
                  <img src={profileData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{user?.name?.charAt(0).toUpperCase()}</span>
                )}
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
              <p className="text-gray-600">{user?.email}</p>
              <div className="flex gap-2 mt-2">
                <span className={`px-3 py-1 text-xs rounded-full ${
                  user?.role === 'admin' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {user?.role === 'admin' ? '👑 Administrador' : '👤 Consultor'}
                </span>
                <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-800">
                  ✅ Ativo
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-3 font-medium whitespace-nowrap ${
                activeTab === 'profile'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              👤 Perfil
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-6 py-3 font-medium whitespace-nowrap ${
                activeTab === 'security'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🔒 Segurança
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-6 py-3 font-medium whitespace-nowrap ${
                activeTab === 'notifications'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🔔 Notificações
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`px-6 py-3 font-medium whitespace-nowrap ${
                activeTab === 'preferences'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ⚙️ Preferências
            </button>
          </div>

          <div className="p-6">
            {/* Success Message */}
            {saveSuccess && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <span className="text-green-600">✅</span>
                <span className="text-green-800 font-medium">Alterações salvas com sucesso!</span>
              </div>
            )}

            {/* Tab: Perfil */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações Pessoais</h2>
                  
                  {/* Avatar Upload */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Foto de Perfil</label>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                        {profileData.avatar ? (
                          <img src={profileData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span>{profileData.name?.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <input
                          type="file"
                          id="avatar"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                        <label
                          htmlFor="avatar"
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer inline-block"
                        >
                          📷 Alterar Foto
                        </label>
                        <p className="text-xs text-gray-500 mt-2">JPG, PNG ou GIF. Máx 2MB.</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="João Silva"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="joao@exemplo.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="(11) 99999-9999"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fuso Horário</label>
                      <select
                        value={profileData.timezone}
                        onChange={(e) => setProfileData({ ...profileData, timezone: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
                        <option value="America/Manaus">Manaus (GMT-4)</option>
                        <option value="America/Rio_Branco">Rio Branco (GMT-5)</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      rows="3"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Conte um pouco sobre você..."
                    ></textarea>
                  </div>

                  <div className="flex justify-end gap-2 mt-6">
                    <button
                      onClick={saveProfile}
                      disabled={loading}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? 'Salvando...' : '💾 Salvar Alterações'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Segurança */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Alterar Senha</h2>
                  
                  <div className="max-w-md space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Senha Atual *</label>
                      <input
                        type="password"
                        value={securityData.currentPassword}
                        onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="••••••••"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha *</label>
                      <input
                        type="password"
                        value={securityData.newPassword}
                        onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="••••••••"
                      />
                      <p className="text-xs text-gray-500 mt-1">Mínimo de 6 caracteres</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nova Senha *</label>
                      <input
                        type="password"
                        value={securityData.confirmPassword}
                        onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="••••••••"
                      />
                    </div>

                    {/* Password Strength Indicator */}
                    {securityData.newPassword && (
                      <div className="bg-gray-50 border rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-700 mb-2">Força da senha:</p>
                        <div className="flex gap-1">
                          <div className={`h-1 flex-1 rounded ${securityData.newPassword.length >= 6 ? 'bg-yellow-500' : 'bg-gray-300'}`}></div>
                          <div className={`h-1 flex-1 rounded ${securityData.newPassword.length >= 8 ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
                          <div className={`h-1 flex-1 rounded ${securityData.newPassword.length >= 10 && /[A-Z]/.test(securityData.newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {securityData.newPassword.length < 6 && 'Senha fraca'}
                          {securityData.newPassword.length >= 6 && securityData.newPassword.length < 8 && 'Senha média'}
                          {securityData.newPassword.length >= 8 && securityData.newPassword.length < 10 && 'Senha boa'}
                          {securityData.newPassword.length >= 10 && /[A-Z]/.test(securityData.newPassword) && 'Senha forte'}
                        </p>
                      </div>
                    )}

                    <button
                      onClick={changePassword}
                      disabled={loading || !securityData.currentPassword || !securityData.newPassword || !securityData.confirmPassword}
                      className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? 'Alterando...' : '🔒 Alterar Senha'}
                    </button>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-md font-semibold text-gray-900 mb-3">Autenticação de Dois Fatores</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800 mb-2">🔐 Aumente a segurança da sua conta</p>
                    <p className="text-xs text-blue-700 mb-3">
                      A autenticação de dois fatores adiciona uma camada extra de proteção à sua conta.
                    </p>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                      Ativar 2FA
                    </button>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-md font-semibold text-gray-900 mb-3">Sessões Ativas</h3>
                  <div className="space-y-2">
                    <div className="border rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">💻 Windows - Chrome</p>
                        <p className="text-xs text-gray-500">São Paulo, Brasil • Ativo agora</p>
                      </div>
                      <span className="text-xs text-green-600 font-medium">✓ Atual</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Notificações */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Preferências de Notificação</h2>
                  
                  <div className="space-y-6">
                    {/* Email Notifications */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">📧 Notificações por Email</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Novo Lead</p>
                            <p className="text-xs text-gray-500">Receba email quando um novo lead for atribuído a você</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notifications.emailNewLead}
                              onChange={(e) => setNotifications({ ...notifications, emailNewLead: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Nova Mensagem</p>
                            <p className="text-xs text-gray-500">Receba email quando receber uma nova mensagem</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notifications.emailNewMessage}
                              onChange={(e) => setNotifications({ ...notifications, emailNewMessage: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Tarefa Vencendo</p>
                            <p className="text-xs text-gray-500">Receba email 1 hora antes de uma tarefa vencer</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notifications.emailTaskDue}
                              onChange={(e) => setNotifications({ ...notifications, emailTaskDue: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Push Notifications */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">🔔 Notificações Push (Navegador)</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Novo Lead</p>
                            <p className="text-xs text-gray-500">Notificação instantânea no navegador</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notifications.pushNewLead}
                              onChange={(e) => setNotifications({ ...notifications, pushNewLead: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Nova Mensagem</p>
                            <p className="text-xs text-gray-500">Notificação instantânea no navegador</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notifications.pushNewMessage}
                              onChange={(e) => setNotifications({ ...notifications, pushNewMessage: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Sound */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">🔊 Sons</h3>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Som de Notificação</p>
                          <p className="text-xs text-gray-500">Tocar som ao receber notificações</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifications.soundEnabled}
                            onChange={(e) => setNotifications({ ...notifications, soundEnabled: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-6">
                    <button
                      onClick={saveNotifications}
                      disabled={loading}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? 'Salvando...' : '💾 Salvar Preferências'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Preferências */}
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Preferências do Sistema</h2>
                  
                  <div className="space-y-6">
                    {/* Appearance */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">🎨 Aparência</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setPreferences({ ...preferences, theme: 'light' })}
                          className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 ${
                            preferences.theme === 'light' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                          }`}
                        >
                          <div className="w-12 h-12 bg-white border rounded-lg flex items-center justify-center">
                            ☀️
                          </div>
                          <span className="text-sm font-medium">Claro</span>
                        </button>
                        <button
                          onClick={() => setPreferences({ ...preferences, theme: 'dark' })}
                          className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 ${
                            preferences.theme === 'dark' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                          }`}
                        >
                          <div className="w-12 h-12 bg-gray-800 border rounded-lg flex items-center justify-center">
                            🌙
                          </div>
                          <span className="text-sm font-medium">Escuro</span>
                        </button>
                      </div>
                    </div>

                    {/* Language */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">🌍 Idioma e Região</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Idioma</label>
                          <select
                            value={preferences.language}
                            onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg"
                          >
                            <option value="pt-BR">🇧🇷 Português (Brasil)</option>
                            <option value="en-US">🇺🇸 English (US)</option>
                            <option value="es-ES">🇪🇸 Español</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Formato de Data</label>
                          <select
                            value={preferences.dateFormat}
                            onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg"
                          >
                            <option value="DD/MM/YYYY">DD/MM/YYYY (21/10/2025)</option>
                            <option value="MM/DD/YYYY">MM/DD/YYYY (10/21/2025)</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD (2025-10-21)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Formato de Hora</label>
                          <select
                            value={preferences.timeFormat}
                            onChange={(e) => setPreferences({ ...preferences, timeFormat: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg"
                          >
                            <option value="24h">24 horas (14:30)</option>
                            <option value="12h">12 horas (2:30 PM)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Auto Refresh */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">🔄 Atualização Automática</h3>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Atualizar automaticamente</p>
                          <p className="text-xs text-gray-500">Recarregar dados periodicamente</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={preferences.autoRefresh}
                            onChange={(e) => setPreferences({ ...preferences, autoRefresh: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      {preferences.autoRefresh && (
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Intervalo de Atualização (segundos)</label>
                          <input
                            type="number"
                            min="3"
                            max="60"
                            value={preferences.refreshInterval}
                            onChange={(e) => setPreferences({ ...preferences, refreshInterval: parseInt(e.target.value) })}
                            className="w-full px-4 py-2 border rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-6">
                    <button
                      onClick={savePreferences}
                      disabled={loading}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? 'Salvando...' : '💾 Salvar Preferências'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
