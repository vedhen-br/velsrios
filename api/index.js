// API Health Check para Vercel
export default function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Health check endpoint
  if (req.url === '/api' || req.url === '/api/') {
    return res.status(200).json({
      message: 'Lead Campanha API - Vercel Deploy',
      status: 'online',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production',
      vercel: true
    });
  }

  // Default response
  res.status(404).json({
    error: 'Endpoint not found',
    available: ['/api', '/api/health']
  });
}