# Testing Inbound WhatsApp Messages

This document provides step-by-step instructions for testing and validating the inbound WhatsApp message functionality.

## Overview

The recent changes enhance inbound WhatsApp message handling with:
- Comprehensive DEBUG logging
- Defensive guards against broadcast/status/group messages
- Better text extraction for all message types
- Enhanced frontend socket.io handling with duplicate prevention

## Pre-deployment Setup

### 1. Configure Environment Variables

In your Render backend service, set the following environment variable:

```bash
WHATSAPP_LOG_LEVEL=debug
```

This will enable detailed DEBUG logs for message processing. Options are: `trace`, `debug`, `info`, `warn`, `error`, `fatal`, `silent`.

> **Note:** For production, you can use `info` level. Use `debug` only when troubleshooting issues.

### 2. Deploy Changes

1. Merge the PR to your main branch
2. Render will auto-deploy the backend
3. Vercel will auto-deploy the frontend (if configured)

## Testing Procedure

### Backend Verification (Render Logs)

1. **Open Render Logs:**
   - Go to your Render dashboard
   - Select your backend service
   - Open the "Logs" tab
   - Enable auto-scroll

2. **Connect WhatsApp Session:**
   - If not already connected, scan the QR code from the Configurações page
   - Look for log: `✅ WhatsApp Web conectado com sucesso!`

3. **Send Test Message from Customer Device:**
   - From a customer's WhatsApp, send a test message to your business number
   - Example: "Hello, I need help"

4. **Verify Logs Appear:**

   You should see logs in this sequence:

   ```
   [DEBUG] messages.upsert event received: { messageCount: 1, type: 'notify' }
   [DEBUG] Processing inbound message: { remoteJid: '5511999999999@s.whatsapp.net', messageId: '...', fromMe: false, hasMessage: true }
   📥 Mensagem recebida: { phone: '5511999999999', jid: '5511999999999@s.whatsapp.net', messageId: '...' }
   [DEBUG] Message types detected: { types: 'conversation', hasProtocol: false, hasReaction: false }
   [DEBUG] Message processed summary: { remoteJid: '...', fromMe: false, phone: '5511999999999', types: 'conversation', textLength: 17, textPreview: 'Hello, I need help' }
   💬 Texto extraído: { text: 'Hello, I need help', hasText: true }
   🆕 Novo lead criado: { leadId: 123, phone: '5511999999999', assignedTo: 1 }
   💾 Mensagem salva no banco: { messageId: 456, leadId: 123, whatsappId: '...' }
   [DEBUG] Socket.io event "message:new" emitted: { leadId: 123, messageId: 456 }
   ```

5. **Verify Message Types:**

   Test different message types:
   - **Text:** "Test message"
   - **Image with caption:** Send an image with caption text
   - **Video with caption:** Send a video with caption text
   - **Button response:** If using interactive messages
   - **List response:** If using list messages

   For each, verify the `[DEBUG] Message types detected:` log shows the correct type.

6. **Verify Defensive Guards Work:**

   These messages should be skipped with appropriate DEBUG logs:
   - Group messages → `[DEBUG] Skipping group message (not supported yet)`
   - Broadcast messages → `[DEBUG] Skipping broadcast/status message`
   - Outbound messages (sent by you) → `[DEBUG] Skipping outbound message (fromMe=true)`
   - Messages with no text → `[DEBUG] Skipping message with no useful text`

### Frontend Verification (Browser Console)

1. **Open Atendimentos Page:**
   - Log in to your frontend
   - Navigate to the Atendimentos page
   - Open browser DevTools (F12)
   - Go to the Console tab

2. **Send Test Message from Customer:**
   - From customer WhatsApp, send a message
   - Watch the browser console

