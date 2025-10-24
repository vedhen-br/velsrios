# 🚀 Deploy no Vercel - Guia Completo

Este guia explica como fazer deploy do **Lead Campanha CRM** no **Vercel** (sem Docker).

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

### 📊 **Arquitetura:**
```
GitHub Repo → Vercel Deploy → Production URLs
     ↓              ↓              ↓
  Frontend    Static Site    https://seu-app.vercel.app
  Backend     API Routes    https://seu-app.vercel.app/api/*
  Database    Postgres      Vercel Postgres (integrado)
```

---

## 🔧 **Preparação do Projeto**

### 1. **Estrutura Atual vs Vercel:**

```diff
Lead Campanha/
├── frontend/          # ✅ Deploy como Static Site
├── backend/           # 🔄 Vira Serverless Functions
├── .devcontainer/     # ❌ Não usado (só para Codespaces)
+ ├── api/             # ✅ Nova pasta para Vercel Functions  
+ ├── vercel.json      # ✅ Configuração do Vercel
+ └── prisma/          # 🔄 Migra SQLite → PostgreSQL
```

### 2. **Arquivos Já Criados:**
- ✅ `vercel.json` - Configuração principal
- ✅ `api/index.js` - Entry point das Functions
- ✅ `prisma/schema-postgres.prisma` - Schema PostgreSQL

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

## 🗄️ **Passo 2: Configurar Banco PostgreSQL**

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

### 2.3. **Migrar Schema:**
```bash
# No Codespaces ou local:
cp prisma/schema-postgres.prisma prisma/schema.prisma
npx prisma migrate dev --name init-postgres
```

---

## ⚙️ **Passo 3: Configurar Variáveis de Ambiente**

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

## 🚀 **Passo 4: Deploy e Configuração**

### 4.1. **Primeiro Deploy:**
```bash
# Commit as alterações para Vercel
git add .
git commit -m "Add: Configuração Vercel + PostgreSQL"
git push origin main
```

O Vercel fará deploy automático em ~2-3 minutos.

### 4.2. **URLs Geradas:**
- **Frontend:** `https://velsrios.vercel.app`
- **API:** `https://velsrios.vercel.app/api/health`
- **Admin:** `https://velsrios.vercel.app/api/`

### 4.3. **Seed do Banco:**
```bash
# Via Vercel CLI ou no primeiro acesso
npx prisma db seed
```

---

## 🧪 **Passo 5: Testes e Validação**

### 5.1. **Testar Endpoints:**
```bash
# Health check
curl https://velsrios.vercel.app/api/health

# Login
curl -X POST https://velsrios.vercel.app/api/login \
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

### Produção (Vercel):
```bash
# Push para deploy automático
git push origin main
# Deploy: https://velsrios.vercel.app (automático)
```

---

## 🤖 **Configurar WhatsApp Webhook**

### 5.1. **URL do Webhook:**
```
https://velsrios.vercel.app/api/webhook/whatsapp
```

### 5.2. **Meta Business (Facebook):**
1. **App Settings** → **WhatsApp** → **Configuration**
2. **Webhook URL:** `https://velsrios.vercel.app/api/webhook/whatsapp`  
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