# 🏗️ Arquitetura Técnica - Lead Campanha

## 📐 Visão Geral

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  React + Vite + Tailwind CSS (Port 5173)                   │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │  Login   │  │Dashboard │  │   CRM    │                 │
│  │  Page    │  │  Stats   │  │  Kanban  │                 │
│  └──────────┘  └──────────┘  └──────────┘                 │
│                       │                                      │
│                 AuthContext                                 │
│                       │                                      │
└───────────────────────┼──────────────────────────────────────┘
                        │
                   HTTP + JWT
                        │
┌───────────────────────▼──────────────────────────────────────┐
│                      BACKEND                                  │
│     Node.js + Express + Prisma (Port 4000)                   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              API Routes (/api)                       │  │
│  │                                                       │  │
│  │  Public:                                             │  │
│  │    POST /login                                       │  │
│  │    POST /webhook                                     │  │
│  │                                                       │  │
│  │  Authenticated:                                      │  │
│  │    GET  /me, /users, /leads                         │  │
│  │    POST /leads, /tasks                              │  │
│  │    PATCH /leads/:id, /tasks/:id                     │  │
│  │                                                       │  │
│  │  Admin Only:                                         │  │
│  │    POST /distribute                                  │  │
│  │    GET  /reports/overview                           │  │
│  └──────────────────────────────────────────────────────┘  │
│                       │                                      │
│  ┌──────────┐  ┌──────▼───────┐  ┌─────────────┐          │
│  │   Auth   │  │  Services    │  │  Business   │          │
│  │  (JWT)   │  │              │  │   Logic     │          │
│  │          │  │ • Distributor│  │             │          │
│  │ • Token  │  │ • AIClassifier│ │ • Validation│          │
│  │ • Hash   │  │ • Logger     │  │ • Rules     │          │
│  └──────────┘  └──────────────┘  └─────────────┘          │
│                       │                                      │
└───────────────────────┼──────────────────────────────────────┘
                        │
                   Prisma ORM
                        │
┌───────────────────────▼──────────────────────────────────────┐
│                   DATABASE (SQLite)                          │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   User   │  │   Lead   │  │ Message  │  │   Task   │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│  ┌──────────┐  ┌──────────┐                               │
│  │ LeadLog  │  │   Tag    │                               │
│  └──────────┘  └──────────┘                               │
└───────────────────────────────────────────────────────────────┘
```

## 🔐 Fluxo de Autenticação

```
┌──────┐                                    ┌──────────┐
│Client│                                    │ Backend  │
└──┬───┘                                    └────┬─────┘
   │                                             │
   │  POST /api/login                           │
   │  {email, password}                         │
   │────────────────────────────────────────────>│
   │                                             │
   │                                             │ 1. Busca user no DB
   │                                             │ 2. Compara hash da senha
   │                                             │ 3. Gera JWT token
   │                                             │
   │  {token, user}                             │
   │<────────────────────────────────────────────│
   │                                             │
   │ Armazena token no localStorage             │
   │                                             │
   │  GET /api/leads                            │
   │  Header: Authorization: Bearer <token>     │
   │────────────────────────────────────────────>│
   │                                             │
   │                                             │ 1. authMiddleware verifica token
   │                                             │ 2. Decodifica JWT
   │                                             │ 3. Adiciona user ao req
   │                                             │ 4. Executa rota
   │                                             │
   │  [...leads]                                │
   │<────────────────────────────────────────────│
   │                                             │
