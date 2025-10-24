import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { getWebSocketUrl } from '../utils/env'

const SOCKET_URL = getWebSocketUrl()

export function useSocket(userId) {
  const socketRef = useRef(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!userId) return

    // Criar conexão
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    })

    const socket = socketRef.current

    socket.on('connect', () => {
      console.log('✅ WebSocket conectado:', socket.id)
      setIsConnected(true)
      
      // Autenticar usuário
      socket.emit('authenticate', { userId })
    })

    socket.on('disconnect', () => {
      console.log('❌ WebSocket desconectado')
      setIsConnected(false)
    })

    socket.on('connect_error', (error) => {
      console.error('Erro de conexão WebSocket:', error)
    })

    // Cleanup
    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [userId])

  return {
    socket: socketRef.current,
    isConnected
  }
}

export function useSocketEvent(socket, event, handler) {
  useEffect(() => {
    if (!socket) return

    socket.on(event, handler)

    return () => {
      socket.off(event, handler)
    }
  }, [socket, event, handler])
}
