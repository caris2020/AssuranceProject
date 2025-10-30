import React, { useState, useEffect } from 'react'
import { useAuth } from '../state/AuthState'
import { Button } from '../../ui'
import { 
    getAdminDashboard, 
    createInvitation, 
    getAllInvitations, 
    getAllUsers,
    getAccessRequestsForOwner,
    getReportsByCompany,
    getCasesByStatus,
    getCasesByCompany,
    getUsersByCompany,
    cancelInvitation,
    activateUser,
    deactivateUser,
    toggleUserStatus,
    getReportStats,
    getCaseStats,
    softDeleteUser
} from '../services/api'
import { SubscriptionManagement } from '../components/SubscriptionManagement'

// Types pour le tableau de bord
type DashboardData = {
    totalUsers: number
    totalReports: number
    totalCases: number
    totalAccessRequests: number
    pendingAccessRequests: number
    totalInvitations: number
    pendingInvitations: number
    recentUsers: UserData[]
    recentReports: ReportData[]
    recentAccessRequests: AccessRequestData[]
    recentInvitations: InvitationData[]
    reportsByCompany: Record<string, number>
    casesByStatus: Record<string, number>
    casesByCompany: Record<string, number>
    usersByCompany: Record<string, number>
    onlineUsers: UserData[]
    recentlyLoggedIn: UserData[]
    recentlyLoggedOut: UserData[]
}

type UserData = {
    id: number
    username: string
    firstName: string
    lastName: string
    email: string
    insuranceCompany: string
    status: string
    role: string
    lastLoginAt?: string
    lastLogoutAt?: string
    isActive: boolean
    // Informations d'abonnement
    subscriptionStartDate?: string
    subscriptionEndDate?: string
    subscriptionActive?: boolean
    subscriptionStatus?: string
    daysUntilExpiration?: number
    lastRenewalRequestDate?: string
}

type ReportData = {
    id: number
    title: string
    createdBy: string
    createdAt: string
}

type AccessRequestData = {
    id: number
    reportTitle: string
    requesterName: string
    status: string
    requestedAt: string
}

type InvitationData = {
    id: number
    email: string
    insuranceCompany: string
    status: string
    createdAt: string
    expiresAt: string
}

