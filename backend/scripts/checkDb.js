require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

async function main() {
  const prisma = new PrismaClient()
  try {
    const [users, leads, messages, tasks] = await Promise.all([
      prisma.user.count(),
      prisma.lead.count(),
      prisma.message.count(),
      prisma.task.count()
    ])

    const urlMasked = (process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL || '')
      .replace(/:(.*?)@/, '://***:***@')

    console.log('✅ Conexão Prisma OK')
    console.log('🔗 DB URL:', urlMasked)
    console.log('📊 Contagens:', { users, leads, messages, tasks })
  } catch (err) {
    console.error('❌ Falha ao conectar no banco via Prisma')
    console.error(err.message)
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

main()
