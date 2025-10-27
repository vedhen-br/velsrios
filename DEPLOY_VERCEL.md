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

## 🧩 Cache no Vercel (evitar UI antiga após deploy)

Para que cada deploy apareça imediatamente para todos os usuários sem precisar dar hard refresh:

- Já incluímos `vercel.json` na raiz com headers de cache:
  - `Cache-Control: no-cache, no-store, must-revalidate` para `/` e `/index.html` (o HTML nunca é cacheado).
  - `Cache-Control: public, max-age=31536000, immutable` para `/assets/*` (arquivos com hash gerados pelo Vite, seguros para cache longo).
- O Vite já gera nomes com hash (ex.: `/assets/app.abc123.js`), então quando você faz um novo deploy, o HTML aponta para novos arquivos e o usuário recebe a versão nova automaticamente.

Boas práticas adicionais:

1) Após alterar variáveis `VITE_*`, sempre faça "Redeploy" (elas entram na build).
2) Se algo parecer desatualizado, use a ação "Redeploy > Clear Build Cache" na Vercel para forçar build do zero.
3) Evite service workers agressivos (PWA) se não forem necessários. Este projeto não registra SW por padrão.

### Verificar a versão em produção (debug rápido)

Ativamos um mini painel de diagnóstico. Abra qualquer página com `?debug=1` no final da URL, por exemplo:

```
https://velsrios.vercel.app/#atendimentos?debug=1
```

Você verá no canto inferior esquerdo:
- `env` (onde está rodando)
- `apiUrl` e `wsUrl` resolvidos
- `commit` (primeiros 7 chars do SHA do deploy)
- `builtAt` (timestamp da build)

Isso ajuda a confirmar rapidamente se a versão em produção bate com o commit esperado.

---

## 🔐 Ajustes Recomendados para Render (Backend)

No painel do Render (onde o backend está hospedado), defina as seguintes variáveis de ambiente para permitir que o frontend implantado (Vercel) se conecte ao backend via CORS / socket.io:

```
FRONTEND_URL=https://velsrios.vercel.app
EXTRA_ALLOWED_ORIGINS=https://velsrios.vercel.app
# Para depuração temporária (NÃO recomendado em produção):
ALLOW_ALL_ORIGINS=false
```

Explicação:
- `FRONTEND_URL` é usado internamente para gerar links e referência de callback (webhook).
- `EXTRA_ALLOWED_ORIGINS` aceita uma lista separada por vírgula de domínios que o backend deve aceitar (CORS/socket.io).
- `ALLOW_ALL_ORIGINS=true` permite qualquer origem (útil só para debug rápido; remova em produção).

Após salvar as variáveis no Render, reinicie o serviço para que as novas configurações entrem em vigor.

## ✅ Checklist final — produção

- [ ] No Render (backend): setar `POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING`, `JWT_SECRET`, `FRONTEND_URL`, `EXTRA_ALLOWED_ORIGINS` e reiniciar.
- [ ] No Vercel (frontend): setar `VITE_API_URL` e `VITE_WS_URL` apontando para o backend (`https://lead-campanha-api.onrender.com`) e redeploy.
- [ ] No Neon: confirmar credenciais e que o `POSTGRES_PRISMA_URL` fornecido ao Render consegue migrar/seed.
- [ ] Testar: Login (admin), abrir aba WhatsApp → clicar `Conectar via QR` e observar geração do QR no modal.

Se quiser, eu posso preparar um pequeno arquivo `scripts/deploy-envs.md` com comandos e o payload exato para usar nas CLIs (Vercel/Render) — me diga se prefere isso.

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
