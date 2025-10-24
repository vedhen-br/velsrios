# 🚀 Quick Start - GitHub Codespaces

## ⚠️ Pré-requisito: Criar Repositório no GitHub

**Antes de usar o Codespaces, você precisa:**
1. Criar um repositório no GitHub
2. Fazer upload do projeto para o repositório

📘 **[SIGA O GUIA COMPLETO: SETUP_GITHUB.md](./SETUP_GITHUB.md)** 📘

---

## Depois de Configurar o GitHub:

1. Acesse seu repositório no GitHub
2. Clique em `Code` > `Codespaces` > `Create codespace on main`
3. Aguarde o setup automático (2-5 minutos)
4. Execute: `npm run dev`
5. Acesse URLs públicas na aba "Ports"

**📖 Documentação Completa:** [CODESPACES_README.md](./CODESPACES_README.md)

---

## 📚 Documentação Adicional

| Arquivo | Descrição |
|---------|-----------|
| **[SETUP_GITHUB.md](./SETUP_GITHUB.md)** | 📦 **COMECE AQUI:** Guia passo a passo para GitHub |
| **[CODESPACES_README.md](./CODESPACES_README.md)** | 🌐 Guia completo para GitHub Codespaces |
| **[N8N_INTEGRATION.md](./N8N_INTEGRATION.md)** | 🤖 Integração com n8n Cloud |
| **[GUIA_COMPLETO.md](./GUIA_COMPLETO.md)** | 📖 Documentação técnica |
| **[README.md](./README.md)** | 📄 Documentação geral do projeto |

---

## 🔧 Setup Rápido

### GitHub Codespaces (Recomendado)

```bash
# Após abrir o Codespace, execute:
npm run dev

# Ou use o script helper:
bash setup-codespaces.sh
```

### Local

```bash
npm run install-all
cd backend && npx prisma generate && npx prisma migrate dev
npm run seed
cd .. && npm run dev
```

---

## 🌐 URLs no Codespaces

- **Backend:** `https://seu-codespace-4000.app.github.dev`
- **Frontend:** `https://seu-codespace-5173.app.github.dev`
- **Webhook n8n:** `https://seu-codespace-4000.app.github.dev/api/webhook`

> As URLs são detectadas automaticamente pelo frontend!

---

## 🔐 Login Padrão

- **Email:** `admin@leadcampanha.com`
- **Senha:** `admin123`

---

**💡 Dica:** Leia [CODESPACES_README.md](./CODESPACES_README.md) para instruções detalhadas de configuração do WhatsApp, n8n e troubleshooting.
