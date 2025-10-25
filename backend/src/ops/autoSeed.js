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

module.exports = { autoSeedIfEmpty }
