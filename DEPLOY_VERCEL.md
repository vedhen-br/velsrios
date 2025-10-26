# 🚀 Deploy - Vercel (Frontend) + Render (Backend)

Este guia descreve o fluxo adotado em produção:

- Frontend estático na Vercel (React + Vite)
- Backend dedicado no Render (Node/Express + Prisma)

---

## ⚡ **Por que Vercel + GitHub?**

### ✅ **Vantagens:**
- **Deploy automático** a cada git push
- **Serverless** - escala automaticamente
- **Zero configuração** de servidor
- **Postgres integrado** (Vercel Postgres)
- **Edge Functions** para performance global
- **SSL gratuito** e CDN automático
- **Sem Docker** - mais simples e rápido

### 📊 Arquitetura (atual)
```
GitHub (main)
 ├─ Vercel → builda frontend (Vite) → https://velsrios.vercel.app
 └─ Render → executa backend (Express/Prisma) → https://lead-campanha-api.onrender.com
Banco: Neon Postgres (SSL obrigatório)
```

---

## 🔧 **Preparação do Projeto**

### 1. Estrutura do projeto

```diff
Lead Campanha/
├── frontend/          # ✅ Deploy como Static Site (Vercel)
├── backend/           # ✅ API dedicada (Render)
├── .devcontainer/     # ❌ Não usado (só para Codespaces)
  ├── api/             # Removido (funções serverless legadas)
  ├── vercel.json      # Rewrites do SPA
  └── prisma/          # Removido (schema legado)
```

### 2. **Arquivos Já Criados:**
- ✅ `vercel.json` - Configuração principal

---

## 🌐 **Passo 1: Criar Projeto no Vercel**

### 1.1. **Acessar Vercel:**
- **Site:** https://vercel.com
- **Login:** Use sua conta GitHub (`vedhen-br`)

### 1.2. **Importar Repositório:**
1. Clique em **"New Project"**
2. **Import Git Repository**
3. Selecione: `vedhen-br/velsrios`
4. **Framework Preset:** "Other"
5. **Root Directory:** `/` (raiz)

### 1.3. **Configurar Build:**
- **Build Command:** `cd frontend && npm run build`
- **Output Directory:** `frontend/dist`
- **Install Command:** `npm install && cd frontend && npm install && cd ../backend && npm install`

---

## 🗄️ Banco de dados (Produção)

Em produção usamos Neon Postgres configurado no Render (backend). No Render, defina:

```
POSTGRES_PRISMA_URL
POSTGRES_URL_NON_POOLING
JWT_SECRET
FRONTEND_URL (ex.: https://velsrios.vercel.app)
PORT (4000)
AUTO_SEED (opcional), ADMIN_EMAIL, ADMIN_PASSWORD
```

Obs.: A seção abaixo sobre Vercel Postgres é legado; mantenha-a apenas como referência.

### 2.1. **Criar Vercel Postgres:**
1. No painel do Vercel → **Storage** → **Create Database**
2. Tipo: **Postgres**
3. Nome: `lead-campanha-db`
4. Region: **Washington, D.C. (iad1)** (mais próximo do Brasil)

### 2.2. **Copiar Variáveis de Ambiente:**
O Vercel gerará automaticamente:
```env
POSTGRES_URL="postgres://..."
POSTGRES_PRISMA_URL="postgres://..."
POSTGRES_URL_NON_POOLING="postgres://..."
POSTGRES_USER="..."
POSTGRES_HOST="..."
POSTGRES_PASSWORD="..."
POSTGRES_DATABASE="..."
```

### 2.3. **Migrar Schema (Legado atualizado):**
```bash
# O schema legado na raiz foi removido.
# Para testes locais com Postgres, use o schema do backend:
cd backend
npx prisma migrate dev --name init
```

---

## ⚙️ Variáveis de Ambiente – Vercel (Frontend)

Em Project → Settings → Environment Variables, defina (Production):

```
VITE_API_URL = https://lead-campanha-api.onrender.com/api
VITE_WS_URL  = https://lead-campanha-api.onrender.com
```

Após salvar, faça Redeploy (as envs só entram na build).

---

## ⚙️ **Passo 3: Configurar Variáveis de Ambiente** (Legado – Vercel Postgres)

### 3.1. **No Painel Vercel:**
1. **Projeto** → **Settings** → **Environment Variables**
2. **Adicionar as seguintes variáveis:**

```env
# Database (Auto-geradas pelo Vercel Postgres)
POSTGRES_URL="postgres://..."
POSTGRES_PRISMA_URL="postgres://..."
POSTGRES_URL_NON_POOLING="postgres://..."

# Aplicação
NODE_ENV="production"
JWT_SECRET="seu-jwt-secret-super-seguro-production"

# WhatsApp Cloud API (Opcional)
WHATSAPP_API_TOKEN="seu-token-whatsapp"
WHATSAPP_PHONE_NUMBER_ID="seu-phone-id"
WHATSAPP_BUSINESS_ACCOUNT_ID="seu-business-id"
WHATSAPP_VERIFY_TOKEN="seu-verify-token"

# URLs (Auto-detectadas)
FRONTEND_URL="https://seu-app.vercel.app"
BACKEND_URL="https://seu-app.vercel.app"
```

