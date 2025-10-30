import { useEffect, useRef, useCallback, useState } from 'react'
import { useAuth } from '../state/AuthState'
import { AUTO_LOGOUT_CONFIG } from '../config/autoLogout'

const { INACTIVITY_TIMEOUT, WARNING_TIME, ACTIVITY_EVENTS } = AUTO_LOGOUT_CONFIG

export const useAutoLogout = () => {
	const { isAuthenticated, logout } = useAuth()
	const timeoutRef = useRef<NodeJS.Timeout | null>(null)
	const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null)
	const lastActivityRef = useRef<number>(Date.now())
	const [timeRemaining, setTimeRemaining] = useState<number>(0)
	const [showWarning, setShowWarning] = useState<boolean>(false)

	// Fonction pour réinitialiser le timer
	const resetTimer = useCallback(() => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current)
		}
		if (warningTimeoutRef.current) {
			clearTimeout(warningTimeoutRef.current)
		}
		
		if (isAuthenticated) {
			// Timer pour l'alerte (30 secondes avant la déconnexion)
			warningTimeoutRef.current = setTimeout(() => {
				setShowWarning(true)
			}, INACTIVITY_TIMEOUT - WARNING_TIME)

			// Timer pour la déconnexion automatique
			timeoutRef.current = setTimeout(() => {
				console.log('Déconnexion automatique due à l\'inactivité')
				setShowWarning(false)
				logout()
			}, INACTIVITY_TIMEOUT)
		}
		
		lastActivityRef.current = Date.now()
		setTimeRemaining(INACTIVITY_TIMEOUT)
		setShowWarning(false)
	}, [isAuthenticated, logout])

	// Fonction pour étendre la session
	const extendSession = useCallback(() => {
		resetTimer()
	}, [resetTimer])

	// Fonction pour détecter l'activité utilisateur
	const handleUserActivity = useCallback(() => {
		resetTimer()
	}, [resetTimer])

	// Effet pour mettre à jour le temps restant
	useEffect(() => {
		if (!isAuthenticated || !showWarning) {
			setTimeRemaining(0)
			return
		}

		const interval = setInterval(() => {
			const elapsed = Date.now() - lastActivityRef.current
			const remaining = Math.max(0, INACTIVITY_TIMEOUT - elapsed)
			setTimeRemaining(remaining)

			if (remaining <= 0) {
				clearInterval(interval)
			}
		}, 1000)

		return () => clearInterval(interval)
	}, [isAuthenticated, showWarning])

	// Effet pour initialiser le système de surveillance
	useEffect(() => {
		if (!isAuthenticated) {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current)
				timeoutRef.current = null
			}
			if (warningTimeoutRef.current) {
				clearTimeout(warningTimeoutRef.current)
				warningTimeoutRef.current = null
			}
			setShowWarning(false)
			setTimeRemaining(0)
			return
		}

		// Ajouter les écouteurs d'événements
		ACTIVITY_EVENTS.forEach(event => {
			document.addEventListener(event, handleUserActivity, true)
		})

		// Initialiser le timer
		resetTimer()

		// Nettoyer les écouteurs d'événements
		return () => {
			ACTIVITY_EVENTS.forEach(event => {
				document.removeEventListener(event, handleUserActivity, true)
			})
			
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current)
			}
			if (warningTimeoutRef.current) {
				clearTimeout(warningTimeoutRef.current)
			}
		}
	}, [isAuthenticated, handleUserActivity, resetTimer])

	// Nettoyer les timers lors du démontage
	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current)
			}
			if (warningTimeoutRef.current) {
				clearTimeout(warningTimeoutRef.current)
			}
		}
	}, [])

	return {
		lastActivity: lastActivityRef.current,
		timeRemaining,
		showWarning,
		resetTimer: extendSession,
		extendSession,
		logout
	}
}
