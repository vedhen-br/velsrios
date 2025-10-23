# ✅ Checklist: Próximos Passos para Rodar o Projeto

Siga esta lista para colocar o sistema em funcionamento:

---

## 📦 Etapa 1: Configurar GitHub (OBRIGATÓRIO)

- [ ] **1.1** Criar conta no GitHub (se não tiver): https://github.com/signup
- [ ] **1.2** Criar novo repositório:
  - Acesse: https://github.com/new
  - Nome: `lead-campanha-crm`
  - Visibilidade: **Private** (recomendado)
  - **NÃO** marque nenhuma opção adicional
  - Clique em "Create repository"

- [ ] **1.3** Fazer upload do projeto:
  
  **Opção A - Via Web (Mais Fácil):**
  - Clique em "uploading an existing file"
  - Arraste toda a pasta do projeto
  - Commit changes
  
  **Opção B - Via Git (Terminal):**
  ```powershell
  cd "c:\Users\pedro.neto\Desktop\Lead Campanha"
  git init
  git add .
  git commit -m "Initial commit"
  git remote add origin https://github.com/SEU_USUARIO/lead-campanha-crm.git
  git branch -M main
  git push -u origin main
  ```

📘 **Guia detalhado:** [SETUP_GITHUB.md](./SETUP_GITHUB.md)

---

## 🌐 Etapa 2: Abrir no GitHub Codespaces

- [ ] **2.1** Acessar seu repositório no GitHub
- [ ] **2.2** Clicar no botão verde `<> Code`
- [ ] **2.3** Selecionar aba `Codespaces`
- [ ] **2.4** Clicar em `Create codespace on main`
- [ ] **2.5** Aguardar setup automático (2-5 minutos)

---

## ⚙️ Etapa 3: Configurar Variáveis de Ambiente

No terminal do Codespaces:

- [ ] **3.1** Copiar arquivo de exemplo:
  ```bash
  cd backend
  cp .env.example .env
  ```

- [ ] **3.2** Editar o arquivo `.env`:
  ```bash
  nano .env  # ou use o editor do VS Code
  ```

- [ ] **3.3** Preencher as variáveis **obrigatórias**:
  ```env
  DATABASE_URL="file:./dev.db"
  JWT_SECRET="crie-um-secret-aleatorio-seguro-123456"
  NODE_ENV="development"
  ```

- [ ] **3.4** (Opcional) Adicionar credenciais WhatsApp:
  ```env
  WHATSAPP_API_TOKEN="seu-token-meta"
  WHATSAPP_PHONE_NUMBER_ID="seu-phone-id"
  WHATSAPP_BUSINESS_ACCOUNT_ID="seu-business-id"
  WHATSAPP_VERIFY_TOKEN="seu-verify-token"
  ```

---

## ▶️ Etapa 4: Rodar o Projeto

No terminal do Codespaces:

- [ ] **4.1** Voltar para raiz do projeto:
  ```bash
  cd /workspaces/lead-campanha-crm
  ```

- [ ] **4.2** Executar o projeto:
  ```bash
  npm run dev
  ```

- [ ] **4.3** Verificar se apareceu:
  ```
  ✓ Backend rodando em http://localhost:4000
  ✓ Frontend rodando em http://localhost:5173
  ```

---

## 🌍 Etapa 5: Acessar URLs Públicas

- [ ] **5.1** Clicar na aba `PORTS` (painel inferior do VS Code)

- [ ] **5.2** Tornar portas públicas:
  - Clique com botão direito na porta `4000`
  - Selecione `Port Visibility` > `Public`
  - Repita para a porta `5173`

- [ ] **5.3** Abrir o frontend:
  - Clique no ícone de globo 🌐 ao lado da porta `5173`
  - Ou copie a URL: `https://CODESPACE-NAME-5173.app.github.dev`

---

## 🔐 Etapa 6: Testar Login

- [ ] **6.1** Acessar o frontend no navegador
- [ ] **6.2** Fazer login com credenciais padrão:
  - **Email:** `admin@leadcampanha.com`
  - **Senha:** `admin123`
- [ ] **6.3** Verificar se o dashboard carregou

---

## 🤖 Etapa 7: Configurar WhatsApp (Opcional)

⚠️ **Pule esta etapa se quiser apenas testar o sistema localmente**

- [ ] **7.1** Criar app Meta Business: https://developers.facebook.com/apps
- [ ] **7.2** Adicionar produto "WhatsApp"
- [ ] **7.3** Configurar webhook:
  - URL: `https://SEU-CODESPACE-4000.app.github.dev/api/webhook/whatsapp`
  - Verify Token: (o mesmo do `.env`)
  - Subscribe to: `messages`
- [ ] **7.4** Copiar credenciais para `backend/.env`
- [ ] **7.5** Reiniciar servidor: `npm run dev`

📘 **Guia detalhado:** [N8N_INTEGRATION.md](./N8N_INTEGRATION.md)

---

## 🧪 Etapa 8: Testar Funcionalidades

- [ ] **8.1** Criar um novo lead (página Leads)
- [ ] **8.2** Abrir o chat (página Atendimentos)
- [ ] **8.3** Enviar uma mensagem teste
- [ ] **8.4** Verificar se a mensagem aparece em tempo real

---

## 🔄 Etapa 9: Iteração e Alterações

Sempre que quiser fazer alterações:

### Editar Código:
- [ ] Edite os arquivos no VS Code do Codespaces
- [ ] O hot-reload atualiza automaticamente
- [ ] Teste as mudanças no navegador

### Salvar no Git:
```bash
git add .
git commit -m "Descrição da alteração"
git push
```

### Atualizar Banco de Dados:
```bash
cd backend
npx prisma migrate dev --name nome_da_mudanca
```

### Adicionar Pacotes:
```bash
# Backend
cd backend
npm install nome-do-pacote

# Frontend
cd frontend
npm install nome-do-pacote
```

---

## 🆘 Troubleshooting

### ❌ Problema: Ports não aparecem
**Solução:** Execute `npm run dev` novamente

### ❌ Problema: Frontend não conecta ao backend
**Solução:** Certifique-se de que ambas as portas estão públicas

### ❌ Problema: Erro de autenticação
**Solução:** Verifique se o `JWT_SECRET` está configurado no `.env`

### ❌ Problema: Banco de dados corrompido
**Solução:**
```bash
cd backend
rm -rf prisma/dev.db
npx prisma migrate reset --force
npm run seed
```

---

## 📚 Documentação de Referência

| Arquivo | Quando Usar |
|---------|-------------|
| **[SETUP_GITHUB.md](./SETUP_GITHUB.md)** | Primeira vez configurando GitHub/Codespaces |
| **[QUICKSTART.md](./QUICKSTART.md)** | Resumo rápido dos comandos |
| **[CODESPACES_README.md](./CODESPACES_README.md)** | Detalhes técnicos do Codespaces |
| **[N8N_INTEGRATION.md](./N8N_INTEGRATION.md)** | Integrar com n8n Cloud |
| **[GUIA_COMPLETO.md](./GUIA_COMPLETO.md)** | Documentação técnica completa |

---

## 🎉 Próximos Passos Após Tudo Funcionando

1. ✅ **Customize o design** (Tailwind CSS em `frontend/src/`)
2. ✅ **Adicione automações** com n8n Cloud
3. ✅ **Configure usuários** e permissões
4. ✅ **Implemente novos recursos** conforme necessário
5. ✅ **Monitore logs** e ajuste performance

---

**💡 Dica:** Marque cada checkbox conforme completa. Salve este arquivo para acompanhar seu progresso!
