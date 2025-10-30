const express = require('express')
const { PrismaClient } = require('@prisma/client')
const { hashPassword, comparePassword } = require('../auth/password')
const { generateToken, authMiddleware, adminOnly } = require('../auth/jwt')
const Distributor = require('../services/distributor')
const aiClassifier = require('../services/aiClassifier')
const whatsappService = require('../services/whatsapp.service')
const whatsappWebService = require('../services/whatsappWeb.service')

const router = express.Router()
const prisma = new PrismaClient()
const distributor = new Distributor(prisma)

// ==================== PUBLIC ROUTES ====================

// Health check
router.get('/health', (req, res) => res.json({ ok: true }))

// Simple ping endpoint (sanity check)
router.get('/ping', (req, res) => {
  res.status(200).json({ pong: true, timestamp: new Date().toISOString() })
})

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email e senha obrigatórios' })

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !comparePassword(password, user.password)) {
    return res.status(401).json({ error: 'Credenciais inválidas' })
  }

  const token = generateToken(user)
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  })
})

// Webhook WhatsApp - Verificação (GET) e Recebimento (POST)
router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode']
  const token = req.query['hub.verify_token']
  const challenge = req.query['hub.challenge']

  const result = whatsappService.verifyWebhook(mode, token, challenge)

  if (result) {
    return res.status(200).send(result)
  }

  res.status(403).send('Forbidden')
})

router.post('/webhook', async (req, res) => {
  try {
    const io = req.app.get('io')

    // Processa webhook real do WhatsApp Cloud API
    const result = await whatsappService.processWebhook(req.body, io)

    if (result.success) {
      return res.status(200).json({ success: true })
    }

    return res.status(400).json({ error: result.error })
  } catch (error) {
    console.error('Erro no webhook:', error)
    res.status(500).json({ error: 'Erro interno' })
  }
})

// ==================== AUTHENTICATED ROUTES ====================

router.use(authMiddleware)

// Get current user
router.get('/me', async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true, role: true, phone: true, available: true, maxLeads: true, data: true }
  })

  // Permissões via JSON (admin tem todas)
  let permissions = { canDeleteConversation: false, canTransferLead: false, canToggleAI: false }
  try {
    const parsed = JSON.parse(user?.data || '{}')
    permissions = { ...permissions, ...(parsed?.permissions || {}) }
  } catch { }
  if (user.role === 'admin') {
    permissions = { canDeleteConversation: true, canTransferLead: true, canToggleAI: true }
  }

  const { data, ...rest } = user || {}
  res.json({ ...rest, permissions })
})

// Get dashboard stats
router.get('/leads/stats', async (req, res) => {
  try {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // Total de leads
    const totalLeads = await prisma.lead.count()

    // Leads de hoje
    const todayLeads = await prisma.lead.count({
      where: {
        createdAt: { gte: today }
      }
    })

    // Agentes online (usuarios ativos/disponíveis)
    const onlineAgents = await prisma.user.count({
      where: {
        available: true,
        role: { not: 'admin' }
      }
    })

    // Leads em atendimento (stages ativos)
    const inProgress = await prisma.lead.count({
      where: {
        stage: { in: ['contacted', 'qualified', 'proposal', 'negotiation'] }
      }
    })

    // Leads convertidos (fechados)
    const converted = await prisma.lead.count({
      where: {
        stage: 'closed'
      }
    })

    res.json({
      totalLeads,
      todayLeads,
      onlineAgents,
      inProgress,
      converted
    })
  } catch (error) {
    console.error('Erro ao buscar stats:', error)
    res.status(500).json({ error: 'Erro ao buscar estatísticas' })
  }
})

// List users (admin ou próprio perfil)
router.get('/users', async (req, res) => {
  // Admin sempre vê todos
  if (req.user.role === 'admin') {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, available: true, maxLeads: true, createdAt: true, data: true }
    })
    return res.json(users)
  }

  // Usuário com permissão de transferir também pode listar todos
  const me = await prisma.user.findUnique({ where: { id: req.user.id } })
  let canTransfer = false
  try {
    const parsed = JSON.parse(me?.data || '{}')
    canTransfer = !!parsed?.permissions?.canTransferLead
  } catch { }

  if (canTransfer) {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, available: true, data: true }
    })
    return res.json(users)
  }

  // Caso contrário, vê apenas o próprio perfil
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true, role: true, data: true }
  })
  res.json([user])
})

