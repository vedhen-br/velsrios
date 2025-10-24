const { PrismaClient } = require('@prisma/client')
const { hashPassword } = require('../src/auth/password')
const prisma = new PrismaClient()

async function main() {
  await prisma.user.deleteMany()
  await prisma.lead.deleteMany()

  await prisma.user.create({
    data: {
      name: 'Administrador',
      email: 'admin@leadcampanha.com',
      password: hashPassword('admin123'),
      role: 'admin',
      phone: '11999999999',
      available: true,
      maxLeads: 999
    }
  })

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

  console.log('✅ Seed completo!')
  console.log('👤 Admin: admin@leadcampanha.com / admin123')
  console.log('👥 Users: user1@leadcampanha.com até user5@leadcampanha.com / user123')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
