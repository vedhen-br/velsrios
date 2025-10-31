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

// Logger configurável via env
const logger = pino({ 
  level: process.env.WHATSAPP_LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV !== 'production' ? {
    target: 'pino-pretty',
    options: { colorize: true }
  } : undefined
})

class WhatsAppWebService {
  constructor() {
    this.status = 'disconnected' // 'disconnected' | 'qr' | 'connecting' | 'connected'
    this.qrDataUrl = null
    this.sock = null
    this.io = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 10
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
    try {
      this.io = io
      logger.info('🔄 Iniciando sessão WhatsApp Web/Baileys...')
      
      const baileyLogger = pino({ level: 'silent' })
      const { state, saveCreds } = await this.usePostgresAuthState()
      const { version } = await fetchLatestBaileysVersion()

      logger.info(`📱 Usando Baileys versão: ${version.join('.')}`)

      this.sock = makeWASocket({
        version,
        auth: state,
        logger: baileyLogger,
        printQRInTerminal: false
      })

      this.status = 'connecting'
      if (io) io.emit('whatsapp:web:status', { status: 'connecting' })
      logger.info('🔌 Status: connecting')

      // Evento crítico: atualização de credenciais - SEMPRE salvar
      this.sock.ev.on('creds.update', async () => {
        try {
          await saveCreds()
          logger.info('💾 Credenciais atualizadas e salvas no banco')
        } catch (error) {
          logger.error('❌ Erro ao salvar credenciais:', error?.message || error)
        }
      })

      // Evento crítico: atualização de conexão
      this.sock.ev.on('connection.update', async (update) => {
        try {
          const { qr, connection, lastDisconnect } = update
          
          logger.info('🔄 Connection update:', { 
            connection, 
            hasQr: !!qr,
            disconnectReason: lastDisconnect?.error?.output?.statusCode 
          })

          if (qr) {
            this.qrDataUrl = await QRCode.toDataURL(qr)
            this.status = 'qr'
            this.reconnectAttempts = 0 // Reset on new QR
            
            if (io) {
              io.emit('whatsapp:web:qr', { qrDataUrl: this.qrDataUrl, ts: Date.now() })
              io.emit('whatsapp:web:status', { status: 'qr' })
            }
            
            logger.info('📱 QR Code gerado - aguardando escaneamento')
          }

          if (connection === 'open') {
            this.status = 'connected'
            this.qrDataUrl = null
            this.reconnectAttempts = 0
            
            if (io) io.emit('whatsapp:web:status', { status: 'connected' })
            
            logger.info('✅ WhatsApp Web conectado com sucesso!')
          }

          if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut
            
            this.status = 'disconnected'
            this.qrDataUrl = null
            
            if (io) io.emit('whatsapp:web:status', { status: 'disconnected' })
            
            logger.warn('❌ Conexão fechada:', {
              statusCode,
              reason: lastDisconnect?.error?.message,
              willReconnect: shouldReconnect
            })

            if (shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
              this.reconnectAttempts++
              const delay = Math.min(3000 * this.reconnectAttempts, 30000) // Max 30s
              
              logger.info(`🔄 Tentativa de reconexão ${this.reconnectAttempts}/${this.maxReconnectAttempts} em ${delay}ms`)
              
              setTimeout(() => this.startSession(io), delay)
            } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
              logger.error('❌ Máximo de tentativas de reconexão atingido')
            }
          }
        } catch (error) {
          logger.error('❌ Erro no handler connection.update:', error?.stack || error?.message || error)
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

      // Evento crítico: mensagens recebidas (upsert)
      this.sock.ev.on('messages.upsert', async (u) => {
        try {
          const msg = u.messages?.[0]
          if (!msg || msg.key.fromMe) return

          const remoteJid = msg.key.remoteJid || ''
          let phone = (remoteJid.match(/\d+/g) || []).join('')
          phone = this.normalizePhone(phone)
          
          logger.info('📥 Mensagem recebida:', { phone, jid: remoteJid, hasMessage: !!msg.message })
          
          if (!phone || phone.length < 10 || phone.length > 15) {
            logger.warn('⚠️ Telefone inválido ignorado:', { phone, length: phone?.length })
            return
          }

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
            logger.debug('⏭️ Mensagem de controle/sincronização ignorada')
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
          
          logger.info('💬 Texto extraído:', { text: text?.slice(0, 100), hasText: !!text })
          
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

            logger.info('🆕 Novo lead criado:', { leadId: lead.id, phone, assignedTo: assigned?.id })

            if (assigned && this.io) {
              await prisma.leadLog.create({ data: { leadId: lead.id, userId: assigned.id, action: 'Novo lead do WhatsApp (QR)' } })
              this.io.emit('lead:new', { userId: assigned.id, lead })
            }
          } else {
            await prisma.lead.update({ where: { id: lead.id }, data: { lastInteraction: timestamp } })
            logger.debug('📝 Lead atualizado:', { leadId: lead.id })
          }

          // Se não há texto útil, ignora para evitar spam de "[mensagem não suportada]"
          if (!text || !String(text).trim()) {
            logger.debug('⏭️ Mensagem sem texto útil ignorada')
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

          logger.info('💾 Mensagem salva no banco:', { messageId: savedMessage.id, leadId: lead.id })

          if (this.io) {
            this.io.emit('message:new', { leadId: lead.id, message: savedMessage, lead })
            logger.debug('📡 Evento message:new emitido via socket.io')
          }

          // Gerar resposta automática via IA (classificador/responder simples)
          try {
            // Responder apenas se IA estiver habilitada para este lead
            const checkLead = await prisma.lead.findUnique({ where: { id: lead.id } })
            if (checkLead?.aiEnabled) {
              const aiResponse = aiClassifier.generateResponse(text)
              if (aiResponse) {
                logger.info('🤖 Resposta IA gerada:', { response: aiResponse?.slice(0, 100) })
                
                // Enviar resposta ao usuário via WhatsApp e persistir como 'bot' internamente
                const sendRes = await this.sendMessage(phone, aiResponse, this.io, lead.id, 'bot')
                
                if (!sendRes.success) {
                  logger.warn('⚠️ IA: envio via WhatsApp falhou', { error: sendRes.error })
                } else {
                  logger.info('✅ Resposta IA enviada com sucesso')
                }
              }
            }
          } catch (e) {
            logger.error('❌ Erro ao gerar/enviar resposta IA:', e?.stack || e?.message || e)
          }
        } catch (err) {
          logger.error('❌ Erro ao processar mensagem (Baileys):', err?.stack || err?.message || err)
        }
      })

      // Evento: atualização de mensagens (status de leitura, entrega, etc.)
      this.sock.ev.on('messages.update', async (updates) => {
        try {
          logger.debug('📬 messages.update:', { count: updates?.length })
          
          for (const update of updates || []) {
            try {
              const { key, update: statusUpdate } = update
              
              if (statusUpdate?.status) {
                // Atualizar status da mensagem no banco se tivermos o whatsappId
                const whatsappId = key?.id
                if (whatsappId) {
                  await prisma.message.updateMany({
                    where: { whatsappId },
                    data: { status: statusUpdate.status }
                  })
                  
                  logger.info('📊 Status de mensagem atualizado:', { whatsappId, status: statusUpdate.status })
                  
                  // Emitir evento via socket.io
                  if (this.io) {
                    this.io.emit('message:status', { whatsappId, status: statusUpdate.status })
                  }
                }
              }
            } catch (updateError) {
              logger.error('❌ Erro ao processar update individual:', updateError?.message)
            }
          }
        } catch (error) {
          logger.error('❌ Erro no handler messages.update:', error?.stack || error?.message || error)
        }
      })

      return { started: true, status: this.status, qrDataUrl: this.qrDataUrl }
    } catch (error) {
      logger.error('❌ Erro fatal ao iniciar sessão WhatsApp Web:', error?.stack || error?.message || error)
      this.status = 'disconnected'
      throw error
    }
  }

  // AuthState persistido no Postgres via Prisma (tabela whatsapp_store)
  async usePostgresAuthState() {
    try {
      logger.info('💾 Carregando credenciais do banco de dados...')
      
      // Carrega credenciais
      const credsRow = await prisma.whatsAppStore.findUnique({ where: { key: 'creds' } }).catch(() => null)
      const creds = credsRow ? JSON.parse(credsRow.value, BufferJSON.reviver) : initAuthCreds()
      
      if (credsRow) {
        logger.info('✅ Credenciais existentes encontradas no banco')
      } else {
        logger.info('🆕 Inicializando novas credenciais')
      }

      const writeCreds = async () => {
        try {
          const value = JSON.stringify(creds, BufferJSON.replacer)
          await prisma.whatsAppStore.upsert({
            where: { key: 'creds' },
            update: { value },
            create: { key: 'creds', value }
          })
          logger.info('💾 Credenciais salvas no banco com sucesso')
        } catch (error) {
          logger.error('❌ Erro ao salvar credenciais:', error?.message || error)
          throw error
        }
      }

      const readKeys = async (type, ids) => {
        try {
          const map = new Map()
          const keys = await Promise.all(ids.map(async (id) => {
            const key = `${type}:${id}`
            const row = await prisma.whatsAppStore.findUnique({ where: { key } }).catch(() => null)
            return [id, row ? JSON.parse(row.value, BufferJSON.reviver) : null]
          }))
          for (const [id, value] of keys) {
            map.set(id, value)
          }
          logger.debug(`🔑 Keys lidas: ${type} (${ids.length} items)`)
          return map
        } catch (error) {
          logger.error('❌ Erro ao ler keys:', error?.message || error)
          return new Map()
        }
      }

      const writeKeys = async (data) => {
        try {
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
          if (ops.length) {
            await Promise.all(ops)
            logger.debug(`🔑 Keys salvas: ${ops.length} items`)
          }
        } catch (error) {
          logger.error('❌ Erro ao salvar keys:', error?.message || error)
        }
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
    } catch (error) {
      logger.error('❌ Erro ao configurar AuthState:', error?.stack || error?.message || error)
      throw error
    }
  }

  async sendMessage(to, message, io = null, leadId = null, sender = 'agent') {
    try {
      logger.info('📤 Tentando enviar mensagem:', { to, leadId, sender, messagePreview: message?.slice(0, 50) })
      
      if (!this.isConnected()) {
        logger.warn('⚠️ WhatsApp Web não conectado')
        return { success: false, error: 'not-connected' }
      }
      
      const normalized = this.normalizePhone(to)
      const jid = `${normalized}@s.whatsapp.net`
      
      logger.debug('📱 Enviando para JID:', jid)
      
      const sentMsg = await this.sock.sendMessage(jid, { text: message })
      
      logger.info('✅ Mensagem enviada via Baileys:', { 
        jid, 
        messageId: sentMsg?.key?.id,
        status: sentMsg?.status 
      })

      // Persistir mensagem como enviada pelo agente/bot
      const savedMessage = await prisma.message.create({
        data: { 
          leadId, 
          text: message, 
          direction: 'outgoing', 
          sender: sender || 'agent', 
          status: 'sent',
          whatsappId: sentMsg?.key?.id || null
        }
      })
      
      logger.info('💾 Mensagem salva no banco:', { messageId: savedMessage.id })
      
      if ((io || this.io) && leadId) {
        (io || this.io).emit('message:new', { leadId, message: savedMessage })
        logger.debug('📡 Evento message:new emitido via socket.io')
      }
      
      return { success: true, message: savedMessage }
    } catch (e) {
      logger.error('❌ Erro ao enviar mensagem via Baileys:', e?.stack || e?.message || e)
      return { success: false, error: e.message }
    }
  }

  async disconnect() {
    try {
      logger.info('🔌 Desconectando WhatsApp Web...')
      
      if (this.sock) {
        try { 
          await this.sock.logout() 
          logger.info('✅ Logout executado com sucesso')
        } catch (logoutError) { 
          logger.warn('⚠️ Erro no logout (ignorando):', logoutError?.message)
        }
        
        try { 
          if (typeof this.sock.end === 'function') {
            this.sock.end() 
          }
          logger.info('✅ Conexão encerrada')
        } catch (endError) { 
          logger.warn('⚠️ Erro ao encerrar conexão (ignorando):', endError?.message)
        }
      }
    } catch (error) {
      logger.error('❌ Erro ao desconectar:', error?.stack || error?.message || error)
    } finally {
      this.status = 'disconnected'
      this.qrDataUrl = null
      this.sock = null
      this.reconnectAttempts = 0
      
      logger.info('🔌 WhatsApp Web desconectado')
      
      if (this.io) {
        this.io.emit('whatsapp:web:status', { status: 'disconnected' })
      }
    }
  }

  /**
   * Reseta a sessão: apaga credenciais/keys persistidas, desconecta e inicia novamente
   * Útil quando o QR fica em loop de carregamento ou as credenciais corrompem
   */
  async resetSession(io = null) {
    try {
      logger.info('🔄 Resetando sessão WhatsApp Web...')
      
      // Desconecta sessão atual (se houver)
      await this.disconnect()

      // Limpa storage no Postgres
      try {
        const deleted = await prisma.whatsAppStore.deleteMany({})
        logger.info(`🧹 whatsapp_store limpo: ${deleted.count} registros removidos`)
      } catch (e) {
        logger.warn('⚠️ Não foi possível limpar whatsapp_store:', e?.message || e)
      }

      // Reinicia sessão para forçar novo QR
      logger.info('🔄 Iniciando nova sessão...')
      return this.startSession(io || this.io)
    } catch (error) {
      logger.error('❌ Erro ao resetar sessão:', error?.stack || error?.message || error)
      throw error
    }
  }
}

module.exports = new WhatsAppWebService()
