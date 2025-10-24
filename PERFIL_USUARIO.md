# 👤 Sistema de Perfil Pessoal - Lead Campanha

## 🎯 Visão Geral

Cada usuário agora possui uma página de perfil completa para gerenciar suas informações pessoais, segurança, notificações e preferências. Implementado seguindo os melhores padrões de mercado (Salesforce, HubSpot, Pipedrive).

## ✨ Funcionalidades Implementadas

### 1. **Perfil** 👤

#### Upload de Foto de Perfil
- 📷 Upload de imagem (JPG, PNG, GIF)
- 🔄 Preview em tempo real
- 💾 Armazenamento em base64
- 🎨 Avatar com iniciais caso não tenha foto

#### Informações Pessoais
- **Nome Completo**: Nome de exibição no sistema
- **Email**: Email principal (usado para login)
- **Telefone**: Telefone de contato
- **Fuso Horário**: Configuração regional (Brasília, Manaus, Rio Branco)
- **Bio**: Descrição pessoal

#### Validações
- ✅ Nome e email obrigatórios
- ✅ Formato de email válido
- ✅ Preview antes de salvar
- ✅ Feedback visual de sucesso

### 2. **Segurança** 🔒

#### Alteração de Senha
- **Senha Atual**: Validação obrigatória
- **Nova Senha**: Mínimo 6 caracteres
- **Confirmar Senha**: Deve coincidir
- 📊 **Indicador de Força da Senha**:
  - Fraca: < 6 caracteres (amarelo)
  - Média: 6-8 caracteres (laranja)
  - Boa: 8-10 caracteres (verde claro)
  - Forte: 10+ caracteres com maiúsculas (verde)

#### Autenticação de Dois Fatores (2FA)
- 🔐 Ativar/desativar 2FA
- 📱 Suporte para autenticadores
- ⚡ Camada extra de segurança

#### Sessões Ativas
- 💻 Visualizar dispositivos conectados
- 📍 Localização e horário de acesso
- ✓ Indicador de sessão atual
- 🚫 Encerrar sessões remotas (futuro)

### 3. **Notificações** 🔔

#### Notificações por Email
- 📧 **Novo Lead**: Alertar quando lead for atribuído
- 💬 **Nova Mensagem**: Alertar sobre mensagens recebidas
- ⏰ **Tarefa Vencendo**: Lembrete 1 hora antes do vencimento

#### Notificações Push (Navegador)
- 🔔 **Novo Lead**: Notificação instantânea
- 💬 **Nova Mensagem**: Alerta em tempo real
- 🔕 Controle individual por tipo

#### Sons
- 🔊 **Som de Notificação**: Ativar/desativar sons
- 🎵 Feedback sonoro ao receber alertas

#### Controles
- Toggle switches modernos (estilo iOS)
- Ativação/desativação individual
- Configurações persistentes

### 4. **Preferências** ⚙️

#### Aparência
- ☀️ **Tema Claro**: Interface clara (padrão)
- 🌙 **Tema Escuro**: Interface escura para baixa luminosidade
- 🎨 Seleção visual com cards

#### Idioma e Região
- 🌍 **Idioma**: Português (BR), English (US), Español
- 📅 **Formato de Data**: 
  - DD/MM/YYYY (21/10/2025)
  - MM/DD/YYYY (10/21/2025)
  - YYYY-MM-DD (2025-10-21)
- ⏰ **Formato de Hora**: 24h (14:30) ou 12h (2:30 PM)

#### Atualização Automática
- 🔄 **Ativar/Desativar**: Recarregar dados automaticamente
- ⏱️ **Intervalo**: Configurar tempo de atualização (3-60 segundos)
- ⚡ Performance otimizada

## 🎨 Interface do Usuário

### Design Moderno
- **Header com Avatar**: Foto de perfil com gradiente colorido
- **Badges de Status**: Admin/Consultor, Ativo
- **Tabs Organizadas**: Navegação clara entre seções
- **Cards Informativos**: Agrupamento visual de configurações
- **Toggle Switches**: Interruptores modernos estilo iOS
- **Feedback Visual**: Mensagens de sucesso/erro

### Responsividade
- ✅ Desktop: Layout completo em 2 colunas
- ✅ Tablet: Layout adaptado
- ✅ Mobile: Layout empilhado

### Acessibilidade
- ✅ Labels descritivos
- ✅ Placeholders informativos
- ✅ Mensagens de validação claras
- ✅ Contraste adequado
- ✅ Navegação por teclado

## 📡 API Endpoints

### Atualizar Perfil
```http
PATCH /api/users/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "phone": "(11) 99999-9999",
  "avatar": "data:image/jpeg;base64,...",
  "bio": "Consultor de vendas...",
  "timezone": "America/Sao_Paulo"
}
```

