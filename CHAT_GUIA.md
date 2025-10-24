# 💬 Módulo de Atendimentos / Chat - Lead Campanha

## ✅ O que foi implementado

### Interface Estilo papo.ai (3 Colunas)

**Coluna 1: Lista de Conversas**
- ✅ Filtros: Todos / Novos / Meus
- ✅ Busca por nome ou número
- ✅ Cards com preview da última mensagem
- ✅ Badges de prioridade e status
- ✅ Indicador visual de leads não atribuídos
- ✅ Timestamp das mensagens
- ✅ Atualização automática a cada 3 segundos

**Coluna 2: Área de Chat**
- ✅ Header com nome, telefone e status do lead
- ✅ Histórico completo de mensagens
- ✅ Diferenciação visual:
  - Mensagens recebidas (esquerda, fundo branco)
  - Mensagens enviadas (direita, fundo azul)
  - Mensagens da IA (fundo verde com ícone 🤖)
- ✅ Input para enviar novas mensagens
- ✅ Auto-scroll para última mensagem
- ✅ Timestamps em cada mensagem

**Coluna 3: Detalhes do Lead**
- ✅ Informações completas do lead
- ✅ Seletor de estágio do funil
- ✅ Histórico de logs e ações
- ✅ Dados do responsável

### Navegação Completa

**Menu Principal:**
- ✅ **Atendimentos** - Chat e gestão de conversas
- ✅ **CRM** - Submenu com Contatos e Kanban
- ✅ **Apps** - Submenu com Gestão+, Campanhas, Chatbot, Automações, Agenda, Checklist
- ✅ **Relatórios** - Submenu com Indicadores e Atendimentos
- ✅ **Ajustes** (Admin) - Submenu com Conta, Equipes, Templates, Usuários

**Header:**
- ✅ Logo e marca
- ✅ Menu dropdown funcionais
- ✅ Notificações
- ✅ Perfil do usuário
- ✅ Botão de logout

## 🚀 Como Usar

### 1. Acesse a página de Atendimentos

Após fazer login, você será direcionado automaticamente para a tela de **Atendimentos**.

**URL:** http://localhost:5173 → Redireciona para Atendimentos

### 2. Simule uma mensagem do WhatsApp

Abra o PowerShell e execute:

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:4000/api/webhook `
  -ContentType 'application/json' `
  -Body (ConvertTo-Json @{
    phone='5511988888888'
    text='Olá, quero comprar um apartamento de 3 quartos na Zona Sul'
    name='Maria Silva'
  })
```

**O que acontece:**
1. ✅ Webhook recebe a mensagem
2. ✅ IA analisa o texto:
   - Detecta palavra "comprar" → Prioridade **Alta**
   - Detecta "apartamento" → Interesse: **Compra de imóvel**
3. ✅ Lead é criado no sistema
4. ✅ IA responde automaticamente (mensagem verde com 🤖)
5. ✅ Sistema distribui o lead via round-robin para um consultor disponível
6. ✅ Lead aparece na lista de conversas com badge "Novo"

### 3. Visualize o lead na lista

Na **Coluna 1** (Lista de Conversas):
- Você verá o card com "Maria Silva"
- Badge amarelo "Novo" (lead não atribuído ainda)
- Badge vermelho "high" (prioridade alta)
- Preview da mensagem inicial

### 4. Clique no lead para abrir o chat

**Coluna 2** mostrará:
- Mensagem inicial de Maria (fundo branco, à esquerda)
- Resposta automática da IA (fundo verde com 🤖)

**Coluna 3** mostrará:
- Nome: Maria Silva
- Telefone: 5511988888888
- Interesse: Compra de imóvel
- Prioridade: high
- Estágio: new
- Logs de criação e atribuição

### 5. Envie uma resposta

Digite no campo de texto na parte inferior do chat:

```
Olá Maria! Vi que você tem interesse em apartamento na Zona Sul. 
Temos ótimas opções disponíveis. Qual seria seu orçamento?
```

Clique em **Enviar**.

**Resultado:**
- Mensagem aparece no chat (fundo azul, à direita)
- Timestamp é registrado
- Lead é atualizado automaticamente

### 6. Atualize o estágio do lead

Na **Coluna 3**, use o dropdown "Estágio":
- Selecione "contacted" (Contactado)

**Resultado:**
- Estágio atualizado
- Log registrado no histórico
- Badge no header do chat atualiza

### 7. Filtre conversas

Use os botões no topo da **Coluna 1**:

- **Todos**: Mostra todos os leads
- **Novos**: Apenas leads não atribuídos
- **Meus**: Apenas leads atribuídos a você

## 🔄 Fluxo Completo de Atendimento

### Passo a Passo

```
1. WhatsApp → Webhook
   ├─ Cliente envia: "Quero comprar um apartamento"
   └─ POST /api/webhook

2. IA Analisa
   ├─ Priority: high (palavra "comprar")
   ├─ Interest: "Compra de imóvel" (palavra "apartamento")
   └─ Gera resposta automática

