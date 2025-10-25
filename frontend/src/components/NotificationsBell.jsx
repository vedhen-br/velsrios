import React, { useState } from 'react'
import { useNotifications } from '../contexts/NotificationsContext'

export default function NotificationsBell() {
  const { items, unreadCount, markAllRead } = useNotifications()
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        className="relative p-2 hover:bg-gray-100 rounded"
        title="Notificações"
        onClick={() => {
          setOpen(v => !v)
          markAllRead()
        }}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
          <div className="px-4 py-2 border-b bg-gray-50 rounded-t-lg flex items-center justify-between">
            <span className="text-sm font-semibold">Notificações</span>
            <span className="text-xs text-gray-500">{items.length}</span>
          </div>
          <div className="max-h-80 overflow-y-auto divide-y">
            {items.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">Sem notificações</div>
            ) : (
              items.slice(0, 20).map(n => (
                <div key={n.id} className="p-3 text-sm">
                  <div className="flex items-start gap-2">
                    <span className={
                      `mt-0.5 w-2 h-2 rounded-full ${n.type === 'success' ? 'bg-green-500' :
                        n.type === 'warning' ? 'bg-yellow-500' :
                          n.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                      }`
                    }></span>
                    <div className="flex-1">
                      <p className="font-medium">{n.title || 'Atualização'}</p>
                      <p className="text-gray-600 text-xs">{n.message}</p>
                      <p className="text-gray-400 text-[10px] mt-1">{new Date(n.createdAt).toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
