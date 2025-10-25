import React, { createContext, useContext, useMemo, useState, useCallback } from 'react'

const NotificationsContext = createContext(null)

export function NotificationsProvider({ children }) {
  const [items, setItems] = useState([])
  const unreadCount = useMemo(() => items.filter(n => !n.read).length, [items])

  const remove = useCallback((id) => {
    setItems(prev => prev.filter(n => n.id !== id))
  }, [])

  const markAllRead = useCallback(() => {
    setItems(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  const notify = useCallback(({ title, message, type = 'info', ttl = 8000 }) => {
    const id = Math.random().toString(36).slice(2)
    const item = { id, title, message, type, createdAt: new Date().toISOString(), read: false }
    setItems(prev => [item, ...prev].slice(0, 50))
    // auto dismiss toast only (keep in list as read)
    if (ttl > 0) {
      setTimeout(() => {
        setItems(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)))
      }, ttl)
    }
    // Browser notification (best-effort)
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title || 'Notificação', { body: message })
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission()
      }
    }
    return id
  }, [])

  const value = { items, unreadCount, notify, remove, markAllRead }
  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  return useContext(NotificationsContext)
}
