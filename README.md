# Velsrios Platform 🚀

Minha plataforma moderna, completa e integrada.

## 📋 Sobre o Projeto

Velsrios é uma plataforma web full-stack moderna desenvolvida com Node.js, Express e as melhores práticas de desenvolvimento. O projeto inclui:

- ✅ Backend RESTful API com Express
- ✅ Frontend responsivo com HTML/CSS/JavaScript
- ✅ Segurança integrada (Helmet, CORS, Rate Limiting)
- ✅ Testes automatizados com Jest
- ✅ Linting com ESLint
- ✅ CI/CD com GitHub Actions
- ✅ Suporte a Docker e Docker Compose
- ✅ Documentação completa

## 🚀 Começando

### Pré-requisitos

- Node.js 16.x ou superior
- npm ou yarn
- Docker (opcional)

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/vedhen-br/velsrios.git
cd velsrios
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. Inicie o servidor:
```bash
npm start
```

O servidor estará disponível em `http://localhost:3000`

## 🛠️ Scripts Disponíveis

- `npm start` - Inicia o servidor em produção
- `npm run dev` - Inicia o servidor em modo desenvolvimento com hot-reload
- `npm test` - Executa os testes
- `npm run lint` - Verifica o código com ESLint
- `npm run lint:fix` - Corrige automaticamente problemas de linting
- `npm run build` - Cria build de produção

## 🐳 Docker

### Usando Docker

```bash
# Build da imagem
docker build -t velsrios .

# Executar container
docker run -p 3000:3000 velsrios
```

### Usando Docker Compose

```bash
# Iniciar serviços
docker-compose up -d

# Parar serviços
docker-compose down
```

## 📡 API Endpoints

### Health Check
```http
GET /api/health
```
Retorna o status do servidor.

### Info
```http
GET /api/info
```
Retorna informações sobre a plataforma.

### Users
```http
GET /api/users
```
Retorna lista de usuários (exemplo).

## 🏗️ Estrutura do Projeto

```
velsrios/
├── .github/
│   └── workflows/       # GitHub Actions workflows
├── __tests__/           # Testes
├── public/              # Arquivos estáticos
│   ├── css/
│   ├── js/
│   └── index.html
├── src/
│   ├── server/          # Código do servidor
│   └── client/          # Código do cliente
├── .env.example         # Exemplo de variáveis de ambiente
├── .eslintrc.js         # Configuração ESLint
├── .gitignore
├── docker-compose.yml   # Docker Compose
├── Dockerfile           # Docker configuration
├── jest.config.js       # Configuração Jest
├── package.json
└── README.md
```

## 🧪 Testes

Os testes são escritos com Jest e incluem:

- Testes de API
- Testes de integração
- Cobertura de código

Execute os testes com:
```bash
npm test
```

## 🔒 Segurança

O projeto implementa várias medidas de segurança:

- **Helmet.js**: Protege contra vulnerabilidades comuns
- **CORS**: Controle de acesso entre origens
- **Rate Limiting**: Proteção contra abuso de API
- **Validação de entrada**: Sanitização de dados

## 🚀 CI/CD

O projeto usa GitHub Actions para:

- Executar testes automaticamente
- Verificar código com linter
- Build de produção
- Deploy automático (configurável)

## 📦 Tecnologias

- **Backend**: Node.js, Express
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Testes**: Jest, Supertest
- **Qualidade**: ESLint
- **Container**: Docker, Docker Compose
- **CI/CD**: GitHub Actions

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**vedhen-br**

- GitHub: [@vedhen-br](https://github.com/vedhen-br)

## 🙏 Agradecimentos

- Express.js community
- Node.js community
- Todos os contribuidores

---

Feito com ❤️ por vedhen-br
