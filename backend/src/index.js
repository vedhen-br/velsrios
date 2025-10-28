require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const swaggerUi = require('swagger-ui-express')
const { createServer } = require('http')
const { Server } = require('socket.io')
const { PrismaClient } = require('@prisma/client')
const apiRoutes = require('./routes/api')
const { autoSeedIfEmpty, seedUiDemoIfEnabled } = require('./ops/autoSeed')
const openapiSpec = require('./openapi.json')

const app = express()
const httpServer = createServer(app)
const prisma = new PrismaClient()

// Behind a proxy/load balancer (Render, Vercel), trust proxy for correct IPs
app.set('trust proxy', 1)

// Configurar CORS para aceitar Codespaces, local e domínios adicionais via env
// EXTRA_ALLOWED_ORIGINS pode ser uma lista separada por ',' de domínios (ex: https://meusite.com,https://outro.com)
// ALLOW_ALL_ORIGINS=true permite todas as origens (útil apenas para debug)
const extra = (process.env.EXTRA_ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
  ...extra,
  /^https:\/\/.*\.vercel\.app$/, // Vercel previews & prod
  /^http:\/\/localhost:\d+$/,       // qualquer porta localhost (ex.: 5174)
  /^https:\/\/.*\.github\.dev$/,   // Codespaces
  /^https:\/\/.*\.app\.github\.dev$/  // Codespaces preview
].filter(Boolean)

// Log allowed origins on startup (helps debugging CORS issues)
console.log('🌍 Allowed origins for CORS/socket.io:', allowedOrigins)
// Configurar Socket.io com CORS
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      // Allow all origins when explicitly requested (debug)
      if (String(process.env.ALLOW_ALL_ORIGINS).toLowerCase() === 'true') return callback(null, true)

      // Permitir requests sem origin (mobile apps, Postman, etc)
      if (!origin) return callback(null, true)
      const isAllowed = allowedOrigins.some(allowed => {
        if (typeof allowed === 'string') return allowed === origin
        if (allowed instanceof RegExp) return allowed.test(origin)
        return false
      })

      if (!isAllowed) console.warn(`CORS/socket.io: origin rejected -> ${origin}`)
      else console.log(`CORS/socket.io: origin allowed -> ${origin}`)

      callback(null, isAllowed)
    },
    methods: ['GET', 'POST'],
    credentials: true
  }
})

// Disponibilizar io nas rotas
app.set('io', io)

app.use(cors({
  origin: (origin, callback) => {
    // Allow all origins explicitly when env says so (debug/unblock)
    if (String(process.env.ALLOW_ALL_ORIGINS).toLowerCase() === 'true') return callback(null, true)

    // Permit requests without Origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true)

    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') return allowed === origin
      if (allowed instanceof RegExp) return allowed.test(origin)
      return false
    })

    if (!isAllowed) console.warn(`CORS/api: origin rejected -> ${origin}`)
    else console.log(`CORS/api: origin allowed -> ${origin}`)

    callback(null, isAllowed)
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type', 'Accept']
}))
// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}))

// Request logging (skip in test env)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'))
}

// Basic rate limiting for API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // allow generous but safe amount
  standardHeaders: true,
  legacyHeaders: false
})
app.use('/api', apiLimiter)

app.use(bodyParser.json({ limit: '2mb' }))

// Socket.io eventos
io.on('connection', (socket) => {
  console.log(`✅ Cliente conectado: ${socket.id}`)

  // Autenticação do socket
  socket.on('authenticate', (data) => {
    if (data?.userId) {
      socket.userId = data.userId
      socket.join(`user_${data.userId}`)
      console.log(`🔐 Usuário ${data.userId} autenticado no socket ${socket.id}`)
    }
  })

  // Usuário visualizando um lead específico
  socket.on('viewing:lead', (leadId) => {
    socket.leadId = leadId
    socket.join(`lead_${leadId}`)
    console.log(`👁️  Socket ${socket.id} visualizando lead ${leadId}`)
  })

  // Usuário parou de visualizar lead
  socket.on('leave:lead', (leadId) => {
    socket.leave(`lead_${leadId}`)
    console.log(`👋 Socket ${socket.id} saiu do lead ${leadId}`)
  })

  // Digitando...
  socket.on('typing:start', (data) => {
    socket.to(`lead_${data.leadId}`).emit('user:typing', {
      leadId: data.leadId,
      userId: socket.userId
    })
  })

  socket.on('typing:stop', (data) => {
    socket.to(`lead_${data.leadId}`).emit('user:stopped-typing', {
      leadId: data.leadId,
      userId: socket.userId
    })
  })

  socket.on('disconnect', () => {
    console.log(`❌ Cliente desconectado: ${socket.id}`)
  })
})

// API docs (basic OpenAPI UI)
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec))

// API routes
app.use('/api', apiRoutes)

// Redirect root to health
app.get('/', (req, res) => res.redirect('/api/health'))

const port = process.env.PORT || 4000
httpServer.listen(port, '0.0.0.0', async () => {
  console.log(`🚀 Backend rodando em http://localhost:${port}`)
  console.log(`📡 API disponível em http://localhost:${port}/api`)
  console.log(`🔌 WebSocket disponível em ws://localhost:${port}`)
  console.log(`📊 Health check: http://localhost:${port}/api/health`)
  // Auto-seed (opcional): cria usuários básicos se o banco estiver vazio
  try {
    await autoSeedIfEmpty(prisma)
    await seedUiDemoIfEnabled(prisma)
  } catch (err) {
    console.warn('⚠️  Auto-seed ignorado:', err?.message)
  }

  // Log Codespaces URL if available
  if (process.env.CODESPACE_NAME) {
    console.log(`\n🌐 Codespaces URLs:`)
    console.log(`   Backend: https://${process.env.CODESPACE_NAME}-${port}.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`)
  }

  // Opcional: iniciar sessão WhatsApp Web automaticamente, se habilitado
  try {
    const autoStart = String(process.env.WHATSAPP_WEB_AUTO_START || '').toLowerCase() === 'true'
    if (autoStart) {
      const whatsappWebService = require('./services/whatsappWeb.service')
      console.log('🔄 WHATSAPP_WEB_AUTO_START=true: iniciando sessão WhatsApp Web...')
      whatsappWebService.startSession(io)
    }
  } catch (e) {
    console.warn('⚠️  Falha ao auto-iniciar WhatsApp Web:', e?.message || e)
  }
})

