# 🚀 Guia Rápido - Lead Campanha

## ✅ O que foi implementado

### Backend Completo (Node.js + Express + Prisma + SQLite)

✔️ **Autenticação & Permissões**
- Sistema de login com JWT
- Roles: Admin (vê tudo) e User (vê apenas seus leads)
- Middleware de autenticação para rotas protegidas
- Hash de senhas com SHA256

✔️ **Webhook WhatsApp com IA**
- Endpoint `/api/webhook` para receber mensagens
- IA classifica prioridade automaticamente:
  - **Alta**: palavras como "comprar", "quero", "interesse", "urgente"
  - **Média**: palavras como "talvez", "informações", "preço"
  - **Baixa**: demais casos
- Detecta interesse automaticamente (Compra, Investimento, Aluguel)
- Cria lead, registra mensagens e logs

✔️ **Distribuição Round-Robin Inteligente**
- Distribui leads automaticamente entre consultores
- Respeita limite de leads por usuário (padrão: 30)
- Considera disponibilidade do consultor
- Fallback para admin quando necessário
- Logs completos de todas as atribuições

✔️ **CRM Completo**
- 6 estágios do funil: new → contacted → qualified → proposal → negotiation → closed
- Gerenciamento de leads com todos os campos necessários
- Sistema de mensagens vinculadas a leads
- Tarefas vinculadas a leads e usuários
- Tags personalizáveis
- Logs de todas as ações (criação, atualização, atribuição)

✔️ **API RESTful Completa**
- 20+ endpoints documentados
- Filtros avançados (estágio, prioridade, usuário)
- Paginação e ordenação
- Relatórios e métricas para admin

### Frontend Completo (React + Vite + Tailwind)

✔️ **Sistema de Autenticação**
- Tela de login responsiva
- AuthContext com gerenciamento de sessão
- Token JWT armazenado no localStorage
- Logout funcional

✔️ **Dashboard Moderno**
- Cards de estatísticas em tempo real:
  - Total de leads
  - Meus leads
  - Leads não atribuídos
  - Total de usuários
- Atualização automática a cada 5 segundos

✔️ **CRM Kanban Visual**
- 6 colunas representando estágios do funil
- Drag-and-drop visual (clique para mover)
- Cards coloridos por prioridade
- Modal de detalhes do lead
- Botões para mover lead entre estágios

✔️ **Filtros Avançados**
- Filtrar por estágio
- Filtrar por prioridade
- Filtrar por usuário responsável (admin)
- Botão limpar filtros

✔️ **Ações Rápidas**
- Criar lead manualmente
- Distribuir leads (admin)
- Visualizar detalhes completos
- Atualizar estágio do lead

## 🎯 Como usar

### 1. Acesse http://localhost:5173

### 2. Faça login

**Como Admin:**
- Email: `admin@leadcampanha.com`
- Senha: `admin123`
- Pode ver todos os leads
- Pode distribuir leads manualmente
- Acessa relatórios

**Como Consultor:**
- Email: `user1@leadcampanha.com` (até user5)
- Senha: `user123`
- Vê apenas seus próprios leads
- Pode atualizar estágio dos seus leads
- Pode criar tarefas

### 3. Criar leads

**Manualmente no dashboard:**
- Preencha Nome, Telefone e Interesse
- Clique em "Criar Lead"

**Via WhatsApp (simulado):**
```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:4000/api/webhook `
  -ContentType 'application/json' `
  -Body (ConvertTo-Json @{
    phone='5511999887766'
    text='Olá, quero comprar um apartamento'
    name='Cliente Teste'
  })
```

### 4. Distribuir leads

- Como admin, clique no botão "Distribuir"
- O sistema atribuirá automaticamente leads não atribuídos
- Segue algoritmo round-robin com respeito ao limite

### 5. Gerenciar leads no Kanban

- Visualize leads organizados por estágio
- Clique em um lead para ver detalhes
- Use os botões para mover entre estágios
- Cores indicam prioridade:
  - 🔴 Vermelho = Alta
  - 🟡 Amarelo = Média
  - ⚪ Cinza = Baixa

### 6. Filtrar leads

- Use os dropdowns no topo para filtrar
- Combine múltiplos filtros
- Clique em "Limpar" para resetar

## 🔌 Endpoints Principais

### Públicos
- `POST /api/login` - Login
- `POST /api/webhook` - Webhook WhatsApp
- `GET /api/health` - Health check

### Autenticados (precisa de token JWT no header)
- `GET /api/me` - Usuário atual
- `GET /api/users` - Listar usuários
- `GET /api/leads` - Listar leads
- `GET /api/leads/:id` - Detalhes de um lead
- `POST /api/leads` - Criar lead
- `PATCH /api/leads/:id` - Atualizar lead
- `POST /api/leads/:id/messages` - Enviar mensagem
- `POST /api/tasks` - Criar tarefa

### Admin apenas
- `POST /api/distribute` - Distribuir leads
- `GET /api/reports/overview` - Relatórios

## 📊 Banco de Dados (SQLite)

**Tabelas criadas:**
- `User` - Usuários (admin e consultores)
- `Lead` - Leads e prospects
- `Message` - Mensagens do chat
- `LeadLog` - Histórico de ações
- `Task` - Tarefas vinculadas a leads
- `Tag` - Tags personalizáveis

**Arquivo:** `backend/prisma/dev.db`

## 🎨 Próximas Evoluções Sugeridas

1. **Chat em Tempo Real**
   - Implementar WebSocket para mensagens instantâneas
   - Notificações push quando receber nova mensagem
   - Indicador "digitando..."

2. **WhatsApp Cloud API Real**
   - Integrar com Meta Cloud API
   - Enviar/receber mensagens reais
   - Status de leitura e entrega

3. **IA Avançada**
   - Integrar OpenAI GPT-4 para respostas mais inteligentes
   - Análise de sentimento
   - Sugestões de resposta para consultores

4. **Relatórios Visuais**
   - Gráficos de conversão por etapa
   - Dashboard executivo
   - Exportação em PDF/Excel

5. **Notificações**
   - Email quando receber novo lead
   - Alerta quando lead ficar sem resposta
   - Lembretes de tarefas pendentes

6. **Mobile**
   - App React Native
   - Push notifications
   - Acesso offline

## 🐛 Troubleshooting

**Backend não inicia:**
```powershell
cd backend
npm install
npx prisma generate
npm run dev
```

**Frontend não carrega:**
```powershell
cd frontend
npm install
npm run dev
```

**Erro de autenticação:**
- Verifique se o token está sendo enviado no header
- Faça logout e login novamente
- Limpe o localStorage do navegador

**Banco de dados corrompido:**
```powershell
cd backend
npx prisma db push --force-reset
node prisma/seed.js
```

## 📞 Suporte

Qualquer dúvida ou problema, basta pedir!
