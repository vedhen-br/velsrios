import React from 'react'

// Teste simples - remover AuthProvider temporariamente
export default function App() {
  console.log('🔍 App.jsx carregado!')
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-blue-900">🎉 React Funcionando!</h1>
          <p className="text-gray-600 mt-2">Lead Campanha CRM</p>
          <p className="text-sm text-green-600 mt-4">✅ Frontend carregou corretamente</p>
          <p className="text-sm text-green-600">✅ Tailwind CSS funcionando</p>
          <p className="text-sm text-gray-500 mt-4">Abra o console (F12) para ver os logs</p>
        </div>
        
        <div className="space-y-4 mt-6">
          <button className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition">
            Teste de Botão
          </button>
          
          <div className="text-center text-sm text-gray-600">
            <p className="font-semibold">Sistema funcionando!</p>
            <p className="mt-2">Vou restaurar a autenticação agora...</p>
          </div>
        </div>
      </div>
    </div>
  )
}
