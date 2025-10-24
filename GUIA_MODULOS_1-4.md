# 🚀 Guia das Novas Funcionalidades

## ✅ Módulos Implementados (1 a 4)

### 1️⃣ Página de Contatos (CRM Completo)

**Acesso:** Menu CRM → Contatos ou `#contatos`

#### Funcionalidades:
- ✅ **Listagem Completa de Leads**
  - Tabela com todos os leads do sistema
  - Visualização de: Nome, Telefone, Email, Prioridade, Estágio, Responsável, Mensagens, Data de Criação
  
- ✅ **Busca Inteligente**
  - Busca em tempo real por: Nome, Telefone ou Email
  - Filtra automaticamente conforme você digita

- ✅ **Filtros Avançados**
  - **Por Estágio:** Novo, Contactado, Qualificado, Proposta, Negociação, Fechado
  - **Por Prioridade:** Alta (🔴), Média (🟡), Baixa (⚪)
  - **Por Responsável:** Filtra leads por usuário atribuído (apenas admin)

- ✅ **Ações em Massa** (Admin)
  - Selecionar múltiplos leads (checkbox)
  - **Reatribuir:** Mudar responsável de vários leads de uma vez
  - **Excluir:** Deletar múltiplos leads simultaneamente
  - Seleção rápida com "Selecionar Todos"

- ✅ **Exportação CSV** (Admin)
  - Baixa arquivo CSV com todos os leads
  - Inclui: ID, Nome, Telefone, Email, Prioridade, Estágio, Status, Responsável, Data

- ✅ **Criar Novo Lead** (Admin)
  - Formulário rápido com campos: Nome, Telefone*, Email, Interesse
  - Lead criado manualmente entra no sistema com estágio "Novo"

- ✅ **Estatísticas em Tempo Real**
  - Total de Leads
  - Leads de Alta Prioridade (contador vermelho)
  - Leads Novos (contador azul)
  - Leads Fechados (contador verde)

#### Como Usar:
```bash
# 1. Acesse a página
http://localhost:5173/#contatos

# 2. Use os filtros para encontrar leads específicos
- Digite no campo de busca para filtrar por nome/telefone/email
- Use os dropdowns para filtrar por estágio, prioridade ou responsável

# 3. Ações em massa (Admin)
- Marque os checkboxes dos leads desejados
- Escolha "Reatribuir para..." no menu dropdown
- Ou clique em "Excluir Selecionados"

# 4. Criar novo lead (Admin)
- Clique em "➕ Novo Lead"
- Preencha os campos (telefone é obrigatório)
- Clique em "Criar Lead"

# 5. Exportar dados (Admin)
- Clique em "📥 Exportar CSV"
- Arquivo será baixado automaticamente
```

---

### 2️⃣ Página de Tarefas

**Acesso:** Menu Apps → Tarefas ou `#tarefas`

#### Funcionalidades:
- ✅ **Gerenciamento Completo de Tarefas**
  - Criar, visualizar, completar e excluir tarefas
  - Vincular tarefas a leads específicos
  
- ✅ **Organização Automática**
  - **🚨 Atrasadas:** Tarefas vencidas não concluídas (vermelho)
  - **📅 Hoje:** Tarefas com vencimento hoje (azul)
  - **📆 Próximas:** Tarefas futuras (cinza)
  - **📋 Sem Data:** Tarefas sem prazo definido

- ✅ **Filtros de Status**
  - **Pendentes:** Tarefas não concluídas (padrão)
  - **Concluídas:** Tarefas finalizadas
  - **Todas:** Visualizar tudo junto

- ✅ **Criação Rápida**
  - Título da tarefa
  - Descrição detalhada (opcional)
  - Data de vencimento (opcional)
  - Vinculação a lead (opcional)

- ✅ **Interações Simples**
  - Marcar/desmarcar como concluída (checkbox)
  - Excluir tarefa (🗑️)
  - Tarefas concluídas ficam com texto riscado

- ✅ **Estatísticas**
  - Total de tarefas
  - Tarefas pendentes
  - Tarefas atrasadas (alerta)
  - Tarefas concluídas

#### Como Usar:
```bash
# 1. Acesse a página
http://localhost:5173/#tarefas

# 2. Criar nova tarefa
- Clique em "➕ Nova Tarefa"
- Preencha o título (obrigatório)
- Adicione descrição se necessário
- Escolha data de vencimento (opcional)
- Vincule a um lead (opcional)
- Clique em "Criar Tarefa"

# 3. Gerenciar tarefas
- Clique no checkbox para marcar como concluída
- Clique em 🗑️ para excluir

# 4. Usar filtros
- Clique em "Pendentes" para ver só as não concluídas
- Clique em "Concluídas" para ver histórico
- Clique em "Todas" para visão geral

# 5. Priorizar
- Tarefas atrasadas aparecem primeiro em vermelho
- Tarefas de hoje aparecem em azul
- Organize seu dia focando nas seções de cima para baixo
```

