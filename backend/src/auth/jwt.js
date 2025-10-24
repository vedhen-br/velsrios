const jwt = require('jsonwebtoken')

const SECRET = process.env.JWT_SECRET || 'lead-campanha-secret-2025'

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    SECRET,
    { expiresIn: '7d' }
  )
}

function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET)
  } catch (e) {
    return null
  }
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ error: 'Token não fornecido' })

  const token = authHeader.split(' ')[1]
  const payload = verifyToken(token)

  if (!payload) return res.status(401).json({ error: 'Token inválido' })

  req.user = payload
  next()
}

function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' })
  }
  next()
}

module.exports = { generateToken, verifyToken, authMiddleware, adminOnly }
