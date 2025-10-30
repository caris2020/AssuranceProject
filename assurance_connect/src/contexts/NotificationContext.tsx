import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from '../modules/state/AuthState'
import { getUserNotifications, markNotificationAsRead } from '../modules/services/api'
import NotificationToast from '../ui/NotificationToast'

interface Notification {
  id: number
  title: string
  message: string
  type: string
  createdAt: string
  read: boolean
  action?: string
  url?: string
  metadata?: string
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Notification) => void
  markAsRead: (id: number) => Promise<void>
  markAllAsRead: () => Promise<void>
  removeNotification: (id: number) => void
  refreshNotifications: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

interface NotificationProviderProps {
  children: React.ReactNode
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [toasts, setToasts] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const unreadCount = notifications.filter(n => !n.read).length

  const loadNotifications = useCallback(async () => {
    if (!user?.name) return

    try {
      setIsLoading(true)
      const data = await getUserNotifications(user.name)

      setNotifications(prev => {
        // Si c'est le premier chargement (prev est vide), ne pas afficher de toasts
        const isFirstLoad = prev.length === 0
        
        if (!isFirstLoad) {
          // Sinon, détecter seulement les VRAIES nouvelles notifications non lues
          const prevIds = new Set(prev.map(n => n.id))
          const newItems = data.filter(n => !prevIds.has(n.id) && !n.read)
          
          if (newItems.length > 0) {
            setToasts(prevToasts => {
              const existingToastIds = new Set(prevToasts.map(t => t.id))
              const freshToasts = newItems.filter(n => !existingToastIds.has(n.id))
              return freshToasts.length > 0 ? [...prevToasts, ...freshToasts] : prevToasts
            })
          }
        }
        
        return data
      })
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user?.name])

  const refreshNotifications = useCallback(async () => {
    await loadNotifications()
  }, [loadNotifications])

  const addNotification = useCallback((notification: Notification) => {
    setNotifications(prev => {
      // Vérifier si la notification existe déjà
      if (prev.find(n => n.id === notification.id)) {
        return prev
      }
      return [notification, ...prev]
    })
    
    // Afficher le toast seulement si c'est une nouvelle notification
    setToasts(prev => {
      if (prev.find(n => n.id === notification.id)) {
        return prev
      }
      return [...prev, notification]
    })
  }, [])

  const markAsRead = useCallback(async (id: number) => {
    if (!user?.name) return

    try {
      const success = await markNotificationAsRead(id, user.name)
      if (success) {
        setNotifications(prev =>
          prev.map(n =>
            n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n
          )
        )
      }
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error)
    }
  }, [user?.name])

  const markAllAsRead = useCallback(async () => {
    if (!user?.name) return

    try {
      // Marquer toutes les notifications non lues comme lues
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id)
      
      for (const id of unreadIds) {
        await markNotificationAsRead(id, user.name)
      }
      
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true, readAt: new Date().toISOString() }))
      )
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications:', error)
    }
  }, [user?.name, notifications, markNotificationAsRead])

  const removeNotification = useCallback((id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(n => n.id !== id))
  }, [])

  // Charger les notifications au montage et quand l'utilisateur change
  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  // Polling pour les nouvelles notifications (toutes les 30 secondes)
  useEffect(() => {
    if (!user?.name) return

    const interval = setInterval(() => {
      loadNotifications()
    }, 30000)

    return () => clearInterval(interval)
  }, [user?.name, loadNotifications])

  const contextValue: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    refreshNotifications
  }

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      
      {/* Afficher les toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <NotificationToast
            key={toast.id}
            notification={toast}
            onClose={() => removeToast(toast.id)}
            onMarkAsRead={markAsRead}
            autoClose={true}
            duration={5000}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  )
}
