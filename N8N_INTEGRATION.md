# 🔗 Integração n8n Cloud - Lead Campanha CRM

## 📋 Visão Geral

Este documento detalha como integrar o **Lead Campanha CRM** com **n8n Cloud** para automações de:
- ✅ Captação de leads via formulários
- ✅ Envio de mensagens WhatsApp
- ✅ Notificações automáticas
- ✅ Qualificação de leads com IA
- ✅ Distribuição automática

---

## 🎯 Arquitetura da Integração

```
┌─────────────┐      Webhook       ┌──────────────┐
│   n8n Cloud │ ◄─────────────────► │  Backend API │
│  (Workflows)│      HTTP/JSON     │  (Express)   │
└─────────────┘                     └──────────────┘
      │                                    │
      │ Triggers:                          │ Endpoints:
      │ - Form Submit                      │ - POST /webhook
      │ - WhatsApp                         │ - POST /leads
      │ - Schedule                         │ - POST /leads/:id/messages
      │ - HTTP Request                     │ - GET /leads
      └────────────────────────────────────┘
```

---

## 🔌 Endpoints Disponíveis para n8n

### 1. **Webhook Principal** - Receber Leads
**Endpoint:** `POST /api/webhook`

**Descrição:** Webhook público para receber novos leads de qualquer fonte externa (formulários, landing pages, Meta WhatsApp Business).

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Body (JSON):**
```json
{
  "phone": "+5511999999999",
  "text": "Olá, tenho interesse no produto X",
  "name": "João Silva",
  "email": "joao@example.com",
  "origin": "whatsapp"
}
```

**Response (200 OK):**
```json
{
  "leadAdmin": { "id": "uuid", "phone": "+5511999999999", ... },
  "leadUser": { "id": "uuid", "assignedTo": "user-id", ... },
  "assigned": { "userId": "user-id", "userName": "Carlos" }
}
```

**Uso no n8n:**
- Trigger: Webhook ou HTTP Request
- Adicione este endpoint na URL do webhook
- Configure método POST
- Mapeie os dados do formulário para o JSON acima

---

### 2. **Criar Lead Manualmente**
**Endpoint:** `POST /api/leads`

**Descrição:** Criar um novo lead manualmente (requer autenticação).

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

**Body (JSON):**
```json
{
  "name": "Maria Santos",
  "phone": "+5511988888888",
  "email": "maria@example.com",
  "origin": "manual",
  "priority": "high",
  "interest": "Produto Premium"
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "name": "Maria Santos",
  "phone": "+5511988888888",
  "status": "open",
  "stage": "new",
  "createdAt": "2025-10-23T10:00:00Z"
}
```

---

### 3. **Enviar Mensagem WhatsApp**
**Endpoint:** `POST /api/leads/:leadId/messages`

**Descrição:** Enviar mensagem para um lead específico via WhatsApp Cloud API.

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

**Body (JSON):**
```json
{
  "text": "Olá! Obrigado pelo seu interesse. Como posso ajudar?"
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "leadId": "lead-uuid",
  "content": "Olá! Obrigado pelo seu interesse...",
  "sender": "agent",
  "status": "sent",
  "whatsappId": "wamid.xxx",
  "createdAt": "2025-10-23T10:05:00Z"
}
```

---

### 4. **Listar Leads**
**Endpoint:** `GET /api/leads`

**Descrição:** Listar todos os leads (com filtros opcionais).

**Headers:**
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

**Query Parameters:**
- `stage` - Filtrar por estágio (new, contacted, qualified, etc)
- `priority` - Filtrar por prioridade (low, medium, high)
- `assignedTo` - Filtrar por usuário responsável

**Exemplo:**
```
GET /api/leads?stage=new&priority=high
```

**Response (200 OK):**
```json
[
  {
    "id": "uuid",
    "name": "João Silva",
    "phone": "+5511999999999",
    "stage": "new",
    "priority": "high",
    "assignedTo": "user-id",
    "createdAt": "2025-10-23T09:00:00Z"
  }
]
```

---

### 5. **Buscar Lead por ID**
**Endpoint:** `GET /api/leads/:id`

