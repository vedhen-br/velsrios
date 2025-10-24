// API de Leads para Vercel Functions  
import jwt from 'jsonwebtoken';

// Mock data (depois será substituído pelo Prisma + PostgreSQL)
let leads = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@email.com',
    phone: '11999999999',
    stage: 'new',
    priority: 'high',
    interest: 'Compra',
    source: 'whatsapp',
    notes: 'Cliente interessado em apartamento 3 quartos',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2', 
    name: 'Maria Santos',
    email: 'maria@email.com',
    phone: '11888888888',
    stage: 'contacted',
    priority: 'medium', 
    interest: 'Investimento',
    source: 'site',
    notes: 'Procura investimento para aluguel',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

function verifyToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const token = authHeader.replace('Bearer ', '');
  try {
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
    return jwt.verify(token, jwtSecret);
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Verificar autenticação
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Token inválido ou ausente' });
  }

  try {
    switch (req.method) {
      case 'GET':
        // Listar leads
        return res.status(200).json({
          leads,
          total: leads.length,
          message: 'Leads recuperados com sucesso'
        });

      case 'POST':
        // Criar novo lead
        const { name, email, phone, interest, notes } = req.body;
        
        if (!name || !phone) {
          return res.status(400).json({ error: 'Nome e telefone são obrigatórios' });
        }

        const newLead = {
          id: Date.now().toString(),
          name,
          email: email || null,
          phone,
          stage: 'new',
          priority: 'medium',
          interest: interest || null,
          source: 'manual',
          notes: notes || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        leads.push(newLead);
        
        return res.status(201).json({
          message: 'Lead criado com sucesso',
          lead: newLead
        });

      case 'PUT':
        // Atualizar lead (implementar depois)
        return res.status(501).json({ error: 'Atualização não implementada ainda' });

      case 'DELETE':
        // Deletar lead (implementar depois)
        return res.status(501).json({ error: 'Exclusão não implementada ainda' });

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Erro na API de leads:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}