#!/usr/bin/env bash
# Script to verify git remote configuration
# Usage: ./verify-git-remote.sh

set -euo pipefail

echo "🔍 Verificando configuração do Git remote..."
echo ""

# Get the origin URL
if ORIGIN_URL=$(git remote get-url origin 2>&1); then
    echo "✅ Git remote 'origin' configurado com sucesso!"
    echo "📍 URL: $ORIGIN_URL"
    
    # Verify it's the correct repository with precise pattern matching
    # Matches both HTTPS and SSH formats:
    # - https://github.com/vedhen-br/velsrios
    # - https://github.com/vedhen-br/velsrios.git
    # - git@github.com:vedhen-br/velsrios.git
    if [[ "$ORIGIN_URL" =~ ^(https://github\.com/|git@github\.com:)vedhen-br/velsrios(\.git)?$ ]]; then
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
