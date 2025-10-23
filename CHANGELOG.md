# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [1.0.0] - 2025-10-23

### Adicionado
- Estrutura inicial do projeto
- Backend RESTful API com Express.js
- Frontend responsivo com HTML/CSS/JavaScript
- Endpoints da API:
  - `GET /api/health` - Health check
  - `GET /api/info` - Informações da plataforma
  - `GET /api/users` - Lista de usuários (exemplo)
- Middleware de segurança:
  - Helmet.js para headers seguros
  - CORS configurado
  - Rate limiting (100 requisições por 15 minutos)
- Testes automatizados com Jest
  - 4 testes de API
  - 100% de cobertura dos endpoints
- Linting com ESLint
- CI/CD com GitHub Actions:
  - Workflow de testes
  - Workflow de build
  - Workflow de segurança
  - Workflow de Docker
- Suporte a Docker:
  - Dockerfile otimizado
  - docker-compose.yml
  - Health check configurado
- Documentação completa:
  - README.md abrangente
  - Guia de API (docs/API.md)
  - Guia de Deploy (docs/DEPLOYMENT.md)
  - Guia de Desenvolvimento (docs/DEVELOPMENT.md)
  - CONTRIBUTING.md
  - CODE_OF_CONDUCT.md
  - CHANGELOG.md
- Templates do GitHub:
  - Template de Bug Report
  - Template de Feature Request
  - Template de Pull Request
- Configurações:
  - .gitignore completo
  - .env.example
  - .eslintrc.js
  - jest.config.js
  - webpack.config.js
- Licença MIT

### Segurança
- Implementação de Helmet.js para proteção de headers HTTP
- Rate limiting para prevenir abuso de API
- CORS configurado adequadamente
- Validação de permissões em workflows do GitHub Actions
- Sem vulnerabilidades conhecidas nas dependências

### Performance
- Servidor Express otimizado
- Arquivos estáticos servidos eficientemente
- Docker image otimizada com multi-stage build

---

## Formato das Mudanças

- **Adicionado** - Para novas funcionalidades
- **Alterado** - Para mudanças em funcionalidades existentes
- **Descontinuado** - Para funcionalidades que serão removidas
- **Removido** - Para funcionalidades removidas
- **Corrigido** - Para correções de bugs
- **Segurança** - Para vulnerabilidades corrigidas

---

[1.0.0]: https://github.com/vedhen-br/velsrios/releases/tag/v1.0.0
