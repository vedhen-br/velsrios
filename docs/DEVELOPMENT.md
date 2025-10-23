# Development Setup Guide

Guia para configurar o ambiente de desenvolvimento do Velsrios.

## Requisitos

- **Node.js** 16.x ou superior
- **npm** 7.x ou superior (ou yarn)
- **Git**
- **Docker** (opcional, para desenvolvimento com containers)
- **VS Code** (recomendado) ou outro editor de código

## Configuração Inicial

### 1. Clone o Repositório

```bash
git clone https://github.com/vedhen-br/velsrios.git
cd velsrios
```

### 2. Instale as Dependências

```bash
npm install
```

### 3. Configure as Variáveis de Ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
PORT=3000
NODE_ENV=development
```

### 4. Inicie o Servidor de Desenvolvimento

```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3000`

## Scripts Disponíveis

### Desenvolvimento

```bash
npm run dev      # Inicia servidor com hot-reload (nodemon)
npm start        # Inicia servidor em modo produção
```

### Testes

```bash
npm test         # Executa todos os testes
npm test -- --watch  # Executa testes em modo watch
npm test -- --coverage  # Executa testes com cobertura
```

### Linting

```bash
npm run lint     # Verifica o código
npm run lint:fix # Corrige problemas automaticamente
```

### Build

```bash
npm run build    # Cria build de produção
npm run build:dev # Cria build de desenvolvimento
```

## Estrutura do Projeto

```
velsrios/
├── .github/              # GitHub configurations
│   ├── workflows/        # GitHub Actions workflows
│   └── ISSUE_TEMPLATE/   # Issue templates
├── __tests__/            # Testes
├── docs/                 # Documentação adicional
├── public/               # Arquivos estáticos
│   ├── css/             # Estilos CSS
│   ├── js/              # JavaScript frontend
│   └── index.html       # HTML principal
├── src/
│   ├── server/          # Código do servidor
│   │   └── index.js     # Entry point do servidor
│   └── client/          # Código do cliente
├── .env.example         # Exemplo de variáveis de ambiente
├── .eslintrc.js         # Configuração ESLint
├── .gitignore          # Git ignore
├── docker-compose.yml   # Docker Compose
├── Dockerfile          # Docker configuration
├── jest.config.js      # Configuração Jest
├── package.json        # Dependências do projeto
└── README.md           # Documentação principal
```

## Workflow de Desenvolvimento

### 1. Criar uma Branch

```bash
git checkout -b feature/minha-feature
```

### 2. Fazer Alterações

Faça suas alterações no código seguindo os padrões do projeto.

### 3. Testar

```bash
npm run lint
npm test
```

### 4. Commit

Use commits semânticos:

```bash
git commit -m "feat: adiciona nova funcionalidade"
git commit -m "fix: corrige bug no login"
git commit -m "docs: atualiza documentação"
```

### 5. Push e Pull Request

```bash
git push origin feature/minha-feature
```

Abra um Pull Request no GitHub.

## Debugging

### VS Code

Adicione ao `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Server",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/src/server/index.js",
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

### Chrome DevTools

Para debugging do frontend, use as Chrome DevTools (F12).

## Docker Development

### Build e Run

```bash
docker-compose up --build
```

### Logs

```bash
docker-compose logs -f
```

### Parar

```bash
docker-compose down
```

## Troubleshooting

### Porta já em uso

```bash
# Linux/Mac
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Problemas com dependências

```bash
rm -rf node_modules package-lock.json
npm install
```

### Problemas com cache do Jest

```bash
npm test -- --clearCache
```

## Boas Práticas

1. **Sempre escreva testes** para novas funcionalidades
2. **Rode o linter** antes de fazer commit
3. **Mantenha commits pequenos** e com mensagens claras
4. **Atualize a documentação** quando necessário
5. **Revise o código** antes de submeter PR

## Recursos Adicionais

- [Documentação da API](./API.md)
- [Guia de Deploy](./DEPLOYMENT.md)
- [Código de Conduta](../CODE_OF_CONDUCT.md)
- [Como Contribuir](../CONTRIBUTING.md)

## Suporte

Para dúvidas ou problemas:

1. Verifique a [documentação](../README.md)
2. Procure em [Issues](https://github.com/vedhen-br/velsrios/issues)
3. Abra uma nova issue se necessário

---

Feito com ❤️ para desenvolvedores
