# 📦 Guia: Subir Projeto para GitHub e Usar Codespaces

Este guia explica como criar um repositório no GitHub, fazer upload do projeto e iniciar o GitHub Codespaces.

---

## 📋 Pré-requisitos

- Conta no GitHub (gratuita): https://github.com/signup
- Git instalado (opcional para linha de comando)

---

## 🚀 Passo 1: Criar Repositório no GitHub

### Opção A: Via Interface Web (Mais Fácil)

1. **Acesse:** https://github.com/new
2. **Preencha:**
   - **Repository name:** `lead-campanha-crm` (ou o nome que preferir)
   - **Description:** "Sistema CRM com WhatsApp Cloud API e Chat em Tempo Real"
   - **Visibility:** 
     - ✅ **Private** (recomendado - apenas você vê)
     - ⚠️ Public (qualquer pessoa pode ver o código)
3. **NÃO marque:**
   - ❌ Add a README file
   - ❌ Add .gitignore
   - ❌ Choose a license
4. **Clique:** "Create repository"

### Opção B: Via GitHub CLI (Avançado)

```powershell
# Instale GitHub CLI: https://cli.github.com/
gh auth login
gh repo create lead-campanha-crm --private --source=. --remote=origin
```

---

## 📤 Passo 2: Fazer Upload do Projeto

### Opção A: Via GitHub Web (Upload Direto)

1. **Na página do repositório criado, clique:** "uploading an existing file"
2. **Arraste toda a pasta** `Lead Campanha` para a área de upload
3. **Aguarde o upload** de todos os arquivos
4. **Escreva uma mensagem:** "Initial commit - CRM WhatsApp"
5. **Clique:** "Commit changes"

⚠️ **IMPORTANTE:** Certifique-se de que os arquivos `.env` **NÃO** sejam enviados (o `.gitignore` deve impedir isso).

### Opção B: Via Git (Linha de Comando)

Abra o PowerShell **na pasta do projeto** (`Lead Campanha`):

```powershell
# 1. Inicialize o Git (se ainda não foi feito)
git init

# 2. Adicione todos os arquivos
git add .

# 3. Faça o primeiro commit
git commit -m "Initial commit - CRM WhatsApp"

# 4. Conecte ao repositório remoto (substitua SEU_USUARIO pelo seu usuário do GitHub)
git remote add origin https://github.com/SEU_USUARIO/lead-campanha-crm.git

# 5. Envie os arquivos
git branch -M main
git push -u origin main
```

**Se pedir credenciais:**
- **Username:** seu usuário do GitHub
- **Password:** use um **Personal Access Token** (não a senha da conta)
  - Crie em: https://github.com/settings/tokens
  - Permissões: `repo` (full control)

---

## 🌐 Passo 3: Abrir no GitHub Codespaces

### 3.1. Acessar o Repositório

1. **Acesse:** `https://github.com/SEU_USUARIO/lead-campanha-crm`
2. **Clique no botão verde:** `<> Code`
3. **Selecione a aba:** `Codespaces`
4. **Clique:** `Create codespace on main`

