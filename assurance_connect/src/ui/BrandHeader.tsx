import React from 'react'
import { useAuth } from '../modules/state/AuthState'

export const BrandHeader: React.FC<React.PropsWithChildren> = ({ children }) => {
	const { user } = useAuth()
	return (
		<header className="bg-gradient-to-r from-brand-700 to-brand-500 text-white shadow-lg backdrop-blur-sm">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
				<div className="flex items-center gap-3">
					{user?.companyLogo ? (
						<img src={user.companyLogo} alt="Logo compagnie" className="h-10 w-10 rounded-xl object-contain bg-white/15 shadow-sm transition-transform duration-200 hover:scale-105" />
					) : (
						<div className="h-10 w-10 rounded-xl bg-white/15 grid place-items-center shadow-sm transition-transform duration-200 hover:scale-105">🔐</div>
					)}
					<div>
						<div className="text-xl font-bold tracking-tight">Assurance Connect</div>
						<div className="text-sm text-white/90 font-medium">Plateforme anti‑fraude</div>
					</div>
				</div>
				<div className="flex items-center gap-4">
					{children}
					<div className="hidden md:flex items-center gap-3 text-sm bg-white/10 rounded-lg px-3 py-2">
						<span className="font-medium">{user?.firstName || user?.name}</span>
						{!user?.companyLogo && (
							<span className="text-white/70 text-xs">({user?.role === 'admin' ? 'Administrateur' : 'Point Focal'})</span>
						)}
					</div>
				</div>
			</div>
		</header>
	)
}


