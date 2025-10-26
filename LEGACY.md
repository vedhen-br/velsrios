# Itens legados removidos/obsoletos

Para simplificar o deploy (Vercel + Render) e evitar conflitos, marcamos como legado:

- `api/` (Vercel Functions): substituído por backend dedicado em `backend/`
- `prisma/schema-postgres.prisma` (na raiz): removido; o schema oficial fica em `backend/prisma/schema.prisma`

Notas:
- O deploy da Vercel ignora `api/`, `backend/` e `prisma/` via `.vercelignore`
- O frontend consome a API dedicada pelo `VITE_API_URL` e `VITE_WS_URL`
- Documentação atualizada em `DEPLOY_VERCEL.md`
