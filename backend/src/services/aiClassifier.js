// Simulação de classificação por IA (pode integrar OpenAI futuramente)
class AIClassifier {
  classifyLead(text) {
    if (!text) return { priority: 'low', interest: null }

    const lower = text.toLowerCase()

    // Keywords de alta prioridade
    const highKeywords = ['comprar', 'quero', 'interesse', 'urgente', 'agora', 'quando posso']
    // Keywords de média prioridade
    const mediumKeywords = ['talvez', 'informações', 'preço', 'valor', 'visitar', 'conhecer']

    let priority = 'low'
    let interest = null

    if (highKeywords.some(k => lower.includes(k))) {
      priority = 'high'
    } else if (mediumKeywords.some(k => lower.includes(k))) {
      priority = 'medium'
    }

    // Detectar interesse
    if (lower.match(/casa|apartamento|imóvel|propriedade/)) {
      interest = 'Compra de imóvel'
    } else if (lower.match(/investir|investimento/)) {
      interest = 'Investimento'
    } else if (lower.match(/alugar|aluguel/)) {
      interest = 'Aluguel'
    }

    return { priority, interest }
  }

  generateResponse(text) {
    const lower = text.toLowerCase()
    
    if (lower.match(/oi|olá|ola|bom dia|boa tarde|boa noite/)) {
      return 'Olá! Bem-vindo à nossa plataforma. Como posso ajudá-lo hoje?'
    }
    
    if (lower.match(/comprar|interesse|quero/)) {
      return 'Que ótimo! Vou encaminhá-lo para um de nossos consultores. Em breve você receberá atendimento personalizado.'
    }

    return 'Obrigado pelo contato! Um consultor entrará em contato em breve.'
  }
}

module.exports = new AIClassifier()