```

## 📨 Fluxo do Webhook WhatsApp

```
┌─────────┐          ┌─────────┐          ┌──────────┐          ┌────────┐
│WhatsApp │          │Webhook  │          │    IA    │          │   DB   │
└────┬────┘          └────┬────┘          └────┬─────┘          └───┬────┘
     │                    │                     │                    │
     │ Mensagem recebida  │                     │                    │
     │ "Quero comprar"    │                     │                    │
     │───────────────────>│                     │                    │
     │                    │                     │                    │
     │                    │ classify(text)      │                    │
     │                    │────────────────────>│                    │
     │                    │                     │                    │
     │                    │                     │ Analisa palavras   │
     │                    │                     │ • "comprar" → high │
     │                    │                     │ • detecta interesse│
     │                    │                     │                    │
     │                    │ {priority, interest}│                    │
     │                    │<────────────────────│                    │
     │                    │                     │                    │
     │                    │ Cria Lead                                │
     │                    │─────────────────────────────────────────>│
     │                    │                     │                    │
     │                    │ Cria Message                             │
     │                    │─────────────────────────────────────────>│
     │                    │                     │                    │
     │                    │ generateResponse()  │                    │
     │                    │────────────────────>│                    │
     │                    │                     │                    │
     │                    │ "Vou encaminhar..."│                    │
     │                    │<────────────────────│                    │
     │                    │                     │                    │
     │                    │ Salva resposta IA                        │
     │                    │─────────────────────────────────────────>│
     │                    │                     │                    │
     │                    │ assignLead()        │                    │
     │                    │────────────────────────────────────────> │
     │                    │                     │                    │
     │                    │                     │  Round-robin       │
     │                    │                     │  • Busca users     │
     │                    │                     │  • Verifica limite │
     │                    │                     │  • Atribui         │
     │                    │                     │                    │
     │                    │ {assignedTo}                             │
     │                    │<─────────────────────────────────────────│
     │                    │                     │                    │
     │  Resposta         │                     │                    │
     │<───────────────────│                     │                    │
     │                    │                     │                    │
```

## 🔄 Distribuição Round-Robin

```javascript
// Algoritmo Simplificado

lastIndex = 0  // Estado persistente

function assignLead(leadId) {
  users = getActiveUsers()  // role='user' AND available=true
  
  for (i = 0; i < users.length; i++) {
    lastIndex = (lastIndex + 1) % users.length  // Rotação circular
    candidate = users[lastIndex]
    
    activeLeads = countActiveLeads(candidate.id)
    
    if (activeLeads < candidate.maxLeads) {
      // Atribui ao candidato
      updateLead(leadId, { assignedTo: candidate.id })
      logAssignment(leadId, candidate.id)
      return candidate
    }
  }
  
  // Fallback: todos no limite → atribui ao admin
  admin = getAdmin()
  updateLead(leadId, { assignedTo: admin.id })
  return admin
}
```

**Exemplo prático:**

```
Usuários disponíveis:
- User 1 (5 leads ativos, max: 30)
- User 2 (3 leads ativos, max: 30)
- User 3 (30 leads ativos, max: 30) ← no limite
- User 4 (0 leads ativos, max: 30)
- User 5 (12 leads ativos, max: 30)

lastIndex = 2 (última atribuição foi User 3)

Novo lead chega:
1. Tenta User 4 (índice 3): OK! ✅ (0 < 30)
   → Atribui ao User 4
   → lastIndex = 3
```

## 🗄️ Modelo de Dados (Prisma Schema)

```prisma
model User {
  id        String    @id @default(uuid())
  email     String    @unique
  password  String    // SHA256 hash
  name      String
  role      String    // "admin" | "user"
  available Boolean   @default(true)
  maxLeads  Int       @default(30)
  leads     Lead[]
  tasks     Task[]
}

model Lead {
  id           String    @id @default(uuid())
  name         String?
  phone        String
  email        String?
  origin       String    // "whatsapp", "manual", "website"
  priority     String    // "high", "medium", "low"
  stage        String    // "new", "contacted", "qualified", ...
  assignedTo   String?
  assignedUser User?     @relation(fields: [assignedTo])
  status       String    // "open", "closed"
  interest     String?   // Detectado pela IA
  notes        String?
  messages     Message[]
  logs         LeadLog[]
  tasks        Task[]
  tags         Tag[]
}