// List leads (user vê só os seus, admin vê todos)
// List leads (CRM):
// - Admin vê todos
// - Usuário comum vê só os leads criados manualmente por ele (origin = 'manual' e assignedTo = user.id)
router.get('/leads', async (req, res) => {
  const { stage, priority, assignedTo } = req.query
  let where = {}
  if (req.user.role === 'admin') {
    // Admin vê todos (mas por padrão ocultamos telefones claramente inválidos)
  } else {
    // Usuário comum vê só os leads criados manualmente por ele
    where = {
      origin: 'manual',
      assignedTo: req.user.id
    }
  }
  if (stage) where.stage = stage
  if (priority) where.priority = priority
  if (assignedTo && req.user.role === 'admin') where.assignedTo = assignedTo

  const leads = await prisma.lead.findMany({
    where,
    include: {
      assignedUser: { select: { id: true, name: true, email: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      tasks: { where: { completed: false } },
      _count: { select: { messages: true, tasks: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
  res.json(leads)
})

// By default hide leads with invalid phone formats (too long/short) unless explicitly requested
// If admin provides showInvalid=true, returns all
router.get('/leads/raw', async (req, res) => {
  try {
    const showInvalid = String(req.query.showInvalid).toLowerCase() === 'true'
    const leads = await prisma.lead.findMany({
      include: { assignedUser: true }
    })
    if (showInvalid) return res.json(leads)
    const filtered = leads.filter(l => /^\d{10,15}$/.test(String(l.phone || '')))
    res.json(filtered)
  } catch (e) {
    res.status(500).json({ error: 'Erro ao buscar leads' })
  }
})

// List leads for atendimento (chat interface) — definido ANTES de /leads/:id para evitar conflito
router.get('/leads/atendimento', async (req, res) => {
  try {
    const { stage, assignedTo, origin, inboundOnly, channel } = req.query

    let where = {}

    // Se não é admin, vê apenas os próprios leads
    if (req.user.role !== 'admin') {
      where.assignedTo = req.user.id
    }

    // Filtros opcionais
    if (stage) where.stage = stage
    if (assignedTo && req.user.role === 'admin') where.assignedTo = assignedTo
    // Atendimento deve listar por padrão somente conversas do WhatsApp
    where.origin = origin || 'whatsapp'

    // Filtrar apenas leads que já receberam mensagem (inbound)
    if (String(inboundOnly).toLowerCase() === 'true') {
      where.messages = {
        some: { direction: 'incoming' }
      }
    }

    // Filtrar apenas leads que iniciaram via QR (Baileys)
    // Heurística: mensagens recebidas via Cloud API possuem whatsappId; via Baileys geralmente não salvamos whatsappId
    if ((channel || '').toLowerCase() === 'qr') {
      where.messages = {
        some: { direction: 'incoming', whatsappId: null }
      }
    }

    let leads = await prisma.lead.findMany({
      where,
      include: {
        assignedUser: { select: { id: true, name: true, email: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1 // Apenas a última mensagem para a lista
        },
        tasks: { where: { completed: false } },
        _count: { select: { messages: true, tasks: true } }
      },
      orderBy: {
        updatedAt: 'desc' // Mais recentemente atualizados primeiro
      }
    })

    // Filtra números inválidos (evitar "números aleatórios" com mais de 15 dígitos)
    const isValidPhone = (p) => /^\d{10,15}$/.test(String(p || ''))
    leads = leads.filter(l => isValidPhone(l.phone))

    // Adicionar campo de última interação
    const leadsWithLastInteraction = leads.map(lead => ({
      ...lead,
      lastInteraction: lead.messages[0]?.createdAt || lead.updatedAt
    }))

    res.json(leadsWithLastInteraction)
  } catch (error) {
    console.error('Erro ao buscar leads para atendimento:', error)
    res.status(500).json({ error: 'Erro ao buscar leads' })
  }
})

// Get single lead
// Use numeric id to avoid conflicting with fixed subpaths like '/leads/atendimento'
router.get('/leads/:id', async (req, res) => {
  const lead = await prisma.lead.findUnique({
    where: { id: req.params.id },
    include: {
      assignedUser: true,
      messages: { orderBy: { createdAt: 'asc' } },
      logs: { orderBy: { createdAt: 'desc' } },
      tasks: true,
      tags: true
    }
  })
  if (!lead) return res.status(404).json({ error: 'Lead não encontrado' })
  // Usuário comum pode acessar leads atribuídos a ele (origin manual ou whatsapp)
  if (req.user.role !== 'admin' && lead.assignedTo !== req.user.id) {
    return res.status(403).json({ error: 'Acesso negado' })
  }
  res.json(lead)
})

// Create lead (admin ou webhook)
// Create lead (admin ou usuário comum)
router.post('/leads', async (req, res) => {
  const { name, phone, email, interest, origin } = req.body
  if (!phone) return res.status(400).json({ error: 'phone obrigatório' })
  // Admin pode criar lead manual para qualquer usuário ou para si mesmo
  let assignedTo = req.user.id
  if (req.user.role === 'admin' && req.body.assignedTo) {
    assignedTo = req.body.assignedTo
  }
  const lead = await prisma.lead.create({
    data: {
      name,
      phone,
      email,
      interest,
      origin: origin || 'manual',
      stage: 'new',
      status: 'open',
      assignedTo
    }
  })
  await prisma.leadLog.create({
    data: { leadId: lead.id, action: 'created', message: `Lead criado manualmente por ${req.user.name}` }
  })
  // Notificar via socket (novo lead)
  try {
    const io = req.app.get('io')
    if (io) {
      io.emit('lead:new', { lead, userId: assignedTo })
    }
  } catch (e) {
    // ignore
  }
  res.status(201).json(lead)
})

// Update lead
router.patch('/leads/:id', async (req, res) => {
  const { stage, status, notes, priority, interest } = req.body
  const lead = await prisma.lead.findUnique({ where: { id: req.params.id } })
  if (!lead) return res.status(404).json({ error: 'Lead não encontrado' })
  // Usuário comum pode editar se for o responsável (assignedTo)
  if (req.user.role !== 'admin' && lead.assignedTo !== req.user.id) {
    return res.status(403).json({ error: 'Acesso negado' })
  }
  const updateData = { stage, status, notes, priority, interest }
  // Permite transferência de lead (admin)
  if (req.user.role === 'admin' && req.body.assignedTo) {
    updateData.assignedTo = req.body.assignedTo
  }
  const updated = await prisma.lead.update({
    where: { id: req.params.id },
    data: updateData
  })
  await prisma.leadLog.create({
    data: { leadId: lead.id, action: 'updated', message: `Lead atualizado por ${req.user.name}` }
  })
  res.json(updated)
})

// Assign lead to current user ("assumir lead")
router.patch('/leads/:id/assign/self', async (req, res) => {
  const lead = await prisma.lead.findUnique({ where: { id: req.params.id } })
  if (!lead) return res.status(404).json({ error: 'Lead não encontrado' })

  // Admin sempre pode assumir; user comum pode assumir se estiver sem responsável ou já for o responsável
  if (req.user.role !== 'admin' && lead.assignedTo && lead.assignedTo !== req.user.id) {
    return res.status(403).json({ error: 'Apenas admin pode reassumir de outro usuário' })
  }

  const updated = await prisma.lead.update({
    where: { id: req.params.id },
    data: { assignedTo: req.user.id }
  })

  await prisma.leadLog.create({
    data: { leadId: lead.id, userId: req.user.id, action: 'assigned', message: `Lead assumido por ${req.user.name}` }
  })

  res.json(updated)
})

// Attach tag to lead
router.post('/leads/:id/tags', async (req, res) => {
  try {
    const { tagId, name, color } = req.body
    const lead = await prisma.lead.findUnique({ where: { id: req.params.id } })
    if (!lead) return res.status(404).json({ error: 'Lead não encontrado' })

    // Permissões: admin ou responsável pelo lead
    if (req.user.role !== 'admin' && lead.assignedTo !== req.user.id) {
      return res.status(403).json({ error: 'Acesso negado' })
    }

    let tId = tagId
    if (!tId) {
      // cria tag se não existir
      const existing = await prisma.tag.findUnique({ where: { name } })
      const tag = existing || await prisma.tag.create({ data: { name, color: color || '#3B82F6' } })
      tId = tag.id
    }

    const updated = await prisma.lead.update({
      where: { id: req.params.id },
      data: { tags: { connect: { id: tId } } },
      include: { tags: true }
    })
    res.json(updated.tags)
  } catch (e) {
    res.status(400).json({ error: 'Erro ao adicionar tag' })
  }
})

// Detach tag from lead
router.delete('/leads/:id/tags/:tagId', async (req, res) => {
  try {
    const lead = await prisma.lead.findUnique({ where: { id: req.params.id } })
    if (!lead) return res.status(404).json({ error: 'Lead não encontrado' })
    if (req.user.role !== 'admin' && lead.assignedTo !== req.user.id) {
      return res.status(403).json({ error: 'Acesso negado' })
    }
    const updated = await prisma.lead.update({
      where: { id: req.params.id },
      data: { tags: { disconnect: { id: req.params.tagId } } },
      include: { tags: true }
    })
    res.json(updated.tags)
  } catch (e) {
    res.status(400).json({ error: 'Erro ao remover tag' })
  }
})

// Send message
router.post('/leads/:id/messages', async (req, res) => {
  const { text } = req.body
  if (!text) return res.status(400).json({ error: 'text obrigatório' })

  const lead = await prisma.lead.findUnique({ where: { id: req.params.id } })
  if (!lead) return res.status(404).json({ error: 'Lead não encontrado' })

  if (req.user.role !== 'admin' && lead.assignedTo !== req.user.id) {
    return res.status(403).json({ error: 'Acesso negado' })
  }

  const io = req.app.get('io')

  // Ordem de envio baseada na preferência salva (auto|qr|cloud)
  // Default agora é 'cloud' (pode ser alterado nas Configurações)
  let prefer = 'cloud'
  try {
    const admin = await prisma.user.findFirst({ where: { role: 'admin' }, select: { data: true } })
    const data = JSON.parse(admin?.data || '{}')
    prefer = data.whatsapp_prefer_channel || prefer
  } catch { }

  // Preferir sessão conforme configuração; sempre com fallback
  let result
  try {
    const sendViaQR = async () => {
      if (whatsappWebService.isConnected && whatsappWebService.isConnected()) {
        try { return await whatsappWebService.sendMessage(lead.phone, text, io, req.params.id) }
        catch (err) { console.warn('Baileys erro:', err?.message || err); return { success: false } }
      }
      return { success: false, error: 'qr-not-connected' }
    }

    const sendViaCloud = async () => await whatsappService.sendMessage(lead.phone, text, io, req.params.id)

    if (prefer === 'cloud') {
      result = await sendViaCloud(); if (!result?.success) result = await sendViaQR()
    } else if (prefer === 'qr') {
      result = await sendViaQR(); if (!result?.success) result = await sendViaCloud()
    } else {
      // auto: QR primeiro se conectado, depois Cloud
      result = await sendViaQR(); if (!result?.success) result = await sendViaCloud()
    }
  } catch (e) {
    console.error('Erro no envio de mensagem:', e)
    return res.status(500).json({ error: 'Erro ao enviar mensagem' })
  }

  if (result?.success) {
    // Log de atividade
    await prisma.leadLog.create({
      data: {
        leadId: req.params.id,
        userId: req.user.id,
        action: `Mensagem enviada via WhatsApp${result.simulated ? ' (simulada)' : ''}`,
        message: text
      }
    })
    // Notificar via socket
    try {
      const io = req.app.get('io')
      if (io) {
        io.to(`lead_${req.params.id}`).emit('message:new', {
          leadId: req.params.id,
          leadName: lead.name,
          message: result.message
        })
      }
    } catch (e) {
      // ignore
    }
    return res.status(201).json(result.message)
  }

  res.status(500).json({ error: result?.error || 'Erro ao enviar mensagem' })
})

// Delete a message (admin or owner of lead)
router.delete('/leads/:leadId/messages/:messageId', async (req, res) => {
  try {
    const { leadId, messageId } = req.params
    const lead = await prisma.lead.findUnique({ where: { id: leadId } })
    if (!lead) return res.status(404).json({ error: 'Lead não encontrado' })
    if (req.user.role !== 'admin' && lead.assignedTo !== req.user.id) {
      return res.status(403).json({ error: 'Acesso negado' })
    }

    const msg = await prisma.message.findUnique({ where: { id: messageId } })
    if (!msg || msg.leadId !== leadId) return res.status(404).json({ error: 'Mensagem não encontrada' })

    await prisma.message.delete({ where: { id: messageId } })

    try {
      const io = req.app.get('io')
      if (io) io.to(`lead_${leadId}`).emit('message:deleted', { leadId, messageId })
    } catch { }

    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: 'Erro ao excluir mensagem' })
  }
})

// Create task
router.post('/tasks', async (req, res) => {
  const { title, description, dueDate, leadId } = req.body
  if (!title) return res.status(400).json({ error: 'title obrigatório' })

  const task = await prisma.task.create({
    data: {
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : null,
      leadId,
      userId: req.user.id
    }
  })

  res.status(201).json(task)
})

// Toggle task completion
router.patch('/tasks/:id', async (req, res) => {
  const { completed } = req.body

  const task = await prisma.task.update({
    where: { id: req.params.id },
    data: { completed: completed !== undefined ? completed : undefined }
  })

  res.json(task)
})

// Distribute unassigned leads (manual trigger)
router.post('/distribute', adminOnly, async (req, res) => {
  const unassigned = await prisma.lead.findMany({ where: { assignedTo: null, status: 'open' } })

  const assignments = []
  for (const lead of unassigned) {
    const result = await distributor.assignLead(lead.id)
    assignments.push(result)
  }

  res.json({ total: assignments.length, assignments })
})

// Delete lead (admin only)
// Delete lead
router.delete('/leads/:id', async (req, res) => {
  const lead = await prisma.lead.findUnique({ where: { id: req.params.id } })
  if (!lead) return res.status(404).json({ error: 'Lead não encontrado' })
  // Permissões
  if (req.user.role !== 'admin') {
    // Regra 1: usuário pode excluir seus próprios atendimentos do WhatsApp (aba "Meus")
    if (lead.origin === 'whatsapp' && lead.assignedTo === req.user.id) {
      // permitido
    } else {
      // Regra 2 (fallback): precisa de permissão explícita
      const me = await prisma.user.findUnique({ where: { id: req.user.id } })
      let canDelete = false
      try {
        const parsed = JSON.parse(me?.data || '{}')
        canDelete = !!parsed?.permissions?.canDeleteConversation
      } catch { }
      if (!canDelete) {
        return res.status(403).json({ error: 'Acesso negado' })
      }
    }
  }

  await prisma.message.deleteMany({ where: { leadId: req.params.id } })
  await prisma.leadLog.deleteMany({ where: { leadId: req.params.id } })
  await prisma.task.deleteMany({ where: { leadId: req.params.id } })
  await prisma.lead.delete({ where: { id: req.params.id } })
  res.json({ success: true })
})
// (movido acima de /leads/:id)

// Bulk actions (admin only)
router.post('/leads/bulk', adminOnly, async (req, res) => {
  const { action, leadIds, assignTo, tagIds } = req.body

  if (action === 'delete') {
    for (const id of leadIds) {
      await prisma.message.deleteMany({ where: { leadId: id } })
      await prisma.leadLog.deleteMany({ where: { leadId: id } })
      await prisma.task.deleteMany({ where: { leadId: id } })
    }
    await prisma.lead.deleteMany({ where: { id: { in: leadIds } } })
    return res.json({ success: true, deleted: leadIds.length })
  }

  if (action === 'assign') {
    await prisma.lead.updateMany({
      where: { id: { in: leadIds } },
      data: { assignedTo: assignTo }
    })
    return res.json({ success: true, assigned: leadIds.length })
  }

  res.status(400).json({ error: 'Ação inválida' })
})

// Transferir lead para outro usuário (admin ou permissão específica)
router.patch('/leads/:id/assign/:userId', async (req, res) => {
  const lead = await prisma.lead.findUnique({ where: { id: req.params.id } })
  if (!lead) return res.status(404).json({ error: 'Lead não encontrado' })

  let allowed = req.user.role === 'admin'
  if (!allowed) {
    const me = await prisma.user.findUnique({ where: { id: req.user.id } })
    try {
      const parsed = JSON.parse(me?.data || '{}')
      allowed = !!parsed?.permissions?.canTransferLead
    } catch { }
  }
  if (!allowed) return res.status(403).json({ error: 'Acesso negado' })

  const updated = await prisma.lead.update({ where: { id: req.params.id }, data: { assignedTo: req.params.userId } })
  await prisma.leadLog.create({ data: { leadId: lead.id, userId: req.user.id, action: 'transfer', message: `Lead transferido para usuário ${req.params.userId}` } })
  res.json(updated)
})

// Alternar IA por lead
router.patch('/leads/:id/ai', async (req, res) => {
  const { enabled } = req.body
  const lead = await prisma.lead.findUnique({ where: { id: req.params.id } })
  if (!lead) return res.status(404).json({ error: 'Lead não encontrado' })

  // Permissões: admin ou responsável com permissão para alternar IA
  if (req.user.role !== 'admin') {
    if (lead.assignedTo !== req.user.id) return res.status(403).json({ error: 'Acesso negado' })
    const me = await prisma.user.findUnique({ where: { id: req.user.id } })
    let canToggle = false
    try {
      const parsed = JSON.parse(me?.data || '{}')
      canToggle = !!parsed?.permissions?.canToggleAI
    } catch { }
    if (!canToggle) return res.status(403).json({ error: 'Acesso negado' })
  }

  const updated = await prisma.lead.update({ where: { id: req.params.id }, data: { aiEnabled: !!enabled } })
  await prisma.leadLog.create({ data: { leadId: lead.id, userId: req.user.id, action: 'ai', message: `IA ${enabled ? 'ativada' : 'desativada'}` } })
  res.json(updated)
})

// Export leads to CSV (admin only)
router.get('/leads/export/csv', adminOnly, async (req, res) => {
  const leads = await prisma.lead.findMany({
    include: { assignedUser: true }
  })

  let csv = 'ID,Nome,Telefone,Email,Prioridade,Estágio,Status,Responsável,Criado\n'
  leads.forEach(lead => {
    csv += `${lead.id},${lead.name || ''},${lead.phone},${lead.email || ''},${lead.priority},${lead.stage},${lead.status},${lead.assignedUser?.name || ''},${lead.createdAt}\n`
  })

  res.header('Content-Type', 'text/csv')
  res.attachment('leads.csv')
  res.send(csv)
})

// List all tasks
router.get('/tasks', async (req, res) => {
  const where = req.user.role === 'admin' ? {} : { userId: req.user.id }

  const tasks = await prisma.task.findMany({
    where,
    include: {
      lead: { select: { id: true, name: true, phone: true } },
      user: { select: { id: true, name: true } }
    },
    orderBy: { dueDate: 'asc' }
  })

  res.json(tasks)
})

// Delete task
router.delete('/tasks/:id', async (req, res) => {
  const task = await prisma.task.findUnique({ where: { id: req.params.id } })
  if (!task) return res.status(404).json({ error: 'Tarefa não encontrada' })

  if (req.user.role !== 'admin' && task.userId !== req.user.id) {
    return res.status(403).json({ error: 'Acesso negado' })
  }

  await prisma.task.delete({ where: { id: req.params.id } })
  res.json({ success: true })
})

// Tags endpoints
router.get('/tags', async (req, res) => {
  const tags = await prisma.tag.findMany()
  res.json(tags)
})

router.post('/tags', adminOnly, async (req, res) => {
  const { name, color } = req.body
  if (!name) return res.status(400).json({ error: 'name obrigatório' })

  const tag = await prisma.tag.create({
    data: { name, color: color || '#gray' }
  })
  res.status(201).json(tag)
})

router.delete('/tags/:id', adminOnly, async (req, res) => {
  await prisma.tag.delete({ where: { id: req.params.id } })
  res.json({ success: true })
})

// Reports (admin only)
router.get('/reports/overview', adminOnly, async (req, res) => {
  const totalLeads = await prisma.lead.count()
  const openLeads = await prisma.lead.count({ where: { status: 'open' } })
  const closedLeads = await prisma.lead.count({ where: { status: 'closed' } })

  const byPriority = await prisma.lead.groupBy({
    by: ['priority'],
    _count: true
  })

  const byStage = await prisma.lead.groupBy({
    by: ['stage'],
    _count: true
  })

  const byUser = await prisma.lead.groupBy({
    by: ['assignedTo'],
    _count: true
  })

  res.json({
    totalLeads,
    openLeads,
    closedLeads,
    byPriority,
    byStage,
    byUser
  })
})

// Advanced reports with date filters
router.get('/reports/analytics', adminOnly, async (req, res) => {
  const { startDate, endDate } = req.query

  const dateFilter = {}
  if (startDate) dateFilter.gte = new Date(startDate)
  if (endDate) dateFilter.lte = new Date(endDate)

  const where = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}

  // Leads por dia
  const leads = await prisma.lead.findMany({
    where,
    select: { createdAt: true, stage: true, assignedTo: true }
  })

  // Taxa de conversão por estágio
  const conversionRates = {
    new: leads.length,
    contacted: leads.filter(l => ['contacted', 'qualified', 'proposal', 'negotiation', 'closed'].includes(l.stage)).length,
    qualified: leads.filter(l => ['qualified', 'proposal', 'negotiation', 'closed'].includes(l.stage)).length,
    proposal: leads.filter(l => ['proposal', 'negotiation', 'closed'].includes(l.stage)).length,
    negotiation: leads.filter(l => ['negotiation', 'closed'].includes(l.stage)).length,
    closed: leads.filter(l => l.stage === 'closed').length
  }

  // Leads por usuário
  const leadsByUser = {}
  leads.forEach(lead => {
    const userId = lead.assignedTo || 'unassigned'
    leadsByUser[userId] = (leadsByUser[userId] || 0) + 1
  })

  res.json({
    totalLeads: leads.length,
    conversionRates,
    leadsByUser
  })
})

// Update user (admin only)
router.patch('/users/:id', adminOnly, async (req, res) => {
  const { available, maxLeads, role, permissions } = req.body

  // Merge permissions into data JSON if provided
  let dataUpdate = undefined
  if (permissions) {
    const current = await prisma.user.findUnique({ where: { id: req.params.id }, select: { data: true } })
    let json = {}
    try { json = JSON.parse(current?.data || '{}') } catch { }
    json.permissions = { ...(json.permissions || {}), ...permissions }
    dataUpdate = JSON.stringify(json)
  }

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { available, maxLeads, role, data: dataUpdate !== undefined ? dataUpdate : undefined }
  })

  res.json(user)
})

// Update own profile
router.patch('/users/profile', async (req, res) => {
  const { name, email, phone, avatar, bio, timezone } = req.body

  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, email, phone, avatar, bio, timezone },
      select: { id: true, name: true, email: true, role: true, phone: true, avatar: true, bio: true, timezone: true }
    })

    res.json(user)
  } catch (error) {
    res.status(400).json({ error: 'Erro ao atualizar perfil' })
  }
})

