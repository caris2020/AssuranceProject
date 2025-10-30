import React from 'react'

interface SessionTimerProps {
	timeRemaining: number
	showWarning: boolean
}

export const SessionTimer: React.FC<SessionTimerProps> = ({ timeRemaining, showWarning }) => {
	if (!showWarning || timeRemaining <= 0) {
		return null
	}

	const minutes = Math.floor(timeRemaining / 60000)
	const seconds = Math.floor((timeRemaining % 60000) / 1000)

	// Couleur basée sur le temps restant
	const getColorClass = () => {
		if (timeRemaining <= 10000) return 'text-red-500' // Rouge si moins de 10 secondes
		if (timeRemaining <= 20000) return 'text-orange-500' // Orange si moins de 20 secondes
		return 'text-yellow-500' // Jaune par défaut
	}

	return (
		<div className={`flex items-center gap-2 text-sm ${getColorClass()}`}>
			<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			<span className="font-mono">
				{minutes > 0 ? `${minutes}:` : ''}{seconds.toString().padStart(2, '0')}
			</span>
		</div>
	)
}
