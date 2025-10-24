# Lead Campanha - Plataforma Completa de CRM e Atendimento

Plataforma web de atendimento e CRM integrada ao WhatsApp, com qualificação automatizada de leads via IA e distribuição inteligente round-robin.

## 🚀 Funcionalidades Principais

### 💬 Atendimento
- ✅ Interface de chat 3 colunas estilo papo.ai
- ✅ Webhook WhatsApp com classificação automática via IA
- ✅ Distribuição round-robin com limite de leads por usuário
- ✅ Histórico completo de mensagens e logs

### 📇 CRM Completo
- ✅ **Contatos:** Listagem, busca, filtros avançados, ações em massa, exportar CSV
- ✅ **Kanban:** 6 estágios (new → contacted → qualified → proposal → negotiation → closed)
- ✅ Filtros por estágio, prioridade e responsável
- ✅ Criar e gerenciar leads manualmente

### ✅ Tarefas
- ✅ Sistema completo de tarefas com vinculação a leads
- ✅ Organização automática: Atrasadas, Hoje, Próximas, Sem Data
- ✅ Marcar como concluída, excluir, estatísticas

### 📊 Relatórios e Indicadores
- ✅ KPIs principais: Total, Abertos, Fechados, Taxa de Conversão
- ✅ Funil de conversão visual com percentuais
- ✅ Leads por prioridade e estágio
- ✅ Performance por usuário
- ✅ Filtro por período (data início/fim)

### ⚙️ Configurações (Admin)
- ✅ Gerenciar usuários: limites, disponibilidade, roles
- ✅ Sistema de tags com cores customizáveis
- ✅ Ativar/desativar usuários
- ✅ Controle de permissões

### 🔐 Segurança
- ✅ Autenticação JWT com roles (Admin / User)
- ✅ Permissões por role (admin vê tudo, user vê apenas seus leads)
- ✅ Senhas hashadas com SHA256

## 📁 Estrutura

```
backend/
  src/
    auth/          # JWT e autenticação
    services/      # Distribuidor round-robin e IA
    routes/        # 20+ endpoints API RESTful
  prisma/          # Schema (6 models: User, Lead, Message, LeadLog, Task, Tag)
frontend/
  src/
    contexts/      # AuthContext
    components/    # Layout com navegação completa
    pages/         # 6 páginas: Login, Atendimentos, Dashboard, Contatos, Tarefas, Relatórios, Configurações
```

## � Como Começar

### ⚡ Quick Start (GitHub Codespaces - Recomendado)

**Primeira vez?** Siga o passo a passo completo:

📘 **[SETUP_GITHUB.md](./SETUP_GITHUB.md)** - Guia para criar repositório e usar Codespaces

✅ **[CHECKLIST.md](./CHECKLIST.md)** - Lista de verificação passo a passo

🎯 **[QUICKSTART.md](./QUICKSTART.md)** - Resumo rápido dos comandos

### 🏠 Instalação Local

#### 1. Backend

```powershell
cd "c:\Users\pedro.neto\Desktop\Lead Campanha\backend"
npm install
npx prisma generate
npx prisma db push
node prisma/seed.js
npm run dev
```

O backend estará rodando em **http://localhost:4000**

#### 2. Frontend

```powershell
cd "c:\Users\pedro.neto\Desktop\Lead Campanha\frontend"
npm install
npm run dev
```

O frontend estará rodando em **http://localhost:5173**

## 🔑 Credenciais de Teste

**Administrador:**
- Email: `admin@leadcampanha.com`
- Senha: `admin123`

**Consultores (5 usuários):**
- Email: `user1@leadcampanha.com` até `user5@leadcampanha.com`
- Senha: `user123`

## � Páginas Disponíveis

Após login, acesse:
- `#atendimentos` - Chat/Atendimentos (3 colunas)
- `#contatos` - CRM com listagem completa de leads
- `#kanban` - Dashboard estilo Kanban
- `#tarefas` - Gerenciamento de tarefas
- `#relatorios` - Relatórios e indicadores
- `#configuracoes` - Configurações (admin only)

## �📡 Endpoints da API

### Públicos
- `POST /api/login` - Fazer login
- `POST /api/webhook` - Webhook WhatsApp (cria lead, classifica com IA e distribui)
- `GET /api/health` - Health check

### Autenticados (Header: `Authorization: Bearer <token>`)
- `GET /api/me` - Dados do usuário atual
- `GET /api/users` - Listar usuários
- `GET /api/leads` - Listar leads (filtros: stage, priority, assignedTo)
- `GET /api/leads/:id` - Detalhes de um lead
- `POST /api/leads` - Criar lead manualmente
- `PATCH /api/leads/:id` - Atualizar lead
- `POST /api/leads/:id/messages` - Enviar mensagem
- `GET /api/tasks` - Listar tarefas
- `POST /api/tasks` - Criar tarefa
- `PATCH /api/tasks/:id` - Atualizar tarefa
- `DELETE /api/tasks/:id` - Excluir tarefa
- `GET /api/tags` - Listar tags

