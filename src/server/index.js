const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de segurança
app.use(helmet());

// CORS
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // limite de 100 requisições por janela
});
app.use('/api/', limiter);

// Parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use(express.static('public'));

// Rotas da API
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Velsrios Platform está funcionando!',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/info', (req, res) => {
  res.json({
    name: 'Velsrios Platform',
    version: '1.0.0',
    description: 'Minha plataforma moderna e integrada'
  });
});

// Rota de exemplo para usuários
app.get('/api/users', (req, res) => {
  res.json({
    users: [
      { id: 1, name: 'Admin', role: 'admin' },
      { id: 2, name: 'User', role: 'user' }
    ]
  });
});

// Tratamento de erros
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Algo deu errado!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log(`✅ Servidor Velsrios rodando na porta ${PORT}`);
  console.log(`🌐 Acesse: http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = { app, server };
