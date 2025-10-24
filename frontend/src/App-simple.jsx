import React from 'react'

// App ultra-simples para testar se o React funciona
export default function App() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f3f4f6',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        padding: '2rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        textAlign: 'center'
      }}>
        <h1 style={{ color: '#1f2937', marginBottom: '1rem' }}>
          🎉 Lead Campanha CRM
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
          Deploy funcionando no Vercel!
        </p>
        <div style={{ 
          padding: '0.75rem', 
          backgroundColor: '#dcfce7', 
          color: '#166534',
          borderRadius: '4px',
          border: '1px solid #bbf7d0'
        }}>
          ✅ React renderizando corretamente
        </div>
        <p style={{ 
          marginTop: '1rem', 
          fontSize: '0.875rem', 
          color: '#9ca3af' 
        }}>
          Ambiente: {window.location.hostname}
        </p>
      </div>
    </div>
  )
}