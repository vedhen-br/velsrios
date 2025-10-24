// Health check endpoint para Vercel
export default function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
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
      version: '1.0.0'
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
}