3. Criar Lead
   ├─ Salva no banco
   ├─ Registra mensagem inicial
   └─ Salva resposta da IA

4. Distribuir
   ├─ Round-robin entre consultores
   ├─ Verifica disponibilidade
   ├─ Respeita limite de leads
   └─ Atribui ao consultor

5. Notificar
   ├─ Lead aparece na lista do consultor
   ├─ Badge "Novo" visível
   └─ Atualização a cada 3s

6. Consultor Responde
   ├─ Abre o chat
   ├─ Envia mensagem
   └─ Atualiza estágio

7. Histórico Completo
   ├─ Todas mensagens salvas
   ├─ Logs de ações
   └─ Rastreabilidade total
```

## 🎨 Interface Visual

### Cores e Estados

**Prioridades:**
- 🔴 **Alta (high)**: Badge vermelho
- 🟡 **Média (medium)**: Badge amarelo
- ⚪ **Baixa (low)**: Badge cinza

**Mensagens:**
- 📨 **Recebidas**: Fundo branco, texto preto, à esquerda
- 📤 **Enviadas**: Fundo azul, texto branco, à direita
- 🤖 **IA**: Fundo verde claro, ícone robô, à esquerda

**Estágios:**
- new → contacted → qualified → proposal → negotiation → closed

## 📡 Endpoints Usados

### Chat e Mensagens
- `GET /api/leads` - Lista leads (filtros: stage, priority, assignedTo)
- `GET /api/leads/:id` - Detalhes completos do lead + mensagens
- `POST /api/leads/:id/messages` - Envia nova mensagem
- `PATCH /api/leads/:id` - Atualiza lead (stage, status, etc)

### Webhook WhatsApp
- `POST /api/webhook` - Recebe mensagem do WhatsApp
  - Cria lead
  - Classifica com IA
  - Distribui automaticamente
  - Retorna resposta automática

## 🧪 Testes Recomendados

### Teste 1: Lead de Alta Prioridade
```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:4000/api/webhook `
  -ContentType 'application/json' `
  -Body (ConvertTo-Json @{
    phone='5511999999001'
    text='Preciso urgente comprar um imóvel'
    name='João Urgente'
  })
```
**Esperado:** Priority = high, badge vermelho

### Teste 2: Lead de Média Prioridade
```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:4000/api/webhook `
  -ContentType 'application/json' `
  -Body (ConvertTo-Json @{
    phone='5511999999002'
    text='Gostaria de saber mais informações sobre imóveis'
    name='Ana Pesquisa'
  })
```
**Esperado:** Priority = medium, badge amarelo

### Teste 3: Lead de Baixa Prioridade
```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:4000/api/webhook `
  -ContentType 'application/json' `
  -Body (ConvertTo-Json @{
    phone='5511999999003'
    text='Olá'
    name='Carlos Simples'
  })
```
**Esperado:** Priority = low, badge cinza

### Teste 4: Múltiplos Leads (Distribuição)
Execute 6 webhooks seguidos para ver a distribuição round-robin:

```powershell
1..6 | ForEach-Object {
  Invoke-RestMethod -Method Post -Uri http://localhost:4000/api/webhook `
    -ContentType 'application/json' `
    -Body (ConvertTo-Json @{
      phone="551199999900$_"
      text='Quero comprar'
      name="Lead $_"
    })
}
```

**Esperado:** 
- Lead 1 → Consultor 1
- Lead 2 → Consultor 2
- Lead 3 → Consultor 3
- Lead 4 → Consultor 4
- Lead 5 → Consultor 5
- Lead 6 → Consultor 1 (volta ao primeiro)

## 🔧 Troubleshooting

**Chat não carrega mensagens:**
- Verifique se o backend está rodando
- Confira o console do navegador (F12)
- Confirme que o endpoint `/api/leads/:id` retorna status 200

**Mensagens não aparecem:**
- Verifique autenticação (token JWT)
- Confirme que o lead foi criado no banco
- Cheque se há mensagens associadas ao lead

**Distribuição não funciona:**
- Verifique se há usuários com `role='user'` e `available=true`
- Confirme que não estão no limite de leads (`maxLeads`)
- Cheque logs no terminal do backend

**Atualização não é automática:**
- O polling está configurado para 3 segundos
- Se quiser tempo real, implemente WebSocket (próxima fase)

## 🎯 Próximos Passos (Opcional)

1. **WebSocket para Real-Time**
   - Eliminar polling
   - Notificações instantâneas
   - Indicador "digitando..."

2. **WhatsApp Cloud API Real**
   - Integração com Meta
   - Envio/recebimento real
   - Status de leitura

3. **IA Avançada (OpenAI)**
   - GPT-4 para respostas contextuais
   - Análise de sentimento
   - Sugestões de resposta

4. **Notificações Push**
   - Email quando novo lead
   - Som quando mensagem chega
   - Badge de contagem

---

**🎉 O módulo de Atendimentos está 100% funcional!**

Acesse agora: http://localhost:5173 (após login, clique em "Atendimentos" ou será redirecionado automaticamente)
