import React, { createContext, useContext, useMemo, useState, useEffect } from 'react'

export type UserRole = 'admin' | 'point_focal'

export type User = {
	id?: number
	name: string
	role: UserRole
	email?: string
	insuranceCompany?: string
	companyLogo?: string
	firstName?: string
	lastName?: string
	// Informations d'abonnement
	subscriptionStartDate?: string
	subscriptionEndDate?: string
	subscriptionActive?: boolean
	subscriptionStatus?: string
	daysUntilExpiration?: number
	lastRenewalRequestDate?: string
}

type AuthState = {
	user: User | null
	isAuthenticated: boolean
	login: (username: string, insuranceCompany: string, password: string) => Promise<boolean>
	logout: () => void
}

const AuthContext = createContext<AuthState | undefined>(undefined)

export const AuthStateProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null)
	const [isAuthenticated, setIsAuthenticated] = useState(false)

	// Vérifier si l'utilisateur est déjà connecté au chargement
	useEffect(() => {
		const savedUser = localStorage.getItem('assurance_user')
		if (savedUser) {
			try {
				const userData = JSON.parse(savedUser)
				setUser(userData)
				setIsAuthenticated(true)
			} catch (error) {
				console.error('Erreur lors du chargement de l\'utilisateur:', error)
				localStorage.removeItem('assurance_user')
			}
		}
	}, [])

	const login = async (username: string, insuranceCompany: string, password: string): Promise<boolean> => {
		try {
			// Appel à l'API de connexion
			const response = await fetch('http://localhost:8080/api/auth/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					username,
					insuranceCompany,
					password
				})
			})

			if (response.ok) {
				const userData = await response.json()
				const user: User = {
					id: userData.id,
					name: userData.username,
					firstName: userData.firstName,
					lastName: userData.lastName,
					displayName: userData.displayName,
					email: userData.email,
					role: userData.role === 'ADMIN' ? 'admin' : 'point_focal',
					status: userData.status,
					isActive: userData.isActive,
					insuranceCompany: userData.insuranceCompany,
					companyLogo: userData.companyLogo,
					createdAt: userData.createdAt,
					lastLoginAt: userData.lastLoginAt,
					lastLogoutAt: userData.lastLogoutAt,
					subscriptionStartDate: userData.subscriptionStartDate,
					subscriptionEndDate: userData.subscriptionEndDate,
					subscriptionActive: userData.subscriptionActive,
					subscriptionStatus: userData.subscriptionStatus,
					daysUntilExpiration: userData.daysUntilExpiration,
					lastRenewalRequestDate: userData.lastRenewalRequestDate
				}
				setUser(user)
				setIsAuthenticated(true)
				localStorage.setItem('assurance_user', JSON.stringify(user))
				return true
			} else {
				console.error('Erreur de connexion:', response.statusText)
				return false
			}
		} catch (error) {
			console.error('Erreur lors de la connexion:', error)
			return false
		}
	}

	const logout = () => {
		setUser(null)
		setIsAuthenticated(false)
		localStorage.removeItem('assurance_user')
	}

	const value = useMemo(() => ({ 
		user, 
		isAuthenticated, 
		login, 
		logout
	}), [user, isAuthenticated])

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthState => {
	const ctx = useContext(AuthContext)
	if (!ctx) throw new Error('useAuth must be used within AuthStateProvider')
	return ctx
}


