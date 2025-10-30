import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { BrandHeader } from '../ui'
import { AppStateProvider } from './state/AppState'
import { AuthStateProvider, useAuth } from './state/AuthState'
import { NotificationProvider } from '../contexts/NotificationContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { useAutoLogout } from './hooks'
import { AutoLogoutAlert, SessionTimer } from './components'
import ReportsPage from './pages/Reports'
import DossiersPage from './pages/Dossiers'
import NotificationsPage from './pages/Notifications'
import DashboardPage from './pages/Dashboard'
import AdminPage from './pages/Admin'
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'
import ForgotPasswordPage from './pages/ForgotPassword'
import ResetPasswordPage from './pages/ResetPassword'
import { getUnreadNotificationsCount } from './services/api'

const RequireRole: React.FC<{ role: 'admin' | 'point_focal'; children: React.ReactNode }> = ({ role, children }) => {
	const { user } = useAuth()
	if (!user || user.role !== role) {
		return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16"><div className="rounded-xl border border-slate-200 dark:border-slate-700 p-6 text-sm">Accès refusé. Cette section est réservée au rôle: {role}.</div></div>
	}
	return <>{children}</>
}

const AppContent: React.FC = () => {
	const [dark, setDark] = useState(false)
	const { isAuthenticated, user, logout } = useAuth()
	const { timeRemaining, showWarning, extendSession } = useAutoLogout()
	const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0)

	useEffect(() => {
		document.documentElement.classList.toggle('dark', dark)
	}, [dark])

	// Charger le nombre de notifications non lues
	useEffect(() => {
		if (user?.name) {
			const loadUnreadCount = async () => {
				try {
					const count = await getUnreadNotificationsCount(user.name)
					setUnreadNotificationsCount(count)
				} catch (error) {
					console.error('Erreur chargement notifications:', error)
				}
			}
			
			loadUnreadCount()
			
			// Recharger toutes les 30 secondes
			const interval = setInterval(loadUnreadCount, 30000)
			return () => clearInterval(interval)
		}
	}, [user?.name])

	const activeClass = 'text-white font-semibold bg-white/10 rounded-lg px-3 py-2 transition-all duration-200 shadow-sm'
	const baseLink = 'text-white/80 hover:text-white hover:bg-white/5 rounded-lg px-3 py-2 transition-all duration-200 font-medium'

	if (!isAuthenticated) {
		return (
			<div className="min-h-screen bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
				<Routes>
					<Route path="/login" element={<LoginPage />} />
					<Route path="/register" element={<RegisterPage />} />
					<Route path="/forgot-password" element={<ForgotPasswordPage />} />
					<Route path="/reset-password" element={<ResetPasswordPage />} />
					<Route path="*" element={<Navigate to="/login" replace />} />
				</Routes>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
			{/* Alerte de déconnexion automatique */}
			{showWarning && (
				<AutoLogoutAlert
					timeRemaining={timeRemaining}
					onExtend={extendSession}
					onLogout={logout}
				/>
			)}

			{/* Header */}
			<BrandHeader>
				<nav className="hidden md:flex items-center gap-2 text-base">
					<NavLink to="/" end className={({ isActive }) => (isActive ? activeClass : baseLink)}>Tableau de bord</NavLink>
					<NavLink to="/rapports" className={({ isActive }) => (isActive ? activeClass : baseLink)}>Rapports</NavLink>
					<NavLink to="/dossiers" className={({ isActive }) => (isActive ? activeClass : baseLink)}>Dossiers</NavLink>
					<NavLink to="/notifications" className={({ isActive }) => (isActive ? activeClass : baseLink)}>
						<div className="flex items-center gap-2">
							Notifications
							{unreadNotificationsCount > 0 && (
								<span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
									{unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
								</span>
							)}
						</div>
					</NavLink>
					{user?.role === 'admin' && (
						<NavLink to="/admin" className={({ isActive }) => (isActive ? activeClass : baseLink)}>Admin</NavLink>
					)}
				</nav>
				<div className="flex items-center gap-4">
					<SessionTimer timeRemaining={timeRemaining} showWarning={showWarning} />
					<button 
						onClick={logout}
						className="text-white/80 hover:text-white hover:bg-white/5 text-base font-medium px-3 py-2 rounded-lg transition-all duration-200"
					>
						Déconnexion
					</button>
				</div>
			</BrandHeader>

			{/* Contenu principal */}
			<main className="pt-4">
				<Routes>
					<Route path="/" element={<DashboardPage />} />
					<Route path="/rapports" element={<ReportsPage />} />
					<Route path="/dossiers" element={<DossiersPage />} />
					<Route path="/notifications" element={<NotificationsPage />} />
					<Route path="/admin" element={
						<RequireRole role="admin">
							<AdminPage />
						</RequireRole>
					} />
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</main>
		</div>
	)
}

export const App: React.FC = () => {
	return (
		<BrowserRouter>
			<AuthStateProvider>
				<NotificationProvider>
					<AppStateProvider>
						<AppContent />
					</AppStateProvider>
				</NotificationProvider>
			</AuthStateProvider>
		</BrowserRouter>
	)
}


