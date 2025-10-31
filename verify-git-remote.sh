#!/bin/bash
# Script to verify git remote configuration
# Usage: ./verify-git-remote.sh

echo "🔍 Verificando configuração do Git remote..."
echo ""

# Get the origin URL
ORIGIN_URL=$(git remote get-url origin 2>&1)

if [ $? -eq 0 ]; then
    echo "✅ Git remote 'origin' configurado com sucesso!"
    echo "📍 URL: $ORIGIN_URL"
    
    # Verify it's the correct repository
    if [[ "$ORIGIN_URL" == *"vedhen-br/velsrios"* ]]; then
        echo "✅ URL aponta para o repositório correto: vedhen-br/velsrios"
        exit 0
    else
        echo "⚠️  Aviso: URL não corresponde ao repositório esperado (vedhen-br/velsrios)"
        exit 1
    fi
else
    echo "❌ Erro: Git remote 'origin' não está configurado"
    echo "💡 Configure com: git remote add origin https://github.com/vedhen-br/velsrios.git"
    exit 1
fi
