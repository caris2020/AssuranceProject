import React, { useMemo, useState, useEffect } from 'react'
import { useAuth } from '../state/AuthState'
import { SubscriptionInfo } from '../components/SubscriptionInfo'
import { subscriptionService } from '../services/subscriptionService'
import { countPendingReportRequestsForOwner, fetchMyCases, fetchCases, getUserNotifications, fetchReports } from '../services/api'

const DashboardPage: React.FC = () => {
	const { user } = useAuth()
	const [renewalMessage, setRenewalMessage] = useState<string | null>(null)
	const [pendingRequestsCount, setPendingRequestsCount] = useState<number>(0)
	const [myCasesCount, setMyCasesCount] = useState<number>(0)
	const [totalCasesCount, setTotalCasesCount] = useState<number>(0)
	const [myReportsCount, setMyReportsCount] = useState<number>(0)
	const [totalReportsCount, setTotalReportsCount] = useState<number>(0)
	const [notifications, setNotifications] = useState<any[]>([])
	
	// Charger les vraies données du backend
	useEffect(() => {
		const loadData = async () => {
			if (user?.name) {
				try {
					// Charger les cas de l'utilisateur
					const myCases = await fetchMyCases(user.name)
					setMyCasesCount(myCases.length)
					
					// Charger tous les cas
					const allCases = await fetchCases()
					setTotalCasesCount(allCases.length)
					
					// Charger les rapports
					const allReports = await fetchReports()
					setTotalReportsCount(allReports.length)
					
					// Compter les rapports créés par l'utilisateur
					const myReports = allReports.filter(r => r.createdBy === user.name)
					setMyReportsCount(myReports.length)
					
					// Charger les demandes en attente
					const count = await countPendingReportRequestsForOwner(user.name)
					setPendingRequestsCount(count)
					
					// Charger les notifications
					const notifs = await getUserNotifications(user.name)
					setNotifications(notifs)
				} catch (error) {
					console.error('Erreur lors du chargement des données:', error)
					setMyCasesCount(0)
					setTotalCasesCount(0)
					setMyReportsCount(0)
					setTotalReportsCount(0)
					setPendingRequestsCount(0)
					setNotifications([])
				}
			}
		}
		
		loadData()
	}, [user?.name])
	
	const counts = useMemo(() => {
		return { 
			myCases: myCasesCount,
			totalCases: totalCasesCount,
			myReports: myReportsCount,
			totalReports: totalReportsCount,
			pending: pendingRequestsCount,
			pendingTotal: pendingRequestsCount
		}
	}, [myCasesCount, totalCasesCount, myReportsCount, totalReportsCount, pendingRequestsCount])

	const handleRequestRenewal = async () => {
		if (!user?.id) return
		
		// Demander confirmation
		if (!confirm('Êtes-vous sûr de vouloir demander le renouvellement de votre abonnement ?')) {
			return
		}
		
		try {
			const result = await subscriptionService.requestRenewal(user.id)
			if (result.success) {
				setRenewalMessage('Demande de renouvellement envoyée avec succès ! L\'administrateur sera notifié.')
				// Recharger les données utilisateur après la demande
				setTimeout(() => {
					window.location.reload()
				}, 2000)
			} else {
				setRenewalMessage('Erreur lors de la demande de renouvellement')
			}
		} catch (error) {
			setRenewalMessage('Erreur lors de la demande de renouvellement')
		}
	}
	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 py-8">
			{/* En-tête */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tableau de Bord</h1>
				<p className="mt-2 text-gray-600 dark:text-gray-400">
					Vue d'ensemble de vos activités
				</p>
			</div>

			{/* En-tête avec synthèse */}
			<div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 rounded-lg p-6 mb-6">
				<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
					📊 Synthèse de vos activités
				</h2>
				<p className="text-gray-600 dark:text-gray-300">
					Vue d'ensemble de vos dossiers et demandes d'accès
				</p>
			</div>

			{/* Statistiques générales */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
				<StatCard title="Mes Dossiers" value={counts.myCases} icon="📁" color="blue" />
				<StatCard title="Total Dossiers" value={counts.totalCases} icon="📋" color="green" />
				<StatCard title="Mes Rapports" value={counts.myReports} icon="📄" color="purple" />
			</div>
			
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
				<StatCard title="Total Rapports" value={counts.totalReports} icon="📊" color="indigo" />
				<StatCard title="Demandes de rapports en Attente" value={counts.pending} icon="⏳" color="yellow" />
				<StatCard title="Total demandes de rapports" value={counts.pendingTotal} icon="🔐" color="orange" />
			</div>
			
			{/* Informations d'abonnement */}
			{user && (
				<div className="mt-6">
					{user.role === 'admin' ? (
						<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
							<h3 className="text-lg font-semibold text-gray-900 mb-4">
								👑 Abonnement Administrateur
							</h3>
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<span className="text-sm font-medium text-gray-700">Statut :</span>
									<span className="px-3 py-1 rounded-full text-xs font-medium border text-blue-600 bg-blue-50 border-blue-200">
										Abonnement Permanent
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm font-medium text-gray-700">Type :</span>
									<span className="text-sm text-gray-900">Administrateur</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm font-medium text-gray-700">Expiration :</span>
									<span className="text-sm text-green-600 font-semibold">Jamais</span>
								</div>
								<div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
									<div className="flex items-center">
										<svg className="h-5 w-5 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
											<path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
										</svg>
										<span className="text-sm text-blue-800">
											En tant qu'administrateur, vous avez un abonnement permanent qui ne nécessite pas de renouvellement.
										</span>
									</div>
								</div>
							</div>
						</div>
					) : user.subscriptionStartDate && user.subscriptionEndDate ? (
						<>
							<SubscriptionInfo
								subscriptionStartDate={user.subscriptionStartDate}
								subscriptionEndDate={user.subscriptionEndDate}
								subscriptionActive={user.subscriptionActive || false}
								subscriptionStatus={user.subscriptionStatus || 'ACTIVE'}
								daysUntilExpiration={user.daysUntilExpiration || 0}
								showRenewalButton={user.role !== 'admin'}
								onRequestRenewal={handleRequestRenewal}
							/>
							
							{/* Message de renouvellement */}
							{renewalMessage && (
								<div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
									<div className="flex items-center">
										<svg className="h-5 w-5 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
											<path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
										</svg>
										<span className="text-sm text-blue-800">{renewalMessage}</span>
									</div>
								</div>
							)}
						</>
					) : (
						<div className="bg-white rounded-lg border border-gray-200 p-6">
							<h3 className="text-lg font-semibold text-gray-900 mb-4">
								📅 Informations d'Abonnement
							</h3>
							<div className="text-sm text-gray-600">
								Les informations d'abonnement ne sont pas encore disponibles.
							</div>
						</div>
					)}
				</div>
			)}
			
			{/* Dernières notifications */}
			<div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
				<h3 className="text-lg font-semibold mb-4 flex items-center">
					🔔 Dernières notifications
				</h3>
				<div className="space-y-3">
					{notifications.length > 0 ? (
						notifications.slice(0, 5).map(n => (
							<div key={n.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
								<span className="text-sm text-gray-900 dark:text-white">{n.title}</span>
								<span className="text-xs text-gray-500 dark:text-gray-400">{new Date(n.createdAt).toLocaleString()}</span>
							</div>
						))
					) : (
						<p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Aucune notification</p>
					)}
				</div>
			</div>
		</div>
	)
}

// Composant pour les cartes de statistiques
const StatCard: React.FC<{ title: string; value: number; icon: string; color: string }> = ({ title, value, icon, color }) => {
	const colorClasses = {
		blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
		green: 'bg-green-50 text-green-600 dark:bg-green-900 dark:text-green-400',
		yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400',
		purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900 dark:text-purple-400'
	}

	return (
		<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
			<div className="flex items-center">
				<div className={`flex-shrink-0 p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
					<span className="text-2xl">{icon}</span>
				</div>
				<div className="ml-4">
					<p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
					<p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
				</div>
			</div>
		</div>
	)
}

export default DashboardPage


