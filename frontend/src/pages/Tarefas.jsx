import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'

export default function Tarefas() {
  const { user, token } = useAuth()
  const [tasks, setTasks] = useState([])
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState('pending') // pending | completed | all
  
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    leadId: ''
  })

  const API_URL = 'http://localhost:4000/api'

  useEffect(() => {
    fetchTasks()
    fetchLeads()
  }, [])

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTasks(res.data)
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLeads = async () => {
    try {
      const res = await axios.get(`${API_URL}/leads`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setLeads(res.data)
    } catch (error) {
      console.error('Erro ao buscar leads:', error)
    }
  }

  const createTask = async () => {
    try {
      await axios.post(`${API_URL}/tasks`, newTask, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setShowModal(false)
      setNewTask({ title: '', description: '', dueDate: '', leadId: '' })
      fetchTasks()
      alert('Tarefa criada com sucesso!')
    } catch (error) {
      console.error('Erro ao criar tarefa:', error)
      alert('Erro ao criar tarefa')
    }
  }

  const toggleTaskComplete = async (taskId, completed) => {
    try {
      await axios.patch(`${API_URL}/tasks/${taskId}`, {
        completed: !completed
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchTasks()
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error)
    }
  }

  const deleteTask = async (taskId) => {
    if (!confirm('Deseja realmente excluir esta tarefa?')) return
    
    try {
      await axios.delete(`${API_URL}/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchTasks()
      alert('Tarefa excluída com sucesso!')
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error)
      alert('Erro ao excluir tarefa')
    }
  }

  const filteredTasks = tasks.filter(task => {
    if (filterStatus === 'pending') return !task.completed
    if (filterStatus === 'completed') return task.completed
    return true
  })

  const isOverdue = (dueDate) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date() && !tasks.find(t => t.dueDate === dueDate)?.completed
  }

  const getTasksByDate = () => {
    const today = []
    const upcoming = []
    const overdue = []
    const noDueDate = []

    filteredTasks.forEach(task => {
      if (!task.dueDate) {
        noDueDate.push(task)
      } else {
        const dueDate = new Date(task.dueDate)
        const today_date = new Date()
        today_date.setHours(0, 0, 0, 0)
        dueDate.setHours(0, 0, 0, 0)

        if (dueDate < today_date && !task.completed) {
          overdue.push(task)
        } else if (dueDate.getTime() === today_date.getTime()) {
          today.push(task)
        } else {
          upcoming.push(task)
        }
      }
    })

    return { today, upcoming, overdue, noDueDate }
  }

  const taskGroups = getTasksByDate()

  const TaskCard = ({ task }) => (
    <div className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow ${
      task.completed ? 'opacity-60' : ''
    }`}>
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => toggleTaskComplete(task.id, task.completed)}
          className="w-5 h-5 mt-1 cursor-pointer"
        />
        
        <div className="flex-1">
          <h3 className={`font-semibold text-gray-900 ${task.completed ? 'line-through' : ''}`}>
            {task.title}
          </h3>
          
          {task.description && (
            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
          )}
          
          <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
            {task.dueDate && (
              <span className={`flex items-center gap-1 ${
                isOverdue(task.dueDate) && !task.completed ? 'text-red-600 font-medium' : ''
              }`}>
                📅 {new Date(task.dueDate).toLocaleDateString('pt-BR')}
              </span>
            )}
            
            {task.lead && (
              <span className="flex items-center gap-1">
                👤 {task.lead.name || task.lead.phone}
              </span>
            )}
            
            {task.user && (
              <span className="flex items-center gap-1">
                👨‍💼 {task.user.name}
              </span>
            )}
          </div>
        </div>
        
        <button
          onClick={() => deleteTask(task.id)}
          className="text-red-500 hover:text-red-700 text-sm"
        >
          🗑️
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">✅ Tarefas</h1>
              <p className="text-gray-600">Gerencie suas tarefas e follow-ups</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              ➕ Nova Tarefa
            </button>
          </div>

          {/* Filtros */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-4 py-2 rounded-lg ${
                filterStatus === 'pending'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pendentes ({tasks.filter(t => !t.completed).length})
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-4 py-2 rounded-lg ${
                filterStatus === 'completed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Concluídas ({tasks.filter(t => t.completed).length})
            </button>
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg ${
                filterStatus === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todas ({tasks.length})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-gray-600">Carregando...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
            {filterStatus === 'pending' && 'Nenhuma tarefa pendente'}
            {filterStatus === 'completed' && 'Nenhuma tarefa concluída'}
            {filterStatus === 'all' && 'Nenhuma tarefa cadastrada'}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Atrasadas */}
            {taskGroups.overdue.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-red-600 mb-3">
                  🚨 Atrasadas ({taskGroups.overdue.length})
                </h2>
                <div className="space-y-2">
                  {taskGroups.overdue.map(task => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </div>
            )}

            {/* Hoje */}
            {taskGroups.today.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-blue-600 mb-3">
                  📅 Hoje ({taskGroups.today.length})
                </h2>
                <div className="space-y-2">
                  {taskGroups.today.map(task => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </div>
            )}

            {/* Próximas */}
            {taskGroups.upcoming.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-3">
                  📆 Próximas ({taskGroups.upcoming.length})
                </h2>
                <div className="space-y-2">
                  {taskGroups.upcoming.map(task => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </div>
            )}

            {/* Sem Data */}
            {taskGroups.noDueDate.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-500 mb-3">
                  📋 Sem Data ({taskGroups.noDueDate.length})
                </h2>
                <div className="space-y-2">
                  {taskGroups.noDueDate.map(task => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Estatísticas */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-gray-600 text-sm">Total</p>
            <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-gray-600 text-sm">Pendentes</p>
            <p className="text-2xl font-bold text-blue-600">
              {tasks.filter(t => !t.completed).length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-gray-600 text-sm">Atrasadas</p>
            <p className="text-2xl font-bold text-red-600">
              {taskGroups.overdue.length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-gray-600 text-sm">Concluídas</p>
            <p className="text-2xl font-bold text-green-600">
              {tasks.filter(t => t.completed).length}
            </p>
          </div>
        </div>
      </div>

      {/* Modal Nova Tarefa */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">➕ Nova Tarefa</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Ligar para cliente"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows="3"
                  placeholder="Detalhes da tarefa..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Vencimento</label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lead (opcional)</label>
                <select
                  value={newTask.leadId}
                  onChange={(e) => setNewTask({ ...newTask, leadId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Nenhum lead vinculado</option>
                  {leads.map(lead => (
                    <option key={lead.id} value={lead.id}>
                      {lead.name || lead.phone}
                    </option>
                  ))}
                </select>
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
                onClick={createTask}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                disabled={!newTask.title}
              >
                Criar Tarefa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
