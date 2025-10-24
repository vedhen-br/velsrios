// API principal para Vercel Serverless Functions
import path from 'path';
import { fileURLToPath } from 'url';

// Simular __dirname em ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Importar o app Express do backend
let app;

try {
  // Tentar importar o app do backend
  const backendPath = path.join(__dirname, '..', 'backend', 'src', 'index.js');
  const { default: backendApp } = await import(backendPath);
  app = backendApp;
} catch (error) {
  console.error('Erro ao carregar backend:', error);
  
  // Fallback: criar app Express básico
  const express = await import('express');
  app = express.default();
  
  app.get('/', (req, res) => {
    res.json({ 
      message: 'Lead Campanha API - Vercel Deploy',
      status: 'online',
      timestamp: new Date().toISOString()
    });
  });
  
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok',
      environment: process.env.NODE_ENV || 'development',
      vercel: true
    });
  });
}

// Export para Vercel
export default app;