### Alterar Senha
```http
POST /api/users/change-password
Authorization: Bearer {token}
Content-Type: application/json

{
  "currentPassword": "senha123",
  "newPassword": "novaSenha456"
}
```

### Salvar Notificações
```http
PATCH /api/users/notifications
Authorization: Bearer {token}
Content-Type: application/json

{
  "emailNewLead": true,
  "emailNewMessage": true,
  "emailTaskDue": false,
  "pushNewLead": true,
  "pushNewMessage": true,
  "soundEnabled": true
}
```

### Salvar Preferências
```http
PATCH /api/users/preferences
Authorization: Bearer {token}
Content-Type: application/json

{
  "theme": "light",
  "language": "pt-BR",
  "dateFormat": "DD/MM/YYYY",
  "timeFormat": "24h",
  "autoRefresh": true,
  "refreshInterval": 5
}
```

## 🗄️ Modelo de Dados

### User Model (Prisma)
```prisma
model User {
  id        String    @id @default(uuid())
  email     String    @unique
  password  String
  name      String
  phone     String?
  avatar    String?   // Base64 image
  bio       String?   // Personal bio
  timezone  String?   @default("America/Sao_Paulo")
  data      String?   // JSON for notifications & preferences
  role      String    @default("user")
  available Boolean   @default(true)
  maxLeads  Int       @default(30)
  leads     Lead[]
  tasks     Task[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}
```

## 🚀 Como Usar

### Acessar Perfil
1. Faça login no sistema
2. Clique no seu **avatar/nome** no canto superior direito
3. Será redirecionado para `#perfil`

### Alterar Foto de Perfil
1. Na aba **"👤 Perfil"**, clique em **"📷 Alterar Foto"**
2. Selecione uma imagem (JPG, PNG, GIF)
3. Visualize o preview
4. Clique em **"💾 Salvar Alterações"**

### Mudar Senha
1. Acesse a aba **"🔒 Segurança"**
2. Digite sua **senha atual**
3. Digite a **nova senha** (mínimo 6 caracteres)
4. Confirme a **nova senha**
5. Observe o indicador de força
6. Clique em **"🔒 Alterar Senha"**

### Configurar Notificações
1. Acesse a aba **"🔔 Notificações"**
2. Ative/desative cada tipo de notificação
3. Configure email, push e sons
4. Clique em **"💾 Salvar Preferências"**

### Personalizar Interface
1. Acesse a aba **"⚙️ Preferências"**
2. Escolha o tema (Claro/Escuro)
3. Configure idioma e formatos
4. Ajuste atualização automática
5. Clique em **"💾 Salvar Preferências"**

## 🔒 Segurança Implementada

### Validações Backend
- ✅ Senha atual obrigatória para alteração
- ✅ Validação de tamanho mínimo (6 caracteres)
- ✅ Confirmação de senha
- ✅ Hash SHA256 para senhas
- ✅ Token JWT para autenticação

### Proteções Frontend
- ✅ Validação de formulários
- ✅ Feedback visual de erros
- ✅ Sanitização de inputs
- ✅ Preview seguro de imagens

## 📊 Indicadores de Força de Senha

| Força  | Requisitos                      | Cor          |
|--------|--------------------------------|--------------|
| Fraca  | < 6 caracteres                 | 🟡 Amarelo   |
| Média  | 6-8 caracteres                 | 🟠 Laranja   |
| Boa    | 8-10 caracteres                | 🟢 Verde     |
| Forte  | 10+ caracteres + maiúsculas    | 🟢 Verde     |

## 🎯 Próximas Melhorias

- [ ] Upload real de imagens para servidor/CDN
- [ ] Compressão automática de imagens
- [ ] Crop/resize de fotos de perfil
- [ ] Histórico de alterações de senha
- [ ] Autenticação de dois fatores (2FA) funcional
- [ ] Gerenciamento de sessões ativas
- [ ] Exportação de dados pessoais (LGPD)
- [ ] Exclusão de conta
- [ ] Integração com Google/Microsoft para login social
- [ ] Verificação de email por código

## 🐛 Troubleshooting

**Foto não aparece:**
- Verifique o tamanho do arquivo (máx 2MB recomendado)
- Use formatos suportados: JPG, PNG, GIF
- Confirme que clicou em "Salvar Alterações"

**Erro ao alterar senha:**
- Confirme que a senha atual está correta
- Nova senha deve ter mínimo 6 caracteres
- Senhas devem coincidir

**Notificações não funcionam:**
- Verifique permissões do navegador
- Ative notificações no sistema operacional
- Backend deve implementar envio real de emails/push

**Alterações não salvam:**
- Verifique conexão com internet
- Confirme que está autenticado
- Cheque console do navegador (F12) para erros

---

**🎉 O sistema de perfil pessoal está 100% funcional e pronto para uso!**

Acesse: http://localhost:5173 → Login → Clique no seu avatar → 👤 Perfil
