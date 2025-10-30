class Distributor {
  constructor(prisma) {
    this.prisma = prisma
    this._lastIndex = 0
  }

  async _getActiveUsers() {
    return await this.prisma.user.findMany({
      where: { role: 'user', available: true },
      orderBy: { createdAt: 'asc' }
    })
  }

  async _countActiveLeadsForUser(userId) {
    return await this.prisma.lead.count({
      where: { assignedTo: userId, status: { not: 'closed' } }
    })
  }

  async assignLead(leadId) {
    const users = await this._getActiveUsers()
    if (!users || users.length === 0) {
      // Fallback: atribuir ao admin
      const admin = await this.prisma.user.findFirst({ where: { role: 'admin' } })
      await this.prisma.lead.update({ where: { id: leadId }, data: { assignedTo: admin.id } })
      await this.prisma.leadLog.create({
        data: { leadId, action: 'assigned', message: `Atribuído ao ADM por fallback (nenhum usuário disponível)` }
      })
      return { assignedTo: admin.id, assignedName: admin.name, reason: 'fallback_no_users' }
    }

    // Determine algorithm from admin settings (stored in admin.data)
    let algorithm = 'round-robin'
    try {
      const admin = await this.prisma.user.findFirst({ where: { role: 'admin' }, select: { data: true } })
      const data = JSON.parse(admin?.data || '{}')
      algorithm = data?.distribution?.algorithm || algorithm
    } catch (e) {
      // ignore and use default
    }

    if (algorithm === 'least-busy') {
      // choose user with smallest activeCount under maxLeads
      let best = null
      for (const u of users) {
        const c = await this._countActiveLeadsForUser(u.id)
        if (c < u.maxLeads && (!best || c < best.count)) {
          best = { user: u, count: c }
        }
      }
      if (best) {
        await this.prisma.lead.update({ where: { id: leadId }, data: { assignedTo: best.user.id } })
        await this.prisma.leadLog.create({ data: { leadId, action: 'assigned', message: `Atribuído a ${best.user.name} via least-busy` } })
        return { assignedTo: best.user.id, assignedName: best.user.name, reason: 'least-busy' }
      }
    } else if (algorithm === 'random') {
      // shuffle users and pick first with capacity
      const shuffled = users.sort(() => Math.random() - 0.5)
      for (const candidate of shuffled) {
        const activeCount = await this._countActiveLeadsForUser(candidate.id)
        if (activeCount >= candidate.maxLeads) continue
        await this.prisma.lead.update({ where: { id: leadId }, data: { assignedTo: candidate.id } })
        await this.prisma.leadLog.create({ data: { leadId, action: 'assigned', message: `Atribuído a ${candidate.name} via random` } })
        return { assignedTo: candidate.id, assignedName: candidate.name, reason: 'random' }
      }
    }

    // default: round-robin
    const len = users.length
    for (let i = 0; i < len; i++) {
      this._lastIndex = (this._lastIndex + 1) % len
      const candidate = users[this._lastIndex]

      // Verificar limite de leads
      const activeCount = await this._countActiveLeadsForUser(candidate.id)
      if (activeCount >= candidate.maxLeads) continue

      // Atribuir
      await this.prisma.lead.update({ where: { id: leadId }, data: { assignedTo: candidate.id } })
      await this.prisma.leadLog.create({
        data: { leadId, action: 'assigned', message: `Atribuído a ${candidate.name} via round-robin` }
      })

      console.log(`[Distributor] Lead ${leadId} -> ${candidate.name}`)
      return { assignedTo: candidate.id, assignedName: candidate.name, reason: 'round_robin' }
    }

    // Nenhum usuário disponível com capacidade
    const admin = await this.prisma.user.findFirst({ where: { role: 'admin' } })
    await this.prisma.lead.update({ where: { id: leadId }, data: { assignedTo: admin.id } })
    await this.prisma.leadLog.create({
      data: { leadId, action: 'assigned', message: `Atribuído ao ADM por fallback (todos no limite)` }
    })
    return { assignedTo: admin.id, assignedName: admin.name, reason: 'fallback_limit_reached' }
  }
}

module.exports = Distributor
