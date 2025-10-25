// Utility to detect API and WebSocket URLs dynamically
// Works in both local development and GitHub Codespaces

export function getApiUrl() {
  // Highest priority: explicit env var (works on Vercel with dedicated backend)
  if (import.meta?.env?.VITE_API_URL) return import.meta.env.VITE_API_URL

  // Check if running in Vercel production (only use origin/api if no env provided)
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return `${window.location.origin}/api`
  }

  // Check if running in Codespaces
  if (typeof window !== 'undefined' && window.location.hostname.includes('github.dev')) {
    // Extract base URL and replace port
    const currentUrl = window.location.origin
    const backendUrl = currentUrl.replace(/-5173\./, '-4000.')
    return `${backendUrl}/api`
  }

  // Fallback to localhost
  return 'http://localhost:4000/api'
}

export function getWebSocketUrl() {
  // Highest priority: explicit env var
  if (import.meta?.env?.VITE_WS_URL) return import.meta.env.VITE_WS_URL

  // Codespaces: map to forwarded 4000
  if (typeof window !== 'undefined' && window.location.hostname.includes('github.dev')) {
    const currentUrl = window.location.origin
    return currentUrl.replace(/-5173\./, '-4000.')
  }

  // Fallback to localhost
  return 'http://localhost:4000'
}

export function isCodespaces() {
  return typeof window !== 'undefined' && window.location.hostname.includes('github.dev')
}

export function isVercel() {
  return typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')
}

export function getAppName() {
  return import.meta.env.VITE_APP_NAME || 'Lead Campanha CRM'
}

// Log current environment for debugging
if (typeof window !== 'undefined') {
  console.log('🌐 Environment:', {
    isCodespaces: isCodespaces(),
    isVercel: isVercel(),
    apiUrl: getApiUrl(),
    wsUrl: getWebSocketUrl(),
    hostname: window.location.hostname
  })
}
