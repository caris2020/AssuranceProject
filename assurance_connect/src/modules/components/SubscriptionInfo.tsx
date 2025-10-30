import React from 'react'

interface SubscriptionInfoProps {
	subscriptionStartDate: string
	subscriptionEndDate: string
	subscriptionActive: boolean
	subscriptionStatus: string
	daysUntilExpiration: number
	onRequestRenewal?: () => void
	showRenewalButton?: boolean
}

export const SubscriptionInfo: React.FC<SubscriptionInfoProps> = ({
	subscriptionStartDate,
	subscriptionEndDate,
	subscriptionActive,
	subscriptionStatus,
	daysUntilExpiration,
	onRequestRenewal,
	showRenewalButton = false
}) => {
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('fr-FR', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		})
	}

	const getStatusColor = () => {
		switch (subscriptionStatus) {
			case 'ACTIVE':
				return 'text-green-600 bg-green-50 border-green-200'
			case 'EXPIRED':
				return 'text-red-600 bg-red-50 border-red-200'
			case 'PENDING_RENEWAL':
				return 'text-yellow-600 bg-yellow-50 border-yellow-200'
			case 'SUSPENDED':
				return 'text-gray-600 bg-gray-50 border-gray-200'
			default:
				return 'text-gray-600 bg-gray-50 border-gray-200'
		}
	}

	const getStatusText = () => {
		switch (subscriptionStatus) {
			case 'ACTIVE':
				return 'Actif'
			case 'EXPIRED':
				return 'Expiré'
			case 'PENDING_RENEWAL':
				return 'En attente de renouvellement'
			case 'SUSPENDED':
				return 'Suspendu'
			default:
				return 'Inconnu'
		}
	}

	const getExpirationColor = () => {
		const result = calculateDaysRemaining()
		const daysRemaining = result.days
		
		// Si l'abonnement n'a pas encore commencé
		if (daysRemaining > 365) return 'text-blue-600'
		
		// Si l'abonnement est expiré
		if (daysRemaining === 0) return 'text-red-600'
		
		// Si l'abonnement expire bientôt
		if (daysRemaining <= 30) return 'text-yellow-600'
		if (daysRemaining <= 90) return 'text-orange-600'
		
		return 'text-green-600'
	}

	// Calculer la durée totale de l'abonnement et le pourcentage écoulé
	const calculateProgress = () => {
		const startDate = new Date(subscriptionStartDate)
		const endDate = new Date(subscriptionEndDate)
		// Utiliser la date actuelle réelle
		const now = new Date()
		
		// Durée totale de l'abonnement en jours
		const totalDuration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
		
		// Si l'abonnement n'a pas encore commencé
		if (now < startDate) {
			return {
				totalDuration,
				elapsedTime: 0,
				percentageElapsed: 0,
				status: 'not_started'
			}
		}
		
		// Si l'abonnement est expiré
		if (now > endDate) {
			return {
				totalDuration,
				elapsedTime: totalDuration,
				percentageElapsed: 100,
				status: 'expired'
			}
		}
		
		// Si l'abonnement est en cours
		const elapsedTime = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
		const percentageElapsed = Math.min(100, Math.max(0, (elapsedTime / totalDuration) * 100))
		
		return {
			totalDuration,
			elapsedTime,
			percentageElapsed,
			status: 'active'
		}
	}

	const progress = calculateProgress()

	// Fonction pour calculer les jours restants directement à partir des dates
	const calculateDaysRemaining = () => {
		const startDate = new Date(subscriptionStartDate)
		const endDate = new Date(subscriptionEndDate)
		const now = new Date()
		
		if (now < startDate) {
			const daysUntilStart = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
			return { days: daysUntilStart, text: `Commence dans ${daysUntilStart} jour${daysUntilStart > 1 ? 's' : ''}` }
		}
		
		if (now > endDate) {
			return { days: 0, text: 'Expiré' }
		}
		
		const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
		
		if (daysRemaining === 0) {
			return { days: 0, text: 'Expire aujourd\'hui' }
		}
		
		return { days: daysRemaining, text: `${daysRemaining} jours` }
	}

	// Fonction pour obtenir le texte des jours restants
	const getDaysRemainingText = () => {
		const result = calculateDaysRemaining()
		return result.text
	}

	return (
		<div className="bg-white rounded-lg border border-gray-200 p-6">
			<h3 className="text-lg font-semibold text-gray-900 mb-4">
				📅 Informations d'Abonnement
			</h3>
			
			<div className="space-y-4">
				{/* Statut de l'abonnement */}
				<div className="flex items-center justify-between">
					<span className="text-sm font-medium text-gray-700">Statut :</span>
					<span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor()}`}>
						{getStatusText()}
					</span>
				</div>

				{/* Date de début */}
				<div className="flex items-center justify-between">
					<span className="text-sm font-medium text-gray-700">Date de début :</span>
					<span className="text-sm text-gray-900">{formatDate(subscriptionStartDate)}</span>
				</div>

				{/* Date de fin */}
				<div className="flex items-center justify-between">
					<span className="text-sm font-medium text-gray-700">Date de fin :</span>
					<span className="text-sm text-gray-900">{formatDate(subscriptionEndDate)}</span>
				</div>

				{/* Jours restants */}
				<div className="flex items-center justify-between">
					<span className="text-sm font-medium text-gray-700">Jours restants :</span>
					<span className={`text-sm font-semibold ${getExpirationColor()}`}>
						{getDaysRemainingText()}
					</span>
				</div>

				{/* Barre de progression */}
				{progress.status !== 'not_started' && (
					<div className="mt-4">
						<div className="flex items-center justify-between text-xs text-gray-600 mb-1">
							<span>Temps écoulé</span>
							<span>{Math.round(progress.percentageElapsed)}%</span>
						</div>
						<div className="w-full bg-gray-200 rounded-full h-2">
							<div
								className={`h-2 rounded-full transition-all duration-300 ${
									calculateDaysRemaining().days <= 30 ? 'bg-red-500' :
									calculateDaysRemaining().days <= 90 ? 'bg-yellow-500' : 'bg-green-500'
								}`}
								style={{ width: `${progress.percentageElapsed}%` }}
							></div>
						</div>
					</div>
				)}

				{/* Bouton de demande de renouvellement */}
				{showRenewalButton && (progress.status === 'expired' || daysUntilExpiration <= 30) && (
					<div className="mt-4 pt-4 border-t border-gray-200">
						<button
							onClick={onRequestRenewal}
							className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
						>
							🔄 Demander le renouvellement
						</button>
					</div>
				)}

				{/* Message d'alerte pour expiration proche */}
				{progress.status !== 'not_started' && (() => {
					const result = calculateDaysRemaining()
					return result.days <= 30
				})() && (
					<div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
						<div className="flex items-center">
							<svg className="h-5 w-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
								<path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
							</svg>
							<span className="text-sm text-yellow-800">
								Votre abonnement expire dans {calculateDaysRemaining().days} jour{calculateDaysRemaining().days > 1 ? 's' : ''}.
								{showRenewalButton && ' Contactez l\'administrateur pour le renouveler.'}
							</span>
						</div>
					</div>
				)}

				{/* Message pour abonnement qui n'a pas encore commencé */}
				{progress.status === 'not_started' && (
					<div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
						<div className="flex items-center">
							<svg className="h-5 w-5 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
								<path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
							</svg>
							<span className="text-sm text-blue-800">
								Votre abonnement n'a pas encore commencé. Il sera actif à partir de la date de début.
							</span>
						</div>
					</div>
				)}

				{/* Message pour abonnement expiré */}
				{progress.status === 'expired' && (
					<div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
						<div className="flex items-center">
							<svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
								<path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
							</svg>
							<span className="text-sm text-red-800">
								Votre abonnement a expiré.
								{showRenewalButton && ' Demandez le renouvellement pour continuer à utiliser l\'application.'}
							</span>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
