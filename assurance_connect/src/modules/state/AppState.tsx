import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type AccessRequestStatus = 'pending' | 'approved' | 'rejected'

export type AccessRequest = {
	id: string
	reportId?: number // ID du rapport pour générer les codes d'accès
	reportTitle: string
	requesterId: string
	requesterName: string
	requesterEmail: string
	requesterCompany: string
	requesterPhone?: string
	reason?: string
	status: AccessRequestStatus
	temporaryCode?: string
	expiresAt?: string // ISO string
	rejectionReason?: string
	processedBy?: string
	processedAt?: string // ISO
	requestedAt: string // ISO
}

export type NotificationType = 'email' | 'sms' | 'inapp' | 'dashboard'

export type AppNotification = {
	id: string
	type: NotificationType
	title: string
	message: string
	createdAt: string // ISO
	read: boolean
}

export type CaseType = 'enquete' | 'frauduleux'

export type InsuranceCase = {
	id: string
	code?: string
	type: CaseType
	status: 'Enquête en cours' | 'Enquête terminée'
	data: Record<string, unknown>
	createdAt: string
}

export type AuditEvent = {
	id: string
	type: 'ACCESS_REQUEST_CREATED' | 'ACCESS_REQUEST_APPROVED' | 'ACCESS_REQUEST_REJECTED' | 'REPORT_DOWNLOADED' | 'CASE_CREATED'
	message: string
	actor: string
	atISO: string
}

type AppState = {
	accessRequests: AccessRequest[]
	notifications: AppNotification[]
	cases: InsuranceCase[]
	auditEvents: AuditEvent[]
	favorites: string[]
	createAccessRequest: (reportId: number, reportTitle: string, requesterId: string, requesterName: string, requesterEmail: string, requesterCompany: string, requesterPhone?: string, reason?: string) => void
	approveAccessRequest: (id: string, approverName: string) => void
	rejectAccessRequest: (id: string, approverName: string) => void
	markNotificationRead: (id: string) => void
	createCase: (payload: Omit<InsuranceCase, 'id' | 'createdAt' | 'code'>, actorName: string) => void
	toggleFavorite: (reportTitle: string) => void
	isFavorite: (reportTitle: string) => boolean
	getApprovedAccessFor: (reportTitle: string, requesterName: string) => AccessRequest | undefined
	recordDownload: (reportTitle: string, requesterName: string) => void
}

const AppStateContext = createContext<AppState | undefined>(undefined)

const generateCode = (fileId?: number): string => {
	// Si un fileId est fourni, utiliser le même format que le backend
	if (fileId) {
		return `CODE${fileId.toString().padStart(6, '0')}`
	}
	// Sinon, générer un code aléatoire pour les demandes d'accès
	const part = () => Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3)
	return `${part()}-${part()}-${part()}`
}