3. **Verify Console Logs:**

   You should see:

   ```
   [DEBUG] 📩 message:new event received: {
     leadId: 123,
     messageId: 456,
     text: "Hello, I need help",
     sender: "customer",
     direction: "incoming",
     timestamp: "2025-10-31T01:44:43.440Z"
   }
   [DEBUG] Message is for selected lead, updating messages list
   ```

   Or if the message is for a different lead:

   ```
   [DEBUG] Message is for different lead, updating lead list only
   ```

4. **Verify Message Appears:**
   - The message should appear in the chat window
   - **No page reload required**
   - The message should be on the left side (incoming)
   - The sender should show as "customer"

5. **Test Duplicate Prevention:**
   - If the same message event arrives twice (rare edge case)
   - You should see: `[DEBUG] Message already exists, skipping`

### Outbound Message Verification

1. **Send Message from Atendimentos UI:**
   - Type a message in the input field
   - Click "Enviar"

2. **Verify Outbound Still Works:**
   - Message should send successfully
   - Message should appear on the right side (outgoing)
   - Check Render logs: should NOT see `[DEBUG] Skipping outbound message (fromMe=true)` for the sent message
   - The message handler should not process outbound messages

3. **Verify on Customer Device:**
   - Customer should receive the message
   - Message should appear in their WhatsApp

## Troubleshooting

### Issue: No DEBUG Logs Appear

**Solution:**
- Check that `WHATSAPP_LOG_LEVEL=debug` is set in Render environment variables
- Restart the backend service after setting the variable
- Verify the variable is correctly set by checking Render dashboard → Service → Environment

### Issue: Messages Not Appearing in UI

**Check:**
1. **Backend logs:** Verify message is being persisted (look for "💾 Mensagem salva no banco")
2. **Socket.io connection:** In browser console, look for "✅ WebSocket conectado"
3. **Socket.io event:** Check for "[DEBUG] Socket.io event 'message:new' emitted" in backend logs
4. **Frontend console:** Check for "[DEBUG] 📩 message:new event received" in browser console

**Common causes:**
- Socket.io not connected: Check network/firewall issues
- Message filtered out: Check if lead is selected or filtering is active
- CORS issues: Verify FRONTEND_URL is correctly set in backend

### Issue: Messages Duplicating

**Check:**
- Look for log: `[DEBUG] Message already exists, skipping`
- If duplicates still occur, the message ID might be missing
- Check backend logs for `whatsappId: null` in saved messages

### Issue: Broadcast/Group Messages Appearing

**Check:**
- Look for `[DEBUG] Skipping broadcast/status message` or `[DEBUG] Skipping group message`
- If messages still appear, the JID might have a different format
- Add additional defensive guards in the code

## Performance Monitoring

### Metrics to Watch

1. **Response Time:**
   - Time between customer message and backend persistence
   - Should be < 1 second for text messages

2. **Socket.io Latency:**
   - Time between backend emit and frontend receive
   - Should be < 500ms

3. **Memory Usage:**
   - Monitor Render service memory
   - DEBUG logs will increase log volume slightly

## Production Recommendations

1. **Set Log Level to Info:**
   ```bash
   WHATSAPP_LOG_LEVEL=info
   ```
   - Reduces log volume
   - Still captures important events
   - Use `debug` only when troubleshooting

2. **Monitor Error Logs:**
   - Look for `❌` prefix in logs
   - Set up alerts for error patterns

3. **Enable syncFullHistory: false (Default):**
   - This is already the default in Baileys
   - Prevents historical messages from being processed
   - Only new messages are captured

4. **Backup Strategy:**
   - Ensure Postgres backups are configured
   - Messages are persisted in database
   - Can recover from service restarts

## Next Steps

After successful testing:

1. **Document Test Results:**
   - Note successful test scenarios
   - Document any edge cases found
   - Update this document with findings

2. **Optional Enhancements:**
   - Enable group message support (remove `@g.us` guard)
   - Add media message handling (images, videos)
   - Implement message status tracking (delivered, read)

3. **Monitoring:**
   - Set up uptime monitoring for backend
   - Monitor WhatsApp connection status
   - Track message delivery success rate
