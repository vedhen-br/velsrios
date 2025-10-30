/**
 * WhatsApp Web Service (Baileys) - Production-Ready Implementation
 * 
 * ✅ FEATURES:
 * - Automatic reconnection with exponential backoff (max 10 attempts)
 * - Credential persistence exclusively via database (whatsapp_store table)
 * - Comprehensive event handling (messages.upsert, messages.update, connection.update)
 * - Detailed logging for all send, receive, and error events
 * - Socket.io event emissions for QR, status, and messages to frontend
 * - saveCreds called on all credential updates
 * - Robust try/catch blocks in all critical handlers
 * - Production-safe sendMessage and disconnect functions for 24h uptime (Render)
 * 
 * @author Lead Campanha CRM Team
 * @version 2.0.0 - Production Stable
 */

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
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 10
    this.reconnectDelay = 3000 // Initial delay in ms
    this.isReconnecting = false
    this.sendMessageTimeout = 30000 // 30 seconds timeout for send operations
    
    // Logger configuration - works with or without pino-pretty
    const logLevel = process.env.LOG_LEVEL || 'info'
    try {
      // Try to use pino-pretty if available
      this.logger = pino({ 
        level: logLevel,
        transport: {
          target: 'pino-pretty',
          options: { colorize: true }
        }
      })
    } catch (e) {
      // Fallback to basic pino if pino-pretty is not available
      this.logger = pino({ level: logLevel })
    }
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
      this.logger.info('🚀 Iniciando sessão WhatsApp Web (Baileys)...')
      
      const { state, saveCreds } = await this.usePostgresAuthState()
      const { version } = await fetchLatestBaileysVersion()
      
      this.logger.info(`📱 Versão Baileys: ${version.join('.')}`)

      this.sock = makeWASocket({
        version,
        auth: state,
        logger: pino({ level: 'silent' }), // Silent for Baileys internal logs
        printQRInTerminal: false,
        browser: ['Lead Campanha', 'Chrome', process.env.WHATSAPP_BROWSER_VERSION || '121.0.0'],
        defaultQueryTimeoutMs: undefined,
        keepAliveIntervalMs: 30000,
        connectTimeoutMs: 60000,
        qrTimeout: 60000
      })

      this.status = 'connecting'
      this.logger.info('⏳ Status: connecting')
      if (io) io.emit('whatsapp:web:status', { status: 'connecting' })

      // Credentials update handler - CRITICAL for session persistence
      this.sock.ev.on('creds.update', async () => {
        try {
          this.logger.debug('🔐 Credenciais atualizadas, salvando no banco...')
          await saveCreds()
          this.logger.info('✅ Credenciais salvas com sucesso no banco de dados')
        } catch (error) {
          this.logger.error('❌ Erro ao salvar credenciais:', error)
        }
      })

      // Connection update handler
      this.sock.ev.on('connection.update', async (update) => {
        try {
          await this.handleConnectionUpdate(update, io, saveCreds)
        } catch (error) {
          this.logger.error('❌ Erro no handler connection.update:', error)
        }
      })

      // Messages upsert handler (incoming messages)
      this.sock.ev.on('messages.upsert', async (m) => {
        try {
          await this.handleMessagesUpsert(m, io)
        } catch (error) {
          this.logger.error('❌ Erro no handler messages.upsert:', error)
        }
      })

      // Messages update handler (delivery receipts, read receipts, etc.)
      this.sock.ev.on('messages.update', async (updates) => {
        try {
          await this.handleMessagesUpdate(updates)
        } catch (error) {
          this.logger.error('❌ Erro no handler messages.update:', error)
        }
      })

      this.logger.info('✅ Todos os event handlers registrados com sucesso')
      return { started: true, status: this.status, qrDataUrl: this.qrDataUrl }
    } catch (error) {
      this.logger.error('❌ Erro fatal ao iniciar sessão WhatsApp Web:', error)
      this.status = 'disconnected'
      if (io) io.emit('whatsapp:web:status', { status: 'error', error: error.message })
      throw error
    }
  }

  /**
   * Handle connection updates with automatic reconnection logic
   */
  async handleConnectionUpdate(update, io, saveCreds) {
    const { qr, connection, lastDisconnect, isNewLogin } = update

    // QR Code generation
    if (qr) {
      try {
        this.qrDataUrl = await QRCode.toDataURL(qr)
        this.status = 'qr'
        this.logger.info('📱 QR Code gerado - aguardando scan...')
        
        if (io) {
          io.emit('whatsapp:web:qr', { qrDataUrl: this.qrDataUrl, ts: Date.now() })
          io.emit('whatsapp:web:status', { status: 'qr' })
        }
      } catch (error) {
        this.logger.error('❌ Erro ao gerar QR Code:', error)
      }
    }

    // Connection opened successfully
    if (connection === 'open') {
      this.status = 'connected'
      this.qrDataUrl = null
      this.reconnectAttempts = 0
      this.reconnectDelay = 3000
      this.isReconnecting = false
      
      this.logger.info('✅ WhatsApp Web conectado com sucesso!')
      
      if (isNewLogin) {
        this.logger.info('🔐 Novo login detectado - salvando credenciais...')
        try {
          await saveCreds()
        } catch (error) {
          this.logger.error('❌ Erro ao salvar credenciais após novo login:', error)
        }
      }
      
      if (io) {
        io.emit('whatsapp:web:status', { status: 'connected' })
      }
    }

    // Connection closed
    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode
      const reason = DisconnectReason[statusCode] || 'unknown'
      
      this.logger.warn(`⚠️ Conexão fechada. Reason: ${reason} (${statusCode})`)
      
      this.status = 'disconnected'
      this.qrDataUrl = null
      
      if (io) {
        io.emit('whatsapp:web:status', { 
          status: 'disconnected', 
          reason,
          statusCode 
        })
      }

      // Determine if should reconnect
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut
      
      if (shouldReconnect && !this.isReconnecting) {
        this.handleReconnection(io)
      } else if (statusCode === DisconnectReason.loggedOut) {
        this.logger.warn('🚪 Usuário deslogado - limpando credenciais...')
        try {
          await prisma.whatsAppStore.deleteMany({})
          this.logger.info('🧹 Credenciais limpas - novo QR será necessário')
        } catch (error) {
          this.logger.error('❌ Erro ao limpar credenciais:', error)
        }
      }
    }
  }

  /**
   * Handle automatic reconnection with exponential backoff
   */
  handleReconnection(io) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.logger.error(`❌ Máximo de tentativas de reconexão atingido (${this.maxReconnectAttempts})`)
      this.isReconnecting = false
      if (io) {
        io.emit('whatsapp:web:status', { 
          status: 'error', 
          error: 'Max reconnection attempts reached' 
        })
      }
      return
    }

    this.isReconnecting = true
    this.reconnectAttempts++
    
    // Exponential backoff: 3s, 6s, 12s, 24s, 48s, 60s (capped)
    // Using bitwise left shift (1 << n) is equivalent to Math.pow(2, n) but more efficient
    const delay = Math.min(this.reconnectDelay * (1 << (this.reconnectAttempts - 1)), 60000)
    
    this.logger.info(`🔄 Tentativa de reconexão ${this.reconnectAttempts}/${this.maxReconnectAttempts} em ${delay}ms...`)
    
    setTimeout(async () => {
      try {
        this.logger.info('🔌 Reconectando...')
        await this.startSession(io)
      } catch (error) {
        this.logger.error('❌ Erro na tentativa de reconexão:', error)
        this.isReconnecting = false
      }
    }, delay)
  }

  /**
   * Handle incoming messages (messages.upsert)
   */
  async handleMessagesUpsert(upsert, io) {
    try {
      const msg = upsert.messages?.[0]
      
      // Ignore if no message or message from self
      if (!msg || msg.key.fromMe) {
        return
      }

      const remoteJid = msg.key.remoteJid || ''
      let phone = (remoteJid.match(/\d+/g) || []).join('')
      phone = this.normalizePhone(phone)
      
      // Validate phone format
      if (!phone || phone.length < 10 || phone.length > 15) {
        this.logger.debug(`⚠️ Telefone inválido ignorado: ${phone}`)
        return
      }

      // Extract message content
      const m = this.unwrapMessage(msg)

      // Ignore protocol/system messages and reactions
      if (this.isSystemMessage(msg, m)) {
        this.logger.debug('⚠️ Mensagem de sistema ignorada')
        return
      }

      const text = this.extractMessageText(m)

      // Ignore empty messages
      if (!text || !String(text).trim()) {
        this.logger.debug('⚠️ Mensagem vazia ignorada')
        return
      }

      this.logger.info(`📨 Mensagem recebida de ${phone}: ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`)

      const timestamp = new Date()
      
      // Find or create lead
      let lead = await prisma.lead.findFirst({ where: { phone } })

      if (!lead) {
        this.logger.info(`🆕 Criando novo lead para ${phone}`)
        lead = await this.createLeadFromMessage(phone, timestamp)
        
        if (io && lead.assignedTo) {
          io.emit('lead:new', { userId: lead.assignedTo, lead })
        }
      } else {
        await prisma.lead.update({ 
          where: { id: lead.id }, 
          data: { lastInteraction: timestamp } 
        })
      }

      // Save message to database
      const savedMessage = await prisma.message.create({
        data: {
          leadId: lead.id,
          text: text,
          direction: 'incoming',
          sender: 'customer',
          whatsappId: msg.key.id,
          status: 'received',
          createdAt: timestamp
        }
      })

      this.logger.info(`💾 Mensagem salva no banco - ID: ${savedMessage.id}`)

      // Emit to frontend via socket.io
      if (io) {
        io.emit('message:new', { leadId: lead.id, message: savedMessage, lead })
      }

      // AI auto-response
      await this.handleAIResponse(lead, text, phone, io)

    } catch (err) {
      this.logger.error('❌ Erro ao processar mensagem recebida (messages.upsert):', err)
    }
  }

  /**
   * Handle message updates (delivery, read receipts)
   */
  async handleMessagesUpdate(updates) {
    try {
      for (const update of updates) {
        const { key, update: msgUpdate } = update
        
        if (!key?.id) continue

        const status = msgUpdate?.status
        
        if (status) {
          this.logger.debug(`📬 Update de mensagem ${key.id}: status=${status}`)
          
          try {
            // Update message status in database
            const updated = await prisma.message.updateMany({
              where: { whatsappId: key.id },
              data: { 
                status: this.mapBaileysStatusToDb(status)
              }
            })
            
            if (updated.count > 0) {
              this.logger.debug(`✅ Status atualizado para ${updated.count} mensagem(ns)`)
            }
          } catch (error) {
            this.logger.error(`❌ Erro ao atualizar status da mensagem ${key.id}:`, error)
          }
        }
      }
    } catch (err) {
      this.logger.error('❌ Erro ao processar messages.update:', err)
    }
  }

  /**
   * Create lead from incoming message
   */
  async createLeadFromMessage(phone, timestamp) {
    try {
      const users = await prisma.user.findMany({ 
        where: { role: 'user', available: true }, 
        orderBy: { id: 'asc' } 
      })
      const admin = await prisma.user.findFirst({ where: { role: 'admin' } })

      const assigned = users[0] || admin
      
      const lead = await prisma.lead.create({
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

      if (assigned) {
        await prisma.leadLog.create({ 
          data: { 
            leadId: lead.id, 
            userId: assigned.id, 
            action: 'Novo lead do WhatsApp Web',
            message: `Lead criado automaticamente via WhatsApp Web`
          } 
        })
        
        this.logger.info(`✅ Lead ${lead.id} criado e atribuído a ${assigned.name}`)
      }

      return lead
    } catch (error) {
      this.logger.error('❌ Erro ao criar lead:', error)
      throw error
    }
  }

  /**
   * Handle AI auto-response
   */
  async handleAIResponse(lead, text, phone, io) {
    try {
      // Check if AI is enabled for this lead
      const checkLead = await prisma.lead.findUnique({ where: { id: lead.id } })
      
      if (!checkLead?.aiEnabled) {
        this.logger.debug(`⚙️ IA desabilitada para lead ${lead.id}`)
        return
      }

      const aiResponse = aiClassifier.generateResponse(text)
      
      if (aiResponse) {
        this.logger.info(`🤖 IA gerando resposta para ${phone}: ${aiResponse.substring(0, 50)}...`)
        
        const sendRes = await this.sendMessage(phone, aiResponse, io, lead.id, 'bot')
        
        if (!sendRes.success) {
          this.logger.warn(`⚠️ Falha ao enviar resposta da IA: ${sendRes.error}`)
        } else {
          this.logger.info(`✅ Resposta da IA enviada com sucesso`)
        }
      }
    } catch (e) {
      this.logger.error('❌ Erro ao processar resposta da IA:', e)
    }
  }

  /**
   * Helper: Unwrap nested message structures
   */
  unwrapMessage(msgObj) {
    let m = msgObj?.message || {}
    if (m.ephemeralMessage?.message) m = m.ephemeralMessage.message
    if (m.viewOnceMessageV2?.message) m = m.viewOnceMessageV2.message
    if (m.viewOnceMessage?.message) m = m.viewOnceMessage.message
    if (m.documentWithCaptionMessage?.message) m = m.documentWithCaptionMessage.message
    if (m.interactiveResponseMessage?.message) m = m.interactiveResponseMessage.message
    return m || {}
  }

  /**
   * Check if message is a system/protocol message
   */
  isSystemMessage(msg, m) {
    return !!(
      msg.message?.protocolMessage ||
      msg.message?.senderKeyDistributionMessage ||
      msg.message?.messageContextInfo ||
      msg.messageStubType ||
      m?.protocolMessage ||
      m?.senderKeyDistributionMessage ||
      m?.messageContextInfo ||
      m?.reactionMessage
    )
  }

  /**
   * Extract text from various message types
   */
  extractMessageText(m) {
    return (
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
    )
  }

  /**
   * Map Baileys message status to database status
   */
  mapBaileysStatusToDb(baileysStatus) {
    const statusMap = {
      'PENDING': 'sent',
      'SERVER_ACK': 'sent',
      'DELIVERY_ACK': 'delivered',
      'READ': 'read',
      'PLAYED': 'read'
    }
    return statusMap[baileysStatus] || 'sent'
  }

  // AuthState persistido no Postgres via Prisma (tabela whatsapp_store)
  async usePostgresAuthState() {
    try {
      this.logger.info('🔐 Carregando AuthState do banco de dados...')
      
      // Carrega credenciais
      const credsRow = await prisma.whatsAppStore.findUnique({ where: { key: 'creds' } }).catch(() => null)
      const creds = credsRow ? JSON.parse(credsRow.value, BufferJSON.reviver) : initAuthCreds()
      
      if (credsRow) {
        this.logger.info('✅ Credenciais existentes carregadas do banco')
      } else {
        this.logger.info('🆕 Novas credenciais inicializadas')
      }

      const writeCreds = async () => {
        try {
          const value = JSON.stringify(creds, BufferJSON.replacer)
          await prisma.whatsAppStore.upsert({
            where: { key: 'creds' },
            update: { value },
            create: { key: 'creds', value }
          })
          this.logger.debug('💾 Credenciais salvas no banco')
        } catch (error) {
          this.logger.error('❌ Erro ao salvar credenciais:', error)
          throw error
        }
      }

      const readKeys = async (type, ids) => {
        try {
          const map = new Map()
          const keys = await Promise.all(ids.map(async (id) => {
            try {
              const key = `${type}:${id}`
              const row = await prisma.whatsAppStore.findUnique({ where: { key } }).catch(() => null)
              return [id, row ? JSON.parse(row.value, BufferJSON.reviver) : null]
            } catch (error) {
              this.logger.error(`❌ Erro ao ler key ${type}:${id}:`, error)
              return [id, null]
            }
          }))
          for (const [id, value] of keys) {
            map.set(id, value)
          }
          return map
        } catch (error) {
          this.logger.error(`❌ Erro ao ler keys do tipo ${type}:`, error)
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
                }).catch(error => {
                  this.logger.error(`❌ Erro ao salvar key ${key}:`, error.message || error)
                  // Return null to track failures but continue with other operations
                  return null
                })
              )
            }
          }
          if (ops.length) {
            const results = await Promise.all(ops)
            const successCount = results.filter(r => r !== null).length
            const failedCount = results.length - successCount
            
            if (failedCount > 0) {
              this.logger.warn(`⚠️ ${failedCount}/${ops.length} keys falharam ao salvar no banco`)
            } else {
              this.logger.debug(`💾 ${successCount} keys salvas no banco com sucesso`)
            }
          }
        } catch (error) {
          this.logger.error('❌ Erro crítico ao salvar keys:', error)
          // Don't throw - allow session to continue even if some keys fail to save
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
      this.logger.error('❌ Erro ao inicializar AuthState:', error)
      throw error
    }
  }

  /**
   * Send message via WhatsApp Web (production-ready with robust error handling)
   */
  async sendMessage(to, message, io = null, leadId = null, sender = 'agent') {
    const logPrefix = `[sendMessage ${leadId || 'no-lead'}]`
    
    try {
      // Validate connection status
      if (!this.isConnected()) {
        this.logger.warn(`${logPrefix} Tentativa de envio sem conexão ativa`)
        return { success: false, error: 'not-connected' }
      }

      // Validate input
      if (!to || !message) {
        this.logger.error(`${logPrefix} Parâmetros inválidos: to=${to}, message=${!!message}`)
        return { success: false, error: 'invalid-parameters' }
      }

      const normalized = this.normalizePhone(to)
      
      if (!normalized || normalized.length < 10 || normalized.length > 15) {
        this.logger.error(`${logPrefix} Número de telefone inválido: ${to} -> ${normalized}`)
        return { success: false, error: 'invalid-phone' }
      }

      const jid = `${normalized}@s.whatsapp.net`
      
      this.logger.info(`${logPrefix} Enviando mensagem para ${normalized}...`)
      
      // Send message with timeout protection (prevents hanging operations)
      let timeoutId
      const sendPromise = this.sock.sendMessage(jid, { text: message })
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('Send timeout')), this.sendMessageTimeout)
      })
      
      const result = await Promise.race([sendPromise, timeoutPromise])
      
      // Clear timeout to prevent memory leak
      if (timeoutId) clearTimeout(timeoutId)
      
      this.logger.info(`${logPrefix} ✅ Mensagem enviada com sucesso`)

      // Persist message to database
      let savedMessage = null
      
      if (leadId) {
        try {
          savedMessage = await prisma.message.create({
            data: { 
              leadId, 
              text: message, 
              direction: 'outgoing', 
              sender: sender || 'agent', 
              status: 'sent',
              whatsappId: result?.key?.id || null
            }
          })
          
          this.logger.info(`${logPrefix} 💾 Mensagem persistida no banco - ID: ${savedMessage.id}`)
          
          // Emit socket event
          if (io || this.io) {
            (io || this.io).emit('message:new', { leadId, message: savedMessage })
          }
        } catch (dbError) {
          this.logger.error(`${logPrefix} ❌ Erro ao persistir mensagem:`, dbError)
          // Don't fail the whole operation if database save fails
        }
      }
      
      return { success: true, message: savedMessage, messageId: result?.key?.id }
      
    } catch (e) {
      this.logger.error(`${logPrefix} ❌ Erro ao enviar mensagem:`, e)
      
      // Provide more specific error messages
      let errorType = 'send-failed'
      if (e.message?.includes('timeout')) errorType = 'timeout'
      if (e.message?.includes('not-connected')) errorType = 'not-connected'
      
      return { success: false, error: errorType, details: e.message }
    }
  }

  /**
   * Disconnect WhatsApp Web session (production-safe with proper cleanup)
   */
  async disconnect() {
    this.logger.info('🔌 Desconectando WhatsApp Web...')
    
    try {
      // Cancel any pending reconnections
      this.isReconnecting = false
      
      if (this.sock) {
        try {
          this.logger.info('📤 Fazendo logout...')
          await Promise.race([
            this.sock.logout(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Logout timeout')), 5000))
          ])
          this.logger.info('✅ Logout concluído')
        } catch (logoutError) {
          this.logger.warn('⚠️ Erro no logout (continuando com cleanup):', logoutError.message)
        }
        
        try {
          this.logger.info('🔚 Encerrando conexão...')
          if (typeof this.sock.end === 'function') {
            this.sock.end()
          }
          this.logger.info('✅ Conexão encerrada')
        } catch (endError) {
          this.logger.warn('⚠️ Erro ao encerrar conexão:', endError.message)
        }
      }
    } catch (error) {
      this.logger.error('❌ Erro ao desconectar:', error)
    } finally {
      // Always cleanup state
      this.status = 'disconnected'
      this.qrDataUrl = null
      this.sock = null
      this.reconnectAttempts = 0
      this.isReconnecting = false
      
      this.logger.info('✅ WhatsApp Web desconectado e estado limpo')
      
      // Notify via socket.io
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
    this.logger.info('🔄 Resetando sessão WhatsApp Web...')
    
    try {
      // Desconecta sessão atual (se houver)
      await this.disconnect()

      // Limpa storage no Postgres
      try {
        const deleted = await prisma.whatsAppStore.deleteMany({})
        this.logger.info(`🧹 whatsapp_store limpo (${deleted.count} registros removidos) — novo QR será gerado`)
      } catch (e) {
        this.logger.warn('⚠️ Não foi possível limpar whatsapp_store:', e?.message || e)
      }

      // Reinicia sessão para forçar novo QR
      this.logger.info('🔄 Reiniciando sessão...')
      return await this.startSession(io || this.io)
    } catch (error) {
      this.logger.error('❌ Erro ao resetar sessão:', error)
      throw error
    }
  }
}

module.exports = new WhatsAppWebService()