---

### 3️⃣ Página de Relatórios e Indicadores

**Acesso:** Menu Relatórios → Indicadores ou `#relatorios`

#### Funcionalidades:
- ✅ **KPIs Principais** (Dashboard de Métricas)
  - 👥 **Total de Leads:** Quantidade total no sistema
  - 📂 **Leads Abertos:** Leads ainda em atendimento
  - ✅ **Leads Fechados:** Leads convertidos/finalizados
  - 📈 **Taxa de Conversão:** % de leads fechados sobre total

- ✅ **Funil de Conversão** (Visual de Barras)
  - **1. Novo:** 100% (todos os leads começam aqui)
  - **2. Contactado:** % de leads que foram contactados
  - **3. Qualificado:** % de leads qualificados
  - **4. Proposta:** % de leads com proposta enviada
  - **5. Negociação:** % de leads em negociação
  - **6. Fechado:** % de leads convertidos (meta final)
  
  Cada estágio mostra:
  - Quantidade absoluta de leads
  - Percentual em relação ao total de leads novos
  - Barra colorida proporcional à taxa de conversão

- ✅ **Leads por Prioridade**
  - 🔴 Alta: Quantidade de leads urgentes
  - 🟡 Média: Quantidade de leads moderados
  - ⚪ Baixa: Quantidade de leads normais

- ✅ **Leads por Estágio**
  - Distribuição total em cada etapa do funil
  - Novo, Contactado, Qualificado, Proposta, Negociação, Fechado

- ✅ **Performance por Usuário**
  - Barras horizontais mostrando quantidade de leads por usuário
  - Percentual de participação de cada usuário
  - Identificação de usuários mais ativos

- ✅ **Filtro por Período** (Analytics Avançado)
  - Data Início e Data Fim customizáveis
  - Aplica filtros temporais em todas as métricas
  - Botão "Limpar" para voltar à visão completa

#### Como Usar:
```bash
# 1. Acesse a página
http://localhost:5173/#relatorios

# 2. Visualizar métricas gerais
- Os 4 cards no topo mostram KPIs principais
- Atualizados automaticamente ao carregar

# 3. Analisar funil de conversão
- Veja o percentual de conversão entre cada etapa
- Identifique gargalos (quedas acentuadas)
- Exemplo: Se só 20% vão de "Contactado" para "Qualificado", 
  trabalhe na qualificação

# 4. Filtrar por período
- Escolha Data Início e Data Fim
- Clique em "Aplicar Filtro"
- Métricas serão recalculadas para o período
- Clique em "Limpar" para voltar à visão total

# 5. Avaliar performance da equipe
- Role até "Performance por Usuário"
- Veja distribuição de leads entre usuários
- Identifique necessidade de redistribuição
```

---

### 4️⃣ Página de Configurações/Ajustes (Admin)

**Acesso:** Menu Ajustes → Configurações ou `#configuracoes` (APENAS ADMIN)

#### Funcionalidades:

##### 🔷 Aba "Usuários"
- ✅ **Listagem de Todos os Usuários**
  - Nome, Email, Role (Admin/User)
  - Status de Disponibilidade (✅ Disponível / ⏸️ Indisponível)
  - Limite de leads configurado
  - Data de criação

- ✅ **Ativar/Desativar Usuários**
  - Botão rápido para alternar disponibilidade
  - Usuários indisponíveis não recebem novos leads no round-robin

- ✅ **Editar Usuário**
  - **Limite de Leads:** Alterar máximo de leads simultâneos (1-100)
  - **Função:** Mudar entre User e Admin
  - **Disponibilidade:** Marcar/desmarcar disponível
  - Salvar alterações instantaneamente

##### 🔷 Aba "Tags"
- ✅ **Criar Novas Tags**
  - Nome da tag (VIP, Urgente, Follow-up, etc.)
  - Cor customizável (color picker + código hex)
  - Preview em tempo real
  
- ✅ **Visualizar Tags Existentes**
  - Grid com todas as tags criadas
  - Exibição com cor configurada
  
- ✅ **Excluir Tags**
  - Botão de exclusão (🗑️) em cada tag
  - Confirmação antes de excluir

