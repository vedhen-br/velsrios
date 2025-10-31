# Inbound WhatsApp Messages Fix

## Changes Made

### Backend (backend/src/services/whatsappWeb.service.js)

1. **Added `whatsappId` field** to persisted inbound messages
   - Added `whatsappId: msg.key.id || null` to message creation
   - This enables tracking of message status updates (delivered, read, etc.)

2. **Enhanced defensive guards** for non-individual JIDs
   - Added checks to skip broadcast, status, group, and newsletter messages using regex
   - Prevents processing of system messages that aren't from individual customers

3. **Added audio and document caption extraction**
   - Added `m.audioMessage?.caption` and `m.documentMessage?.caption`
   - Ensures captions from audio and document messages are captured

4. **Enhanced DEBUG logging with helper functions**
   - Added initial debug log when messages.upsert is received
   - Created helper functions for text extraction and message type detection
   - Moved constants to module level for better performance
   - Enhanced log messages with more context

### Frontend (frontend/src/pages/Atendimentos.jsx)

1. **Changed console.log to console.debug**
   - Line 163: Changed to `console.debug('[SOCKET] message:new recebido:', data)`
   - Aligns with best practices for debug-level logging

2. **Added verification logging**
   - Line 167: Added `console.debug('[SOCKET] Atualizando thread ativo:', ...)`
   - Helps verify when the active thread is being updated

## Expected Behavior

### Backend Logs (Render)
When a customer sends a message, you should see:
```
[DEBUG] messages.upsert received: { messageCount: 1, type: 'notify' }
[DEBUG] Message details: { remoteJid: '5511999999999@s.whatsapp.net', fromMe: false, detectedTypes: ['conversation'], textPreview: 'Hello...', hasText: true }
💬 Texto extraído: { text: 'Hello...', hasText: true }
[WhatsApp] Mensagem recebida persistida: { messageId: 'xxx', leadId: 'yyy', whatsappId: 'zzz' }
[WhatsApp] Evento message:new emitido: { leadId: 'yyy', messageId: 'xxx' }
```

### Frontend Console (Browser)
When a message is received via socket:
```
[SOCKET] message:new recebido: { leadId: 'xxx', message: {...}, lead: {...} }
[SOCKET] Atualizando thread ativo: { leadId: 'xxx', messageId: 'yyy' }
```

## Testing Steps

1. Deploy backend to Render
2. Ensure WhatsApp Web is connected (scan QR if needed)
3. Send a message from a customer device to the business WhatsApp number
4. Check Render backend logs for the expected log messages above
5. Check browser console (F12) for the expected frontend log messages
6. Verify the message appears in the Atendimentos UI without page reload
7. Verify outbound messages still work correctly

## Non-Goals

- Full history synchronization (syncFullHistory remains false)
- Media downloading (not implemented in this change)
- Group chat support (intentionally skipped)
