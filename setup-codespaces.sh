#!/bin/bash

echo "🚀 Lead Campanha CRM - Setup Codespaces"
echo "========================================"
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Instalar dependências
echo "📦 Instalando dependências..."
npm install --prefix backend
npm install --prefix frontend
npm install
echo -e "${GREEN}✅ Dependências instaladas${NC}"
echo ""

# 2. Gerar Prisma Client
echo "🗄️  Gerando Prisma Client..."
cd backend && npx prisma generate
echo -e "${GREEN}✅ Prisma Client gerado${NC}"
echo ""

# 3. Aplicar migrations
echo "📊 Aplicando migrations do banco..."
npx prisma migrate deploy
echo -e "${GREEN}✅ Migrations aplicadas${NC}"
echo ""

# 4. Popular banco (opcional)
echo -e "${YELLOW}Deseja popular o banco com dados de teste? (y/n)${NC}"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo "🌱 Populando banco de dados..."
    node prisma/seed.js
    echo -e "${GREEN}✅ Banco populado com dados de teste${NC}"
    echo ""
    echo "📧 Credenciais:"
    echo "   Admin: admin@leadcampanha.com / admin123"
    echo "   Users: user1@leadcampanha.com até user5@leadcampanha.com / password123"
    echo ""
fi

cd ..

# 5. Verificar variáveis de ambiente
if [ ! -f "backend/.env" ]; then
    echo "⚙️  Criando arquivo .env no backend..."
    cp backend/.env.example backend/.env
    echo -e "${GREEN}✅ Arquivo backend/.env criado${NC}"
fi

if [ ! -f "frontend/.env" ]; then
    echo "⚙️  Criando arquivo .env no frontend..."
    cp frontend/.env.example frontend/.env
    echo -e "${GREEN}✅ Arquivo frontend/.env criado${NC}"
fi
echo ""

# 6. Mostrar próximos passos
echo -e "${GREEN}🎉 Setup completo!${NC}"
echo ""
echo "📋 Próximos passos:"
echo "   1. Execute: npm run dev"
echo "   2. Acesse a aba 'Ports' no VS Code"
echo "   3. Abra as portas 4000 (Backend) e 5173 (Frontend)"
echo "   4. Login: admin@leadcampanha.com / admin123"
echo ""
echo "📚 Documentação:"
echo "   • CODESPACES_README.md - Guia completo do Codespaces"
echo "   • N8N_INTEGRATION.md - Integração com n8n Cloud"
echo "   • GUIA_COMPLETO.md - Documentação geral"
echo ""
echo -e "${YELLOW}🚀 Execute 'npm run dev' para iniciar!${NC}"