// Change password
router.post('/users/change-password', async (req, res) => {
  const { currentPassword, newPassword } = req.body

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Senhas obrigatórias' })
  }

  const user = await prisma.user.findUnique({ where: { id: req.user.id } })

  if (!comparePassword(currentPassword, user.password)) {
    return res.status(401).json({ error: 'Senha atual incorreta' })
  }

  const hashedPassword = hashPassword(newPassword)

  await prisma.user.update({
    where: { id: req.user.id },
    data: { password: hashedPassword }
  })

  res.json({ success: true, message: 'Senha alterada com sucesso' })
})

// Update notification preferences
router.patch('/users/notifications', async (req, res) => {
  const { emailNewLead, emailNewMessage, emailTaskDue, pushNewLead, pushNewMessage, soundEnabled } = req.body

  // Store in user data/preferences (you can extend User model or use JSON field)
  await prisma.user.update({
    where: { id: req.user.id },
    data: {
      data: JSON.stringify({
        notifications: { emailNewLead, emailNewMessage, emailTaskDue, pushNewLead, pushNewMessage, soundEnabled }
      })
    }
  })

  res.json({ success: true })
})

// Update preferences
router.patch('/users/preferences', async (req, res) => {
  const { theme, language, dateFormat, timeFormat, autoRefresh, refreshInterval } = req.body

  // Store in user data/preferences
  const currentData = JSON.parse(req.user.data || '{}')
  currentData.preferences = { theme, language, dateFormat, timeFormat, autoRefresh, refreshInterval }

  await prisma.user.update({
    where: { id: req.user.id },
    data: { data: JSON.stringify(currentData) }
  })

  res.json({ success: true })
})

