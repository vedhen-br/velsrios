# 🚀 Velsrios - Quick Start Guide

Get your Velsrios platform running in minutes!

## Prerequisites

- Node.js 16.x or higher
- npm 7.x or higher

## Installation (3 simple steps)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm start
```

### 3. Open Your Browser
Visit: **http://localhost:3000**

That's it! 🎉

---

## Available Commands

| Command | Description |
|---------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server with hot-reload |
| `npm test` | Run all tests |
| `npm run lint` | Check code quality |
| `npm run lint:fix` | Auto-fix linting issues |
| `npm run build` | Build for production |

## API Endpoints

Try these in your browser or with curl:

- **Health Check**: http://localhost:3000/api/health
- **Platform Info**: http://localhost:3000/api/info
- **Users List**: http://localhost:3000/api/users

## Docker Quick Start

```bash
# Using Docker Compose (recommended)
docker-compose up

# Or using Docker directly
docker build -t velsrios .
docker run -p 3000:3000 velsrios
```

## What's Included?

✅ Modern RESTful API  
✅ Responsive Frontend  
✅ Security Features (Helmet, CORS, Rate Limiting)  
✅ Automated Tests  
✅ CI/CD Integration  
✅ Docker Support  
✅ Complete Documentation  

## Need Help?

- 📖 [Full Documentation](README.md)
- 🔧 [Development Guide](docs/DEVELOPMENT.md)
- 🚀 [Deployment Guide](docs/DEPLOYMENT.md)
- 📡 [API Documentation](docs/API.md)

## Troubleshooting

**Port already in use?**
```bash
# Change the port in .env file
PORT=3001
```

**Dependencies issues?**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

**Happy coding!** 💻
