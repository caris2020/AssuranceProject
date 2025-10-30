import React, { useEffect, useState } from 'react'
import { useAuth } from '../state/AuthState'
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification, deleteAllUserNotifications, getTrashedNotifications, restoreNotification } from '../services/api'
import { Button } from '../../ui'

interface Notification {
  id: number
  userId: string
  title: string
  message: string
  type: string
  action?: string
  url?: string
  metadata?: string
  read: boolean
  createdAt: string
  readAt?: string
}

const NotificationsPage: React.FC = () => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [trash, setTrash] = useState<Notification[]>([])
  const [showTrash, setShowTrash] = useState<boolean>(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadNotifications = async () => {
    if (!user?.name) return
    
    try {
      setLoading(true)
      const data = await getUserNotifications(user.name)
      setNotifications(data)
      try {
        const t = await getTrashedNotifications(user.name)
        setTrash(t)
      } catch {}
      setError(null)
    } catch (err) {
      setError('Erreur lors du chargement des notifications')
      console.error('Erreur chargement notifications:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: number) => {
    if (!user?.name) return
    
    try {
      const success = await markNotificationAsRead(notificationId, user.name)
      if (success) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId 
              ? { ...n, read: true, readAt: new Date().toISOString() }
              : n
          )
        )
      }
    } catch (err) {
      console.error('Erreur marquage notification:', err)
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!user?.name) return
    
    try {
      const success = await markAllNotificationsAsRead(user.name)
      if (success) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, read: true, readAt: new Date().toISOString() }))
        )
      }
    } catch (err) {
      console.error('Erreur marquage toutes notifications:', err)
    }
  }

  const handleDeleteNotification = async (notificationId: number) => {
    if (!user?.name) {
      console.error('❌ Utilisateur non connecté')
      return
    }
    
    console.log('🔍 Tentative de suppression de la notification:', notificationId, 'pour l\'utilisateur:', user.name)
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette notification ?')) {
      console.log('❌ Suppression annulée par l\'utilisateur')
      return
    }
    
    try {
      console.log('📡 Appel API deleteNotification...')
      const success = await deleteNotification(notificationId, user.name)
      console.log('📡 Réponse API:', success)
      
      if (success) {
        console.log('✅ Suppression réussie, mise à jour de la liste')
        // déplacer dans la corbeille locale
        const item = notifications.find(n => n.id === notificationId)
        setNotifications(prev => prev.filter(n => n.id !== notificationId))
        if (item) setTrash(prev => [item, ...prev])
      } else {
        console.error('❌ La suppression a échoué côté serveur')
        alert('Erreur: La suppression a échoué')
      }
    } catch (err) {
      console.error('❌ Erreur suppression notification:', err)
      alert('Erreur lors de la suppression: ' + (err as Error).message)
    }
  }

  const handleDeleteAllNotifications = async () => {
    if (!user?.name) return
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer toutes vos notifications ?')) {
      return
    }
    
    try {
      const success = await deleteAllUserNotifications(user.name)
      if (success) {
        setNotifications([])
      }
    } catch (err) {
      console.error('Erreur suppression toutes notifications:', err)
    }
  }

  const handleRestore = async (notificationId: number) => {
    if (!user?.name) return
    try {
      const ok = await restoreNotification(notificationId, user.name)
      if (ok) {
        await loadNotifications()
      }
    } catch (err) {
      console.error('Erreur restauration notification:', err)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [user?.name])

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Notifications</h2>
          <div className="flex gap-2">
            <Button intent="secondary" size="sm" onClick={() => setShowTrash(v => !v)}>
              {showTrash ? 'Masquer la corbeille' : 'Corbeille'}
            </Button>
            {unreadCount > 0 && (
              <Button 
                intent="secondary" 
                size="sm" 
                onClick={handleMarkAllAsRead}
              >
                Marquer tout comme lu ({unreadCount})
              </Button>
            )}
            {notifications.length > 0 && (
              <Button 
                intent="secondary" 
                size="sm" 
                onClick={handleDeleteAllNotifications}
                className="text-red-600 hover:text-red-700"
              >
                Supprimer tout
              </Button>
            )}
          </div>
        </div>

        {loading && (
          <div className="py-8 text-sm text-slate-500">Chargement des notifications...</div>
        )}

        {error && (
          <div className="py-8 text-sm text-red-600">{error}</div>
        )}

        {!loading && !error && (
          <ul className="mt-4 divide-y divide-slate-200 dark:divide-slate-700">
            {notifications.length === 0 && (
              <li className="py-8 text-sm text-slate-500">Aucune notification pour le moment</li>
            )}
            {notifications.map(notification => (
              <li key={notification.id} className="py-3 flex items-start gap-3">
                <div className={`h-2 w-2 rounded-full mt-2 ${notification.read ? 'bg-slate-400' : 'bg-brand-500'}`}></div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{notification.title}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">{notification.message}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {new Date(notification.createdAt).toLocaleString('fr-FR')}
                  </div>
                </div>
                <div className="flex flex-col gap-1 ml-auto">
                  {!notification.read && (
                    <button 
                      className="text-xs text-brand-600 hover:underline" 
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      Marquer comme lu
                    </button>
                  )}
                  <button 
                    className="text-xs text-red-600 hover:underline hover:text-red-700" 
                    onClick={() => handleDeleteNotification(notification.id)}
                    title="Supprimer cette notification"
                  >
                    🗑️ Supprimer
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Corbeille (affichage conditionnel) */}
        {showTrash && (
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Corbeille</h3>
            <span className="text-xs text-slate-500">{trash.length} élément(s)</span>
          </div>
          {trash.length === 0 ? (
            <div className="py-4 text-xs text-slate-500">Aucun élément dans la corbeille</div>
          ) : (
            <ul className="mt-2 divide-y divide-slate-200 dark:divide-slate-700">
              {trash.map(n => (
                <li key={n.id} className="py-2 flex items-start gap-3">
                  <div className="flex-1">
                    <div className="text-xs font-medium">{n.title}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-300">{n.message}</div>
                  </div>
                  <button className="text-xs text-brand-600 hover:underline" onClick={() => handleRestore(n.id)}>
                    Restaurer
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        )}
      </div>
    </div>
  )
}

export default NotificationsPage