// ==================== ADMIN WHATSAPP SETTINGS ====================

// Get WhatsApp settings (admin only)
router.get('/whatsapp/settings', adminOnly, async (req, res) => {
  try {
    const admin = await prisma.user.findFirst({
      where: { role: 'admin' },
      select: { data: true }
    })

    const data = JSON.parse(admin?.data || '{}')

    res.json({
      phoneNumberId: data.whatsapp_phone_number_id || '',
      accessToken: data.whatsapp_access_token ? '***CONFIGURADO***' : '',
      verifyToken: data.whatsapp_verify_token || 'lead_campanha_webhook_token_2025',
      // Preferência padrão: 'cloud' — administrador pode mudar na UI
      preferChannel: data.whatsapp_prefer_channel || 'cloud', // auto | qr | cloud
      isConfigured: !!(data.whatsapp_phone_number_id && data.whatsapp_access_token)
    })
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar configurações' })
  }
})

// Update WhatsApp settings (admin only)
router.patch('/whatsapp/settings', adminOnly, async (req, res) => {
  try {
    const { phoneNumberId, accessToken, verifyToken, preferChannel } = req.body

    const admin = await prisma.user.findFirst({ where: { role: 'admin' } })
    const currentData = JSON.parse(admin?.data || '{}')

    // Atualizar configurações
    if (phoneNumberId !== undefined) currentData.whatsapp_phone_number_id = phoneNumberId
    if (accessToken !== undefined) currentData.whatsapp_access_token = accessToken
    if (verifyToken !== undefined) currentData.whatsapp_verify_token = verifyToken
    if (preferChannel !== undefined) currentData.whatsapp_prefer_channel = preferChannel

    await prisma.user.update({
      where: { id: admin.id },
      data: { data: JSON.stringify(currentData) }
    })

    // Recarregar configurações no serviço
    await whatsappService.loadConfig()

    res.json({
      success: true,
      message: 'Configurações do WhatsApp atualizadas com sucesso'
    })
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar configurações' })
  }
})