### 3.2. **Ambiente de desenvolvimento:**
```env
# Para Codespaces/Local - manter SQLite
DATABASE_URL="file:./dev.db"
NODE_ENV="development"
```

---

## 🚀 Deploy e Configuração

### 4.1. **Primeiro Deploy:**
```bash
# Commit as alterações para Vercel
git add .
git commit -m "Add: Configuração Vercel + PostgreSQL"
git push origin main
```

O Vercel fará deploy automático em ~2-3 minutos.

### URLs de Produção
- Frontend: `https://velsrios.vercel.app`
- Backend: `https://lead-campanha-api.onrender.com`
- Docs API (Swagger): `https://lead-campanha-api.onrender.com/api/docs`

### 4.3. **Seed do Banco:**
```bash
# Via Vercel CLI ou no primeiro acesso
npx prisma db seed
```

---

## 🧪 Testes e Validação

### 5.1. **Testar Endpoints:**
```bash
# Health check
curl https://lead-campanha-api.onrender.com/api/health

# Login
curl -X POST https://lead-campanha-api.onrender.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@leadcampanha.com","password":"admin123"}'
```

### 5.2. **Testar Frontend:**
1. Acesse: `https://velsrios.vercel.app`
2. Login: `admin@leadcampanha.com` / `admin123`
3. Teste: Dashboard, Contatos, Atendimentos

### 5.3. **Logs e Debug:**
- **Vercel Dashboard** → **Functions** → **View Logs**
- **Real-time logs** durante execução

---

## 🔄 **Fluxo de Desenvolvimento**

### Desenvolvimento (Codespaces):
```bash
# SQLite para desenvolvimento rápido
npm run dev
# Acesso: https://seu-codespace-5173.app.github.dev
```

### Produção (Fluxo)
1) `git push origin main`
2) Vercel builda o frontend; Render inicia o backend com `db:deploy && start`
3) Validar `/api/health` e `/api/docs` no Render e UI na Vercel

---

## 🤖 **Configurar WhatsApp Webhook**

### 5.1. **URL do Webhook:**
```
https://lead-campanha-api.onrender.com/api/webhook
```

### 5.2. **Meta Business (Facebook):**
1. **App Settings** → **WhatsApp** → **Configuration**
2. **Webhook URL:** `https://lead-campanha-api.onrender.com/api/webhook`
3. **Verify Token:** (mesmo valor da env var)
4. **Subscribe:** `messages`

---

## 🆘 **Troubleshooting**

### ❌ **Erro: "Module not found"**
**Causa:** Estrutura de pastas incorreta
**Solução:** Verificar `vercel.json` e paths das imports

### ❌ **Erro: "Database connection failed"**
**Causa:** Env vars do Postgres não configuradas
**Solução:** Copiar vars do painel Vercel Postgres

### ❌ **Erro: "Function timeout"**
**Causa:** Serverless functions têm limite de 10s (hobby) / 60s (pro)
**Solução:** Otimizar queries ou upgrade plano

### ❌ **Frontend não conecta à API**
**Causa:** CORS ou URL incorreta
**Solução:** Verificar `FRONTEND_URL` nas env vars

---

## 💰 **Custos Vercel**

### **Hobby (Gratuito):**
- ✅ **100GB bandwidth**
- ✅ **1000 serverless executions**
- ✅ **1 concurrent build**
- ✅ **Postgres:** 60h compute time
- ⏱️ **Function timeout:** 10 segundos

### **Pro ($20/mês):**
- ✅ **1TB bandwidth**
- ✅ **Unlimited executions**
- ✅ **12 concurrent builds**
- ✅ **Postgres:** 1000h compute time
- ⏱️ **Function timeout:** 60 segundos

---

## 🔗 **Links Úteis**

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Seu Projeto:** https://vercel.com/vedhen-br/velsrios
- **Documentação:** https://vercel.com/docs
- **Postgres Docs:** https://vercel.com/docs/storage/vercel-postgres

---

## 🎯 **Resumo dos Benefícios**

| Aspecto | Codespaces (Dev) | Vercel (Prod) | Docker |
|---------|------------------|---------------|---------|
| **Setup** | ✅ Automático | ✅ Zero-config | ❌ Complexo |
| **Performance** | ✅ Rápido | ✅ Edge CDN | ⚠️ Overhead |
| **Escalabilidade** | ❌ 1 usuário | ✅ Auto-scale | ⚠️ Manual |
| **Custo** | ✅ Gratuito | ✅ Tier gratuito | 💰 Servidor |
| **Manutenção** | ✅ Zero | ✅ Zero | ❌ Alta |

**🎉 Resultado: Sistema profissional sem complexidade de Docker!**
