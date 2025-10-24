# 🚀 Lead Campanha CRM - Guia Codespaces

## 📋 Sobre o Projeto

**Lead Campanha CRM** é um sistema completo de gestão de leads com:
- ✅ Chat WhatsApp integrado (Cloud API oficial)
- ✅ WebSocket para atualizações em tempo real
- ✅ Distribuição automática de leads
- ✅ IA para classificação e respostas automáticas
- ✅ Sistema de tarefas e kanban
- ✅ Relatórios e analytics
- ✅ Integração com n8n Cloud para automações

---

## 🌐 Rodando no GitHub Codespaces

### **1. Abrir o Codespace**

1. Acesse o repositório no GitHub
2. Clique no botão verde **"Code"**
3. Selecione a aba **"Codespaces"**
4. Clique em **"Create codespace on main"**
5. Aguarde o container ser criado (1-2 minutos)

### **2. Instalação Automática**

O Codespaces executará automaticamente:
```bash
npm install --prefix backend
npm install --prefix frontend
cd backend && npx prisma generate && npx prisma migrate deploy
```

### **3. Iniciar Aplicação**

No terminal do Codespaces, execute:

```bash
npm run dev
```

Ou para rodar backend e frontend separadamente:

```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend  
npm run dev:frontend
```

### **4. Acessar URLs Públicas**

O Codespaces expõe automaticamente as portas como públicas:

**Backend (API + WebSocket):** Porta `4000`
- Clique na aba **"Ports"** no painel inferior
- Localize a porta `4000`
- Clique no ícone de 🌐 para abrir no navegador
- URL será algo como: `https://seu-codespace-4000.app.github.dev`

**Frontend (React + Vite):** Porta `5173`
- Na aba **"Ports"**, localize a porta `5173`
- Clique no ícone de 🌐 para abrir no navegador
- URL será algo como: `https://seu-codespace-5173.app.github.dev`

> ⚠️ **Importante:** As URLs são detectadas automaticamente! O frontend se conecta ao backend usando a URL do Codespaces.

---

## 🗄️ Banco de Dados

### **SQLite no Codespaces**

O projeto usa **SQLite** como banco de dados, que funciona perfeitamente no Codespaces:

- Arquivo: `backend/prisma/dev.db`
- Migrado automaticamente no `postCreateCommand`
- Persiste entre sessões do Codespace

### **Comandos Prisma Úteis**

```bash
# Ver dados no navegador (Prisma Studio)
npm run prisma:studio

# Criar nova migration
npm run prisma:migrate

# Popular banco com dados de teste
npm run seed
```

### **Acessar Prisma Studio**

1. Execute: `npm run prisma:studio`
2. Prisma Studio abrirá na porta `5555`
3. Acesse via aba "Ports" → porta `5555`
4. Interface visual para ver/editar dados

---

## 🔐 Credenciais Padrão

### **Login Admin**
- **Email:** `admin@leadcampanha.com`
- **Senha:** `admin123`

### **Usuários de Teste**
- **Email:** `user1@leadcampanha.com` até `user5@leadcampanha.com`
- **Senha:** `password123`

---

## ⚙️ Configurações

### **Variáveis de Ambiente**

#### **Backend** (`backend/.env`):
```env
NODE_ENV=development
PORT=4000
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=http://localhost:5173

# WhatsApp Cloud API (Configure na interface)
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_VERIFY_TOKEN=lead_campanha_webhook_token_2025

# n8n Integration
N8N_WEBHOOK_URL=
N8N_API_KEY=
```

#### **Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:4000/api
VITE_WS_URL=http://localhost:4000
VITE_APP_NAME=Lead Campanha CRM
```

> 🔥 **URLs Dinâmicas:** O frontend detecta automaticamente se está rodando no Codespaces e ajusta as URLs. Não precisa editar manualmente!

---

## 💬 Configurar WhatsApp Cloud API

### **1. Criar App no Meta Developer**

1. Acesse [developers.facebook.com](https://developers.facebook.com)
2. Crie novo app → Tipo "Business"
3. Adicione produto "WhatsApp"
4. Anote:
   - **Phone Number ID**
   - **Access Token** (temporário ou permanente)

### **2. Configurar no CRM**

1. Acesse o CRM (`https://seu-codespace-5173.app.github.dev`)
2. Login como admin
3. Vá em **Configurações** → Aba **WhatsApp**
4. Cole as credenciais:
   - Phone Number ID
   - Access Token
   - Verify Token (já pré-preenchido)
