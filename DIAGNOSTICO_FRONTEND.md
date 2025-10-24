# 🔍 Diagnóstico: Frontend Página em Branco

## Passo 1: Abrir o Console do Navegador (F12)

1. Com o frontend rodando em http://localhost:5173
2. Aperte **F12** no navegador (Chrome/Edge)
3. Vá na aba **Console**
4. Veja se tem erros em **vermelho**

---

## Erros Comuns e Soluções

### ❌ Erro: "Failed to fetch" ou "Network Error"

**Causa:** Backend não está acessível ou CORS bloqueando

**Solução:**

```powershell
# Verifique se o backend está rodando:
curl http://localhost:4000/api/health

# Se não retornar {"ok":true}, reinicie o backend:
cd "C:\Users\pedro.neto\Desktop\Lead Campanha\backend"
npm run dev
```

**Solução CORS:**
Edite `backend\.env` e adicione:

```env
FRONTEND_URL=http://localhost:5173
```

Reinicie o backend.

---

### ❌ Erro: "Uncaught SyntaxError" ou "Unexpected token"

**Causa:** Arquivo JSX corrompido ou dependência faltando

**Solução:**

```powershell
# Reinstale dependências do frontend:
cd "C:\Users\pedro.neto\Desktop\Lead Campanha\frontend"
Remove-Item node_modules -Recurse -Force
Remove-Item package-lock.json
npm install
npm run dev
```

---

### ❌ Erro: "Cannot read properties of undefined"

**Causa:** Variável ou componente não carregado corretamente

**Solução:**
Veja qual arquivo está causando o erro no console (ex: `AuthContext.jsx:23`)
e compartilhe o erro completo comigo.

---

### ❌ Tela branca SEM erros no console

**Causa:** CSS do Tailwind não carregou ou `#root` não foi encontrado

**Solução 1 - Verificar Tailwind:**

```powershell
cd "C:\Users\pedro.neto\Desktop\Lead Campanha\frontend"
npm run dev
```

Veja se aparece a mensagem "Tailwind CSS" no terminal.

**Solução 2 - Limpar cache do Vite:**

```powershell
cd "C:\Users\pedro.neto\Desktop\Lead Campanha\frontend"
Remove-Item -Recurse -Force .vite
npm run dev
```

---

## Passo 2: Testar API Manualmente

No PowerShell ou no navegador:

```powershell
# Health check (deve retornar {"ok":true})
curl http://localhost:4000/api/health

# Login (deve retornar token e user)
curl -X POST http://localhost:4000/api/login `
  -H "Content-Type: application/json" `
  -d '{"email":"admin@leadcampanha.com","password":"admin123"}'
```

Se algum desses comandos falhar, o backend não está configurado corretamente.

---

## Passo 3: Verificar Portas

```powershell
# Ver o que está rodando na porta 5173 (frontend)
netstat -ano | findstr :5173

# Ver o que está rodando na porta 4000 (backend)
netstat -ano | findstr :4000
```

Se não aparecer nada, significa que o servidor não está rodando.

---

## Passo 4: Tela de Loading Infinito

Se a tela mostra "Carregando..." para sempre:

**Causa:** O `AuthContext` está travado tentando buscar `/api/me`

**Solução Rápida - Testar sem autenticação:**

Edite `frontend/src/App.jsx` e comente temporariamente a checagem:

```jsx
// TEMPORÁRIO - apenas para teste
if (loading) {
  return <div>Sistema carregando...</div>;
}

// Se não tiver user, force um teste:
// return <Login />  // force mostrar a tela de login
```

---

## Passo 5: Me Envie Estas Informações

Se ainda não funcionar, me envie:

1. **Print do console do navegador (F12 → Console)**
2. **Print do terminal do backend** (últimas 10 linhas)
3. **Print do terminal do frontend** (últimas 10 linhas)
4. **Resultado de:** `curl http://localhost:4000/api/health`

---

## ✅ Solução Mais Comum (90% dos casos)

### O frontend não está conseguindo chamar o backend por CORS

**Fix definitivo:**

1. Pare o backend (Ctrl+C)
2. Edite `backend\.env`:
   ```env
   PORT=4000
   DATABASE_URL="file:./dev.db"
   JWT_SECRET=seu-secret-super-seguro-123
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```
3. Reinicie:
   ```powershell
   cd "C:\Users\pedro.neto\Desktop\Lead Campanha\backend"
   npm run dev
   ```
4. Recarregue o frontend (F5)

Se aparecer no console do **backend** algo como:

```
✅ CORS permitido para: http://localhost:5173
```

Então está OK.

---

## 🚀 Teste Final

1. Backend rodando: http://localhost:4000/api/health → `{"ok":true}`
2. Frontend rodando: http://localhost:5173 → Tela de login aparecer
3. Console sem erros (F12)
4. Login funcionar com: `admin@leadcampanha.com` / `admin123`

---

**Próximo passo:** Me envie o que aparecer no console (F12) para eu resolver rapidinho! 🎯
