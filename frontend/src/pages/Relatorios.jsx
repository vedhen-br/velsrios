import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import { getApiUrl } from '../utils/env'

export default function Relatorios() {
  const { token } = useAuth()
  const [overview, setOverview] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })

  const API_URL = getApiUrl()

  useEffect(() => {
    fetchOverview()
    fetchAnalytics()
  }, [])

  const fetchOverview = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API_URL}/reports/overview`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setOverview(res.data)
    } catch (error) {
      console.error('Erro ao buscar overview:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const params = {}
      if (dateRange.startDate) params.startDate = dateRange.startDate
      if (dateRange.endDate) params.endDate = dateRange.endDate

      const res = await axios.get(`${API_URL}/reports/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      })
      setAnalytics(res.data)
    } catch (error) {
      console.error('Erro ao buscar analytics:', error)
    }
  }

  const applyDateFilter = () => {
    fetchAnalytics()
  }

  const clearDateFilter = () => {
    setDateRange({ startDate: '', endDate: '' })
    setTimeout(() => fetchAnalytics(), 100)
  }

  const getConversionRate = (current, total) => {
    if (!total) return 0
    return ((current / total) * 100).toFixed(1)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">📊 Relatórios e Indicadores</h1>
              <p className="text-gray-600">Análise de performance e conversão</p>
            </div>
          </div>

          {/* Filtro de Data */}
          <div className="flex items-end gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="px-3 py-2 border rounded-lg"
              />
            </div>
            <button
              onClick={applyDateFilter}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Aplicar Filtro
            </button>
            <button
              onClick={clearDateFilter}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Limpar
            </button>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-gray-600">Carregando relatórios...</p>
          </div>
        ) : (
          <>
            {/* KPIs Principais */}
            {overview && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Total de Leads</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{overview.totalLeads}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                      👥
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Leads Abertos</p>
                      <p className="text-3xl font-bold text-blue-600 mt-1">{overview.openLeads}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                      📂
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Leads Fechados</p>
                      <p className="text-3xl font-bold text-green-600 mt-1">{overview.closedLeads}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl">
                      ✅
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Taxa de Conversão</p>
                      <p className="text-3xl font-bold text-purple-600 mt-1">
                        {getConversionRate(overview.closedLeads, overview.totalLeads)}%
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl">
                      📈
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Funil de Conversão */}
            {analytics && analytics.conversionRates && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">🔄 Funil de Conversão</h2>

                <div className="space-y-4">
                  {/* Novo */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-700">1. Novo</span>
                      <span className="font-bold text-gray-900">{analytics.conversionRates.new}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-8">
                      <div
                        className="bg-blue-600 h-8 rounded-full flex items-center justify-end pr-3 text-white text-sm font-medium"
                        style={{ width: '100%' }}
                      >
                        100%
                      </div>
                    </div>
                  </div>

                  {/* Contactado */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-700">2. Contactado</span>
                      <span className="font-bold text-gray-900">{analytics.conversionRates.contacted}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-8">
                      <div
                        className="bg-blue-500 h-8 rounded-full flex items-center justify-end pr-3 text-white text-sm font-medium"
                        style={{
                          width: `${getConversionRate(analytics.conversionRates.contacted, analytics.conversionRates.new)}%`,
                          minWidth: '60px'
                        }}
                      >
                        {getConversionRate(analytics.conversionRates.contacted, analytics.conversionRates.new)}%
                      </div>
                    </div>
                  </div>

                  {/* Qualificado */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-700">3. Qualificado</span>
                      <span className="font-bold text-gray-900">{analytics.conversionRates.qualified}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-8">
                      <div
                        className="bg-yellow-500 h-8 rounded-full flex items-center justify-end pr-3 text-white text-sm font-medium"
                        style={{
                          width: `${getConversionRate(analytics.conversionRates.qualified, analytics.conversionRates.new)}%`,
                          minWidth: '60px'
                        }}
                      >
                        {getConversionRate(analytics.conversionRates.qualified, analytics.conversionRates.new)}%
                      </div>
                    </div>
                  </div>

                  {/* Proposta */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-700">4. Proposta</span>
                      <span className="font-bold text-gray-900">{analytics.conversionRates.proposal}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-8">
                      <div
                        className="bg-orange-500 h-8 rounded-full flex items-center justify-end pr-3 text-white text-sm font-medium"
                        style={{
                          width: `${getConversionRate(analytics.conversionRates.proposal, analytics.conversionRates.new)}%`,
                          minWidth: '60px'
                        }}
                      >
                        {getConversionRate(analytics.conversionRates.proposal, analytics.conversionRates.new)}%
                      </div>
                    </div>
                  </div>

                  {/* Negociação */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-700">5. Negociação</span>
                      <span className="font-bold text-gray-900">{analytics.conversionRates.negotiation}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-8">
                      <div
                        className="bg-purple-500 h-8 rounded-full flex items-center justify-end pr-3 text-white text-sm font-medium"
                        style={{
                          width: `${getConversionRate(analytics.conversionRates.negotiation, analytics.conversionRates.new)}%`,
                          minWidth: '60px'
                        }}
                      >
                        {getConversionRate(analytics.conversionRates.negotiation, analytics.conversionRates.new)}%
                      </div>
                    </div>
                  </div>

                  {/* Fechado */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-700">6. Fechado</span>
                      <span className="font-bold text-gray-900">{analytics.conversionRates.closed}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-8">
                      <div
                        className="bg-green-600 h-8 rounded-full flex items-center justify-end pr-3 text-white text-sm font-medium"
                        style={{
                          width: `${getConversionRate(analytics.conversionRates.closed, analytics.conversionRates.new)}%`,
                          minWidth: '60px'
                        }}
                      >
                        {getConversionRate(analytics.conversionRates.closed, analytics.conversionRates.new)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Leads por Prioridade */}
            {overview && overview.byPriority && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">🎯 Leads por Prioridade</h2>
                <div className="grid grid-cols-3 gap-4">
                  {overview.byPriority.map(item => (
                    <div key={item.priority} className="text-center p-4 border rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">
                        {item.priority === 'high' && '🔴 Alta'}
                        {item.priority === 'medium' && '🟡 Média'}
                        {item.priority === 'low' && '⚪ Baixa'}
                      </p>
                      <p className="text-3xl font-bold text-gray-900">{item._count}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Leads por Estágio */}
            {overview && overview.byStage && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Leads por Estágio</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {overview.byStage.map(item => (
                    <div key={item.stage} className="p-4 border rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">
                        {item.stage === 'new' && 'Novo'}
                        {item.stage === 'contacted' && 'Contactado'}
                        {item.stage === 'qualified' && 'Qualificado'}
                        {item.stage === 'proposal' && 'Proposta'}
                        {item.stage === 'negotiation' && 'Negociação'}
                        {item.stage === 'closed' && 'Fechado'}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">{item._count}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Leads por Usuário */}
            {analytics && analytics.leadsByUser && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">👥 Performance por Usuário</h2>
                <div className="space-y-3">
                  {Object.entries(analytics.leadsByUser)
                    .sort(([, a], [, b]) => b - a)
                    .map(([userId, count]) => (
                      <div key={userId} className="flex items-center gap-4">
                        <div className="w-32 text-sm font-medium text-gray-700">
                          {userId === 'unassigned' ? 'Não Atribuído' : `Usuário ${userId.slice(0, 8)}`}
                        </div>
                        <div className="flex-1">
                          <div className="w-full bg-gray-200 rounded-full h-6">
                            <div
                              className="bg-blue-600 h-6 rounded-full flex items-center justify-end pr-2 text-white text-xs font-medium"
                              style={{
                                width: `${(count / analytics.totalLeads) * 100}%`,
                                minWidth: '40px'
                              }}
                            >
                              {count}
                            </div>
                          </div>
                        </div>
                        <div className="w-16 text-right text-sm font-medium text-gray-600">
                          {((count / analytics.totalLeads) * 100).toFixed(1)}%
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