##### 🔷 Aba "Templates"
- 📝 Em desenvolvimento
- Futuramente: templates de mensagens rápidas

#### Como Usar:
```bash
# IMPORTANTE: Apenas usuários com role=admin têm acesso!

# 1. Acesse a página (Admin)
http://localhost:5173/#configuracoes

# 2. Gerenciar Usuários
- Vá para aba "👥 Usuários"
- Clique em "Ativar/Desativar" para mudar disponibilidade
- Clique em "Editar" para abrir modal:
  * Altere limite de leads (ex: de 30 para 50)
  * Mude função (User ↔ Admin)
  * Marque/desmarque disponível
  * Clique em "Salvar"

# 3. Criar e Gerenciar Tags
- Vá para aba "🏷️ Tags"
- Clique em "➕ Nova Tag"
- Digite nome (ex: "VIP")
- Escolha cor no color picker ou digite código hex
- Veja preview da tag
- Clique em "Criar Tag"
- Para excluir: clique no 🗑️ ao lado da tag

# 4. Casos de uso práticos
- Desativar usuário em férias
- Aumentar limite de lead performer
- Promover usuário a admin
- Criar tags para categorizar leads (VIP, Urgente, etc.)
```

---

## 🔌 Novos Endpoints da API

### Endpoints de Leads
```
DELETE /api/leads/:id (Admin)
  Exclui um lead e todos os dados relacionados

POST /api/leads/bulk (Admin)
  Body: { action: 'delete', leadIds: [...] }
  Body: { action: 'assign', leadIds: [...], assignTo: userId }
  Ações em massa

GET /api/leads/export/csv (Admin)
  Exporta leads em formato CSV
```

### Endpoints de Tarefas
```
GET /api/tasks
  Lista tarefas do usuário (ou todas se admin)

DELETE /api/tasks/:id
  Exclui uma tarefa
```

### Endpoints de Tags
```
GET /api/tags
  Lista todas as tags

POST /api/tags (Admin)
  Body: { name, color }
  Cria nova tag

DELETE /api/tags/:id (Admin)
  Exclui uma tag
```

### Endpoints de Relatórios
```
GET /api/reports/analytics
  Query: ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
  Relatório com filtro de data
  Retorna: taxas de conversão, leads por usuário, etc.
```

### Endpoints de Usuários
```
PATCH /api/users/:id (Admin)
  Body: { available, maxLeads, role }
  Atualiza configurações do usuário
```

---

## 🎯 Fluxo de Uso Completo

### Cenário 1: Gerente Monitorando Performance
```
1. Acessar #relatorios
2. Ver taxa de conversão geral
3. Analisar funil: identificar gargalo em "Qualificado → Proposta"
4. Ir para #configuracoes
5. Verificar carga de trabalho dos usuários
6. Redistribuir leads se necessário
```

### Cenário 2: Vendedor Organizando Dia
```
1. Acessar #tarefas
2. Ver tarefas atrasadas e de hoje
3. Marcar tarefas concluídas conforme avança
4. Criar novas tarefas para follow-ups
5. Ir para #contatos para ver leads
6. Filtrar por "Alta Prioridade" e "Novo"
7. Ir para #atendimentos para conversar
```

### Cenário 3: Admin Configurando Sistema
```
1. Acessar #configuracoes
2. Criar tags: "VIP", "Urgente", "Follow-up"
3. Ajustar limite de leads dos usuários
4. Desativar usuário em férias
5. Ir para #contatos
6. Reatribuir leads do usuário em férias
7. Exportar CSV para backup
```

---

## 📊 Métricas e KPIs Disponíveis

### Dashboards
- **Contatos:** Total, Alta Prioridade, Novos, Fechados
- **Tarefas:** Total, Pendentes, Atrasadas, Concluídas
- **Relatórios:** Total Leads, Abertos, Fechados, Taxa de Conversão

### Funil de Conversão
- Taxa de cada estágio sobre o total
- Identificação de gargalos
- Comparação visual entre etapas

### Performance
- Leads por usuário (quantidade e %)
- Distribuição de carga de trabalho
- Identificação de usuários mais/menos ativos

---

## 🚀 Como Testar Tudo

### 1. Iniciar Sistema
```powershell
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 2. Login como Admin
```
URL: http://localhost:5173
Email: admin@leadcampanha.com
Senha: admin123
```

### 3. Testar Cada Módulo
```
1. Contatos (CRM)
   - Acessar #contatos
   - Criar novo lead
   - Filtrar por prioridade
   - Selecionar múltiplos
   - Exportar CSV