5. Clique em **Salvar Configurações**

### **3. Configurar Webhook na Meta**

1. No Meta Developer → WhatsApp → Configuration
2. Clique em "Configure Webhooks"
3. **Callback URL:** Cole a URL do backend + `/api/webhook`
   ```
   https://seu-codespace-4000.app.github.dev/api/webhook
   ```
4. **Verify Token:** `lead_campanha_webhook_token_2025`
5. Marque eventos:
   - ✅ messages
   - ✅ message_status
6. Clique em **Verify and Save**

### **4. Testar Integração**

1. Na interface de configurações do CRM
2. Digite um número de teste
3. Clique em **Enviar Teste**
4. Verifique se a mensagem chegou no WhatsApp

---

## 🤖 Integração com n8n Cloud

### **O que é n8n?**

n8n é uma plataforma de automação low-code que permite criar workflows visuais para:
- Captar leads de formulários
- Enviar mensagens automáticas
- Integrar com Google Sheets, Gmail, Slack, etc.
- Agendar tarefas recorrentes

### **URLs para Webhooks**

**Webhook Principal (receber leads):**
```
https://seu-codespace-4000.app.github.dev/api/webhook
```

**Autenticação (obter JWT token):**
```
https://seu-codespace-4000.app.github.dev/api/login
```

### **Documentação Completa**

Veja o arquivo **[N8N_INTEGRATION.md](./N8N_INTEGRATION.md)** para:
- 📚 Lista completa de endpoints
- 🤖 Workflows prontos para importar
- 🔐 Como autenticar no n8n
- 💡 Exemplos de automações reais

---

## 🛠️ Scripts Disponíveis

### **Raiz do Projeto**

```bash
# Instalar dependências em backend e frontend
npm run install-all

# Rodar backend e frontend juntos
npm run dev

# Rodar apenas backend
npm run dev:backend

# Rodar apenas frontend
npm run dev:frontend

# Build de produção (frontend)
npm run build

# Comandos Prisma
npm run prisma:generate  # Gerar Prisma Client
npm run prisma:migrate   # Criar migration
npm run prisma:studio    # Abrir Prisma Studio
npm run seed             # Popular banco com dados de teste
```

### **Backend** (`cd backend`)

```bash
npm run dev      # Iniciar em modo dev
npm run start    # Iniciar em produção
npm run seed     # Popular banco de dados
```

### **Frontend** (`cd frontend`)

```bash
npm run dev      # Iniciar Vite dev server
npm run build    # Build de produção
npm run preview  # Preview do build
```

---

## 📁 Estrutura do Projeto

```
Lead Campanha/
├── .devcontainer/          # Configuração do Codespaces
│   └── devcontainer.json
├── backend/                # API Node.js + Express
│   ├── prisma/
│   │   ├── schema.prisma   # Schema do banco
│   │   ├── dev.db          # SQLite database
│   │   └── migrations/     # Histórico de migrations
│   ├── src/
│   │   ├── index.js        # Server principal (Express + Socket.io)
│   │   ├── routes/
│   │   │   └── api.js      # Rotas da API
│   │   ├── services/
│   │   │   ├── whatsapp.service.js  # WhatsApp Cloud API
│   │   │   ├── distributor.js       # Distribuição de leads
│   │   │   └── aiClassifier.js      # IA para classificação
│   │   └── auth/
│   │       ├── jwt.js      # JWT middleware
│   │       └── password.js # Hashing de senhas
│   ├── .env                # Variáveis de ambiente
│   └── package.json
├── frontend/               # React + Vite + Tailwind
│   ├── src/
│   │   ├── pages/          # Páginas da aplicação
│   │   │   ├── Atendimentos.jsx   # Chat WhatsApp
│   │   │   ├── Contatos.jsx       # CRM manual
│   │   │   ├── Kanban.jsx         # Pipeline visual
│   │   │   ├── Tarefas.jsx        # To-do list
│   │   │   ├── Relatorios.jsx     # Analytics
│   │   │   ├── Configuracoes.jsx  # Admin settings
│   │   │   └── Perfil.jsx         # User profile
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── contexts/       # React Context (Auth, etc)
│   │   ├── hooks/          # Custom hooks (useSocket)
│   │   └── utils/          # Utilidades (env.js)
│   ├── .env                # Variáveis de ambiente
│   └── package.json
├── N8N_INTEGRATION.md      # Guia de integração n8n
├── GUIA_COMPLETO.md        # Documentação completa
├── package.json            # Scripts raiz
└── README.md               # Este arquivo
```