![Codespaces Button](https://docs.github.com/assets/cb-77061/mw-1440/images/help/codespaces/new-codespace-button.webp)

### 3.2. Aguardar Setup Automático

O Codespaces vai:
- ✅ Criar um ambiente Linux com Node.js 20
- ✅ Instalar extensões do VS Code
- ✅ Executar `postCreateCommand` (npm install, prisma generate, etc.)
- ⏱️ **Tempo estimado:** 2-5 minutos

Você verá logs no terminal automático.

### 3.3. Configurar Variáveis de Ambiente

1. **No terminal do Codespaces, execute:**

```bash
# Backend
cd backend
cp .env.example .env
nano .env  # ou use o editor do VS Code
```

2. **Preencha as variáveis obrigatórias:**

```env
# Database
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET="seu-secret-super-seguro-aqui-12345"

# WhatsApp Cloud API (Meta Business)
WHATSAPP_API_TOKEN="seu-token-aqui"
WHATSAPP_PHONE_NUMBER_ID="seu-phone-id-aqui"
WHATSAPP_BUSINESS_ACCOUNT_ID="seu-business-id-aqui"
WHATSAPP_VERIFY_TOKEN="seu-verify-token-aqui"

# Server
NODE_ENV="development"
```

3. **Frontend:**

```bash
cd ../frontend
cp .env.example .env
# O frontend detecta URLs automaticamente no Codespaces!
```

---

## ▶️ Passo 4: Rodar o Projeto

No terminal do Codespaces:

```bash
# Volte para a raiz do projeto
cd /workspaces/lead-campanha-crm

# Execute o projeto (backend + frontend)
npm run dev
```

Você verá:
```
Backend rodando em http://localhost:4000
Frontend rodando em http://localhost:5173
```

---

## 🌍 Passo 5: Acessar URLs Públicas

### 5.1. Abrir a Aba "Ports"

1. **No VS Code do Codespaces, clique na aba:** `PORTS` (painel inferior)
2. **Você verá duas portas:**
   - `4000` - Backend
   - `5173` - Frontend

### 5.2. Tornar Portas Públicas

Para cada porta:
1. **Clique com botão direito** na porta
2. **Selecione:** `Port Visibility` > `Public`

### 5.3. Acessar as URLs

As URLs públicas terão o formato:
- **Backend:** `https://CODESPACE-NAME-4000.app.github.dev`
- **Frontend:** `https://CODESPACE-NAME-5173.app.github.dev`

**Clique no ícone de globo** 🌐 ao lado da porta para abrir no navegador.

---

## 🔐 Passo 6: Fazer Login

Acesse o frontend e use as credenciais padrão:

- **Email:** `admin@leadcampanha.com`
- **Senha:** `admin123`

---

## 🤖 Passo 7: Configurar WhatsApp (Opcional)

### 7.1. Obter Credenciais da Meta

1. **Acesse:** https://developers.facebook.com/apps
2. **Crie um app** do tipo "Business"
3. **Adicione o produto:** "WhatsApp"
4. **Configure:**
   - Webhook URL: `https://SEU-CODESPACE-4000.app.github.dev/api/webhook/whatsapp`
   - Verify Token: o mesmo que você colocou no `.env`
   - Subscribe to: `messages`

### 7.2. Obter Tokens

- **Phone Number ID:** Configurações > WhatsApp > API Setup
- **Business Account ID:** Configurações > WhatsApp > API Setup
- **Access Token:** Configurações > WhatsApp > API Setup > Generate Token

### 7.3. Atualizar `.env`

Coloque os valores obtidos no arquivo `backend/.env` e **reinicie o servidor:**

```bash
# Pare o servidor (Ctrl+C)
npm run dev
```

---

## 🔄 Iteração e Alterações

### Para Fazer Alterações:

1. **Edite os arquivos** no VS Code do Codespaces
2. **O hot-reload** vai recarregar automaticamente
3. **Salve alterações no Git:**

```bash
git add .
git commit -m "Descrição da alteração"
git push
```

### Para Atualizar o Banco de Dados:

```bash
cd backend
npx prisma migrate dev --name descricao_da_mudanca
```

### Para Adicionar Pacotes:

```bash
# Backend
cd backend
npm install nome-do-pacote

# Frontend
cd frontend
npm install nome-do-pacote
```

---

## 📚 Próximos Passos

1. ✅ **Teste o chat em tempo real** (página Atendimentos)
2. ✅ **Configure n8n Cloud** ([N8N_INTEGRATION.md](./N8N_INTEGRATION.md))
3. ✅ **Customize layouts e funcionalidades** conforme necessário
4. ✅ **Configure webhooks do WhatsApp** para receber mensagens

---

## 🆘 Troubleshooting

### Problema: "Ports não aparecem"

**Solução:** Execute `npm run dev` novamente.

### Problema: "Frontend não conecta ao backend"

**Solução:** Verifique se ambas as portas estão públicas na aba "Ports".

### Problema: "Erro ao rodar migrations"

**Solução:**
```bash
cd backend
rm -rf prisma/dev.db
npx prisma migrate reset --force
npx prisma migrate dev
npm run seed
```

### Problema: "WhatsApp não recebe mensagens"

**Solução:**
1. Verifique se o webhook está configurado corretamente
2. Certifique-se de que a porta 4000 está pública
3. Teste o endpoint: `https://SEU-CODESPACE-4000.app.github.dev/api/webhook/whatsapp`

---

## 💡 Dicas

- **Codespaces é gratuito** para contas pessoais (60 horas/mês)
- **Os dados persistem** enquanto o Codespace existir
- **Você pode parar e reiniciar** o Codespace sem perder dados
- **Use `.gitignore`** para não enviar `.env` e `node_modules`

---

**🎉 Pronto! Agora você tem o CRM rodando no GitHub Codespaces e pode iterar conforme necessário.**

**📖 Documentação Adicional:**
- [CODESPACES_README.md](./CODESPACES_README.md)
- [N8N_INTEGRATION.md](./N8N_INTEGRATION.md)
- [GUIA_COMPLETO.md](./GUIA_COMPLETO.md)