2. Tarefas
   - Acessar #tarefas
   - Criar tarefa com vencimento hoje
   - Marcar como concluída
   - Ver estatísticas

3. Relatórios
   - Acessar #relatorios
   - Ver KPIs principais
   - Analisar funil
   - Aplicar filtro de data

4. Configurações
   - Acessar #configuracoes
   - Editar limite de um usuário
   - Criar tag "VIP" com cor vermelha
   - Desativar/ativar usuário
```

### 4. Testar Integração
```bash
# Criar lead via webhook
Invoke-RestMethod -Method POST -Uri "http://localhost:4000/api/webhook" -ContentType "application/json" -Body '{"phone":"5511999999999","text":"Olá, quero comprar um apartamento","name":"Cliente Teste"}'

# Verificar:
1. Lead aparece em #contatos
2. Lead aparece em #atendimentos
3. Estatísticas atualizadas em #relatorios
```

---

## ✅ Checklist de Funcionalidades

### Página de Contatos
- [x] Listagem de leads
- [x] Busca em tempo real
- [x] Filtros (estágio, prioridade, responsável)
- [x] Ações em massa (reatribuir, excluir)
- [x] Exportar CSV
- [x] Criar novo lead
- [x] Estatísticas em tempo real
- [x] Navegação para chat

### Página de Tarefas
- [x] Criar tarefa
- [x] Listar tarefas
- [x] Marcar como concluída
- [x] Excluir tarefa
- [x] Vincular a lead
- [x] Organizar por data (atrasadas, hoje, próximas)
- [x] Filtros (pendentes, concluídas, todas)
- [x] Estatísticas

### Página de Relatórios
- [x] KPIs principais
- [x] Funil de conversão visual
- [x] Leads por prioridade
- [x] Leads por estágio
- [x] Performance por usuário
- [x] Filtro por período
- [x] Taxa de conversão automática

### Página de Configurações
- [x] Listar usuários
- [x] Editar usuário (limite, role, disponibilidade)
- [x] Ativar/desativar usuário
- [x] Criar tags
- [x] Listar tags
- [x] Excluir tags
- [x] Color picker para tags
- [x] Restrição de acesso (admin only)

### Backend (API)
- [x] Endpoint delete lead
- [x] Endpoint bulk actions
- [x] Endpoint export CSV
- [x] Endpoint list/delete tasks
- [x] Endpoint create/delete tags
- [x] Endpoint analytics com filtro data
- [x] Endpoint update user

---

## 🎨 Melhorias Visuais Implementadas

- ✅ Cores consistentes (azul para ações, vermelho para alertas, verde para sucesso)
- ✅ Ícones intuitivos em todos os botões
- ✅ Cards com sombras suaves
- ✅ Badges coloridos para prioridade e estágio
- ✅ Barras de progresso no funil
- ✅ Loading states com spinner
- ✅ Empty states com mensagens amigáveis
- ✅ Hover effects nos botões e cards
- ✅ Estatísticas com destaque visual
- ✅ Tabelas responsivas com scroll

---

## 🔜 Próximos Passos Sugeridos

1. **WebSocket para Real-time** (eliminar polling)
2. **WhatsApp Cloud API** (integração real com Meta)
3. **Notificações Push** (alertas de novas mensagens)
4. **Templates de Mensagens** (respostas rápidas)
5. **Relatórios Exportáveis** (PDF com gráficos)
6. **Automações Avançadas** (ações automáticas por triggers)
7. **Integração com CRMs** (Pipedrive, HubSpot)
8. **App Mobile** (React Native)

---

## 💡 Dicas de Uso

1. **Use Filtros Combinados:** Combine busca + estágio + prioridade para encontrar leads específicos rapidamente
2. **Crie Tarefas ao Atender:** Sempre que prometer retornar, crie uma tarefa com data
3. **Monitore Funil Semanalmente:** Identifique quedas de conversão e tome ações corretivas
4. **Configure Limites Realistas:** Defina maxLeads baseado na capacidade real de cada vendedor
5. **Use Tags Estrategicamente:** Crie categorias que fazem sentido para seu negócio
6. **Exporte CSV Regularmente:** Faça backups semanais da base de leads

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do backend (terminal)
2. Verifique console do navegador (F12)
3. Confirme que backend está rodando na porta 4000
4. Confirme que frontend está rodando na porta 5173
5. Verifique se o token JWT está válido (expira em 7 dias)

---

**Versão:** 2.0  
**Data:** 21/10/2025  
**Módulos:** 1-4 Completos ✅
