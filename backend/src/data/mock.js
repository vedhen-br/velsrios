// Simulated data store (in-memory)
const users = [
  { id: 'u1', name: 'Administrador', role: 'admin' },
  { id: 'u2', name: 'Usuario 1', role: 'user', available: true, maxLeads: 30 },
  { id: 'u3', name: 'Usuario 2', role: 'user', available: true, maxLeads: 30 },
  { id: 'u4', name: 'Usuario 3', role: 'user', available: true, maxLeads: 30 },
  { id: 'u5', name: 'Usuario 4', role: 'user', available: true, maxLeads: 30 },
  { id: 'u6', name: 'Usuario 5', role: 'user', available: true, maxLeads: 30 }
]

const leads = []

module.exports = { users, leads }
