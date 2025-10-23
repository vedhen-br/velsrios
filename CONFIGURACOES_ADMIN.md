# ⚙️ Painel de Configurações Admin - Lead Campanha

## 🎯 Visão Geral

O admin agora possui um painel completo de configurações para gerenciar todos os aspectos do sistema e controlar limitações e permissões dos usuários.

## 📋 Funcionalidades Implementadas

### 1. **Gerenciamento de Usuários** 👥

#### Configurações por Usuário:
- ✅ **Limite de Leads Simultâneos**: Define quantos leads ativos cada usuário pode gerenciar
- ✅ **Função (Role)**: Alterna entre Admin e Usuário
- ✅ **Disponibilidade**: Ativa/desativa usuário para receber leads automaticamente

#### Permissões Customizadas:
- ✅ Disponível para receber leads automaticamente
- ✅ Pode criar leads manualmente no CRM
- ✅ Pode editar seus próprios leads
- ✅ Pode excluir seus próprios leads
- ✅ Pode exportar dados em CSV
- ✅ Pode visualizar relatórios e estatísticas

#### Notificações:
- 🔔 Notificar quando receber novo lead
- 🔔 Notificar quando receber nova mensagem
- 🔔 Notificar sobre tarefas vencendo

#### Horário de Trabalho:
- ⏰ Define horário de início e fim
- ⏰ Leads só são distribuídos dentro deste horário

#### Estatísticas por Usuário:
- 📊 Leads Ativos
- 📊 Leads Convertidos
- 📊 Taxa de Conversão
- 📊 Tempo Médio de Resposta

### 2. **Configurações Globais do Sistema** 🎯

#### Distribuição Automática:
- ✅ Ativar/desativar distribuição automática
- ✅ Algoritmo: Round-Robin, Menos Ocupado, Aleatório
- ✅ Tempo de espera antes de distribuir

#### IA e Qualificação:
- 🤖 Ativar/desativar classificação por IA
- 🤖 Resposta automática inicial
- 🤖 Palavras-chave para alta prioridade customizáveis

#### Limites e Restrições:
- 🛡️ Limite global de leads por usuário
- 🛡️ Dias de inatividade antes de marcar lead como inativo
- 🛡️ Prevenir leads duplicados

#### Notificações e Alertas:
- 📧 Enviar notificações por email
- 📱 Enviar notificações por SMS
- ⏱️ Alertar sobre leads sem resposta após X horas

#### Integração WhatsApp:
- 💬 Webhook URL configurável
- 💬 Status da integração
- 💬 Botão para configurar WhatsApp Cloud API

#### Backup e Manutenção:
- 💾 Backup automático diário
- 💾 Visualizar último backup
- 💾 Fazer backup manual
- 🔧 Modo manutenção

### 3. **Gerenciamento de Tags** 🏷️

- ✅ Criar tags customizadas
- ✅ Definir cor da tag (visual)
- ✅ Preview da tag antes de criar
- ✅ Excluir tags
- ✅ Visualização em grid colorido

### 4. **Templates de Mensagens Rápidas** 📝

Templates pré-configurados:
- 👋 Boas-vindas
- 📅 Agendamento
- 🔄 Follow-up

Funcionalidades:
- ✅ Criar novos templates
- ✅ Editar templates existentes
- ✅ Usar templates em respostas rápidas

## 🚀 Como Usar

### Acessar Configurações:
1. Faça login como **admin**
2. Clique em **"⚙️ Configurações"** no menu
3. Navegue pelas abas:
   - **👥 Usuários**: Gerenciar usuários e permissões
   - **🏷️ Tags**: Criar e gerenciar tags
   - **📝 Templates**: Configurações globais e templates

### Editar Usuário:
1. Na aba **Usuários**, clique em **"⚙️ Configurar"**
2. Ajuste:
   - Limite de leads
   - Função (Admin/User)
   - Permissões (checkboxes)
   - Notificações
   - Horário de trabalho
3. Clique em **"Salvar"**

### Ativar/Desativar Usuário:
1. Clique no botão **"Ativar"** ou **"Desativar"**
2. Usuários inativos não recebem leads automaticamente

### Criar Tag:
1. Na aba **Tags**, clique em **"➕ Nova Tag"**
2. Digite o nome da tag
3. Escolha uma cor
4. Visualize o preview
5. Clique em **"Criar Tag"**

### Configurar Sistema:
1. Na aba **Templates**, role até **"Configurações Globais"**
2. Ajuste cada seção conforme necessário
3. Clique em **"💾 Salvar Configurações"**

## 🔒 Permissões

### Admin:
- ✅ Acesso total a todas as configurações
- ✅ Pode editar qualquer usuário
- ✅ Pode criar/editar/excluir tags
- ✅ Pode configurar sistema globalmente
- ✅ Pode fazer backup
- ✅ Pode transferir leads do CRM principal

### Usuário Comum:
- ❌ Sem acesso ao painel de configurações
- ✅ Pode criar/editar/excluir seus próprios contatos
- ✅ Pode ver seus próprios leads atribuídos
- ✅ Pode usar templates de mensagens

## 📊 Estatísticas Disponíveis

Para cada usuário, o admin visualiza:
- **Leads Ativos**: Quantidade atual de leads em aberto
- **Convertidos**: Total de leads fechados
- **Taxa de Conversão**: Percentual de sucesso
- **Tempo Médio de Resposta**: Agilidade do atendimento

## 🎨 Interface

- **Design Moderno**: Interface limpa e intuitiva
- **Responsivo**: Funciona em desktop e mobile
- **Visual Claro**: Badges coloridos para status
- **Feedback Instantâneo**: Alertas e confirmações
- **Busca e Filtros**: Encontre rapidamente usuários e tags

## 🔄 Fluxo de Distribuição Configurável

O admin pode escolher entre 3 algoritmos:

1. **Round-Robin (Padrão)**: Distribui alternadamente entre usuários disponíveis
2. **Menos Ocupado**: Prioriza usuário com menos leads ativos
3. **Aleatório**: Distribui aleatoriamente

## 📝 Próximas Melhorias Sugeridas

- [ ] Integração real com WhatsApp Cloud API (Meta)
- [ ] Sistema de permissões granulares por módulo
- [ ] Relatório detalhado por usuário com gráficos
- [ ] Histórico de alterações de configurações
- [ ] Exportação de configurações em JSON
- [ ] Importação de configurações de backup
- [ ] Notificações em tempo real via WebSocket
- [ ] Templates de IA com OpenAI GPT-4
- [ ] Agenda integrada com Google Calendar

## 🐛 Troubleshooting

**Mudanças não salvam:**
- Verifique se você está logado como admin
- Confirme que o backend está rodando
- Cheque o console do navegador (F12)

**Usuário não recebe leads:**
- Verifique se está "Disponível"
- Confirme que não atingiu o limite de leads
- Cheque horário de trabalho configurado

**Estatísticas não aparecem:**
- Dados são calculados em tempo real
- Aguarde alguns segundos para carregar
- Recarregue a página se necessário

---

**🎉 O painel de configurações está 100% funcional e pronto para uso!**

Acesse: http://localhost:5173 → Login como Admin → ⚙️ Configurações
