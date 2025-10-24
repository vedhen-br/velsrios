# Script PowerShell para testar a API do backend
# Execute: .\test-api.ps1

Write-Host "`n🔍 Testando Backend do Lead Campanha...`n" -ForegroundColor Cyan

# Teste 1: Health Check
Write-Host "1️⃣ Testando Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:4000/api/health" -Method Get
    if ($health.ok -eq $true) {
        Write-Host "   ✅ Backend está rodando!" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Backend retornou resposta inesperada" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Erro: Backend não está acessível" -ForegroundColor Red
    Write-Host "   → Certifique-se de que 'npm run dev' está rodando no backend" -ForegroundColor Yellow
    exit 1
}

# Teste 2: Login
Write-Host "`n2️⃣ Testando Login..." -ForegroundColor Yellow
try {
    $body = @{
        email = "admin@leadcampanha.com"
        password = "admin123"
    } | ConvertTo-Json

    $headers = @{
        "Content-Type" = "application/json"
    }

    $login = Invoke-RestMethod -Uri "http://localhost:4000/api/login" -Method Post -Body $body -Headers $headers
    
    if ($login.token) {
        Write-Host "   ✅ Login funcionou! Token recebido." -ForegroundColor Green
        Write-Host "   👤 Usuário: $($login.user.name)" -ForegroundColor Cyan
        
        # Teste 3: Buscar dados autenticados
        Write-Host "`n3️⃣ Testando busca de leads..." -ForegroundColor Yellow
        $authHeaders = @{
            "Authorization" = "Bearer $($login.token)"
        }
        
        $leads = Invoke-RestMethod -Uri "http://localhost:4000/api/leads" -Method Get -Headers $authHeaders
        Write-Host "   ✅ API retornou $($leads.Count) leads" -ForegroundColor Green
        
    } else {
        Write-Host "   ❌ Login falhou: token não recebido" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Erro no login: $($_.Exception.Message)" -ForegroundColor Red
}

# Teste 4: CORS
Write-Host "`n4️⃣ Verificando CORS..." -ForegroundColor Yellow
Write-Host "   ℹ️  CORS deve permitir: http://localhost:5173" -ForegroundColor Cyan
Write-Host "   → Verifique no backend/.env se FRONTEND_URL está configurado" -ForegroundColor Yellow

# Teste 5: Portas
Write-Host "`n5️⃣ Verificando portas em uso..." -ForegroundColor Yellow
$port4000 = netstat -ano | Select-String ":4000"
$port5173 = netstat -ano | Select-String ":5173"

if ($port4000) {
    Write-Host "   ✅ Porta 4000 (backend) está em uso" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Porta 4000 (backend) NÃO está em uso" -ForegroundColor Yellow
}

if ($port5173) {
    Write-Host "   ✅ Porta 5173 (frontend) está em uso" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Porta 5173 (frontend) NÃO está em uso" -ForegroundColor Yellow
}

Write-Host "`n✅ Testes completos!`n" -ForegroundColor Green
Write-Host "📌 Próximos passos:" -ForegroundColor Cyan
Write-Host "   1. Abra http://localhost:5173 no navegador" -ForegroundColor White
Write-Host "   2. Aperte F12 para abrir o console" -ForegroundColor White
Write-Host "   3. Veja se há erros em vermelho" -ForegroundColor White
Write-Host "   4. Me envie o print se houver erros`n" -ForegroundColor White
