const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class WhatsAppService {
  constructor() {
    this.baseURL = 'https://graph.facebook.com/v21.0';
    this.config = null;
    this.loadConfig();
  }

  // Normaliza telefone para E.164 simples usando código do país padrão (ex: Brasil 55)
  normalizePhone(raw) {
    try {
      const defCC = process.env.DEFAULT_COUNTRY_CODE || '55'
      let digits = String(raw || '').replace(/\D/g, '')
      if (digits.startsWith(defCC)) return digits
      if (digits.length >= 12) return digits
      return defCC + digits
    } catch {
      return String(raw || '').replace(/\D/g, '')
    }
  }

  async loadConfig() {
    try {
      // Busca configurações do WhatsApp do banco (será salvo pelo admin)
      const settings = await prisma.user.findFirst({
        where: { role: 'admin' },
        select: { data: true }
      });

      if (settings?.data) {
        const data = JSON.parse(settings.data);
        this.config = {
          phoneNumberId: data.whatsapp_phone_number_id,
          accessToken: data.whatsapp_access_token,
          verifyToken: data.whatsapp_verify_token || 'lead_campanha_webhook_token_2025'
        };
      }
    } catch (error) {
      console.error('Erro ao carregar configurações WhatsApp:', error);
    }
  }

  /**
   * Verifica webhook do WhatsApp (GET)
   */
  verifyWebhook(mode, token, challenge) {
    const verifyToken = this.config?.verifyToken || 'lead_campanha_webhook_token_2025';

    if (mode === 'subscribe' && token === verifyToken) {
      console.log('✅ Webhook verificado com sucesso!');
      return challenge;
    }

    return null;
  }

  /**
   * Envia mensagem de texto via WhatsApp Cloud API
   */
  async sendMessage(to, message, io = null, leadId = null) {
    try {
      if (!this.config?.phoneNumberId || !this.config?.accessToken) {
        console.warn('⚠️  WhatsApp não configurado, simulando envio...');
        return this.simulateSend(to, message, io, leadId);
      }

      const url = `${this.baseURL}/${this.config.phoneNumberId}/messages`;
      const normalized = this.normalizePhone(to)

      const response = await axios.post(
        url,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: normalized,
          type: 'text',
          text: { body: message }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const messageId = response.data.messages[0].id;

      // Salva mensagem no banco
      const savedMessage = await prisma.message.create({
        data: {
          leadId,
          text: message,
          direction: 'outgoing',
          sender: 'agent',
          whatsappId: messageId,
          status: 'sent'
        }
      });

      // Notifica via WebSocket
      if (io && leadId) {
        io.emit('message:new', {
          leadId,
          message: savedMessage
        });
      }

      console.log(`✅ Mensagem enviada para ${to}: ${messageId}`);
      return { success: true, messageId, message: savedMessage };

    } catch (error) {
      console.error('❌ Erro ao enviar mensagem WhatsApp:', error.response?.data || error.message);

      // Em caso de erro, simula envio
      return this.simulateSend(to, message, io, leadId);
    }
  }

  /**
   * Envia mensagem com mídia (imagem, documento, etc)
   */
  async sendMedia(to, type, mediaUrl, caption = '', io = null, leadId = null) {
    try {
      if (!this.config?.phoneNumberId || !this.config?.accessToken) {
        console.warn('⚠️  WhatsApp não configurado');
        return { success: false, error: 'WhatsApp não configurado' };
      }

      const url = `${this.baseURL}/${this.config.phoneNumberId}/messages`;
      const normalized = this.normalizePhone(to)

      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: normalized,
        type: type // 'image', 'document', 'audio', 'video'
      };

      payload[type] = { link: mediaUrl };
      if (caption && type === 'image') {
        payload[type].caption = caption;
      }

      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      const messageId = response.data.messages[0].id;

      const savedMessage = await prisma.message.create({
        data: {
          leadId,
          text: caption || `[${type.toUpperCase()}]`,
          direction: 'outgoing',
          sender: 'agent',
          whatsappId: messageId,
          status: 'sent',
          mediaUrl
        }
      });

      if (io && leadId) {
        io.emit('message:new', { leadId, message: savedMessage });
      }

      return { success: true, messageId, message: savedMessage };

    } catch (error) {
      console.error('❌ Erro ao enviar mídia WhatsApp:', error.response?.data || error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Processa webhook recebido do WhatsApp
   */
  async processWebhook(body, io = null) {
    try {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;

      if (!value) {
        return { success: false, error: 'Formato inválido' };
      }

      // Processa mensagens recebidas
      if (value.messages && value.messages.length > 0) {
        for (const message of value.messages) {
          await this.processIncomingMessage(message, value.contacts?.[0], io);
        }
      }

      // Processa status de mensagens (enviada, entregue, lida)
      if (value.statuses && value.statuses.length > 0) {
        for (const status of value.statuses) {
          await this.processMessageStatus(status, io);
        }
      }

      return { success: true };

    } catch (error) {
      console.error('❌ Erro ao processar webhook:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Processa mensagem recebida
   */
  async processIncomingMessage(message, contact, io) {
    try {
      const phoneNumber = this.normalizePhone(message.from);
      // Sanitiza telefone: evita criar leads com números não plausíveis
      if (!phoneNumber || phoneNumber.length < 10 || phoneNumber.length > 15) {
        console.warn('Ignorando webhook com telefone inválido:', message.from)
        return { success: false, ignored: true }
      }
      const messageId = message.id;
      const timestamp = new Date(parseInt(message.timestamp) * 1000);

      let content = '';
      let mediaUrl = null;

      // Extrai conteúdo baseado no tipo
      switch (message.type) {
        case 'text':
          content = message.text.body;
          break;
        case 'interactive':
          // Botões e list replies da Cloud API
          try {
            const interactive = message.interactive || {}
            if (interactive.type === 'button_reply') {
              content = interactive.button_reply?.title || interactive.button_reply?.id || '[INTERACTIVE_BUTTON]'
            } else if (interactive.type === 'list_reply') {
              content = interactive.list_reply?.title || interactive.list_reply?.id || '[INTERACTIVE_LIST]'
            } else if (interactive.type === 'product_list_preview') {
              content = '[PRODUTO]'
            } else {
              content = '[INTERACTIVE]'
            }
          } catch (e) {
            content = '[INTERACTIVE]'
          }
          break;
        case 'image':
          content = message.image.caption || '[IMAGEM]';
          mediaUrl = await this.downloadMedia(message.image.id);
          break;
        case 'document':
          content = message.document.filename || '[DOCUMENTO]';
          mediaUrl = await this.downloadMedia(message.document.id);
          break;
        case 'audio':
          content = '[ÁUDIO]';
          mediaUrl = await this.downloadMedia(message.audio.id);
          break;
        case 'video':
          content = '[VÍDEO]';
          mediaUrl = await this.downloadMedia(message.video.id);
          break;
        case 'location':
          content = `📍 ${message.location.name || 'Localização'}`;
          break;
        default:
          content = `[${message.type.toUpperCase()}]`;
      }

      // Busca ou cria lead
      let lead = await prisma.lead.findFirst({ where: { phone: phoneNumber } });

      const contactName = contact?.profile?.name || phoneNumber;

      if (!lead) {
        // Cria novo lead e distribui a um usuário disponível; fallback admin
        const users = await prisma.user.findMany({ where: { role: 'user', available: true }, orderBy: { id: 'asc' } });
        const admin = await prisma.user.findFirst({ where: { role: 'admin' } });
        const assigned = users[0] || admin

        lead = await prisma.lead.create({
          data: {
            name: contactName,
            phone: phoneNumber,
            origin: 'whatsapp',
            status: 'open',
            assignedTo: assigned?.id || null,
            lastInteraction: timestamp
          }
        });

        // Log/notify se houver responsável
        if (assigned) {
          // Prisma schema requires a `message` field on leadLog; provide a sensible default
          await prisma.leadLog.create({
            data: {
              leadId: lead.id,
              userId: assigned.id,
              action: 'Novo lead do WhatsApp (Cloud API)',
              message: content || `Lead criado via WhatsApp por ${contactName}`
            }
          })
          if (io) io.emit('lead:new', { userId: assigned.id, lead })
        }

      } else {
        // Atualiza última interação
        lead = await prisma.lead.update({
          where: { id: lead.id },
          data: { lastInteraction: timestamp }
        });
      }

      // Salva mensagem
      const savedMessage = await prisma.message.create({
        data: {
          leadId: lead.id,
          text: content,
          direction: 'incoming',
          sender: 'customer',
          whatsappId: messageId,
          mediaUrl,
          createdAt: timestamp
        }
      });

      // Notifica via WebSocket
      if (io) {
        io.emit('message:new', {
          leadId: lead.id,
          message: savedMessage,
          lead
        });
      }

      console.log(`📩 Mensagem recebida de ${contactName} (${phoneNumber})`);

      return { success: true, lead, message: savedMessage };

    } catch (error) {
      console.error('❌ Erro ao processar mensagem:', error);
      throw error;
    }
  }

  /**
   * Processa status de mensagem (enviada, entregue, lida)
   */
  async processMessageStatus(status, io) {
    try {
      const messageId = status.id;
      const newStatus = status.status; // 'sent', 'delivered', 'read', 'failed'

      // Atualiza status no banco
      const message = await prisma.message.updateMany({
        where: { whatsappId: messageId },
        data: { status: newStatus }
      });

      // Notifica via WebSocket
      if (io && message.count > 0) {
        io.emit('message:status', {
          whatsappId: messageId,
          status: newStatus
        });
      }

      console.log(`✓ Status atualizado: ${messageId} → ${newStatus}`);

    } catch (error) {
      console.error('❌ Erro ao processar status:', error);
    }
  }

  /**
   * Baixa mídia do WhatsApp
   */
  async downloadMedia(mediaId) {
    try {
      if (!this.config?.accessToken) return null;

      // 1. Obter URL da mídia
      const mediaResponse = await axios.get(
        `${this.baseURL}/${mediaId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`
          }
        }
      );

      const mediaUrl = mediaResponse.data.url;

      // 2. Baixar arquivo
      const fileResponse = await axios.get(mediaUrl, {
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`
        },
        responseType: 'arraybuffer'
      });

      // Aqui você pode salvar o arquivo localmente ou fazer upload para S3/CDN
      // Por enquanto, retorna a URL original
      return mediaUrl;

    } catch (error) {
      console.error('❌ Erro ao baixar mídia:', error);
      return null;
    }
  }

  /**
   * Simula envio de mensagem (fallback quando WhatsApp não está configurado)
   */
  async simulateSend(to, message, io, leadId) {
    const savedMessage = await prisma.message.create({
      data: {
        leadId,
        text: message,
        direction: 'outgoing',
        sender: 'agent',
        status: 'sent'
      }
    });

    if (io && leadId) {
      io.emit('message:new', {
        leadId,
        message: savedMessage
      });
    }

    console.log(`📤 Mensagem simulada para ${to}: ${message}`);
    return { success: true, simulated: true, message: savedMessage };
  }

  /**
   * Marca mensagem como lida
   */
  async markAsRead(messageId) {
    try {
      if (!this.config?.phoneNumberId || !this.config?.accessToken) {
        return { success: false };
      }

      await axios.post(
        `${this.baseURL}/${this.config.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return { success: true };

    } catch (error) {
      console.error('❌ Erro ao marcar como lida:', error);
      return { success: false };
    }
  }
}

module.exports = new WhatsAppService();
