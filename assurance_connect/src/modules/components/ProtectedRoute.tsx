import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../state/AuthState'

interface ProtectedRouteProps {
	children: React.ReactNode
	requireAuth?: boolean
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
	children, 
	requireAuth = true 
}) => {
	const { isAuthenticated } = useAuth()

	if (requireAuth && !isAuthenticated) {
		return <Navigate to="/login" replace />
	}

	if (!requireAuth && isAuthenticated) {
		return <Navigate to="/" replace />
	}

	return <>{children}</>
}
