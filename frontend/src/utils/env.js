// Utility to detect API and WebSocket URLs dynamically
// Works in both local development and GitHub Codespaces

export function getApiUrl() {
  // Check if running in Codespaces
  if (typeof window !== 'undefined' && window.location.hostname.includes('github.dev')) {
    // Extract base URL and replace port
    const currentUrl = window.location.origin
    const backendUrl = currentUrl.replace(/-5173\./, '-4000.')
    return `${backendUrl}/api`
  }
  
  // Use environment variable or fallback to localhost
  return import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
}

export function getWebSocketUrl() {
  // Check if running in Codespaces
  if (typeof window !== 'undefined' && window.location.hostname.includes('github.dev')) {
    // Extract base URL and replace port
    const currentUrl = window.location.origin
    return currentUrl.replace(/-5173\./, '-4000.')
  }
  
  // Use environment variable or fallback to localhost
  return import.meta.env.VITE_WS_URL || 'http://localhost:4000'
}

export function isCodespaces() {
  return typeof window !== 'undefined' && window.location.hostname.includes('github.dev')
}

export function getAppName() {
  return import.meta.env.VITE_APP_NAME || 'Lead Campanha CRM'
}

// Log current environment for debugging
if (typeof window !== 'undefined') {
  console.log('🌐 Environment:', {
    isCodespaces: isCodespaces(),
    apiUrl: getApiUrl(),
    wsUrl: getWebSocketUrl(),
    hostname: window.location.hostname
  })
}
