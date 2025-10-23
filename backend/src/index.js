require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const { createServer } = require('http')
const { Server } = require('socket.io')
const apiRoutes = require('./routes/api')

const app = express()
const httpServer = createServer(app)

// Configurar CORS para aceitar Codespaces e local
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
  /^https:\/\/.*\.github\.dev$/,  // Codespaces
  /^https:\/\/.*\.app\.github\.dev$/  // Codespaces preview
].filter(Boolean)

// Configurar Socket.io com CORS
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      // Permitir requests sem origin (mobile apps, Postman, etc)
      if (!origin) return callback(null, true)
      
      const isAllowed = allowedOrigins.some(allowed => {
        if (typeof allowed === 'string') return allowed === origin
        if (allowed instanceof RegExp) return allowed.test(origin)
        return false
      })
      
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
    if (!origin) return callback(null, true)
    
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') return allowed === origin
      if (allowed instanceof RegExp) return allowed.test(origin)
      return false
    })
    
    callback(null, isAllowed)
  },
  credentials: true
}))
app.use(bodyParser.json())

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

// API routes
app.use('/api', apiRoutes)

// Redirect root to health
app.get('/', (req, res) => res.redirect('/api/health'))

const port = process.env.PORT || 4000
httpServer.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Backend rodando em http://localhost:${port}`)
  console.log(`📡 API disponível em http://localhost:${port}/api`)
  console.log(`🔌 WebSocket disponível em ws://localhost:${port}`)
  console.log(`📊 Health check: http://localhost:${port}/api/health`)
  
  // Log Codespaces URL if available
  if (process.env.CODESPACE_NAME) {
    console.log(`\n🌐 Codespaces URLs:`)
    console.log(`   Backend: https://${process.env.CODESPACE_NAME}-${port}.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`)
  }
})