### Admin apenas
- `POST /api/distribute` - Distribuir leads não atribuídos
- `GET /api/reports/overview` - Relatórios gerais
- `GET /api/reports/analytics` - Analytics com filtro de data
- `POST /api/leads/bulk` - Ações em massa (reatribuir, excluir)
- `DELETE /api/leads/:id` - Excluir lead
- `GET /api/leads/export/csv` - Exportar leads em CSV
- `POST /api/tags` - Criar tag
- `DELETE /api/tags/:id` - Excluir tag
- `PATCH /api/users/:id` - Atualizar usuário

## 🤖 Webhook WhatsApp

Simule uma mensagem do WhatsApp:

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:4000/api/webhook -ContentType 'application/json' -Body (ConvertTo-Json @{phone='5511999999999'; text='Quero comprar um imóvel'; name='Cliente Teste'})
```

A IA irá:
1. Classificar a prioridade (high/medium/low)
2. Detectar interesse (Compra, Investimento, Aluguel)
3. Criar o lead
4. Distribuir automaticamente via round-robin
5. Enviar resposta automática

## 📚 Documentação

### 🎯 Primeiros Passos
- **[CHECKLIST.md](CHECKLIST.md)** - ✅ Lista de verificação completa (COMECE AQUI!)
- **[SETUP_GITHUB.md](SETUP_GITHUB.md)** - 📦 Guia para GitHub e Codespaces
- **[QUICKSTART.md](QUICKSTART.md)** - ⚡ Resumo rápido dos comandos

### 🌐 Ambiente e Integração
- **[CODESPACES_README.md](CODESPACES_README.md)** - 🌐 Detalhes do GitHub Codespaces
- **[N8N_INTEGRATION.md](N8N_INTEGRATION.md)** - 🤖 Integração com n8n Cloud

### 📖 Documentação Técnica
- **[GUIA_COMPLETO.md](GUIA_COMPLETO.md)** - 📖 Guia de uso geral do sistema
- **[GUIA_MODULOS_1-4.md](GUIA_MODULOS_1-4.md)** - 📋 Funcionalidades detalhadas
- **[CHAT_GUIA.md](CHAT_GUIA.md)** - 💬 Documentação do módulo de chat
- **[ARQUITETURA.md](ARQUITETURA.md)** - 🏗️ Arquitetura técnica
- **[RESUMO_IMPLEMENTACAO.md](RESUMO_IMPLEMENTACAO.md)** - 📊 Resumo técnico

## 🎯 Roadmap

### ✅ Implementado (v2.0)
- ✅ Autenticação e permissões
- ✅ Webhook WhatsApp + IA
- ✅ Distribuição round-robin
- ✅ Chat/Atendimentos (3 colunas)
- ✅ CRM Completo (Contatos + Kanban)
- ✅ Sistema de Tarefas
- ✅ Relatórios e Indicadores
- ✅ Configurações Admin

### 🔜 Próximas Features
- [ ] ✅ **WhatsApp Cloud API real** (Meta Business) - em desenvolvimento
- [ ] ✅ **WebSocket real-time** (Socket.io) - em desenvolvimento
- [ ] Integração com OpenAI GPT-4
- [ ] Templates de mensagens
- [ ] Notificações push
- [ ] Relatórios exportáveis (PDF)
- [ ] Automações avançadas
- [ ] App mobile

## 📊 Estatísticas do Projeto

- **Páginas:** 6 (Login, Atendimentos, Dashboard, Contatos, Tarefas, Relatórios, Configurações)
- **Endpoints API:** 25+
- **Modelos de Dados:** 6 (User, Lead, Message, LeadLog, Task, Tag)
- **Linhas de Código:** ~4.000+
- **Tecnologias:** React, Node.js, Prisma, SQLite, JWT, Tailwind

## 📊 Arquitetura

- **Backend:** Node.js + Express + Prisma + SQLite
- **Frontend:** React 18 + Vite 5 + Tailwind CSS 3
- **Auth:** JWT com SHA256
- **Real-time:** Polling (3-5s) - evolui para WebSocket
- **Database:** SQLite (dev) - pode migrar para PostgreSQL (prod)

---

**Versão:** 2.0  
**Status:** ✅ Completo e Funcional  
**Desenvolvido para:** Campanhas imobiliárias com foco em atendimento automatizado e distribuição inteligente de leads  
**Data:** Outubro 2025
