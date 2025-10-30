import React, { useEffect, useState } from 'react'
import { useAuth } from '../state/AuthState'
import { subscriptionService, RenewalRequest } from '../services/subscriptionService'

interface SubscriptionManagementProps {
	onRenewSubscription: (userId: number) => void
}

export const SubscriptionManagement: React.FC<SubscriptionManagementProps> = ({ onRenewSubscription }) => {
	const { user } = useAuth()
	const [activeFilter, setActiveFilter] = useState<'expired' | 'pending' | 'expiring' | 'active'>('expired')
	const [renewalRequests, setRenewalRequests] = useState<RenewalRequest[]>([])
	const [loading, setLoading] = useState(true)
	const [loadingUsers, setLoadingUsers] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [stats, setStats] = useState<any>(null)
	const [users, setUsers] = useState<any[]>([])

	// États pour les modales
	const [approveModalOpen, setApproveModalOpen] = useState(false)
	const [rejectModalOpen, setRejectModalOpen] = useState(false)
	const [selectedRequest, setSelectedRequest] = useState<RenewalRequest | null>(null)
	const [rejectionReason, setRejectionReason] = useState('')

	useEffect(() => {
		loadData()
		loadUsersByFilter(activeFilter)
	}, [])

	useEffect(() => {
		loadUsersByFilter(activeFilter)
	}, [activeFilter])

	const loadData = async () => {
		try {
			setLoading(true)
			const [requests, subscriptionStats] = await Promise.all([
				subscriptionService.getPendingRenewalRequests(),
				subscriptionService.getSubscriptionStats()
			])
			setRenewalRequests(requests)
			setStats(subscriptionStats)
		} catch (error) {
			setError('Erreur lors du chargement des données')
			console.error('Erreur:', error)
		} finally {
			setLoading(false)
		}
	}

	const loadUsersByFilter = async (filter: string) => {
		try {
			setLoadingUsers(true)
			let endpoint = ''
			switch (filter) {
				case 'expired':
					endpoint = '/api/subscriptions/expired'
					break
				case 'pending':
					endpoint = '/api/subscriptions/pending-renewal'
					break
				case 'expiring':
					endpoint = '/api/subscriptions/expiring-soon'
					break
				case 'active':
					endpoint = '/api/subscriptions/active'
					break
				default:
					endpoint = '/api/subscriptions/expired'
			}
			
			const response = await fetch(`http://localhost:8080${endpoint}`)
			if (response.ok) {
				const data = await response.json()
				setUsers(data)
			} else {
				console.error('Erreur lors du chargement des utilisateurs')
				setUsers([])
			}
		} catch (error) {
			console.error('Erreur lors du chargement des utilisateurs:', error)
			setUsers([])
		} finally {
			setLoadingUsers(false)
		}
	}

	const handleApprove = async (request: RenewalRequest) => {
		if (!user?.id) return

		try {
			const result = await subscriptionService.approveRenewalRequest(request.id)
			if (result.success) {
				alert('Demande approuvée avec succès')
				loadData() // Recharger les données
			} else {
				alert('Erreur lors de l\'approbation')
			}
		} catch (error) {
			alert('Erreur lors de l\'approbation')
			console.error('Erreur:', error)
		}
		setApproveModalOpen(false)
		setSelectedRequest(null)
	}

	const handleReject = async (request: RenewalRequest) => {
		if (!user?.id) return

		try {
			const result = await subscriptionService.rejectRenewalRequest(request.id)
			if (result.success) {
				alert('Demande rejetée')
				loadData() // Recharger les données
			} else {
				alert('Erreur lors du rejet')
			}
		} catch (error) {
			alert('Erreur lors du rejet')
			console.error('Erreur:', error)
		}
		setRejectModalOpen(false)
		setSelectedRequest(null)
		setRejectionReason('')
	}

	const openApproveModal = (request: RenewalRequest) => {
		setSelectedRequest(request)
		setApproveModalOpen(true)
	}

	const openRejectModal = (request: RenewalRequest) => {
		setSelectedRequest(request)
		setRejectModalOpen(true)
	}

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('fr-FR', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		})
	}

	// Fonction pour calculer correctement les jours restants
	const calculateDaysRemaining = (endDate: string) => {
		const end = new Date(endDate)
		// Utiliser la date actuelle réelle
		const now = new Date()
		
		const diffTime = end.getTime() - now.getTime()
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
		
		return diffDays > 0 ? diffDays : 0
	}

	const getFilteredUsers = () => {
		return users
	}

	if (loading) {
		return (
			<div className="space-y-6">
				<div className="text-center py-12">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
					<p className="mt-4 text-gray-600">Chargement des données d'abonnement...</p>
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className="space-y-6">
				<div className="bg-red-50 border border-red-200 rounded-md p-4">
					<div className="flex">
						<div className="flex-shrink-0">
							<svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
								<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
							</svg>
						</div>
						<div className="ml-3">
							<h3 className="text-sm font-medium text-red-800">Erreur</h3>
							<div className="mt-2 text-sm text-red-700">
								<p>{error}</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="space-y-6">
			<div className="mb-8">
				<h2 className="text-xl font-semibold text-gray-900">Gestion des Abonnements</h2>
				<p className="mt-2 text-gray-600">Gérez les demandes de renouvellement d'abonnement</p>
			</div>

			{/* Statistiques */}
			{stats && (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
					<div className="bg-white rounded-lg border border-gray-200 p-6">
						<div className="text-sm font-medium text-gray-500">Demandes en attente</div>
						<div className="mt-2 text-3xl font-bold text-blue-600">{stats.pendingRequestsCount || 0}</div>
					</div>
					<div className="bg-white rounded-lg border border-gray-200 p-6">
						<div className="text-sm font-medium text-gray-500">Abonnements expirés</div>
						<div className="mt-2 text-3xl font-bold text-red-600">{stats.expiredCount || 0}</div>
					</div>
					<div className="bg-white rounded-lg border border-gray-200 p-6">
						<div className="text-sm font-medium text-gray-500">Expirant bientôt</div>
						<div className="mt-2 text-3xl font-bold text-yellow-600">{stats.expiringSoonCount || 0}</div>
					</div>
					<div className="bg-white rounded-lg border border-gray-200 p-6">
						<div className="text-sm font-medium text-gray-500">En attente de renouvellement</div>
						<div className="mt-2 text-3xl font-bold text-orange-600">{stats.pendingRenewalCount || 0}</div>
					</div>
				</div>
			)}

			{/* Filtres d'abonnement */}
			<div className="bg-white rounded-lg border border-gray-200">
				<div className="px-6 py-4 border-b border-gray-200">
					<h3 className="text-lg font-semibold text-gray-900">
						{activeFilter === 'expired' && 'Utilisateurs avec des abonnements expirés'}
						{activeFilter === 'pending' && 'Utilisateurs en attente de renouvellement'}
						{activeFilter === 'expiring' && 'Utilisateurs avec des abonnements expirant bientôt'}
						{activeFilter === 'active' && 'Utilisateurs avec des abonnements actifs'}
					</h3>
				</div>
				
				<div className="px-6 py-4 border-b border-gray-200">
					<div className="flex space-x-4">
						{[
							{ id: 'expired', label: 'Expirés', color: 'text-red-600' },
							{ id: 'pending', label: 'En attente', color: 'text-yellow-600' },
							{ id: 'expiring', label: 'Expiration proche', color: 'text-orange-600' },
							{ id: 'active', label: 'Actifs', color: 'text-green-600' }
						].map(filter => (
							<button
								key={filter.id}
								onClick={() => setActiveFilter(filter.id as any)}
								className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
									activeFilter === filter.id
										? 'bg-blue-100 text-blue-700 border-b-2 border-blue-500'
										: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
								}`}
							>
								{filter.label}
							</button>
						))}
					</div>
				</div>

				{/* Contenu selon le filtre */}
				<div className="p-6">
					{loadingUsers ? (
						<div className="text-center py-12">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
							<p className="mt-4 text-gray-600">Chargement des utilisateurs...</p>
						</div>
					) : getFilteredUsers().length === 0 ? (
						<div className="text-center py-12">
							<svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
							</svg>
							<h3 className="mt-2 text-sm font-medium text-gray-900">Aucun utilisateur trouvé</h3>
							<p className="mt-1 text-sm text-gray-500">
								{activeFilter === 'expired' && 'Aucun utilisateur avec un abonnement expiré.'}
								{activeFilter === 'pending' && 'Aucun utilisateur en attente de renouvellement.'}
								{activeFilter === 'expiring' && 'Aucun utilisateur avec un abonnement expirant bientôt.'}
								{activeFilter === 'active' && 'Aucun utilisateur avec un abonnement actif.'}
							</p>
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="bg-gray-50">
									<tr>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Utilisateur
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Société
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Statut
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Expiration
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Actions
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{getFilteredUsers().map((user: any) => (
										<tr key={user.id}>
											<td className="px-6 py-4 whitespace-nowrap">
												<div>
													<div className="text-sm font-medium text-gray-900">{user.username}</div>
													<div className="text-sm text-gray-500">{user.email}</div>
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
												{user.insuranceCompany}
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
													user.subscriptionStatus === 'ACTIVE' ? 'bg-green-100 text-green-800' :
													user.subscriptionStatus === 'EXPIRED' ? 'bg-red-100 text-red-800' :
													user.subscriptionStatus === 'PENDING_RENEWAL' ? 'bg-yellow-100 text-yellow-800' :
													'bg-gray-100 text-gray-800'
												}`}>
													{user.subscriptionStatus}
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div>
													<div className="text-sm text-gray-900">
														{user.subscriptionEndDate ? new Date(user.subscriptionEndDate).toLocaleDateString('fr-FR') : 'N/A'}
													</div>
													{user.subscriptionEndDate && (
														<div className="text-sm text-gray-500">
															{user.role === 'ADMIN' ? (
																'Abonnement permanent'
															) : (
																(() => {
																	const daysRemaining = calculateDaysRemaining(user.subscriptionEndDate)
																	return daysRemaining > 0 ? `${daysRemaining} jours restants` : 'Expiré'
																})()
															)}
														</div>
													)}
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
												{user.role !== 'ADMIN' && (
													<button
														onClick={() => onRenewSubscription(user.id)}
														className="bg-blue-600 text-white px-3 py-1 rounded-md text-xs hover:bg-blue-700 transition-colors"
													>
														Renouveler
													</button>
												)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>
			</div>

			{/* Demandes de renouvellement en attente */}
			<div className="bg-white rounded-lg border border-gray-200">
				<div className="px-6 py-4 border-b border-gray-200">
					<h3 className="text-lg font-semibold text-gray-900">Demandes de Renouvellement en Attente</h3>
				</div>

				{renewalRequests.length === 0 ? (
					<div className="px-6 py-12 text-center">
						<svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
						</svg>
						<h3 className="mt-2 text-sm font-medium text-gray-900">Aucune demande en attente</h3>
						<p className="mt-1 text-sm text-gray-500">Toutes les demandes de renouvellement ont été traitées.</p>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Utilisateur
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Société
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Date de demande
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Expiration
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{renewalRequests.map((request) => (
									<tr key={request.id}>
										<td className="px-6 py-4 whitespace-nowrap">
											<div>
												<div className="text-sm font-medium text-gray-900">{request.username}</div>
												<div className="text-sm text-gray-500">{request.userEmail}</div>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											{request.insuranceCompany}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											{formatDate(request.requestDate)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div>
												<div className="text-sm text-gray-900">
													{new Date(request.subscriptionEndDate).toLocaleDateString('fr-FR')}
												</div>
												<div className="text-sm text-gray-500">
													{(() => {
														const daysRemaining = calculateDaysRemaining(request.subscriptionEndDate)
														return daysRemaining > 0 ? `${daysRemaining} jours restants` : 'Expiré'
													})()}
												</div>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
											<div className="flex space-x-2">
												<button
													onClick={() => openApproveModal(request)}
													className="bg-green-600 text-white px-3 py-1 rounded-md text-xs hover:bg-green-700 transition-colors"
												>
													Approuver
												</button>
												<button
													onClick={() => openRejectModal(request)}
													className="bg-red-600 text-white px-3 py-1 rounded-md text-xs hover:bg-red-700 transition-colors"
												>
													Rejeter
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>

			{/* Modal d'approbation */}
			{approveModalOpen && selectedRequest && (
				<div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
					<div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
						<div className="mt-3 text-center">
							<h3 className="text-lg font-medium text-gray-900 mb-4">Approuver la demande</h3>
							<p className="text-sm text-gray-500 mb-6">
								Êtes-vous sûr de vouloir approuver la demande de renouvellement pour{' '}
								<strong>{selectedRequest.username}</strong> ?
							</p>
							<div className="flex justify-center space-x-4">
								<button
									onClick={() => handleApprove(selectedRequest)}
									className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
								>
									Approuver
								</button>
								<button
									onClick={() => setApproveModalOpen(false)}
									className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
								>
									Annuler
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Modal de rejet */}
			{rejectModalOpen && selectedRequest && (
				<div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
					<div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
						<div className="mt-3">
							<h3 className="text-lg font-medium text-gray-900 mb-4">Rejeter la demande</h3>
							<p className="text-sm text-gray-500 mb-4">
								Rejeter la demande de renouvellement pour <strong>{selectedRequest.username}</strong>
							</p>
							<div className="mb-4">
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Raison du rejet (optionnel)
								</label>
								<textarea
									value={rejectionReason}
									onChange={(e) => setRejectionReason(e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
									rows={3}
									placeholder="Raison du rejet..."
								/>
							</div>
							<div className="flex justify-center space-x-4">
								<button
									onClick={() => handleReject(selectedRequest)}
									className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
								>
									Rejeter
								</button>
								<button
									onClick={() => setRejectModalOpen(false)}
									className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
								>
									Annuler
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
