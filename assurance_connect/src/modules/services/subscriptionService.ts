const API_BASE_URL = 'http://localhost:8080/api'

export interface SubscriptionStatus {
	isActive: boolean
	daysUntilExpiration: number
}

export interface SubscriptionStats {
	expiredCount: number
	pendingRenewalCount: number
	expiringSoonCount: number
}

export interface RenewalRequest {
	id: number
	userId: number
	username: string
	userEmail: string
	insuranceCompany: string
	requestDate: string
	status: 'PENDING' | 'APPROVED' | 'REJECTED'
	subscriptionEndDate: string
	daysUntilExpiration: number
}

export const subscriptionService = {
	/**
	 * Vérifie le statut d'abonnement d'un utilisateur
	 */
	async checkSubscriptionStatus(userId: number): Promise<SubscriptionStatus> {
		const response = await fetch(`${API_BASE_URL}/subscriptions/check/${userId}`)
		if (!response.ok) {
			throw new Error('Erreur lors de la vérification du statut d\'abonnement')
		}
		return response.json()
	},

	/**
	 * Demande de renouvellement d'abonnement
	 */
	async requestRenewal(userId: number): Promise<{ success: boolean; message: string }> {
		const response = await fetch(`${API_BASE_URL}/subscriptions/request-renewal/${userId}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			}
		})
		
		if (!response.ok) {
			throw new Error('Erreur lors de la demande de renouvellement')
		}
		
		return response.json()
	},

	/**
	 * Renouvelle l'abonnement d'un utilisateur (admin seulement)
	 */
	async renewSubscription(userId: number): Promise<{ success: boolean; message: string }> {
		const response = await fetch(`${API_BASE_URL}/subscriptions/renew/${userId}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			}
		})
		
		if (!response.ok) {
			throw new Error('Erreur lors du renouvellement de l\'abonnement')
		}
		
		return response.json()
	},

	/**
	 * Obtient les demandes de renouvellement en attente (admin seulement)
	 */
	async getPendingRenewalRequests(): Promise<RenewalRequest[]> {
		const response = await fetch(`${API_BASE_URL}/subscriptions/renewal-requests/pending`)
		if (!response.ok) {
			throw new Error('Erreur lors de la récupération des demandes de renouvellement')
		}
		return response.json()
	},

	/**
	 * Approuve une demande de renouvellement (admin seulement)
	 */
	async approveRenewalRequest(requestId: number): Promise<{ success: boolean; message: string }> {
		const response = await fetch(`${API_BASE_URL}/subscriptions/renewal-requests/${requestId}/approve`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			}
		})
		
		if (!response.ok) {
			throw new Error('Erreur lors de l\'approbation de la demande')
		}
		
		return response.json()
	},

	/**
	 * Rejette une demande de renouvellement (admin seulement)
	 */
	async rejectRenewalRequest(requestId: number): Promise<{ success: boolean; message: string }> {
		const response = await fetch(`${API_BASE_URL}/subscriptions/renewal-requests/${requestId}/reject`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			}
		})
		
		if (!response.ok) {
			throw new Error('Erreur lors du rejet de la demande')
		}
		
		return response.json()
	},

	/**
	 * Obtient les utilisateurs avec des abonnements expirés
	 */
	async getExpiredSubscriptions(): Promise<any[]> {
		const response = await fetch(`${API_BASE_URL}/subscriptions/expired`)
		if (!response.ok) {
			throw new Error('Erreur lors de la récupération des abonnements expirés')
		}
		return response.json()
	},

	/**
	 * Obtient les utilisateurs en attente de renouvellement
	 */
	async getPendingRenewalSubscriptions(): Promise<any[]> {
		const response = await fetch(`${API_BASE_URL}/subscriptions/pending-renewal`)
		if (!response.ok) {
			throw new Error('Erreur lors de la récupération des demandes de renouvellement')
		}
		return response.json()
	},

	/**
	 * Obtient les utilisateurs avec des abonnements expirant bientôt
	 */
	async getSubscriptionsExpiringSoon(): Promise<any[]> {
		const response = await fetch(`${API_BASE_URL}/subscriptions/expiring-soon`)
		if (!response.ok) {
			throw new Error('Erreur lors de la récupération des abonnements expirant bientôt')
		}
		return response.json()
	},

	/**
	 * Obtient les statistiques des abonnements
	 */
	async getSubscriptionStats(): Promise<SubscriptionStats> {
		const response = await fetch(`${API_BASE_URL}/subscriptions/stats`)
		if (!response.ok) {
			throw new Error('Erreur lors de la récupération des statistiques')
		}
		return response.json()
	}
}
