# 🧪 TESTE RÁPIDO - Módulos 1 a 4

## ⚡ Teste em 5 Minutos

### 1️⃣ Iniciar Sistema (2 min)

```powershell
# Terminal 1 - Backend
cd "C:\Users\pedro.neto\Desktop\Lead Campanha\backend"
npm run dev

# Terminal 2 - Frontend
cd "C:\Users\pedro.neto\Desktop\Lead Campanha\frontend"
npm run dev
```

**✅ Confirmação:** 
- Backend: "🚀 Backend rodando em http://localhost:4000"
- Frontend: "Local: http://localhost:5173"

---

### 2️⃣ Login (30 seg)

1. Abrir navegador: `http://localhost:5173`
2. Login como Admin:
   - Email: `admin@leadcampanha.com`
   - Senha: `admin123`
3. **✅ Sucesso:** Menu de navegação aparece no topo

---

### 3️⃣ Testar Contatos (1 min)

1. Clicar no menu **CRM → Contatos**
2. Verificar: Tabela com leads carregados
3. Digite "999" no campo de busca
4. **✅ Sucesso:** Leads filtrados em tempo real
5. Clicar em **➕ Novo Lead**:
   - Nome: `Teste CRM`
   - Telefone: `5511988888888`
   - Clicar em **Criar Lead**
6. **✅ Sucesso:** Lead aparece na tabela
7. Clicar em **📥 Exportar CSV**
8. **✅ Sucesso:** Arquivo `leads.csv` baixado

**🎯 Extras para testar:**
- Selecionar múltiplos leads (checkboxes)
- Escolher "Reatribuir para..." no menu
- Ver estatísticas nos cards (Total, Alta Prioridade, etc.)

---

### 4️⃣ Testar Tarefas (1 min)

1. Clicar no menu **Apps → Tarefas**
2. Verificar: Página de tarefas vazia ou com tarefas existentes
3. Clicar em **➕ Nova Tarefa**:
   - Título: `Ligar para cliente teste`
   - Descrição: `Retornar ligação sobre proposta`
   - Data: Selecionar hoje
   - Lead: Escolher um lead (opcional)
   - Clicar em **Criar Tarefa**
4. **✅ Sucesso:** Tarefa aparece na seção "📅 Hoje"
5. Marcar checkbox para completar
6. **✅ Sucesso:** Tarefa fica com texto riscado
7. Clicar em 🗑️ para excluir
8. **✅ Sucesso:** Tarefa removida

**🎯 Extras para testar:**
- Filtrar por "Concluídas"
- Ver estatísticas (Total, Pendentes, Atrasadas)
- Criar tarefa sem data (vai para "📋 Sem Data")

---

### 5️⃣ Testar Relatórios (1 min)

1. Clicar no menu **Relatórios → Indicadores**
2. Verificar: 4 KPIs no topo (Total, Abertos, Fechados, Taxa de Conversão)
3. Rolar para ver **Funil de Conversão**
4. **✅ Sucesso:** 6 barras coloridas com percentuais
5. Escolher datas:
   - Data Início: 7 dias atrás
   - Data Fim: Hoje
   - Clicar em **Aplicar Filtro**
6. **✅ Sucesso:** Métricas recalculadas
7. Rolar até **Performance por Usuário**
8. **✅ Sucesso:** Barras horizontais com distribuição

**🎯 Extras para testar:**
- Ver "Leads por Prioridade" (🔴 Alta, 🟡 Média, ⚪ Baixa)
- Ver "Leads por Estágio" (6 cards)
- Clicar em "Limpar" para voltar à visão total

---

### 6️⃣ Testar Configurações (1 min)

1. Clicar no menu **Ajustes → Configurações** (canto superior direito)
2. Verificar: Página com 3 abas (Usuários, Tags, Templates)
3. **Aba Usuários:**
   - Ver lista de 6 usuários (1 admin + 5 users)
   - Clicar em **Editar** em um usuário
   - Alterar "Limite de leads" de 30 para 50
   - Clicar em **Salvar**
   - **✅ Sucesso:** Usuário atualizado
4. **Aba Tags:**
   - Clicar em **➕ Nova Tag**
   - Nome: `VIP`
   - Escolher cor vermelha no color picker
   - Clicar em **Criar Tag**
   - **✅ Sucesso:** Tag aparece no grid
   - Clicar em 🗑️ na tag
   - **✅ Sucesso:** Tag excluída após confirmação

**🎯 Extras para testar:**
- Ativar/Desativar usuário (botão rápido)
- Mudar role de user para admin
- Criar várias tags com cores diferentes

---

## 🚀 Teste de Integração Completo

### Webhook → Chat → Contatos → Relatórios

```powershell
# 1. Criar lead via webhook
Invoke-RestMethod -Method POST -Uri "http://localhost:4000/api/webhook" -ContentType "application/json" -Body '{"phone":"5511977777777","text":"Olá, quero comprar um apartamento de 3 quartos urgente!","name":"Cliente VIP"}'
```

