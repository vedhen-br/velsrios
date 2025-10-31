# 🧠 Instruções Personalizadas do Copilot para o projeto Velsrios

O objetivo deste projeto é desenvolver uma **plataforma de atendimento ao cliente e gestão de conversas** que centraliza a comunicação do WhatsApp para empresas. Ela permite que múltiplos atendentes usem um único número de WhatsApp simultaneamente, organizando o trabalho da equipe através de uma interface unificada.

## 🎯 Diretrizes gerais
- Priorizar código limpo, modular, comentado e de fácil manutenção.
- Seguir boas práticas de arquitetura para **Next.js (frontend)** + **Node.js + Prisma (backend)**.
- Garantir integração estável entre **Vercel (frontend)** e **Render (backend)**.
- Evitar dependências desnecessárias e priorizar performance.
- Seguir a estrutura atual de pastas (frontend / backend separados).

## 🧩 Funcionalidades do CRM
- Gerenciar múltiplos atendentes usando **um único número de WhatsApp** simultaneamente.
- Organizar conversas por fila de atendimento, status e prioridade.
- Permitir **atribuição de conversas** a atendentes específicos.
- Registrar histórico completo de mensagens por cliente.
- Implementar notificações internas quando houver novas mensagens ou interações pendentes.
- Permitir busca e filtragem avançada de conversas e clientes.
- Garantir segurança, privacidade e persistência de dados em Prisma/Postgres.

## 🔗 Integração com WhatsApp
- Verificar sempre se o **auth state** do WhatsApp está persistindo corretamente no Prisma.
- Reconectar automaticamente quando houver erro de sessão, sugerindo QR code se necessário.
- Otimizar estabilidade e performance do fluxo de envio/recebimento de mensagens.
- Permitir múltiplas sessões ou agentes usando o mesmo número de WhatsApp sem conflito.

## 💻 Backend de referência
O backend está hospedado em:  
`https://velsrios-backend.onrender.com`

Copilot deve considerar este endpoint para **testes, chamadas HTTP e exemplos de integração**.

## 💬 Estilo de interação do Copilot
- Ser direto, técnico e prático nas respostas.
- Priorizar soluções escaláveis e fáceis de manter.
- Sugerir melhorias visuais, de UX/UI e otimização de performance.
- Fornecer exemplos de código quando possível, sempre adaptados ao stack do projeto.

## 🛠 Extras
- Indicar possíveis pacotes, bibliotecas ou ferramentas úteis (Next.js, Prisma, Tailwind, etc.).
- Alertar sobre problemas de compatibilidade entre frontend/backend.
- Sugerir testes unitários ou de integração quando necessário.

---

> Última atualização: 31/10/2025 — por Pedro Oliveira
