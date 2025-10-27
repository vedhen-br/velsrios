const { hashPassword } = require('../auth/password')

/**
 * Creates initial users if database is empty.
 * Safe by default: does NOT delete data; only runs when there are no users.
 * Controlled by env AUTO_SEED ("true" to enable). Defaults to false in production.
 *
 * Env options:
 * - AUTO_SEED=true            Enable auto seed on startup
 * - ADMIN_EMAIL=...           Admin email (default: admin@leadcampanha.com)
 * - ADMIN_PASSWORD=...        Admin password (default: admin123)
 */
async function autoSeedIfEmpty(prisma) {
  const enabled = String(process.env.AUTO_SEED || '').toLowerCase() === 'true'
  if (!enabled) return

  const usersCount = await prisma.user.count()
  if (usersCount > 0) {
    console.log('🟡 Auto-seed: banco já possui usuários, nada a fazer.')
    return
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@leadcampanha.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

  console.log('🌱 Executando auto-seed (criando admin e usuários demo)...')

  // Admin
  await prisma.user.create({
    data: {
      name: 'Administrador',
      email: adminEmail,
      password: hashPassword(adminPassword),
      role: 'admin',
      phone: '11999999999',
      available: true,
      maxLeads: 999
    }
  })

  // Users de demonstração
  for (let i = 1; i <= 5; i++) {
    await prisma.user.create({
      data: {
        name: `Consultor ${i}`,
        email: `user${i}@leadcampanha.com`,
        password: hashPassword('user123'),
        role: 'user',
        phone: `1199999900${i}`,
        available: true,
        maxLeads: 30
      }
    })
  }

  console.log('✅ Auto-seed concluído.')
}

async function seedUiDemoIfEnabled(prisma) {
  const enabled = String(process.env.AUTO_SEED_UI || '').toLowerCase() === 'true'
  if (!enabled) return

  const phone = '559999000111'
  const existing = await prisma.lead.findFirst({ where: { phone } })
  if (existing) {
    console.log('🟡 UI demo seed: lead de teste já existe.')
    return
  }

  const admin = await prisma.user.findFirst({ where: { role: 'admin' } })
  const user = await prisma.user.findFirst({ where: { role: 'user' } })

  const assignedTo = user?.id || admin?.id || null

  const lead = await prisma.lead.create({
    data: {
      name: 'Cliente Demo',
      phone,
      origin: 'whatsapp',
      priority: 'medium',
      stage: 'contacted',
      assignedTo,
      status: 'open',
      interest: 'Plano Premium',
      lastInteraction: new Date()
    }
  })

  const now = Date.now()
  await prisma.message.createMany({
    data: [
      { leadId: lead.id, text: 'Olá! Vi seu anúncio e tenho interesse.', direction: 'incoming', sender: 'customer', createdAt: new Date(now - 1000 * 60 * 60 * 24) },
      { leadId: lead.id, text: 'Oi! Que bom falar com você. Posso ajudar com dúvidas e planos.', direction: 'outgoing', sender: 'agent', status: 'sent', createdAt: new Date(now - 1000 * 60 * 60 * 24 + 5 * 60 * 1000) },
      { leadId: lead.id, text: 'Quais são as opções?', direction: 'incoming', sender: 'customer', createdAt: new Date(now - 1000 * 60 * 60) },
      { leadId: lead.id, text: 'Temos o Plano Premium com suporte IA 24/7.', direction: 'outgoing', sender: 'agent', status: 'sent', createdAt: new Date(now - 1000 * 60 * 30) }
    ]
  })

  await prisma.leadLog.create({ data: { leadId: lead.id, action: 'created', message: 'Lead de demonstração criado para validar UI' } })

  console.log('✅ UI demo seed concluído.')
}

module.exports = { autoSeedIfEmpty, seedUiDemoIfEnabled }