**Descrição:** Buscar informações detalhadas de um lead específico.

**Headers:**
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "name": "João Silva",
  "phone": "+5511999999999",
  "email": "joao@example.com",
  "origin": "whatsapp",
  "stage": "new",
  "priority": "high",
  "status": "open",
  "assignedUser": {
    "id": "user-id",
    "name": "Carlos"
  },
  "messages": [...],
  "logs": [...],
  "tasks": [...]
}
```

---

### 6. **Atualizar Lead**
**Endpoint:** `PATCH /api/leads/:id`

**Descrição:** Atualizar informações de um lead.

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

**Body (JSON):**
```json
{
  "stage": "qualified",
  "priority": "high",
  "notes": "Cliente muito interessado em plano anual"
}
```

---

### 7. **Health Check**
**Endpoint:** `GET /api/health`

**Descrição:** Verificar se a API está online (não requer autenticação).

**Response (200 OK):**
```json
{
  "ok": true
}
```

---

## 🤖 Workflows n8n Recomendados

### **Workflow 1: Captar Leads de Formulário**

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Webhook    │────►│ Set Fields   │────►│ HTTP Request │
│  (Trigger)   │     │ (Transform)  │     │ (POST /leads)│
└──────────────┘     └──────────────┘     └──────────────┘
```

**Configuração:**
1. **Webhook Node**: Recebe dados do formulário
2. **Set Node**: Mapeia campos (nome, email, telefone)
3. **HTTP Request Node**: Envia para `POST /api/webhook`

**Dados de exemplo (entrada do formulário):**
```json
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "telefone": "11999999999",
  "mensagem": "Quero saber mais sobre o produto"
}
```

**Transformação (Set Node):**
```json
{
  "name": "{{$json.nome}}",
  "email": "{{$json.email}}",
  "phone": "+55{{$json.telefone}}",
  "text": "{{$json.mensagem}}",
  "origin": "formulario_site"
}
```

---

### **Workflow 2: Enviar Mensagem de Boas-Vindas**

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Webhook    │────►│   Filter     │────►│ HTTP Request │
│ (Lead Novo)  │     │ (Se novo)    │     │ (Send Msg)   │
└──────────────┘     └──────────────┘     └──────────────┘
```

**Configuração:**
1. **Webhook Node**: Escuta `POST /api/webhook` (nosso backend envia evento)
2. **If Node**: Verifica se `stage === 'new'`
3. **HTTP Request Node**: Envia mensagem via `POST /api/leads/:id/messages`

**Body da Mensagem:**
```json
{
  "text": "👋 Olá {{$json.name}}! Obrigado pelo seu contato. Em breve um consultor entrará em contato."
}
```

---

### **Workflow 3: Qualificar Leads com IA (ChatGPT)**

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Schedule   │────►│ Get Leads    │────►│   ChatGPT    │────►│ Update Lead  │
│  (Diário)    │     │ (Não qualif.)│     │ (Analisar)   │     │ (Priority)   │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

**Configuração:**
1. **Cron Node**: Executa diariamente às 9h
2. **HTTP Request**: `GET /api/leads?stage=new`
3. **Loop**: Para cada lead
4. **OpenAI Node**: Analisa texto inicial e classifica prioridade
5. **HTTP Request**: `PATCH /api/leads/:id` com nova priority

---

### **Workflow 4: Notificar Admin de Lead Prioritário**

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Webhook    │────►│   Filter     │────►│    Email     │
│ (Lead Novo)  │     │ (High Prior.)│     │ (Gmail/SMTP) │
└──────────────┘     └──────────────┘     └──────────────┘
```

**Configuração:**
1. **Webhook**: Recebe webhook quando lead é criado
2. **If Node**: Se `priority === 'high'`
3. **Gmail Node**: Envia email para admin

**Email Template:**
```
Assunto: 🚨 Novo Lead Prioritário - {{$json.name}}

Olá Admin,

Um novo lead de alta prioridade acabou de chegar:

Nome: {{$json.name}}
Telefone: {{$json.phone}}
Interesse: {{$json.interest}}
Mensagem: {{$json.initialMessage}}

Acesse o CRM: https://seu-crm.com/leads/{{$json.id}}
```