**Aguardar 3 segundos** e verificar:

1. **Atendimentos** (`#atendimentos`):
   - Lead aparece na lista de conversas à esquerda
   - Clicar no lead
   - Ver mensagens no centro
   - Ver detalhes à direita (prioridade: high)
   - **✅ Sucesso:** Chat funcionando

2. **Contatos** (`#contatos`):
   - Lead "Cliente VIP" aparece na tabela
   - Prioridade: 🔴 Alta (badge vermelho)
   - Estágio: Novo (badge azul)
   - Mensagens: 2 (inicial + resposta automática)
   - **✅ Sucesso:** Lead registrado

3. **Relatórios** (`#relatorios`):
   - Total de Leads: +1
   - Alta Prioridade: +1
   - Novos: +1
   - Funil: barra "Novo" atualizada
   - **✅ Sucesso:** Métricas atualizadas

---

## ✅ Checklist Rápido

Use este checklist durante o teste:

### Navegação
- [ ] Login com admin funciona
- [ ] Menu superior carrega corretamente
- [ ] Todos os links clicáveis funcionam
- [ ] Logout funciona (botão vermelho)

### Contatos
- [ ] Tabela carrega leads
- [ ] Busca filtra em tempo real
- [ ] Filtros (estágio, prioridade) funcionam
- [ ] Criar novo lead funciona
- [ ] Exportar CSV baixa arquivo
- [ ] Estatísticas mostram valores corretos

### Tarefas
- [ ] Criar tarefa funciona
- [ ] Tarefa aparece na seção correta (Hoje, etc.)
- [ ] Marcar como concluída funciona
- [ ] Excluir tarefa funciona
- [ ] Filtros (Pendentes, Concluídas) funcionam
- [ ] Estatísticas mostram valores corretos

### Relatórios
- [ ] 4 KPIs carregam
- [ ] Funil de conversão aparece com 6 barras
- [ ] Filtro de data funciona
- [ ] Performance por usuário mostra barras
- [ ] Leads por prioridade mostra contadores
- [ ] Leads por estágio mostra distribuição

### Configurações
- [ ] Página só acessível por admin
- [ ] Lista de usuários carrega
- [ ] Editar usuário funciona
- [ ] Ativar/desativar usuário funciona
- [ ] Criar tag funciona
- [ ] Color picker funciona
- [ ] Excluir tag funciona

### Integração
- [ ] Webhook cria lead
- [ ] IA classifica prioridade
- [ ] Distribuidor atribui usuário
- [ ] Lead aparece em Atendimentos
- [ ] Lead aparece em Contatos
- [ ] Métricas atualizam em Relatórios

---

## 🐛 Troubleshooting Rápido

### Problema: "Erro ao buscar leads"
**Solução:** Verificar se backend está rodando na porta 4000

### Problema: "Token inválido"
**Solução:** Fazer logout e login novamente (token expira em 7 dias)

### Problema: "Tabela vazia em Contatos"
**Solução:** Verificar se seed foi executado: `node prisma/seed.js`

### Problema: "Botão não responde"
**Solução:** Verificar console do navegador (F12) por erros de JavaScript

### Problema: "Página branca"
**Solução:** 
1. Verificar terminal do frontend por erros
2. Verificar se build passou: `npm run build`
3. Limpar cache: Ctrl+Shift+R

---

## 📊 Resultados Esperados

Após completar todos os testes:

- ✅ **6 páginas funcionando:** Login, Atendimentos, Dashboard, Contatos, Tarefas, Relatórios, Configurações
- ✅ **25+ endpoints testados** via interface
- ✅ **Integração completa:** Webhook → IA → Distribuidor → Chat → CRM → Relatórios
- ✅ **Permissões funcionando:** Admin vê tudo, User vê só seus leads
- ✅ **Real-time parcial:** Polling a cada 3-5 segundos

---

## 🎯 Próximo Passo

Após testar tudo com sucesso, você pode:

1. **Personalizar:** Ajustar cores, textos, limites no código
2. **Integrar WhatsApp Real:** Implementar Meta Cloud API
3. **Adicionar WebSocket:** Eliminar polling, real-time instantâneo
4. **Deploy:** Hospedar em servidor de produção
5. **Adicionar Features:** Templates, notificações, automações

---

## 💡 Dica de Ouro

**Para impressionar:** 
1. Faça um vídeo rápido mostrando o fluxo completo:
   - Webhook cria lead
   - Aparece em Atendimentos
   - Conversa no chat
   - Move pelo Kanban
   - Cria tarefa
   - Vê relatório atualizado
2. Mostre o funil de conversão visual
3. Demonstre ações em massa (selecionar 10 leads e reatribuir)
4. Exporte CSV e abra no Excel

**Tempo total do vídeo:** 2-3 minutos  
**Impacto:** 🚀🚀🚀

---

**Status:** ✅ Sistema 100% funcional  
**Tempo de teste:** ~10 minutos  
**Diversão:** 😄 Garantida!
