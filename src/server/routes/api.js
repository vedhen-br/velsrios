const express = require('express');
const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Velsrios Platform está funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Platform info endpoint
router.get('/info', (req, res) => {
  res.json({
    name: 'Velsrios Platform',
    version: '1.0.0',
    description: 'Minha plataforma moderna e integrada'
  });
});

// Users endpoint (example)
router.get('/users', (req, res) => {
  res.json({
    users: [
      { id: 1, name: 'Admin', role: 'admin' },
      { id: 2, name: 'User', role: 'user' }
    ]
  });
});

module.exports = router;
