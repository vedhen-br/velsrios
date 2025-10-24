const express = require('express')
const { users, leads } = require('./data/mock')
const { v4: uuidv4 } = require('uuid')

const router = express.Router()

// GET /health
router.get('/health', (req, res) => res.json({ ok: true }))

// GET /users
router.get('/users', (req, res) => {
  const simple = users.map(u => ({ id: u.id, name: u.name, role: u.role }))
  res.json(simple)
})

// GET /leads
router.get('/leads', (req, res) => {
  const decorated = leads.map(l => ({ id: l.id, name: l.name, interest: l.interest, assignedTo: l.assignedTo }))
  res.json(decorated)
})

// POST /leads -> create a new lead
router.post('/leads', (req, res) => {
  const { name, phone, interest } = req.body
  if (!phone) return res.status(400).json({ error: 'phone required' })
  const lead = { id: uuidv4(), name: name || null, phone, interest: interest || null, assignedTo: null, createdAt: new Date().toISOString() }
  leads.push(lead)
  res.status(201).json(lead)
})

// POST /distribute -> round-robin assign unassigned leads to users
let lastIndex = 0
router.post('/distribute', (req, res) => {
  // find unassigned leads
  const unassigned = leads.filter(l => !l.assignedTo)

  const userList = users.filter(u => u.role === 'user')
  if (userList.length === 0) return res.status(500).json({ error: 'no users to assign' })

  const assignments = []

  for (const lead of unassigned) {
    // find next available user
    let assigned = null
    for (let i = 0; i < userList.length; i++) {
      lastIndex = (lastIndex + 1) % userList.length
      const candidate = userList[lastIndex]
      if (!candidate.available) continue
      // count active leads
      const activeCount = leads.filter(l => l.assignedTo === candidate.id && l.status !== 'closed').length
      if (candidate.maxLeads && activeCount >= candidate.maxLeads) continue
      assigned = candidate
      break
    }
    if (!assigned) assigned = users.find(u => u.role === 'admin')

    lead.assignedTo = assigned.id
    lead.assignedAt = new Date().toISOString()
    assignments.push({ leadId: lead.id, assignedTo: assigned.id, assignedName: assigned.name })
    console.log(`[distribute] Lead ${lead.id} assigned to ${assigned.name}`)
  }

  res.json({ assigned: assignments })
})

module.exports = router
