import React, { useEffect, useState } from 'react'

interface NotificationToastProps {
  notification: {
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
  onClose: () => void
  onMarkAsRead?: (id: number) => void
  autoClose?: boolean
  duration?: number
}

const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onClose,
  onMarkAsRead,
  autoClose = true,
  duration = 5000
}) => {
  const [isVisible, setIsVisible] = useState(true)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [autoClose, duration])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsVisible(false)
      onClose()
    }, 300)
  }

  const handleClick = () => {
    if (onMarkAsRead && !notification.read) {
      onMarkAsRead(notification.id)
    }
    
    if (notification.url) {
      window.location.href = notification.url
    }
    
    handleClose()
  }

  const getIcon = () => {
    switch (notification.type) {
      case 'CASE_CREATED':
        return <span className="text-2xl">📁</span>
      case 'CASE_STATUS_CHANGED':
        return <span className="text-2xl">🔄</span>
      case 'REPORT_CREATED':
        return <span className="text-2xl">📄</span>
      case 'REPORT_REQUEST_TO_OWNER':
        return <span className="text-2xl">⚠️</span>
      case 'REPORT_REQUEST_CONFIRMATION':
        return <span className="text-2xl">✅</span>
      case 'VALIDATION_CODE_GENERATED':
        return <span className="text-2xl">🔐</span>
      case 'REPORT_DOWNLOADED':
        return <span className="text-2xl">📥</span>
      case 'DOWNLOAD_COMPLETED':
        return <span className="text-2xl">✅</span>
      default:
        return <span className="text-2xl">🔔</span>
    }
  }

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'CASE_CREATED':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
      case 'REPORT_CREATED':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
      case 'REPORT_REQUEST_TO_OWNER':
        return 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800'
      case 'REPORT_REQUEST_CONFIRMATION':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
      case 'VALIDATION_CODE_GENERATED':
        return 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800'
      case 'REPORT_DOWNLOADED':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
      case 'DOWNLOAD_COMPLETED':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
      default:
        return 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800'
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return 'À l\'instant'
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `Il y a ${minutes} min`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `Il y a ${hours}h`
    } else {
      const days = Math.floor(diffInSeconds / 86400)
      return `Il y a ${days}j`
    }
  }

  if (!isVisible) return null

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 max-w-sm w-full
        ${getBackgroundColor()}
        border rounded-lg shadow-lg
        transform transition-all duration-300 ease-in-out
        ${isClosing ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
        ${!notification.read ? 'ring-2 ring-blue-500/20' : ''}
        cursor-pointer hover:shadow-xl
      `}
      onClick={handleClick}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                {notification.title}
              </h4>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleClose()
                }}
                className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <span className="text-lg">✕</span>
              </button>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
              {notification.message}
            </p>
            
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatTime(notification.createdAt)}
              </span>
              {!notification.read && (
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotificationToast
