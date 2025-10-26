# 🧰 Operations Runbook – Lead Campanha

Guia rápido para releases, incidentes e rotinas de operação.

---

## 🔄 Releases

1) Pré-checagens
- Frontend: build local `npm run build --prefix frontend`
- Backend: `npm run db:generate --prefix backend`
- Linhas principais de mudança anotadas no PR/commit

2) Deploy
- `git push origin main` (dispara Vercel + Render)
- Vercel: verifica build do frontend
- Render: verifica logs – procura `🚀 Backend rodando` e `🟡/✅ Auto-seed`

3) Pós-deploy (smoke tests)
- Backend: `GET /api/health` (200 ok)
- Backend: `GET /api/docs` (Swagger abre)
- Frontend: login admin, abrir Atendimentos, criar “+ Novo Lead”, enviar mensagem
- Dashboard: números de `/api/leads/stats` carregam

---

## 🧪 Checks rápidos

- DB connectivity (backend): `npm run check:db --prefix backend`
- API health (backend): `npm run check:api --prefix backend`
- Prisma migrate (prod): Render roda `npm run db:deploy` no start

---

## ⚙️ Variáveis de Ambiente

Vercel (Frontend)
- `VITE_API_URL = https://lead-campanha-api.onrender.com/api`
- `VITE_WS_URL  = https://lead-campanha-api.onrender.com`
- Após alterar: Save + Redeploy (envs só entram na build)

Render (Backend)
- `POSTGRES_PRISMA_URL` (pooler)
- `POSTGRES_URL_NON_POOLING` (directUrl)
- `JWT_SECRET`, `PORT=4000`, `FRONTEND_URL=https://velsrios.vercel.app`
- (Opcional) `AUTO_SEED`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`

---

## 🔐 CORS e Proxy

- CORS usa `FRONTEND_URL`
- Express por trás de proxy (Render): `app.set('trust proxy', 1)` – já configurado

---

## 📣 Notificações & WebSocket

- Eventos emitidos pelo backend:
  - `lead:new` após criar lead (contém `lead` e `userId` destino)
  - `message:new` após enviar mensagem (contém `leadId`, `leadName`, `message`)
- Frontend escuta e cria notificações in-app

---

## 🧯 Incidentes comuns

- UI não reflete mudanças: ver `frontend/src/main.jsx` (usa `./App`), conferir envs Vercel e fazer Redeploy, hard refresh.
- Erro rate-limit no Render: `trust proxy` já habilitado; checar se não foi removido.
- Prisma P1013: URLs começam com `postgresql://` (ou `postgres://` conforme driver), sem aspas extras; usar pooler no datasource.

---

## ↩️ Rollback rápido

- Reverter commit no GitHub para o último estável (ou criar hotfix)
- Redeploy Vercel (Production) e Render (Manual Deploy)
- Validar smoke tests

---

## 📎 Links úteis

- Vercel: https://vercel.com/vedhen-br/velsrios
- Frontend: https://velsrios.vercel.app
- Render (backend): https://dashboard.render.com/
- Backend: https://lead-campanha-api.onrender.com/api/health | /api/docs
