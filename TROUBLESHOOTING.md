# 🐛 TROUBLESHOOTING - Erros e Soluções

> **Documento de Referência**: Todos os erros encontrados e suas soluções durante o desenvolvimento do Lead Campanha

---

## 📋 Como Usar Este Documento

### **Para Desenvolvedores**
1. **Ao encontrar um erro**: Procure aqui primeiro antes de investigar
2. **Ao resolver um erro**: Documente a solução aqui
3. **Formato**: Mantenha o padrão estabelecido para facilitar busca

### **Categorias de Erros**
- 🔧 **Setup & Configuração**
- 🗄️ **Banco de Dados**
- 🌐 **Deploy & Vercel**
- 📱 **Frontend (React)**
- ⚙️ **Backend (Node.js)**
- 🔐 **Autenticação**
- 📦 **Dependências/NPM**

---

## 🔧 SETUP & CONFIGURAÇÃO
### Nova arquitetura (Vercel + Render + Neon)
Se o frontend não refletir mudanças após o deploy:
1) Verifique se `frontend/src/main.jsx` importa `./App` (e não `./App-crm`).
2) Em Vercel → Project → Settings → Environment Variables:
  - `VITE_API_URL=https://<BACKEND-RENDER>/api`
  - `VITE_WS_URL=https://<BACKEND-RENDER>`
  - Clique em Save e faça Redeploy (envs só são aplicadas na build).
3) Em Render (backend): defina `FRONTEND_URL=https://<SEU-VERCEL>.vercel.app`.
4) Hard refresh no navegador (Ctrl+F5).


### **Erro**: `.env` não encontrado
**Sintomas**:
```
Error: Cannot read environment variables
```

**Solução**:
1. Criar arquivo `.env` na raiz do projeto
2. Copiar variáveis do `.env.example`
3. Configurar valores específicos do ambiente

**Prevenção**: Sempre verificar se `.env` existe antes de rodar o projeto

---

### **Erro**: Portas em conflito
**Sintomas**:
```
Error: Port 3000 is already in use
```

**Solução**:
```powershell
# Verificar processo usando a porta
netstat -ano | findstr :3000

# Matar processo específico
taskkill /PID <PID_NUMBER> /F

# Ou usar porta alternativa
npm run dev -- --port 3001
```

**Prevenção**: Sempre verificar portas antes de iniciar serviços

---

## 🗄️ BANCO DE DADOS

### **Erro**: Prisma migration falha
**Sintomas**:
```
Error: Migration failed to apply
P1001: Can't reach database server
```

**Solução**:
```powershell
# 1. Verificar conexão com banco
npx prisma db pull

# 2. Reset do banco (CUIDADO: perde dados)
npx prisma migrate reset

# 3. Nova migration
npx prisma migrate deploy

# 4. Regenerar cliente
npx prisma generate
```

**Prevenção**: Sempre fazer backup antes de migrations

---

### **Erro**: Seed script falha
**Sintomas**:
```
Error: Cannot seed database
Unique constraint failed
```

**Solução**:
```powershell
# 1. Limpar dados existentes
npx prisma migrate reset

# 2. Rodar seed novamente
npm run seed

# Ou usar upsert no script de seed
```

**Prevenção**: Usar `upsert` em vez de `create` no seed

---

## 🌐 DEPLOY & VERCEL
### Erro: frontend segue usando API errada (produção)
**Sintomas**: UI “igual de antes”, sem novas features.

**Causas comuns**:
- `main.jsx` apontando para `App-crm` em vez de `App`.
- `VITE_API_URL/VITE_WS_URL` não configuradas ou faltando redeploy.

**Solução**:
1. Ajustar `frontend/src/main.jsx` para `import App from './App'`.
2. Definir envs em Vercel e redeploy.
3. Confirmar no console do navegador o log `🌐 Environment` com os URLs do Render.


### **Erro**: Build falha no Vercel
**Sintomas**:
```
Build Error: Module not found
```

**Solução**:
1. Verificar se todas as dependências estão no `package.json`
2. Rodar `npm install` localmente
3. Verificar se paths estão corretos (case-sensitive)
4. Fazer novo push

**Comando útil**:
```powershell
# Instalar e salvar dependência
npm install <package> --save
```

---

### **Erro**: Environment Variables no Vercel
**Sintomas**:
```
Error: DATABASE_URL is not defined
```

**Solução**:
1. Ir no painel do Vercel → Project Settings
2. Environment Variables
3. Adicionar todas as variáveis do `.env`
4. Redeploy do projeto

**Prevenção**: Sempre configurar env vars antes do primeiro deploy

---

### **Erro**: Serverless Function timeout
**Sintomas**:
```
Error: Function execution timed out after 10s
```

**Solução**:
1. Otimizar queries do banco
2. Implementar paginação
3. Usar cache quando possível
4. Considerar upgrade do plano Vercel

---

## 📱 FRONTEND (REACT)

### **Erro**: Hydration mismatch
**Sintomas**:
```
Warning: Text content did not match. Server: "X" Client: "Y"
```

**Solução**:
1. Verificar renderização condicional
2. Usar `useEffect` para código client-side only
3. Garantir que SSR e client renderizem igual

**Exemplo**:
```jsx
// ❌ Problemático
const Component = () => {
  return <div>{Date.now()}</div>
}

// ✅ Correto
const Component = () => {
  const [timestamp, setTimestamp] = useState(null)

  useEffect(() => {
    setTimestamp(Date.now())
  }, [])

  return <div>{timestamp}</div>
}
```