---

## 🔄 Fluxo de Trabalho

### **1. Desenvolvimento Local (Bloqueado)**

Se você não consegue rodar localmente devido a bloqueios de rede:
- ✅ Use GitHub Codespaces (ambiente completo na nuvem)
- ✅ Todas as portas são expostas publicamente
- ✅ Banco de dados persiste entre sessões

### **2. Desenvolvimento no Codespaces**

1. Abra Codespace
2. Execute `npm run dev`
3. Acesse URLs públicas
4. Desenvolva normalmente
5. Commite e push para GitHub

### **3. Produção**

Para deploy em produção:

**Backend:**
- Deploy em Render, Railway, Heroku, ou DigitalOcean
- Migre de SQLite para PostgreSQL (recomendado)
- Configure variáveis de ambiente
- Configure domínio personalizado

**Frontend:**
- Deploy em Vercel, Netlify, ou Cloudflare Pages
- Configure `VITE_API_URL` para apontar ao backend em produção
- Build automático a cada push

---

## 🐛 Troubleshooting

### **Porta 4000 em uso**

Se aparecer erro `EADDRINUSE`:
```bash
# Mate todos os processos Node
pkill node

# Ou reinicie o Codespace
# Ctrl+Shift+P → "Codespaces: Rebuild Container"
```

### **URLs não funcionam**

1. Verifique aba "Ports" no VS Code
2. Confirme que portas 4000 e 5173 estão **públicas** (ícone de globo)
3. Clique com botão direito → "Port Visibility" → "Public"

### **WebSocket não conecta**

1. Certifique-se que o backend está rodando
2. Verifique console do navegador (F12)
3. URL do WebSocket deve ser a mesma do backend (sem `/api`)

### **Prisma não funciona**

```bash
# Regenerar Prisma Client
cd backend
npx prisma generate

# Recriar migrations
npx prisma migrate dev --name init

# Resetar banco (CUIDADO: apaga tudo)
npx prisma migrate reset
```

### **Frontend não carrega API**

1. Abra console do navegador (F12 → Console)
2. Verifique se a URL da API está correta
3. Veja logs de `env.js` para debug

---

## 📊 Monitoramento

### **Logs do Backend**

No terminal onde rodou `npm run dev:backend`:
```
✅ Cliente conectado: socket-id
📩 Mensagem recebida de João (11999999999)
🔌 WebSocket disponível em ws://localhost:4000
```

### **Logs do Frontend**

No console do navegador (F12):
```
🌐 Environment: {
  isCodespaces: true,
  apiUrl: "https://...-4000.app.github.dev/api",
  wsUrl: "https://...-4000.app.github.dev"
}
```

---

## 🎓 Recursos de Aprendizado

- **Prisma Docs:** https://prisma.io/docs
- **Socket.io Docs:** https://socket.io/docs
- **Vite Docs:** https://vitejs.dev
- **Tailwind CSS:** https://tailwindcss.com
- **WhatsApp Cloud API:** https://developers.facebook.com/docs/whatsapp
- **n8n Docs:** https://docs.n8n.io

---

## 📞 Suporte

Problemas ou dúvidas?

1. Verifique este README
2. Leia [N8N_INTEGRATION.md](./N8N_INTEGRATION.md)
3. Veja [GUIA_COMPLETO.md](./GUIA_COMPLETO.md)
4. Cheque logs do backend e frontend

---

## 🚀 Começar Agora

```bash
# 1. Clone o repositório (ou crie Codespace direto no GitHub)
git clone https://github.com/seu-usuario/lead-campanha.git

# 2. Abra no GitHub Codespaces
# (Clique em Code → Codespaces → Create codespace)

# 3. Aguarde instalação automática

# 4. Rode a aplicação
npm run dev

# 5. Acesse URLs na aba "Ports"
# Backend: porta 4000
# Frontend: porta 5173

# 6. Login com admin@leadcampanha.com / admin123

# 7. Comece a usar! 🎉
```

---

**🎉 Seu CRM está rodando! Explore, personalize e automatize! 💼**
