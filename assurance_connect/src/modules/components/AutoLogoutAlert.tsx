import React, { useState, useEffect } from 'react'
import { useAuth } from '../state/AuthState'
import { AUTO_LOGOUT_CONFIG } from '../config/autoLogout'

interface AutoLogoutAlertProps {
	timeRemaining: number
	onExtend: () => void
	onLogout: () => void
}

export const AutoLogoutAlert: React.FC<AutoLogoutAlertProps> = ({ 
	timeRemaining, 
	onExtend, 
	onLogout 
}) => {
	const [isVisible, setIsVisible] = useState(false)

	useEffect(() => {
		// Afficher l'alerte quand il reste 30 secondes ou moins
		if (timeRemaining <= 30000 && timeRemaining > 0) {
			setIsVisible(true)
		} else {
			setIsVisible(false)
		}
	}, [timeRemaining])

	if (!isVisible) return null

	const minutes = Math.floor(timeRemaining / 60000)
	const seconds = Math.floor((timeRemaining % 60000) / 1000)

	return (
		<div className="fixed top-4 right-4 z-50 bg-yellow-50 border border-yellow-200 rounded-lg shadow-lg p-4 max-w-sm">
			<div className="flex items-start">
				<div className="flex-shrink-0">
					<svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
						<path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
					</svg>
				</div>
				<div className="ml-3">
					<h3 className="text-sm font-medium text-yellow-800">
						{AUTO_LOGOUT_CONFIG.MESSAGES.WARNING_TITLE}
					</h3>
					<div className="mt-2 text-sm text-yellow-700">
						<p>
							{AUTO_LOGOUT_CONFIG.MESSAGES.WARNING_TEXT} {' '}
							<span className="font-semibold">
								{minutes > 0 ? `${minutes}m ` : ''}{seconds}s
							</span>
						</p>
					</div>
					<div className="mt-4 flex space-x-3">
						<button
							type="button"
							onClick={onExtend}
							className="bg-yellow-50 px-3 py-2 text-sm font-medium text-yellow-800 rounded-md hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
						>
							{AUTO_LOGOUT_CONFIG.MESSAGES.EXTEND_BUTTON}
						</button>
						<button
							type="button"
							onClick={onLogout}
							className="bg-red-50 px-3 py-2 text-sm font-medium text-red-800 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
						>
							{AUTO_LOGOUT_CONFIG.MESSAGES.LOGOUT_BUTTON}
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}