const AdminPage: React.FC = () => {
    const { user } = useAuth()
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'dashboard' | 'invitations' | 'users' | 'reports' | 'cases' | 'subscriptions'>('dashboard')
    
    // États pour les invitations
    const [invitations, setInvitations] = useState<InvitationData[]>([])
    const [showInviteModal, setShowInviteModal] = useState(false)
    const [inviteEmail, setInviteEmail] = useState('')
    const [inviteCompany, setInviteCompany] = useState('')
    const [inviting, setInviting] = useState(false)
    
    // États pour les utilisateurs
    const [users, setUsers] = useState<UserData[]>([])
    
    // Charger les données du tableau de bord
    useEffect(() => {
        loadDashboardData()
    }, [])
    
    const loadDashboardData = async () => {
        try {
            setLoading(true)
            const data = await getAdminDashboard()
            setDashboardData(data)
        } catch (error) {
            console.error('Erreur lors du chargement du tableau de bord:', error)
        } finally {
            setLoading(false)
        }
    }
    
    // Charger les invitations
    const loadInvitations = async () => {
        try {
            const data = await getAllInvitations()
            setInvitations(data)
        } catch (error) {
            console.error('Erreur lors du chargement des invitations:', error)
        }
    }
    
    // Charger les utilisateurs
    const loadUsers = async () => {
        try {
            const data = await getAllUsers()
            setUsers(data)
        } catch (error) {
            console.error('Erreur lors du chargement des utilisateurs:', error)
        }
    }
    
    // Envoyer une invitation
    const handleSendInvitation = async () => {
        if (!inviteEmail || !inviteCompany) {
            alert('Veuillez remplir tous les champs')
            return
        }
        
        try {
            setInviting(true)
            await createInvitation(inviteEmail, inviteCompany, user?.name || 'admin')
            setInviteEmail('')
            setInviteCompany('')
            setShowInviteModal(false)
            loadInvitations()
            loadDashboardData() // Recharger les stats
            alert('Invitation envoyée avec succès!')
        } catch (error) {
            console.error('Erreur lors de l\'envoi de l\'invitation:', error)
            alert('Erreur lors de l\'envoi de l\'invitation')
        } finally {
            setInviting(false)
        }
    }
    
    // Supprimer une invitation
    const handleCancelInvitation = async (invitationId: number) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette invitation ?')) {
            return
        }
        
        try {
            await cancelInvitation(invitationId)
            loadInvitations()
            loadDashboardData() // Recharger les stats
            alert('Invitation supprimée avec succès!')
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'invitation:', error)
            alert('Erreur lors de la suppression de l\'invitation')
        }
    }
    
    // Activer un utilisateur
    const handleActivateUser = async (userId: number) => {
        if (!confirm('Êtes-vous sûr de vouloir activer cet utilisateur ?')) {
            return
        }
        
        try {
            await activateUser(userId)
            loadUsers()
            loadDashboardData() // Recharger les stats
            alert('Utilisateur activé avec succès!')
        } catch (error) {
            console.error('Erreur lors de l\'activation de l\'utilisateur:', error)
            alert('Erreur lors de l\'activation de l\'utilisateur')
        }
    }
    
    // Désactiver un utilisateur
    const handleDeactivateUser = async (userId: number) => {
        if (!confirm('Êtes-vous sûr de vouloir désactiver cet utilisateur ?')) {
            return
        }
        
        try {
            await deactivateUser(userId)
            loadUsers()
            loadDashboardData() // Recharger les stats
            alert('Utilisateur désactivé avec succès!')
        } catch (error) {
            console.error('Erreur lors de la désactivation de l\'utilisateur:', error)
            alert('Erreur lors de la désactivation de l\'utilisateur')
        }
    }
    
    // Basculer le statut d'un utilisateur
    const handleToggleUserStatus = async (userId: number) => {
        try {
            await toggleUserStatus(userId)
            loadUsers()
            loadDashboardData() // Recharger les stats
            alert('Statut de l\'utilisateur modifié avec succès!')
        } catch (error) {
            console.error('Erreur lors de la modification du statut:', error)
            alert('Erreur lors de la modification du statut: ' + error)
        }
    }

    // Renouveler l'abonnement d'un utilisateur
    const handleRenewSubscription = async (userId: number) => {
        try {
            const response = await fetch(`http://localhost:8080/api/subscriptions/renew/${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            
            if (response.ok) {
                const result = await response.json()
                if (result.success) {
                    alert('Abonnement renouvelé avec succès!')
                    loadDashboardData() // Recharger les stats
                } else {
                    alert('Erreur lors du renouvellement: ' + result.message)
                }
            } else {
                alert('Erreur lors du renouvellement de l\'abonnement')
            }
        } catch (error) {
            console.error('Erreur lors du renouvellement:', error)
            alert('Erreur lors du renouvellement de l\'abonnement')
        }
    }
    
    // Charger les données selon l'onglet actif
    useEffect(() => {
        if (activeTab === 'invitations') {
            loadInvitations()
        } else if (activeTab === 'users') {
            loadUsers()
        }
    }, [activeTab])
    
    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center">Chargement du tableau de bord...</div>
            </div>
        )
    }
    
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* En-tête */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tableau de Bord Administrateur</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Gestion complète de la plateforme d'assurance
                </p>
            </div>
            
            {/* Onglets */}
            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <nav className="-mb-px flex space-x-8">
                    {[
                        { id: 'dashboard', label: 'Tableau de Bord', icon: '📊' },
                        { id: 'invitations', label: 'Invitations', icon: '📧' },
                        { id: 'users', label: 'Utilisateurs', icon: '👥' },
                        { id: 'reports', label: 'Rapports', icon: '📋' },
                        { id: 'cases', label: 'Dossiers', icon: '📁' },
                        { id: 'subscriptions', label: 'Abonnements', icon: '📅' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            
            {/* Contenu des onglets */}
            {activeTab === 'dashboard' && (
                <DashboardTab data={dashboardData || {
                    totalUsers: 0,
                    totalReports: 0,
                    totalCases: 0,
                    totalAccessRequests: 0,
                    pendingAccessRequests: 0,
                    totalInvitations: 0,
                    pendingInvitations: 0,
                    recentUsers: [],
                    recentReports: [],
                    recentAccessRequests: [],
                    recentInvitations: [],
                    reportsByCompany: {},
                    casesByStatus: {},
                    casesByCompany: {},
                    usersByCompany: {},
                    onlineUsers: [],
                    recentlyLoggedIn: [],
                    recentlyLoggedOut: []
                }} />
            )}
            
            {activeTab === 'invitations' && (
                <InvitationsTab 
                    invitations={invitations}
                    showModal={showInviteModal}
                    setShowModal={setShowInviteModal}
                    inviteEmail={inviteEmail}
                    setInviteEmail={setInviteEmail}
                    inviteCompany={inviteCompany}
                    setInviteCompany={setInviteCompany}
                    onSendInvitation={handleSendInvitation}
                    onCancelInvitation={handleCancelInvitation}
                    inviting={inviting}
                />
            )}
            
            {activeTab === 'users' && (
                <UsersTab 
                    users={users}
                    onActivateUser={handleActivateUser}
                    onDeactivateUser={handleDeactivateUser}
                    onToggleUserStatus={handleToggleUserStatus}
                    onSoftDeleteUser={async (userId: number) => {
                        if (!confirm('Supprimer cet utilisateur ? Il n\'aura plus accès.')) return
                        try {
                            const ok = await softDeleteUser(userId)
                            if (ok) {
                                loadUsers()
                                loadDashboardData()
                                alert('Utilisateur supprimé (accès révoqué). Vous pouvez renvoyer une invitation plus tard.')
                            } else {
                                alert('Suppression impossible')
                            }
                        } catch (e) {
                            alert('Erreur lors de la suppression')
                        }
                    }}
                    currentUserId={user?.id}
                />
            )}
            
            {activeTab === 'reports' && (
                <ReportsTab data={dashboardData || {
                    totalUsers: 0,
                    totalReports: 0,
                    totalCases: 0,
                    totalAccessRequests: 0,
                    pendingAccessRequests: 0,
                    totalInvitations: 0,
                    pendingInvitations: 0,
                    recentUsers: [],
                    recentReports: [],
                    recentAccessRequests: [],
                    recentInvitations: [],
                    reportsByCompany: {},
                    casesByStatus: {},
                    casesByCompany: {},
                    usersByCompany: {},
                    onlineUsers: [],
                    recentlyLoggedIn: [],
                    recentlyLoggedOut: []
                }} />
            )}
            
            {activeTab === 'cases' && (
                <CasesTab data={dashboardData || {
                    totalUsers: 0,
                    totalReports: 0,
                    totalCases: 0,
                    totalAccessRequests: 0,
                    pendingAccessRequests: 0,
                    totalInvitations: 0,
                    pendingInvitations: 0,
                    recentUsers: [],
                    recentReports: [],
                    recentAccessRequests: [],
                    recentInvitations: [],
                    reportsByCompany: {},
                    casesByStatus: {},
                    casesByCompany: {},
                    usersByCompany: {},
                    onlineUsers: [],
                    recentlyLoggedIn: [],
                    recentlyLoggedOut: []
                }} />
            )}
            
            {activeTab === 'subscriptions' && (
                <SubscriptionManagement onRenewSubscription={handleRenewSubscription} />
            )}
        </div>
    )
}

// Composant pour l'onglet Tableau de Bord
const DashboardTab: React.FC<{ data: DashboardData }> = ({ data }) => {
    const [subscriptionStats, setSubscriptionStats] = useState<{
        expiredCount: number
        pendingRenewalCount: number
        expiringSoonCount: number
    } | null>(null)
    
    const [reportStats, setReportStats] = useState<{
        totalCreated: number
        totalModified: number
        totalDeleted: number
        totalRequests: number
        companiesWithReports: Array<{ company: string; count: number }>
        companiesWithRequests: Array<{ company: string; count: number }>
    } | null>(null)
    
    const [caseStats, setCaseStats] = useState<{
        totalCreated: number
        totalModified: number
        totalDeleted: number
        totalDownloads: number
        casesByCompany: Array<{ company: string; count: number }>
        modifiedByCompany: Array<{ company: string; count: number }>
    } | null>(null)

    useEffect(() => {
        const loadAllStats = async () => {
            try {
                // Charger les statistiques d'abonnement
                const subscriptionResponse = await fetch('http://localhost:8080/api/subscriptions/stats')
                if (subscriptionResponse.ok) {
                    const subscriptionData = await subscriptionResponse.json()
                    setSubscriptionStats(subscriptionData)
                }
                
                // Charger les statistiques des rapports
                const reportResponse = await fetch('http://localhost:8080/api/report-stats')
                if (reportResponse.ok) {
                    const reportData = await reportResponse.json()
                    setReportStats(reportData)
                }
                
                // Charger les statistiques des dossiers
                const caseResponse = await fetch('http://localhost:8080/api/case-stats')
                if (caseResponse.ok) {
                    const caseData = await caseResponse.json()
                    setCaseStats(caseData)
                }
            } catch (error) {
                console.error('Erreur lors du chargement des statistiques:', error)
            }
        }
        
        loadAllStats()
    }, [])

    return (
    <div className="space-y-6">
        {/* En-tête avec synthèse */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                📊 Synthèse complète de la plateforme
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
                Vue d'ensemble des statistiques de tous les modules
            </p>
        </div>

        {/* Statistiques générales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Utilisateurs" value={data.totalUsers || 0} icon="👥" />
            <StatCard title="Rapports" value={reportStats?.totalCreated || data.totalReports || 0} icon="📋" />
            <StatCard title="Dossiers" value={caseStats?.totalCreated || data.totalCases || 0} icon="📁" />
            <StatCard title="Demandes d'accès" value={reportStats?.totalRequests || data.totalAccessRequests || 0} icon="🔐" />
        </div>
        
        {/* Statistiques détaillées par module */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Module Rapports */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                    📋 Module Rapports
                </h3>
                {reportStats ? (
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Créés</span>
                            <span className="font-semibold text-blue-600">{reportStats.totalCreated}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Modifiés</span>
                            <span className="font-semibold text-yellow-600">{reportStats.totalModified}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Supprimés</span>
                            <span className="font-semibold text-red-600">{reportStats.totalDeleted}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Demandes</span>
                            <span className="font-semibold text-green-600">{reportStats.totalRequests}</span>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm">Chargement...</p>
                )}
            </div>

            {/* Module Dossiers */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                    📁 Module Dossiers
                </h3>
                {caseStats ? (
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Créés</span>
                            <span className="font-semibold text-blue-600">{caseStats.totalCreated}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Modifiés</span>
                            <span className="font-semibold text-yellow-600">{caseStats.totalModified}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Supprimés</span>
                            <span className="font-semibold text-red-600">{caseStats.totalDeleted}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Téléchargements</span>
                            <span className="font-semibold text-green-600">{caseStats.totalDownloads}</span>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm">Chargement...</p>
                )}
            </div>

            {/* Module Abonnements */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                    🗓️ Module Abonnements
                </h3>
                {subscriptionStats ? (
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Expirés</span>
                            <span className="font-semibold text-red-600">{subscriptionStats.expiredCount}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">En attente</span>
                            <span className="font-semibold text-yellow-600">{subscriptionStats.pendingRenewalCount}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Expiration proche</span>
                            <span className="font-semibold text-orange-600">{subscriptionStats.expiringSoonCount}</span>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm">Chargement...</p>
                )}
            </div>
        </div>
        
        {/* Répartition par compagnie d'assurance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Répartition des rapports par compagnie */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">📋 Répartition des rapports par compagnie</h3>
                {reportStats && reportStats.companiesWithReports.length > 0 ? (
                    <div className="space-y-2">
                        {reportStats.companiesWithReports.slice(0, 5).map((item, index) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                                <span className="text-sm font-medium">{item.company}</span>
                                <span className="text-sm font-semibold text-blue-600">{item.count} rapports</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm">Aucune donnée disponible</p>
                )}
            </div>

            {/* Répartition des dossiers par compagnie */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">📁 Répartition des dossiers par compagnie</h3>
                {caseStats && caseStats.casesByCompany.length > 0 ? (
                    <div className="space-y-2">
                        {caseStats.casesByCompany.slice(0, 5).map((item, index) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                                <span className="text-sm font-medium">{item.company}</span>
                                <span className="text-sm font-semibold text-green-600">{item.count} dossiers</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm">Aucune donnée disponible</p>
                )}
            </div>
        </div>
        
        {/* Utilisateurs en ligne et récents */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Utilisateurs en ligne</h3>
                <div className="space-y-2">
                    {data.onlineUsers.length === 0 ? (
                        <p className="text-gray-500">Aucun utilisateur en ligne</p>
                    ) : (
                        data.onlineUsers.map(user => (
                            <div key={user.id} className="flex justify-between items-center">
                                <span>{user.firstName} {user.lastName}</span>
                                <span className="text-sm text-green-600">● En ligne</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Dernières connexions</h3>
                <div className="space-y-2">
                    {data.recentlyLoggedIn.slice(0, 5).map(user => (
                        <div key={user.id} className="flex justify-between items-center">
                            <span>{user.firstName} {user.lastName}</span>
                            <span className="text-sm text-gray-500">
                                {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : '—'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
        
        {/* Activité récente */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Activité récente</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <h4 className="font-medium mb-2">Nouveaux utilisateurs</h4>
                    <div className="space-y-1">
                        {data.recentUsers.slice(0, 3).map(user => (
                            <div key={user.id} className="text-sm">
                                {user.firstName} {user.lastName} - {user.insuranceCompany}
                            </div>
                        ))}
                    </div>
                </div>
                
                <div>
                    <h4 className="font-medium mb-2">Nouveaux rapports</h4>
                    <div className="space-y-1">
                        {data.recentReports.slice(0, 3).map(report => (
                            <div key={report.id} className="text-sm">
                                {report.title} - {report.createdBy}
                            </div>
                        ))}
                    </div>
                </div>
                
                <div>
                    <h4 className="font-medium mb-2">Demandes d'accès</h4>
                    <div className="space-y-1">
                        {data.recentAccessRequests.slice(0, 3).map(request => (
                            <div key={request.id} className="text-sm">
                                {request.requesterName} - {request.reportTitle}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
    )
}

// Composant pour l'onglet Invitations
const InvitationsTab: React.FC<{
    invitations: InvitationData[]
    showModal: boolean
    setShowModal: (show: boolean) => void
    inviteEmail: string
    setInviteEmail: (email: string) => void
    inviteCompany: string
    setInviteCompany: (company: string) => void
    onSendInvitation: () => void
    onCancelInvitation: (invitationId: number) => void
    inviting: boolean
}> = ({ invitations, showModal, setShowModal, inviteEmail, setInviteEmail, inviteCompany, setInviteCompany, onSendInvitation, onCancelInvitation, inviting }) => (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Gestion des invitations</h2>
            <Button onClick={() => setShowModal(true)}>Envoyer une invitation</Button>
        </div>
        
        {/* Liste des invitations */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Compagnie
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Statut
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date d'envoi
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Expire le
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {invitations.map(invitation => (
                        <tr key={invitation.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                {invitation.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {invitation.insuranceCompany}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    invitation.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                    invitation.status === 'USED' ? 'bg-green-100 text-green-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                    {invitation.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {new Date(invitation.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {new Date(invitation.expiresAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {invitation.status === 'PENDING' && (
                                    <button
                                        onClick={() => onCancelInvitation(invitation.id)}
                                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                        title="Supprimer l'invitation"
                                    >
                                        🗑️ Supprimer
                                    </button>
                                )}
                                {invitation.status === 'USED' && (
                                    <span className="text-green-600 text-xs">
                                        ✅ Utilisée
                                    </span>
                                )}
                                {invitation.status === 'EXPIRED' && (
                                    <button
                                        onClick={() => onCancelInvitation(invitation.id)}
                                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                        title="Supprimer l'invitation expirée"
                                    >
                                        🗑️ Supprimer
                                    </button>
                                )}
                                {invitation.status === 'CANCELLED' && (
                                    <span className="text-gray-500 text-xs">
                                        ❌ Annulée
                                    </span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        
        {/* Modal d'invitation */}
        {showModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
                    <div className="mt-3">
                        <h3 className="text-lg font-medium mb-4">Envoyer une invitation</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                    placeholder="email@exemple.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Compagnie d'assurance
                                </label>
                                <input
                                    type="text"
                                    value={inviteCompany}
                                    onChange={(e) => setInviteCompany(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                    placeholder="Nom de la compagnie"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3 mt-6">
                            <Button onClick={() => setShowModal(false)}>Annuler</Button>
                            <Button onClick={onSendInvitation} disabled={inviting}>
                                {inviting ? 'Envoi...' : 'Envoyer'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
)

// Composant pour l'onglet Utilisateurs
const UsersTab: React.FC<{
    users: UserData[]
    onActivateUser: (userId: number) => void
    onDeactivateUser: (userId: number) => void
    onToggleUserStatus: (userId: number) => void
    onSoftDeleteUser: (userId: number) => void
    currentUserId: number | undefined
}> = ({ users, onActivateUser, onDeactivateUser, onToggleUserStatus, onSoftDeleteUser, currentUserId }) => (
    <div className="space-y-6">
        <h2 className="text-xl font-semibold">Gestion des utilisateurs</h2>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Utilisateur
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Compagnie
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Statut
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Rôle
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Dernière connexion
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Expiration abonnement
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {users.map(user => (
                        <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {user.firstName} {user.lastName}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {user.email}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {user.insuranceCompany}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    user.status === 'REGISTERED' ? 'bg-green-100 text-green-800' :
                                    user.status === 'INVITED' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                    {user.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {user.role}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Jamais'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {user.role === 'ADMIN' ? (
                                    <div>
                                        <div className="font-medium text-blue-600">
                                            Jamais (Administrateur)
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            Abonnement permanent
                                        </div>
                                    </div>
                                ) : user.subscriptionEndDate ? (
                                    <div>
                                        <div className={`font-medium ${
                                            user.daysUntilExpiration && user.daysUntilExpiration <= 0 ? 'text-red-600' :
                                            user.daysUntilExpiration && user.daysUntilExpiration <= 30 ? 'text-yellow-600' :
                                            'text-green-600'
                                        }`}>
                                            {new Date(user.subscriptionEndDate).toLocaleDateString('fr-FR')}
                                        </div>
                                        {user.daysUntilExpiration !== undefined && (
                                            <div className="text-xs text-gray-400">
                                                {user.daysUntilExpiration > 0 ? `${user.daysUntilExpiration} jours restants` : 
                                                 user.daysUntilExpiration === 0 ? 'Expire aujourd\'hui' : 'Expiré'}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <span className="text-gray-400">Non défini</span>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {user.status === 'INVITED' && (
                                    <button
                                        onClick={() => onActivateUser(user.id)}
                                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                        title="Activer l'utilisateur"
                                    >
                                        ✅ Activer
                                    </button>
                                )}
                                {user.status === 'REGISTERED' && user.isActive && (
                                    <button
                                        onClick={() => onDeactivateUser(user.id)}
                                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                        title="Désactiver l'utilisateur"
                                        disabled={user.role === 'ADMIN' && user.id === currentUserId}
                                    >
                                        🚫 Désactiver
                                    </button>
                                )}
                                {user.status === 'REGISTERED' && !user.isActive && (
                                    <button
                                        onClick={() => onActivateUser(user.id)}
                                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                        title="Restaurer l'utilisateur (réactiver l'accès)"
                                    >
                                        ♻️ Restaurer
                                    </button>
                                )}
                                {user.role !== 'ADMIN' && (
                                    <button
                                        onClick={() => onSoftDeleteUser(user.id)}
                                        className="ml-3 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                        title="Supprimer (désactiver définitivement l'accès)"
                                    >
                                        🗑️ Supprimer
                                    </button>
                                )}
                                {user.role === 'ADMIN' && user.id === currentUserId && (
                                    <span className="text-gray-500 text-xs">
                                        🔒 Vous-même
                                    </span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
)

// Composant pour l'onglet Rapports
const ReportsTab: React.FC<{ data: DashboardData }> = ({ data }) => {
    const [reportStats, setReportStats] = useState<{
        totalCreated: number
        totalModified: number
        totalDeleted: number
        totalRequests: number
        companiesWithReports: Array<{ company: string; count: number }>
        companiesWithRequests: Array<{ company: string; count: number }>
        recentReports: Array<{
            id: number
            title: string
            createdBy: string
            createdAt: string
            company: string
        }>
        recentRequests: Array<{
            id: number
            requesterName: string
            reportTitle: string
            company: string
            requestedAt: string
        }>
    } | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const loadReportStats = async () => {
            try {
                setLoading(true)
                const stats = await getReportStats()
                setReportStats(stats)
                setError(null)
            } catch (err) {
                console.error('Erreur lors du chargement des statistiques des rapports:', err)
                setError('Erreur lors du chargement des données')
            } finally {
                setLoading(false)
            }
        }
        
        loadReportStats()
    }, [])

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Statistiques détaillées des rapports</h2>
                </div>
                <div className="text-center py-12">
                    <div className="text-gray-500">Chargement des statistiques...</div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Statistiques détaillées des rapports</h2>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-700">
                        ❌ {error}
                    </p>
                </div>
            </div>
        )
    }

    if (!reportStats) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Statistiques détaillées des rapports</h2>
                </div>
                <div className="text-center py-12">
                    <div className="text-gray-500">Aucune donnée disponible</div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Statistiques détaillées des rapports</h2>
            </div>
            
            {/* Statistiques générales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <span className="text-2xl">📄</span>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Rapports créés</p>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{reportStats.totalCreated}</p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <span className="text-2xl">✏️</span>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Rapports modifiés</p>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{reportStats.totalModified}</p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <span className="text-2xl">🗑️</span>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Rapports supprimés</p>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{reportStats.totalDeleted}</p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <span className="text-2xl">📤</span>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Demandes envoyées</p>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{reportStats.totalRequests}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Compagnies avec rapports et demandes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                 <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                     <h3 className="text-lg font-semibold mb-4">📄 Répartition par compagnie d'assurance</h3>
                     <div className="space-y-3">
                         {reportStats.companiesWithReports.length > 0 ? (
                             reportStats.companiesWithReports.map((item, index) => (
                                 <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                     <div className="flex items-center">
                                         <span className="text-sm font-medium text-gray-900 dark:text-white">{item.company}</span>
                                     </div>
                                     <div className="flex items-center">
                                         <span className="text-lg font-semibold text-blue-600">{item.count}</span>
                                         <span className="text-sm text-gray-500 ml-1">rapports</span>
                                     </div>
                                 </div>
                             ))
                         ) : (
                             <p className="text-gray-500 text-center py-4">Aucune donnée disponible</p>
                         )}
                     </div>
                 </div>
                 
                 <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                     <h3 className="text-lg font-semibold mb-4">📤 Demandes d'accès par compagnie</h3>
                     <div className="space-y-3">
                         {reportStats.companiesWithRequests.length > 0 ? (
                             reportStats.companiesWithRequests.map((item, index) => (
                                 <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                     <div className="flex items-center">
                                         <span className="text-sm font-medium text-gray-900 dark:text-white">{item.company}</span>
                                     </div>
                                     <div className="flex items-center">
                                         <span className="text-lg font-semibold text-green-600">{item.count}</span>
                                         <span className="text-sm text-gray-500 ml-1">demandes</span>
                                     </div>
                                 </div>
                             ))
                         ) : (
                             <p className="text-gray-500 text-center py-4">Aucune demande d'accès enregistrée</p>
                         )}
                     </div>
                 </div>
            </div>
            
            {/* Rapports et demandes récents */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                 <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                     <h3 className="text-lg font-semibold mb-4">📄 Derniers rapports créés</h3>
                     <div className="space-y-3">
                         {reportStats.recentReports.slice(0, 5).map(report => (
                             <div key={report.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                                 <div className="flex justify-between items-start">
                                     <div>
                                         <div className="font-medium text-gray-900 dark:text-white">{report.title}</div>
                                         <div className="text-sm text-gray-500">Par {report.createdBy}</div>
                                         <div className="text-xs text-gray-400">{report.company}</div>
                                     </div>
                                     <div className="text-xs text-gray-400">
                                         {new Date(report.createdAt).toLocaleDateString('fr-FR')}
                                     </div>
                                 </div>
                             </div>
                         ))}
                     </div>
                 </div>
                 
                 <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                     <h3 className="text-lg font-semibold mb-4">📤 Dernières demandes d'accès</h3>
                     <div className="space-y-3">
                         {reportStats.recentRequests.slice(0, 5).map(request => (
                             <div key={request.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                                 <div className="flex justify-between items-start">
                                     <div>
                                         <div className="font-medium text-gray-900 dark:text-white">{request.reportTitle}</div>
                                         <div className="text-sm text-gray-500">Demandé par {request.requesterName}</div>
                                         <div className="text-xs text-gray-400">{request.company}</div>
                                     </div>
                                     <div className="text-xs text-gray-400">
                                         {new Date(request.requestedAt).toLocaleDateString('fr-FR')}
                                     </div>
                                 </div>
                             </div>
                         ))}
                     </div>
                 </div>
            </div>
        </div>
    )
}

// Composant pour l'onglet Dossiers
const CasesTab: React.FC<{ data: DashboardData }> = ({ data }) => {
    const [caseStats, setCaseStats] = useState<{
        totalCreated: number
        totalModified: number
        totalDeleted: number
        totalDownloads: number
        casesByCompany: Array<{ company: string; count: number }>
        modifiedByCompany: Array<{ company: string; count: number }>
        deletedByCompany: Array<{ company: string; count: number }>
        downloadsByCompany: Array<{ company: string; count: number }>
    } | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const loadCaseStats = async () => {
            try {
                setLoading(true)
                const stats = await getCaseStats()
                setCaseStats(stats)
                setError(null)
            } catch (err) {
                console.error('Erreur lors du chargement des statistiques des dossiers:', err)
                setError('Erreur lors du chargement des données')
            } finally {
                setLoading(false)
            }
        }
        
        loadCaseStats()
    }, [])

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Statistiques détaillées des dossiers</h2>
                </div>
                <div className="text-center py-12">
                    <div className="text-gray-500">Chargement des statistiques...</div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Statistiques détaillées des dossiers</h2>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-700">
                        ❌ {error}
                    </p>
                </div>
            </div>
        )
    }

    if (!caseStats) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Statistiques détaillées des dossiers</h2>
                </div>
                <div className="text-center py-12">
                    <div className="text-gray-500">Aucune donnée disponible</div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Statistiques détaillées des dossiers</h2>
            </div>
            
            {/* Statistiques générales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <span className="text-2xl">📁</span>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Dossiers créés</p>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{caseStats.totalCreated}</p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <span className="text-2xl">✏️</span>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Dossiers modifiés</p>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{caseStats.totalModified}</p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <span className="text-2xl">🗑️</span>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Dossiers supprimés</p>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{caseStats.totalDeleted}</p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <span className="text-2xl">📥</span>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Fichiers téléchargés</p>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{caseStats.totalDownloads}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Statistiques par maison d'assurance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">📁 Dossiers créés par maison d'assurance</h3>
                    <div className="space-y-3">
                        {caseStats.casesByCompany.length > 0 ? (
                            caseStats.casesByCompany.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="flex items-center">
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">{item.company}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="text-lg font-semibold text-blue-600">{item.count}</span>
                                        <span className="text-sm text-gray-500 ml-1">dossiers</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-4">Aucune donnée disponible</p>
                        )}
                    </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">✏️ Dossiers modifiés par maison d'assurance</h3>
                    <div className="space-y-3">
                        {caseStats.modifiedByCompany.length > 0 ? (
                            caseStats.modifiedByCompany.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="flex items-center">
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">{item.company}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="text-lg font-semibold text-yellow-600">{item.count}</span>
                                        <span className="text-sm text-gray-500 ml-1">dossiers</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-4">Aucune donnée disponible</p>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">🗑️ Dossiers supprimés par maison d'assurance</h3>
                    <div className="space-y-3">
                        {caseStats.deletedByCompany.length > 0 ? (
                            caseStats.deletedByCompany.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="flex items-center">
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">{item.company}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="text-lg font-semibold text-red-600">{item.count}</span>
                                        <span className="text-sm text-gray-500 ml-1">dossiers</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-4">Aucune donnée disponible</p>
                        )}
                    </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">📥 Fichiers téléchargés par maison d'assurance</h3>
                    <div className="space-y-3">
                        {caseStats.downloadsByCompany.length > 0 ? (
                            caseStats.downloadsByCompany.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="flex items-center">
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">{item.company}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="text-lg font-semibold text-green-600">{item.count}</span>
                                        <span className="text-sm text-gray-500 ml-1">fichiers</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-4">Aucune donnée disponible</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

// Composant pour les cartes de statistiques
const StatCard: React.FC<{ title: string; value: number; icon: string }> = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center">
            <div className="flex-shrink-0">
                <span className="text-2xl">{icon}</span>
            </div>
            <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
            </div>
        </div>
    </div>
)

export default AdminPage