// Global application settings (admin)
router.get('/settings', adminOnly, async (req, res) => {
  try {
    const admin = await prisma.user.findFirst({ where: { role: 'admin' }, select: { data: true } })
    const data = JSON.parse(admin?.data || '{}')
    // Return sensible defaults
    res.json({
      distribution: data.distribution || { enabled: true, algorithm: 'round-robin', delaySeconds: 0 },
      ai: data.ai || { enabled: true, autoResponse: true, priorityKeywords: ['comprar', 'urgente', 'quero'] }
    })
  } catch (e) {
    res.status(500).json({ error: 'Erro ao carregar configurações' })
  }
})

router.patch('/settings', adminOnly, async (req, res) => {
  try {
    const { distribution, ai } = req.body
    const admin = await prisma.user.findFirst({ where: { role: 'admin' } })
    const current = JSON.parse(admin?.data || '{}')
    if (distribution !== undefined) current.distribution = distribution
    if (ai !== undefined) current.ai = ai
    await prisma.user.update({ where: { id: admin.id }, data: { data: JSON.stringify(current) } })
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: 'Erro ao salvar configurações' })
  }
})

// Test WhatsApp connection (admin only)
router.post('/whatsapp/test', adminOnly, async (req, res) => {
  try {
    const { phoneNumber } = req.body

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Número de telefone obrigatório' })
    }

    const result = await whatsappService.sendMessage(
      phoneNumber,
      '🎉 Teste de conexão WhatsApp Cloud API - Lead Campanha CRM',
      null,
      null
    )

    if (result.success && !result.simulated) {
      res.json({
        success: true,
        message: 'Mensagem de teste enviada com sucesso!'
      })
    } else if (result.simulated) {
      res.json({
        success: false,
        message: 'WhatsApp não configurado. Configure Phone Number ID e Access Token.'
      })
    } else {
      res.status(500).json({
        error: 'Erro ao enviar mensagem de teste'
      })
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ==================== WHATSAPP WEB (QR) - SIMULATED SESSION ====================

// Start WhatsApp Web simulated session (admin only)
router.post('/whatsapp/web/start', adminOnly, async (req, res) => {
  try {
    const io = req.app.get('io')
    const result = await whatsappWebService.startSession(io)
    res.json(result)
  } catch (error) {
    console.error('Erro ao iniciar sessão WhatsApp Web:', error?.stack || error?.message || error)
    res.status(500).json({ error: error?.message || 'Erro ao iniciar sessão WhatsApp Web' })
  }
})

// Get status of WhatsApp Web simulated session (admin only)
router.get('/whatsapp/web/status', adminOnly, async (req, res) => {
  try {
    const status = whatsappWebService.getStatus()
    res.json(status)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao consultar status WhatsApp Web' })
  }
})

// Disconnect WhatsApp Web simulated session (admin only)
router.post('/whatsapp/web/disconnect', adminOnly, async (req, res) => {
  try {
    whatsappWebService.disconnect()
    const io = req.app.get('io')
    if (io) io.emit('whatsapp:web:status', { status: 'disconnected' })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Erro ao desconectar WhatsApp Web' })
  }
})

// Reset WhatsApp Web session (clear creds and force new QR) — admin only
router.post('/whatsapp/web/reset', adminOnly, async (req, res) => {
  try {
    const io = req.app.get('io')
    const result = await whatsappWebService.resetSession(io)
    res.json(result)
  } catch (error) {
    console.error('Erro ao resetar sessão WhatsApp Web:', error?.stack || error?.message || error)
    res.status(500).json({ error: error?.message || 'Erro ao resetar sessão WhatsApp Web' })
  }
})

module.exports = router

// ==================== MAINTENANCE (ADMIN) ====================
// Pequena rotina de limpeza para remover leads inválidos e mensagens antigas não suportadas
// Recomendado executar apenas quando solicitado; protegido por adminOnly no app principal (este arquivo já usa authMiddleware acima).
router.post('/maintenance/cleanup', adminOnly, async (req, res) => {
  try {
    const removeUnsupported = req.body?.removeUnsupported !== false
    const removeInvalidLeads = req.body?.removeInvalidLeads !== false

    const result = { removedUnsupportedMessages: 0, removedInvalidLeads: 0 }

    if (removeUnsupported) {
      const del = await prisma.message.deleteMany({ where: { text: '[mensagem não suportada]' } })
      result.removedUnsupportedMessages = del.count
    }

    if (removeInvalidLeads) {
      // Busca leads e filtra por JS (regex 10-15 dígitos)
      const all = await prisma.lead.findMany({ select: { id: true, phone: true } })
      const invalid = all.filter(l => !/^\d{10,15}$/.test(String(l.phone || '')))
      for (const l of invalid) {
        try {
          await prisma.message.deleteMany({ where: { leadId: l.id } })
          await prisma.leadLog.deleteMany({ where: { leadId: l.id } })
          await prisma.task.deleteMany({ where: { leadId: l.id } })
          await prisma.lead.delete({ where: { id: l.id } })
          result.removedInvalidLeads++
        } catch (e) {
          // continua limpando os demais
        }
      }
    }

    res.json({ success: true, ...result })
  } catch (e) {
    res.status(500).json({ error: 'Erro ao executar limpeza' })
  }
})