model Message {
  id        String   @id
  lead      Lead     @relation(fields: [leadId])
  leadId    String
  sender    String   // nome do user ou "bot" ou phone
  text      String
  direction String   // "incoming" | "outgoing"
}

model LeadLog {
  id        String   @id
  lead      Lead     @relation(fields: [leadId])
  leadId    String
  action    String   // "created", "assigned", "updated", ...
  message   String
}

model Task {
  id          String    @id
  title       String
  description String?
  dueDate     DateTime?
  completed   Boolean   @default(false)
  lead        Lead?     @relation(fields: [leadId])
  user        User?     @relation(fields: [userId])
}

model Tag {
  id     String @id
  name   String
  color  String?
  lead   Lead   @relation(fields: [leadId])
}
```

## 🔑 Permissões por Role

| Endpoint | Public | User | Admin |
|----------|--------|------|-------|
| POST /login | ✅ | ✅ | ✅ |
| POST /webhook | ✅ | ✅ | ✅ |
| GET /me | ❌ | ✅ | ✅ |
| GET /users | ❌ | ✅ (só ele) | ✅ (todos) |
| GET /leads | ❌ | ✅ (só seus) | ✅ (todos) |
| POST /leads | ❌ | ✅ | ✅ |
| PATCH /leads/:id | ❌ | ✅ (só seus) | ✅ (todos) |
| POST /distribute | ❌ | ❌ | ✅ |
| GET /reports/overview | ❌ | ❌ | ✅ |

## 🎨 Componentes Frontend

```
frontend/src/
├── contexts/
│   └── AuthContext.jsx       # Gerenciamento global de auth
├── pages/
│   ├── Login.jsx             # Tela de login
│   └── Dashboard.jsx         # Dashboard principal + Kanban
├── App.jsx                   # Router lógico (Login vs Dashboard)
├── main.jsx                  # Entry point
└── styles.css                # Tailwind + customizações
```

**AuthContext Simplificado:**

```javascript
const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))

  async function login(email, password) {
    const res = await axios.post('/api/login', { email, password })
    localStorage.setItem('token', res.data.token)
    setToken(res.data.token)
    setUser(res.data.user)
  }

  function logout() {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
```

## 📊 Performance & Escalabilidade

**Otimizações Implementadas:**
- Índices automáticos no Prisma (PK, FK, unique)
- Polling a cada 5s (evita sobrecarga)
- Filtros no backend (reduz payload)
- JWT stateless (sem session storage)

**Próximas Otimizações:**
- WebSocket para real-time (eliminar polling)
- Redis para cache de usuários
- PostgreSQL para produção
- CDN para assets estáticos
- Rate limiting nos endpoints públicos

## 🔒 Segurança

**Implementado:**
- ✅ JWT com expiração (7 dias)
- ✅ Hash de senhas (SHA256)
- ✅ CORS configurado
- ✅ Validação de inputs
- ✅ Permissões por role

**Recomendações Futuras:**
- [ ] Usar bcrypt em vez de SHA256
- [ ] HTTPS obrigatório em produção
- [ ] Rate limiting
- [ ] SQL injection protection (Prisma já protege)
- [ ] XSS protection (sanitizar inputs)
- [ ] CSRF tokens
- [ ] 2FA para admins

## 🚀 Deploy (Sugestão)

**Backend:**
- Railway / Render / Heroku
- Variáveis de ambiente: JWT_SECRET, DATABASE_URL
- PostgreSQL em produção

**Frontend:**
- Vercel / Netlify
- Build: `npm run build`
- Variável: VITE_API_URL

**Banco:**
- PostgreSQL (Supabase / Railway)
- Migrations automáticas com Prisma

---

**Stack Final:**
- Frontend: React 18 + Vite 5 + Tailwind 3
- Backend: Node.js 20 + Express 4 + Prisma 5
- Database: SQLite (dev) / PostgreSQL (prod)
- Auth: JWT + SHA256 (migrar para bcrypt)
- Real-time: Polling 5s (migrar para WebSocket)
