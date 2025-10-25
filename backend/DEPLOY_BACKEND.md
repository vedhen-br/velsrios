# Deploy do Backend (Express + Prisma + Socket.io)

Este guia prepara o backend para rodar em um host dedicado (Render/Railway/Fly/EC2), usando o banco Neon (Vercel Storage) como PostgreSQL.

## ✅ Pré‑requisitos
- Banco Neon criado no Vercel (você já tem)
- Variáveis do Neon disponíveis (recomendado marcar Dev/Preview/Prod)
  - POSTGRES_PRISMA_URL (host com "-pooler")
  - POSTGRES_URL_NON_POOLING (host sem "-pooler")
- JWT_SECRET definido (string segura)
- FRONTEND_URL (URL do app no Vercel, ex.: https://velsrios.vercel.app)

## 📦 Variáveis de ambiente (backend/.env)

```
POSTGRES_PRISMA_URL=postgresql://...-pooler.../neondb?sslmode=require
POSTGRES_URL_NON_POOLING=postgresql://.../neondb?sslmode=require
JWT_SECRET=sua-chave-segura
FRONTEND_URL=https://velsrios.vercel.app
PORT=4000
```

Obs.: O `schema.prisma` já usa essas variáveis:
- `url = env("POSTGRES_PRISMA_URL")`
- `directUrl = env("POSTGRES_URL_NON_POOLING")`

## 🛠️ Passos locais (opcional, para testar)

```powershell
cd backend
npm install
# Aplicar migrações
npm run db:deploy
# (opcional) popular a base (APAGA dados):
npm run seed
# Testar conexão com o banco
npm run check:db
# Subir API local
npm run dev
# Testar API
npm run check:api
```

URLs esperadas:
- Health: http://localhost:4000/api/health
- Ping:   http://localhost:4000/api/ping

## � Auto-seed sem Shell (opcional)

Para evitar uso de Shell no provedor, habilite um auto-seed seguro que só roda quando o banco estiver vazio:

```
AUTO_SEED=true
ADMIN_EMAIL=admin@leadcampanha.com
ADMIN_PASSWORD=admin123
```

Ao subir o serviço, o backend criará o admin e 5 usuários de demonstração se não existir nenhum usuário no banco. Não apaga dados existentes e roda apenas uma vez.

## �🚀 Deploy em um host (ex.: Render)

1. Criar serviço Web (Node) apontando para `backend/`
2. Build Command: `npm install`
3. Start Command: `npm run db:deploy && npm start`
4. Variáveis de ambiente (adicionar todas as acima)
5. Health Check (opcional): `/api/health`

Após subir:
- As migrações rodam automaticamente no start (`db:deploy`).
- (opcional) para dados de demo, use `AUTO_SEED=true` (sem precisar de Shell). Caso tenha Shell, você também pode rodar `npm run seed` manualmente.

## 🔌 Conectar o Frontend (Vercel)

No projeto Vercel (Frontend):
- VITE_API_URL = https://SEU-BACKEND-URL/api
- VITE_WS_URL  = https://SEU-BACKEND-URL

Reimplante o frontend. O Dashboard e Atendimentos passarão a usar dados reais.

## 🧪 Verificações Rápidas
- `GET /api/health` → `{ ok: true }`
- `GET /api/leads/stats` → métricas com números > 0 após seed
- `GET /api/leads/atendimento` → lista de leads (vazia no início)
- WebSocket: indicador “Online” na tela de Atendimentos quando o backend estiver ativo

## ❗ Dicas
- Use a URL com `-pooler` para o Prisma principal (POOL) e sem `-pooler` para `directUrl` (migrate/studio).
- `sslmode=require` é necessário no Neon.
- Seeds apagam e recriam dados: use com cautela em produção.

---

Em caso de dúvida, veja também `backend/.env.example` e `README.md` na raiz do projeto.