---

### **Erro**: CORS no desenvolvimento
**Sintomas**:
```
Access to fetch blocked by CORS policy
```

**Solução**:
1. Configurar proxy no `vite.config.js`:
```js
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
})
```

2. Ou usar CORS no backend:
```js
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173']
}))
```

---

## ⚙️ BACKEND (NODE.JS)
### Erro: express-rate-limit com X-Forwarded-For no Render
**Sintomas**:
```
ValidationError: The 'X-Forwarded-For' header is set but the Express 'trust proxy' setting is false
```

**Causa**: Aplicação atrás de proxy sem `trust proxy` habilitado.

**Solução**:
```js
// backend/src/index.js
const app = express()
app.set('trust proxy', 1)
```

**Prevenção**: Em ambientes gerenciados (Render, Vercel), sempre habilitar `trust proxy`.

### Erro: Prisma P1013 / URL inválida
**Sintomas**:
```
Error validating datasource `db`: the URL must start with `postgresql://`
```

**Solução**:
1. Remover aspas extras nas envs do Render/Neon.
2. Usar `postgresql://` (não `postgres://`).
3. Para Prisma, usar pooler em `POSTGRES_PRISMA_URL` e `POSTGRES_URL_NON_POOLING` no `directUrl`.


### **Erro**: JWT Token inválido
**Sintomas**:
```
JsonWebTokenError: invalid token
```

**Solução**:
1. Verificar se token está sendo enviado corretamente
2. Confirmar JWT_SECRET no `.env`
3. Verificar formato do header Authorization

**Formato correto**:
```js
headers: {
  'Authorization': `Bearer ${token}`
}
```

---

### **Erro**: Middleware de autenticação
**Sintomas**:
```
Error: req.user is undefined
```

**Solução**:
```js
// Verificar se middleware está sendo aplicado
app.use('/api/protected', authMiddleware, routes)

// Verificar se middleware está populando req.user
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '')
  if (!token) {
    return res.status(401).json({ error: 'Access denied' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded // ← Importante!
    next()
  } catch (error) {
    res.status(400).json({ error: 'Invalid token' })
  }
}
```

---

## 🔐 AUTENTICAÇÃO

### **Erro**: Senha não confere
**Sintomas**:
```
Error: Invalid credentials
```

**Solução**:
1. Verificar se senha está sendo hasheada no cadastro
2. Usar `bcrypt.compare()` no login
3. Verificar encoding/charset

**Exemplo correto**:
```js
// Cadastro
const hashedPassword = await bcrypt.hash(password, 10)

// Login
const isValidPassword = await bcrypt.compare(password, user.password)
```

---

## 📦 DEPENDÊNCIAS/NPM

### **Erro**: Versão incompatível do Node
**Sintomas**:
```
Error: Unsupported engine
```

**Solução**:
```powershell
# Verificar versão atual
node --version

# Instalar versão específica (usando nvm)
nvm install 18.17.0
nvm use 18.17.0

# Ou atualizar package.json
"engines": {
  "node": ">=18.0.0"
}
```

---

### **Erro**: Cache do NPM corrompido
**Sintomas**:
```
Error: Integrity check failed
```

**Solução**:
```powershell
# Limpar cache
npm cache clean --force

# Deletar node_modules e reinstalar
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

---

## 🔍 COMANDOS ÚTEIS PARA DEBUG

### **Logs e Informações**
```powershell
# Verificar versões
node --version
npm --version

# Logs detalhados do npm
npm install --verbose

# Listar processos nas portas
netstat -ano | findstr :3000

# Verificar variáveis de ambiente
echo $env:NODE_ENV

# Backend health check local
cd backend; npm run check:api

# DB connectivity
cd backend; npm run check:db
```

### **Git e Deploy**
```powershell
# Verificar status
git status
git log --oneline -5

# Forçar redeploy no Vercel
vercel --prod --force
```

### **Banco de Dados**
```powershell
# Status do Prisma
npx prisma migrate status

# Visualizar dados
npx prisma studio

# Backup do schema
npx prisma db pull
```

---

## 📝 TEMPLATE PARA NOVOS ERROS

Quando encontrar um erro novo, use este template:

```markdown
### **Erro**: [Descrição breve do erro]
**Sintomas**:
```
[Mensagem de erro exata]
```

**Contexto**: [Quando/onde acontece]

**Solução**:
1. [Passo a passo da solução]
2. [Comandos específicos]
3. [Verificações necessárias]

**Causa Raiz**: [Por que aconteceu]

**Prevenção**: [Como evitar no futuro]

**Data**: [DD/MM/AAAA]
---
```

## 📊 ESTATÍSTICAS DE ERROS

- **Total de erros documentados**: 15
- **Categoria mais comum**: Setup & Configuração (40%)
- **Última atualização**: 24/10/2024

---

## 🚀 PRÓXIMAS MELHORIAS NESTE DOC

- [ ] Adicionar índice de navegação rápida
- [ ] Criar sistema de tags para busca
- [ ] Adicionar prints/screenshots dos erros
- [ ] Implementar sistema de votação nas soluções
- [ ] Criar script de backup automático deste arquivo

---

*Mantenha este documento sempre atualizado! Cada erro resolvido é conhecimento compartilhado.*

*Última atualização: 24/10/2024*
