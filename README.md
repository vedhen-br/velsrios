# 🚀 Lead Campanha - Sistema CRM Completo

[![Deploy](https://img.shields.io/badge/Deploy-Vercel-000000?style=flat&logo=vercel)](https://vercel.com)
[![GitHub](https://img.shields.io/badge/GitHub-velsrios-181717?style=flat&logo=github)](https://github.com/vedhen-br/velsrios)

## 📋 Sobre o Projeto

Sistema CRM completo para gestão de leads e campanhas de marketing, desenvolvido com tecnologias modernas e focado na automação de processos comerciais.

### 🎯 Objetivo Principal
Criar uma plataforma completa de CRM que permita:
- Gestão eficiente de leads e contatos
- Automação de processos comerciais
- Integração com WhatsApp para comunicação
- Análise de performance e relatórios detalhados
- Sistema de tarefas e follow-ups
- Classificação automática de leads com IA

## 🏗️ Arquitetura do Sistema

### Frontend — React + Vite (Vercel)
- React 18 + Vite + Tailwind
- AuthContext com persistência (localStorage)
- WebSocket (socket.io-client)
- Notificações in-app (sino com badge) e browser (quando permitido)
- Build estático hospedado na Vercel

### Backend — Node.js + Express + Prisma (Render)
- Prisma ORM conectado ao PostgreSQL (Neon)
- Autenticação JWT
- Socket.io (salas por lead e por usuário)
- Endpoints REST (leads, users, tasks, reports, whatsapp, stats)
- Segurança: helmet, rate limit, CORS
- Docs: Swagger UI em `/api/docs`
- Auto-seed opcional controlado por env

### Banco de Dados — Neon (Postgres)
- URLs separadas: pooler (POSTGRES_PRISMA_URL) e non-pooling (POSTGRES_URL_NON_POOLING)
- SSL obrigatório (sslmode=require)

### Deploy e CI/CD
- GitHub → push na branch `main` aciona:
	- Render (backend): `npm run db:deploy && npm start`
	- Vercel (frontend): build estático
- Frontend aponta para o backend dedicado via `VITE_API_URL` e `VITE_WS_URL`

## 📁 Estrutura do Projeto

```
Lead Campanha/
├── frontend/            # React App (Vite + Tailwind)
├── backend/             # API Node/Express (Prisma + JWT + Socket.io)
├── prisma/              # Schema alternativo (referência)
├── api/                 # (Opcional) Funções Vercel antigas, não usadas em prod
└── .github/workflows/   # CI (build)
```

## ✅ Status de Implementação

### ✅ **CONCLUÍDO**
- [x] Frontend + Backend integrados (Vercel + Render)
- [x] Autenticação (JWT + login persistente)
- [x] Banco de dados (Neon Postgres) com Prisma
- [x] API (health, login, leads CRUD, tasks, stats, reports)
- [x] Socket.io (tiping, salas, eventos de mensagem/lead)
- [x] Notificações in-app e browser
- [x] Docs Swagger em `/api/docs`
- [x] Hardening: helmet, rate limit, CORS
- [x] Auto-seed opcional
- [x] Ajustes (admin): simplificado para apenas “Configurações”
- [x] Integração WhatsApp Cloud API com fallback de simulação
- [x] Integração WhatsApp via QR (WhatsApp Web) com Baileys
	- Geração de QR + status em tempo real via WebSocket
	- Recebimento/envio de mensagens roteados para Atendimentos
	- Preferência por sessão QR quando conectada; fallback Cloud API/simulação
	- Persistência da sessão no PostgreSQL (tabela `whatsapp_store`) para sobreviver a reinícios
- [x] Correções de deploy Vercel (remoção de rewrites), ErrorBoundary e DebugBar (prod)
- [x] CI: lint + teste mínimo no frontend antes do build

### 🚧 **EM PROGRESSO**
- [ ] Validação de produção completa (fluxos por perfil)
- [ ] Relatórios avançados e gráficos
- [ ] Testes automatizados (frontend e backend)

### 📋 **PLANEJADO**

## 🎯 Próximos Passos Priorizados

### **Opção 1: Página de Contatos (CRM Completo)** ⭐ **RECOMENDADO**
**Objetivo**: Transformar em um CRM completo e funcional
- [ ] Listagem completa de leads com busca e filtros avançados
- [ ] Importação/exportação CSV
- [ ] Ações em massa (tags, reatribuição, exclusão)
- [ ] Melhor gestão de toda a base de contatos
- [ ] Sistema de tags e categorização
- [ ] Histórico de interações

### **Opção 2: Relatórios e Indicadores** 📊
**Objetivo**: Analytics e Business Intelligence
- [ ] Dashboard analítico com gráficos (Chart.js/Recharts)
- [ ] Métricas de conversão e performance
- [ ] Relatórios por período/usuário/equipe
- [ ] KPIs de vendas e ROI
- [ ] Exportação de relatórios (PDF/Excel)

### **Opção 3: Sistema de Tarefas Completo** ✅
**Objetivo**: Gestão de produtividade e follow-ups
- [ ] Gestão de follow-ups e pendências
- [ ] Agenda integrada (calendar view)
- [ ] Lembretes e notificações
- [ ] Vinculação a leads e oportunidades
- [ ] Sistema de prioridades

### **Opção 4: Painel Admin/Configurações** ⚙️
**Objetivo**: Gestão administrativa completa
- [ ] Gerenciamento de usuários e equipes
- [ ] Templates de mensagens personalizáveis
- [ ] Configurações do sistema
- [ ] Controle de limites e permissões
- [ ] Auditoria e logs

### **Opção 5: WhatsApp (Cloud API + QR)** 📱
**Objetivo**: Robustez e multi-conexão
- [ ] Entrega de mídia e recibos (read/delivered) completos nas duas integrações
- [ ] Painel de status da conexão/renovação de token
- [ ] Persistência de sessão QR com redundância (ex.: storage externo)
- [ ] Reprocessamento de webhooks em caso de falha

## 🔄 Fluxo de Desenvolvimento

### **GitHub + Vercel + Render Workflow**
1. **Desenvolvimento Local**: Fazer alterações no código
2. **Commit & Push**: `git add .` → `git commit -m "feat: descrição"` → `git push`
3. **Auto-Deploy**:
	- Render (backend) recebe o novo código e inicia `db:deploy` + `start`
	- Vercel (frontend) builda o site estático
4. **Ambiente**:
	- Vercel: `VITE_API_URL` e `VITE_WS_URL` devem apontar para o backend do Render
	- Render: `FRONTEND_URL` deve apontar para o domínio Vercel
5. **Teste**: Verificar frontend (login, leads, notificações) e backend (`/api/health`, `/api/docs`)
6. **Documentação**: Atualizar este README com progresso

### **Comandos Úteis**
```powershell
# Frontend (dev)
cd frontend; npm run dev

# Backend (dev)
cd backend; npm run dev

# Prisma
cd backend; npm run db:generate
cd backend; npm run db:deploy

# Migrar tabela da sessão WhatsApp (necessário para QR persistente)
cd backend; npm run db:deploy

# Checks rápidos
cd backend; npm run check:db
cd backend; npm run check:api
```

## 🎨 Design System

### **Cores Principais**
- **Primary**: Blue (#3B82F6)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)

### **Componentes Base**
- Layout responsivo (mobile-first)
- Sidebar navigation
- Cards e modais
- Formulários padronizados
- Tabelas com paginação

## 📊 Métricas de Sucesso

### **KPIs do Projeto**
- [ ] Taxa de conversão de leads
- [ ] Tempo médio de resposta
- [ ] Satisfação do usuário (NPS)
- [ ] Performance da aplicação (< 3s load time)
- [ ] Uptime do sistema (> 99.5%)

## 🚀 Tecnologias

### Frontend
- React 18 + Vite, Tailwind, Axios, socket.io-client

### Backend
- Node.js + Express, Prisma, Socket.io, JWT, Helmet, express-rate-limit, Swagger UI
- WhatsApp Web (Baileys) + sessão persistida no Postgres

### Deploy
- Vercel (frontend), Render (backend), Neon Postgres (DB), GitHub Actions (build)

## 📝 Atualizações Recentes

### [26-27/10/2025]
- Ajustes (admin) simplificado para apenas “Configurações”
- Aba WhatsApp com modo “Conectar via QR”: modal com QR e status ao vivo
- Backend com Baileys e sessão persistida (tabela `whatsapp_store`)
- Envio de mensagens prioriza QR quando conectado; fallback Cloud API/simulado
- Correções de deploy e estabilidade (ErrorBoundary, DebugBar, env fallback no frontend)

### [25/10/2025]
- Backend hardening (helmet, rate limit, CORS), Swagger em `/api/docs`
- Auto-seed opcional no startup (controlado por `AUTO_SEED`)
- Eventos socket para `lead:new` e `message:new`
- Frontend com NotificationsProvider e sino no header
- Dashboard e Atendimentos integrados a dados reais
- CI (Actions) para build dos pacotes

---

## 📞 Próxima Sessão de Desenvolvimento

**Foco Atual**: Implementação da Página de Contatos (Opção 1)
- Iniciar pela listagem de leads
- Implementar busca e filtros
- Adicionar ações em massa

**Lembretes**:
- Sempre fazer push para GitHub para atualizar Vercel
- Atualizar este README com progresso
- Testar em produção após cada deploy
- Documentar novas funcionalidades

---

### 🔗 Troubleshooting
Veja problemas comuns e soluções em [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

*Última atualização: 27/10/2025*
*Desenvolvido por: Pedro Neto*
