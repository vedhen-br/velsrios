# API Documentation

## Base URL

```
http://localhost:3000/api
```

## Endpoints

### Health Check

Verifica o status do servidor.

**Endpoint:** `GET /api/health`

**Response:**
```json
{
  "status": "ok",
  "message": "Velsrios Platform está funcionando!",
  "timestamp": "2025-10-23T20:13:37.055Z"
}
```

**Status Codes:**
- `200 OK` - Servidor funcionando normalmente

---

### Platform Info

Retorna informações sobre a plataforma.

**Endpoint:** `GET /api/info`

**Response:**
```json
{
  "name": "Velsrios Platform",
  "version": "1.0.0",
  "description": "Minha plataforma moderna e integrada"
}
```

**Status Codes:**
- `200 OK` - Informações retornadas com sucesso

---

### List Users

Retorna a lista de usuários (exemplo).

**Endpoint:** `GET /api/users`

**Response:**
```json
{
  "users": [
    {
      "id": 1,
      "name": "Admin",
      "role": "admin"
    },
    {
      "id": 2,
      "name": "User",
      "role": "user"
    }
  ]
}
```

**Status Codes:**
- `200 OK` - Lista retornada com sucesso

---

## Error Responses

### 404 Not Found

Quando uma rota não é encontrada.

```json
{
  "error": "Rota não encontrada"
}
```

### 500 Internal Server Error

Quando ocorre um erro no servidor.

```json
{
  "error": "Algo deu errado!",
  "message": "Detailed error message (only in development)"
}
```

---

## Rate Limiting

A API implementa rate limiting para prevenir abuso:

- **Window:** 15 minutos
- **Max Requests:** 100 por janela
- **Scope:** Rotas `/api/*`

Quando o limite é excedido, você receberá um status `429 Too Many Requests`.

---

## Authentication (Future)

Autenticação será implementada em versões futuras usando JWT tokens.

**Planned Headers:**
```
Authorization: Bearer <token>
```

---

## CORS

CORS está habilitado para permitir requisições de diferentes origens.

---

## Security

A API implementa várias medidas de segurança:

- **Helmet.js** - Headers de segurança HTTP
- **Rate Limiting** - Proteção contra brute force
- **CORS** - Controle de acesso
- **Input Validation** - Sanitização de dados (a ser expandida)

---

## Examples

### cURL

```bash
# Health check
curl http://localhost:3000/api/health

# Get info
curl http://localhost:3000/api/info

# Get users
curl http://localhost:3000/api/users
```

### JavaScript (Fetch)

```javascript
// Health check
fetch('http://localhost:3000/api/health')
  .then(res => res.json())
  .then(data => console.log(data));

// Get info
fetch('http://localhost:3000/api/info')
  .then(res => res.json())
  .then(data => console.log(data));
```

### Python (requests)

```python
import requests

# Health check
response = requests.get('http://localhost:3000/api/health')
print(response.json())

# Get info
response = requests.get('http://localhost:3000/api/info')
print(response.json())
```

---

## Changelog

### v1.0.0 (2025-10-23)
- Initial API release
- Health check endpoint
- Platform info endpoint
- Users list endpoint
- Security measures implemented
