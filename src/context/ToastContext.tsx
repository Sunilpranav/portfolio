import React, { createContext, useContext, useState, useCallback } from 'react'
import { FiCheck, FiX, FiAlertTriangle, FiInfo } from 'react-icons/fi'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} })

const icons = {
  success: <FiCheck />,
  error: <FiX />,
  warning: <FiAlertTriangle />,
  info: <FiInfo />,
}

const colors = {
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#6366f1',
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}>
        {toasts.map(t => (
          <div
            key={t.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              background: 'var(--surface)',
              border: `1px solid ${colors[t.type]}44`,
              borderLeft: `4px solid ${colors[t.type]}`,
              borderRadius: '10px',
              padding: '0.75rem 1rem',
              minWidth: '260px',
              maxWidth: '360px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
              animation: 'slideInRight 0.3s ease',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
            }}
          >
            <span style={{ color: colors[t.type], flexShrink: 0 }}>{icons[t.type]}</span>
            <span>{t.message}</span>
            <button
              onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
              style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <FiX />
            </button>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