---

### **Workflow 5: Sync com Google Sheets**

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Schedule   │────►│  Get Leads   │────►│ Google Sheet │
│  (Hora/Hora) │     │ (Últimos)    │     │ (Append Row) │
└──────────────┘     └──────────────┘     └──────────────┘
```

**Configuração:**
1. **Cron Node**: A cada hora
2. **HTTP Request**: `GET /api/leads?createdAt=>last_hour`
3. **Google Sheets Node**: Adiciona linha com dados do lead

---

## 🔐 Autenticação

### **Obter Token JWT:**

**Endpoint:** `POST /api/login`

**Body:**
```json
{
  "email": "admin@leadcampanha.com",
  "password": "sua-senha"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "Admin",
    "email": "admin@leadcampanha.com",
    "role": "admin"
  }
}
```

**Usar no n8n:**
1. Adicione um nó **HTTP Request** para fazer login
2. Extraia o `token` da response
3. Use em **Header Auth** nos próximos requests:
   ```
   Authorization: Bearer {{$json.token}}
   ```

---

## 🌐 URLs do Codespaces

Quando rodar no GitHub Codespaces, as URLs públicas serão:

**Backend API:**
```
https://seu-codespace-name-4000.app.github.dev/api
```

**Frontend:**
```
https://seu-codespace-name-5173.app.github.dev
```

**Webhook para n8n:**
```
https://seu-codespace-name-4000.app.github.dev/api/webhook
```

> **Dica:** O Codespace expõe automaticamente as portas como públicas. Copie a URL no painel "Ports" do VS Code.

---

## 📊 Exemplos de Automações Completas

### **1. Captação de Lead → WhatsApp → CRM**

**Fluxo:**
1. Cliente preenche formulário no site
2. n8n recebe webhook do formulário
3. n8n transforma dados e envia para `/api/webhook`
4. Backend cria lead e distribui para usuário
5. Backend envia mensagem automática via WhatsApp
6. WebSocket notifica usuário em tempo real

---

### **2. Lead Inativo → Reativação Automática**

**Fluxo:**
1. n8n executa workflow diário (Cron)
2. Busca leads sem interação há 7 dias
3. Para cada lead, envia mensagem:
   - "Olá! Ainda tem interesse? Podemos ajudar?"
4. Atualiza stage para "reativacao"
5. Notifica vendedor

---

### **3. Lead Qualificado → Agendar Reunião**

**Fluxo:**
1. Webhook notifica n8n quando lead é marcado como "qualified"
2. n8n envia email com link do Calendly
3. Cria tarefa no CRM para vendedor
4. Adiciona lead em lista do Google Sheets
5. Envia notificação no Slack

---

## 🛠️ Variáveis de Ambiente Necessárias

Para integração completa, configure no backend (`.env`):

```env
# n8n Integration
N8N_WEBHOOK_URL=https://seu-n8n.app.n8n.cloud/webhook/lead-criado
N8N_API_KEY=sua-api-key-n8n

# WhatsApp (Meta Business API)
WHATSAPP_PHONE_NUMBER_ID=123456789
WHATSAPP_ACCESS_TOKEN=seu-token-meta
WHATSAPP_VERIFY_TOKEN=lead_campanha_webhook_token_2025
```

---

## 🚀 Próximos Passos

1. **Deploy no Codespaces:** Push seu código para GitHub e abra no Codespaces
2. **Configure n8n Cloud:** Crie conta em [n8n.cloud](https://n8n.cloud)
3. **Crie Workflows:** Use os exemplos acima como base
4. **Configure Webhooks:** Aponte para sua URL pública do Codespaces
5. **Teste Integração:** Envie leads de teste e valide fluxo completo

---

## 📞 Suporte

Dúvidas ou problemas? Verifique:
- Logs do backend: Veja console do Node.js
- Logs do n8n: Acesse execuções do workflow
- Network: Verifique se URLs estão públicas no Codespaces

---

**🎉 Pronto! Seu CRM agora está integrado com n8n Cloud para automações ilimitadas!**
