const pino = require('pino')
const QRCode = require('qrcode')
const { PrismaClient } = require('@prisma/client')
const {
  default: makeWASocket,
  initAuthCreds,
  BufferJSON,
  fetchLatestBaileysVersion,
  DisconnectReason
} = require('@whiskeysockets/baileys')

const prisma = new PrismaClient()
const aiClassifier = require('./aiClassifier')

class WhatsAppWebService {
  constructor() {
    this.status = 'disconnected' // 'disconnected' | 'qr' | 'connecting' | 'connected'
    this.qrDataUrl = null
    this.sock = null
    this.io = null
  }

  getStatus() {
    return { status: this.status, qrDataUrl: this.qrDataUrl || null }
  }

  isConnected() {
    return this.status === 'connected' && this.sock
  }

  // Normaliza telefone para E.164 simples usando código do país padrão (ex: Brasil 55)
  normalizePhone(raw) {
    try {
      const defCC = process.env.DEFAULT_COUNTRY_CODE || '55'
      let digits = String(raw || '').replace(/\D/g, '')
      // Se já começa com o código do país (ex.: 55...) mantém
      if (digits.startsWith(defCC)) return digits
      // Se vier com 13+ dígitos, assume que já contém DDI
      if (digits.length >= 12) return digits
      // Caso contrário, prefixa DDI padrão
      return defCC + digits
    } catch {
      return String(raw || '').replace(/\D/g, '')
    }
  }

  async startSession(io) {
    this.io = io
    const logger = pino({ level: 'silent' })
    const { state, saveCreds } = await this.usePostgresAuthState()
    const { version } = await fetchLatestBaileysVersion()

    this.sock = makeWASocket({
      version,
      auth: state,
      logger,
      printQRInTerminal: false
    })

    this.status = 'connecting'
    if (io) io.emit('whatsapp:web:status', { status: 'connecting' })

    this.sock.ev.on('creds.update', saveCreds)

    this.sock.ev.on('connection.update', async (update) => {
      const { qr, connection, lastDisconnect } = update

      if (qr) {
        this.qrDataUrl = await QRCode.toDataURL(qr)
        this.status = 'qr'
        if (io) {
          io.emit('whatsapp:web:qr', { qrDataUrl: this.qrDataUrl, ts: Date.now() })
          io.emit('whatsapp:web:status', { status: 'qr' })
        }
      }

      if (connection === 'open') {
        this.status = 'connected'
        this.qrDataUrl = null
        if (io) io.emit('whatsapp:web:status', { status: 'connected' })
      }

      if (connection === 'close') {
        const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut
        this.status = 'disconnected'
        this.qrDataUrl = null
        if (io) io.emit('whatsapp:web:status', { status: 'disconnected' })
        if (shouldReconnect) {
          setTimeout(() => this.startSession(io), 3000)
        }
      }
    })

    // Helper: desencaixa mensagens com wrappers (ephemeral/viewOnce/etc.)
    const unwrapMessage = (msgObj) => {
      let m = msgObj?.message || {}
      if (m.ephemeralMessage?.message) m = m.ephemeralMessage.message
      if (m.viewOnceMessageV2?.message) m = m.viewOnceMessageV2.message
      if (m.viewOnceMessage?.message) m = m.viewOnceMessage.message
      if (m.documentWithCaptionMessage?.message) m = m.documentWithCaptionMessage.message
      // Alguns tipos vêm aninhados dentro de "interactiveResponseMessage.message"
      if (m.interactiveResponseMessage?.message) m = m.interactiveResponseMessage.message
      return m || {}
    }

    // Mensagens recebidas
    this.sock.ev.on('messages.upsert', async (u) => {
      try {
        const msg = u.messages?.[0]
        if (!msg || msg.key.fromMe) return

        const remoteJid = msg.key.remoteJid || ''
        let phone = (remoteJid.match(/\d+/g) || []).join('')
        phone = this.normalizePhone(phone)
        if (!phone || phone.length < 10 || phone.length > 15) return

        // Extrai texto básico (com unwrapping)
        const m = unwrapMessage(msg)

        // Ignorar mensagens de sincronização de histórico/controle e reações (não são mensagens do usuário)
        if (
          msg.message?.protocolMessage ||
          msg.message?.senderKeyDistributionMessage ||
          msg.message?.messageContextInfo ||
          msg.messageStubType ||
          m?.protocolMessage ||
          m?.senderKeyDistributionMessage ||
          m?.messageContextInfo ||
          m?.reactionMessage
        ) {
          return
        }
        const text =
          m.conversation ||
          m.extendedTextMessage?.text ||
          m.imageMessage?.caption ||
          m.videoMessage?.caption ||
          m.buttonsResponseMessage?.selectedDisplayText ||
          m.listResponseMessage?.title ||
          m.templateButtonReplyMessage?.selectedDisplayText ||
          m.interactiveResponseMessage?.body?.text ||
          m.buttonsMessage?.contentText ||
          ''

        const timestamp = new Date()
        // Busca ou cria lead
        let lead = await prisma.lead.findFirst({ where: { phone } })

        if (!lead) {
          const users = await prisma.user.findMany({ where: { role: 'user', available: true }, orderBy: { id: 'asc' } })
          const admin = await prisma.user.findFirst({ where: { role: 'admin' } })

          const assigned = users[0] || admin
          lead = await prisma.lead.create({
            data: {
              name: phone,
              phone,
              origin: 'whatsapp',
              status: 'open',
              aiEnabled: true,
              assignedTo: assigned?.id || null,
              lastInteraction: timestamp
            }
          })

          if (assigned && this.io) {
            await prisma.leadLog.create({ data: { leadId: lead.id, userId: assigned.id, action: 'Novo lead do WhatsApp (QR)' } })
            this.io.emit('lead:new', { userId: assigned.id, lead })
          }
        } else {
          await prisma.lead.update({ where: { id: lead.id }, data: { lastInteraction: timestamp } })
        }

        // Se não há texto útil, ignora para evitar spam de "[mensagem não suportada]" (ex.: history sync)
        if (!text || !String(text).trim()) {
          return
        }

        const savedMessage = await prisma.message.create({
          data: {
            leadId: lead.id,
            text: text,
            direction: 'incoming',
            sender: 'customer',
            createdAt: timestamp
          }
        })

        if (this.io) {
          this.io.emit('message:new', { leadId: lead.id, message: savedMessage, lead })
        }

        // Gerar resposta automática via IA (classificador/responder simples)
        try {
          // Responder apenas se IA estiver habilitada para este lead
          const checkLead = await prisma.lead.findUnique({ where: { id: lead.id } })
          if (checkLead?.aiEnabled) {
            const aiResponse = aiClassifier.generateResponse(text)
            if (aiResponse) {
              // Enviar resposta ao usuário via WhatsApp e persistir como 'bot' internamente
              const sendRes = await this.sendMessage(phone, aiResponse, this.io, lead.id, 'bot')
              // sendMessage already emits 'message:new' when leadId provided
              if (!sendRes.success) console.warn('IA: envio via WhatsApp falhou', sendRes.error)
            }
          }
        } catch (e) {
          console.error('Erro ao gerar/enviar resposta IA:', e)
        }
      } catch (err) {
        console.error('Erro ao processar mensagem (Baileys):', err)
      }
    })

    return { started: true, status: this.status, qrDataUrl: this.qrDataUrl }
  }