export const AppStateProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
	const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([])
	const [notifications, setNotifications] = useState<AppNotification[]>([])
	const [cases, setCases] = useState<InsuranceCase[]>([])
	const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([])
	const [favorites, setFavorites] = useState<string[]>([])

	useEffect(() => {
		try {
			const raw = localStorage.getItem('assurance_app_state')
			if (raw) {
				const parsed = JSON.parse(raw)
				if (parsed.accessRequests) setAccessRequests(parsed.accessRequests)
				if (parsed.notifications) setNotifications(parsed.notifications)
				if (parsed.cases) setCases(parsed.cases)
				if (parsed.auditEvents) setAuditEvents(parsed.auditEvents)
				if (parsed.favorites) setFavorites(parsed.favorites)
			}
		} catch {}
	}, [])

	useEffect(() => {
		try {
			const payload = JSON.stringify({ accessRequests, notifications, cases, auditEvents, favorites })
			localStorage.setItem('assurance_app_state', payload)
		} catch {}
	}, [accessRequests, notifications, cases, auditEvents, favorites])

	const createAccessRequest = (reportId: number, reportTitle: string, requesterId: string, requesterName: string, requesterEmail: string, requesterCompany: string, requesterPhone?: string, reason?: string) => {
		const now = new Date().toISOString()
		const req: AccessRequest = {
			id: cryptoRandomId(),
			reportId,
			reportTitle,
			requesterId,
			requesterName,
			requesterEmail,
			requesterCompany,
			requesterPhone,
			reason,
			status: 'pending',
			requestedAt: now,
		}
		setAccessRequests(prev => [req, ...prev])
		setNotifications(prev => [
			{
				id: cryptoRandomId(),
				type: 'dashboard',
				title: 'Nouvelle demande d\'accès',
				message: `Demande créée pour "${reportTitle}"`,
				createdAt: now,
				read: false,
			},
			...prev,
		])
		setAuditEvents(prev => [{ id: cryptoRandomId(), type: 'ACCESS_REQUEST_CREATED', message: `Demande d'accès pour "${reportTitle}"`, actor: requesterName, atISO: now }, ...prev])
	}

	const approveAccessRequest = (id: string, approverName: string, fileId?: number) => {
		setAccessRequests(prev => {
			const next = prev.map(r => r.id === id ? {
				...r,
				status: 'approved' as AccessRequestStatus,
				// Générer un code unique basé sur l'ID de la demande d'accès
				code: generateCode(parseInt(id.slice(-6), 16) || Math.floor(Math.random() * 1000000)),
				expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
				updatedAt: new Date().toISOString(),
			} : r)
			const approved = next.find(r => r.id === id)
			if (approved) {
				setNotifications(prev => [{
					id: cryptoRandomId(),
					type: 'inapp',
					title: 'Demande d\'accès approuvée',
					message: `Votre demande pour "${approved.reportTitle}" a été approuvée. Les codes d'accès sont disponibles dans l'interface de téléchargement.`,
					createdAt: new Date().toISOString(),
					read: false,
				}, ...prev])
				setAuditEvents(prev => [{ id: cryptoRandomId(), type: 'ACCESS_REQUEST_APPROVED', message: `Demande approuvée pour "${approved.reportTitle}"`, actor: approverName, atISO: new Date().toISOString() }, ...prev])
			}
			return next
		})
	}

	const rejectAccessRequest = (id: string, approverName: string) => {
		setAccessRequests(prev => {
			const next = prev.map(r => r.id === id ? {
				...r,
				status: 'rejected' as AccessRequestStatus,
				updatedAt: new Date().toISOString(),
			} : r)
			const rejected = next.find(r => r.id === id)
			if (rejected) {
				setAuditEvents(prev => [{ id: cryptoRandomId(), type: 'ACCESS_REQUEST_REJECTED', message: `Demande rejetée pour "${rejected.reportTitle}"`, actor: approverName, atISO: new Date().toISOString() }, ...prev])
			}
			return next
		})
	}

	const markNotificationRead = (id: string) => {
		setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
	}

	const createCase = (payload: Omit<InsuranceCase, 'id' | 'createdAt' | 'code'>, actorName: string) => {
		const item: InsuranceCase = {
			...payload,
			id: cryptoRandomId(),
			code: generateCaseCode(String((payload.data as any)?.initiator || (payload.data as any)?.initiateur || 'IN')),
			createdAt: new Date().toISOString(),
		}
		setCases(prev => [item, ...prev])
		setAuditEvents(prev => [{ id: cryptoRandomId(), type: 'CASE_CREATED', message: `Création dossier (${item.type})`, actor: actorName, atISO: item.createdAt }, ...prev])
	}

	const toggleFavorite = (reportTitle: string) => {
		setFavorites(prev => prev.includes(reportTitle) ? prev.filter(t => t !== reportTitle) : [reportTitle, ...prev])
	}

	const isFavorite = (reportTitle: string) => favorites.includes(reportTitle)

	const getApprovedAccessFor = (reportTitle: string, requesterName: string) => {
		return accessRequests
			.filter(r => r.reportTitle === reportTitle && r.requesterName === requesterName && r.status === 'approved')
			.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime())[0]
	}

	const recordDownload = (reportTitle: string, requesterName: string) => {
		setNotifications(prev => [{
			id: cryptoRandomId(),
			type: 'dashboard',
			title: 'Téléchargement effectué',
			message: `${requesterName} a téléchargé "${reportTitle}"`,
			createdAt: new Date().toISOString(),
			read: false,
		}, ...prev])
		setAuditEvents(prev => [{ id: cryptoRandomId(), type: 'REPORT_DOWNLOADED', message: `Téléchargement de "${reportTitle}"`, actor: requesterName, atISO: new Date().toISOString() }, ...prev])
	}

	const value = useMemo<AppState>(() => ({
		accessRequests,
		notifications,
		cases,
		auditEvents,
		favorites,
		createAccessRequest,
		approveAccessRequest,
		rejectAccessRequest,
		markNotificationRead,
		createCase,
		toggleFavorite,
		isFavorite,
		getApprovedAccessFor,
		recordDownload,
	}), [accessRequests, notifications, cases, auditEvents, favorites])

	return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export const useAppState = (): AppState => {
	const ctx = useContext(AppStateContext)
	if (!ctx) throw new Error('useAppState must be used within AppStateProvider')
	return ctx
}

const cryptoRandomId = (): string => {
	try {
		// @ts-ignore
		const bytes = crypto.getRandomValues(new Uint8Array(8)) as Uint8Array
		return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
	} catch {
		return Math.random().toString(36).slice(2)
	}
}

const generateCaseCode = (initiator: string): string => {
	const prefix = (initiator || 'IN').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2).padEnd(2, 'X')
	const numbers = Math.floor(Math.random() * 1_000_000).toString().padStart(6, '0')
	return `${prefix}-${numbers}`
}


