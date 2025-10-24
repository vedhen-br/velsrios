# 🔧 Guia Rápido: Subir Projeto para GitHub

## 📋 Situação Atual
- ✅ Projeto completo commitado localmente
- ✅ Git configurado corretamente  
- ❌ Precisa criar/conectar repositório GitHub

---

## 🚀 Passo 1: Criar Repositório no GitHub

### Opção A: Via Interface Web (Recomendado)

1. **Acesse:** https://github.com/new
2. **Preencha:**
   - **Repository name:** `lead-campanha-crm`
   - **Description:** "Sistema CRM com WhatsApp Cloud API e Chat em Tempo Real"
   - **Visibility:** Private ✅ (recomendado) ou Public
   - **❌ NÃO marque:** Add a README file, Add .gitignore, Choose a license

3. **Clique:** "Create repository"

4. **Copie a URL** que aparecerá (formato: `https://github.com/SEU_USUARIO/lead-campanha-crm.git`)

### Opção B: Via GitHub CLI (Se tiver instalado)

```powershell
# No terminal do projeto:
gh auth login
gh repo create lead-campanha-crm --private --source=. --remote=origin --push
```

---

## 🔗 Passo 2: Conectar Repositório Local

**Substitua `SEU_USUARIO_GITHUB` pelo seu usuário real do GitHub:**

```powershell
cd "c:\Users\pedro.neto\Desktop\Lead Campanha"
git remote add origin https://github.com/SEU_USUARIO_GITHUB/lead-campanha-crm.git
git branch -M main
git push -u origin main
```

### Se pedir credenciais:
- **Username:** seu usuário do GitHub
- **Password:** use um **Personal Access Token** (não a senha da conta)
  - Crie um token em: https://github.com/settings/tokens
  - Permissões necessárias: `repo` (full control)

---

## ✅ Passo 3: Verificar Upload

1. **Acesse seu repositório:** `https://github.com/SEU_USUARIO/lead-campanha-crm`
2. **Verifique se todos os arquivos estão lá:**
   - ✅ `backend/` (pasta completa)
   - ✅ `frontend/` (pasta completa)  
   - ✅ `.devcontainer/` (para Codespaces)
   - ✅ Arquivos de documentação (README.md, SETUP_GITHUB.md, etc.)

---

## 🌐 Passo 4: Testar no Codespaces

1. **No seu repositório GitHub:**
   - Clique em `<> Code` (botão verde)
   - Aba `Codespaces` 
   - `Create codespace on main`

2. **Aguarde setup automático** (2-5 minutos)

3. **Configure .env e rode:**
   ```bash
   cd backend
   cp .env.example .env
   nano .env  # Configure JWT_SECRET e outras vars
   cd ..
   npm run dev
   ```

4. **Acesse via URLs públicas** na aba "Ports"

---

## 🆘 Troubleshooting

### ❌ Erro: "Repository not found"
**Causa:** Repositório não existe ou nome incorreto
**Solução:** Certifique-se de que criou o repositório e o nome está correto

### ❌ Erro: "Authentication failed"  
**Solução:** Use Personal Access Token ao invés da senha
- Crie em: https://github.com/settings/tokens
- Escopo: `repo`

### ❌ Erro: "Permission denied"
**Solução:** Verifique se você é o owner do repositório

---

## 📝 Comandos Prontos para Copiar

**Depois de criar o repositório, substitua `SEU_USUARIO` e execute:**

```powershell
cd "c:\Users\pedro.neto\Desktop\Lead Campanha"
git remote add origin https://github.com/SEU_USUARIO/lead-campanha-crm.git
git push -u origin main
```

---

## 🎯 Status Atual do Projeto

O commit atual inclui:
- ✅ **56 arquivos alterados** 
- ✅ **WhatsApp Cloud API** implementado
- ✅ **WebSocket** para real-time
- ✅ **Codespaces** configurado
- ✅ **Documentação completa** (guias, checklists)
- ✅ **Backend + Frontend** completos

**Total:** ~18.000 linhas de código atualizadas!

---

**💡 Depois de subir, siga o [COMECE_AQUI.md](./COMECE_AQUI.md) para rodar no Codespaces.**