  // AuthState persistido no Postgres via Prisma (tabela whatsapp_store)
  async usePostgresAuthState() {
    // Carrega credenciais
    const credsRow = await prisma.whatsAppStore.findUnique({ where: { key: 'creds' } }).catch(() => null)
    const creds = credsRow ? JSON.parse(credsRow.value, BufferJSON.reviver) : initAuthCreds()

    const writeCreds = async () => {
      const value = JSON.stringify(creds, BufferJSON.replacer)
      await prisma.whatsAppStore.upsert({
        where: { key: 'creds' },
        update: { value },
        create: { key: 'creds', value }
      })
    }

    const readKeys = async (type, ids) => {
      const map = new Map()
      const keys = await Promise.all(ids.map(async (id) => {
        const key = `${type}:${id}`
        const row = await prisma.whatsAppStore.findUnique({ where: { key } }).catch(() => null)
        return [id, row ? JSON.parse(row.value, BufferJSON.reviver) : null]
      }))
      for (const [id, value] of keys) {
        map.set(id, value)
      }
      return map
    }

    const writeKeys = async (data) => {
      const ops = []
      for (const type of Object.keys(data)) {
        for (const id of Object.keys(data[type])) {
          const key = `${type}:${id}`
          const value = JSON.stringify(data[type][id], BufferJSON.replacer)
          ops.push(
            prisma.whatsAppStore.upsert({
              where: { key },
              update: { value },
              create: { key, value }
            })
          )
        }
      }
      if (ops.length) await Promise.all(ops)
    }

    return {
      state: {
        creds,
        keys: {
          get: readKeys,
          set: writeKeys
        }
      },
      saveCreds: writeCreds
    }
  }

  async sendMessage(to, message, io = null, leadId = null, sender = 'agent') {
    try {
      if (!this.isConnected()) return { success: false, error: 'not-connected' }
      const normalized = this.normalizePhone(to)
      const jid = `${normalized}@s.whatsapp.net`
      await this.sock.sendMessage(jid, { text: message })

      // Persistir mensagem como enviada pelo agente
      const savedMessage = await prisma.message.create({
        data: { leadId, text: message, direction: 'outgoing', sender: sender || 'agent', status: 'sent' }
      })
      if ((io || this.io) && leadId) {
        (io || this.io).emit('message:new', { leadId, message: savedMessage })
      }
      return { success: true, message: savedMessage }
    } catch (e) {
      console.error('Erro ao enviar mensagem via Baileys:', e)
      return { success: false, error: e.message }
    }
  }

  async disconnect() {
    try {
      if (this.sock) {
        try { await this.sock.logout() } catch (_) { }
        try { this.sock.end?.() } catch (_) { }
      }
    } finally {
      this.status = 'disconnected'
      this.qrDataUrl = null
      this.sock = null
    }
  }

  /**
   * Reseta a sessão: apaga credenciais/keys persistidas, desconecta e inicia novamente
   * Útil quando o QR fica em loop de carregamento ou as credenciais corrompem
   */
  async resetSession(io = null) {
    // Desconecta sessão atual (se houver)
    await this.disconnect()

    // Limpa storage no Postgres
    try {
      await prisma.whatsAppStore.deleteMany({})
      console.log('🧹 whatsapp_store limpo — novo QR será gerado')
    } catch (e) {
      console.warn('Não foi possível limpar whatsapp_store:', e?.message || e)
    }

    // Reinicia sessão para forçar novo QR
    return this.startSession(io || this.io)
  }
}

module.exports = new WhatsAppWebService()
