// Health check endpoint para verificar se API está funcionando
export default function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'ok',
      message: 'Lead Campanha API funcionando!',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production',
      platform: 'Vercel Serverless',
      version: '2.0.0',
      endpoints: {
        login: '/api/login',
        leads: '/api/leads',
        health: '/api/health'
      }
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}