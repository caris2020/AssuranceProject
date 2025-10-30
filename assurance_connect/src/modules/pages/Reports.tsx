import React, { useEffect, useMemo, useState } from 'react'
import { Button, Modal, ReportCard, FileInput } from '../../ui'
import { useAppState } from '../state/AppState'
import { fetchReports, BackendReport, createReport, downloadReportSecured, updateReport, deleteReport, fetchCases, BackendCase, findCaseByReference, createCaseBackend, getReportPermissions, getCasePermissions, getReportFilesWithAccessCodes, countPendingReportRequestsForOwner, downloadAllReportFiles } from '../services/api'
import { useAuth } from '../state/AuthState'
import { ReportRequestModal } from '../components/ReportRequestModal'
import { ReportRequestsManagementModal } from '../components/ReportRequestsManagementModal'
import { ValidationCodeModal } from '../components/ValidationCodeModal'

export type Report = {
	id: string
	title: string
	createdAt: string // DD/MM/YYYY
	status: 'Disponible' | 'En attente' | 'Traité'
	beneficiary?: string
	initiator?: string
	insured?: string
	subscriber?: string
	unavailable?: boolean
	caseId?: string
	createdBy?: string
	ownerLogo?: string
}

const mapBackend = (r: BackendReport): Report => ({
	id: String(r.id),
	title: r.title,
	createdAt: new Date(r.createdAt).toLocaleDateString('fr-FR'),
	status: r.status === 'DISPONIBLE' ? 'Disponible' : r.status === 'EN_ATTENTE' ? 'En attente' : 'Traité',
	beneficiary: r.beneficiary,
	initiator: r.initiator,
	insured: r.insured,
	subscriber: r.subscriber,
	// Récupérer le caseId depuis le backend (peut être dans caseId, caseReference ou caseCode)
	caseId: r.caseId || r.caseReference || r.caseCode,
	createdBy: r.createdBy,
	ownerLogo: (r as any).ownerLogo,
})

type SortKey = 'date_desc' | 'date_asc' | 'title_asc' | 'status'

export const ReportsPage: React.FC = () => {
	const { user } = useAuth()
	const [backendCases, setBackendCases] = useState<BackendCase[]>([])
	const { createAccessRequest, toggleFavorite, isFavorite, getApprovedAccessFor, recordDownload, cases: localStorageCases } = useAppState()
	const [caseNumberFilter, setCaseNumberFilter] = useState('')
	const [natureFilter, setNatureFilter] = useState('')
	const [statusFilter, setStatusFilter] = useState('Tous')
	const [favoritesOnly, setFavoritesOnly] = useState(false)
	const [page, setPage] = useState(1)
	const pageSize = 6

	const [backendReports, setBackendReports] = useState<Report[] | null>(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [reportPermissions, setReportPermissions] = useState<Record<number, { canEdit: boolean; canDelete: boolean }>>({})
	
	// États pour les nouveaux modals
	const [showReportRequestModal, setShowReportRequestModal] = useState(false)
	const [showRequestsManagementModal, setShowRequestsManagementModal] = useState(false)
	const [showValidationCodeModal, setShowValidationCodeModal] = useState(false)
	const [selectedReportForRequest, setSelectedReportForRequest] = useState<{ id: number; title: string } | null>(null)
		const [pendingRequestsCount, setPendingRequestsCount] = useState(0)
	
	// Fonctions pour gérer les demandes de rapport
	const handleRequestReport = (reportId: number, reportTitle: string) => {
		setSelectedReportForRequest({ id: reportId, title: reportTitle })
		setShowReportRequestModal(true)
	}
	
	const handleManageRequests = () => {
		setShowRequestsManagementModal(true)
	}
	
	const handleValidateCode = (reportId: number, reportTitle: string) => {
		setSelectedReportForRequest({ id: reportId, title: reportTitle })
		setShowValidationCodeModal(true)
	}
	
	const handleRefreshRequests = () => {
		// Recharger le nombre de demandes en attente
		if (user?.name) {
			countPendingReportRequestsForOwner(user.name)
				.then(setPendingRequestsCount)
				.catch(error => {
					console.error('Erreur lors du rechargement des demandes:', error)
					setPendingRequestsCount(0)
				})
		}
	}
	
	

	useEffect(() => {
		if (!user?.name) return
		
		setLoading(true)
		Promise.all([
			fetchReports().then(async list => {
				const reports = list.map(mapBackend)
				setBackendReports(reports)
				
				// Charger les permissions pour chaque rapport
				const permissions: Record<number, { canEdit: boolean; canDelete: boolean }> = {}
				for (const report of reports) {
					try {
						// Essayer d'abord l'API des permissions
						const perms = await getReportPermissions(Number(report.id), user.name)
						permissions[Number(report.id)] = perms
					} catch (error) {
						// Fallback: Calculer les permissions basées sur le propriétaire
						const isOwner = report.createdBy === user.name
						const isAdmin = user.role === 'admin'
						
						permissions[Number(report.id)] = {
							canEdit: isOwner || isAdmin,
							canDelete: isOwner || isAdmin
						}
					}
				}
				setReportPermissions(permissions)
			}),
			fetchCases().then(list => setBackendCases(list))
		])
			.catch(e => setError(e.message || 'Erreur de chargement'))
			.finally(() => setLoading(false))
	}, [user?.name])

	// Charger le nombre de demandes en attente
	useEffect(() => {
		if (!user?.name) return
		
		const loadPendingRequestsCount = async () => {
			try {
				const count = await countPendingReportRequestsForOwner(user.name)
				setPendingRequestsCount(count)
			} catch (error) {
				console.error('Erreur lors du chargement des demandes en attente:', error)
				setPendingRequestsCount(0)
			}
		}
		
		loadPendingRequestsCount()
	}, [user?.name])

	// Effet séparé pour gérer la recherche automatique
	useEffect(() => {
		// Vérifier s'il y a un numéro de dossier à rechercher automatiquement
		const searchCase = localStorage.getItem('reports_search_case')
		if (searchCase) {
			console.log('Recherche automatique pour le dossier:', searchCase)
			setCaseNumberFilter(searchCase)
			// Nettoyer le localStorage après avoir récupéré la valeur
			localStorage.removeItem('reports_search_case')
		}
	}, []) // Exécuter seulement au montage du composant

	// Debug: Afficher les données chargées
	useEffect(() => {
		if (backendReports && backendCases) {
			console.log('Données chargées:')
			console.log('- Rapports:', backendReports.length, 'rapports')
			console.log('- Dossiers:', backendCases.length, 'dossiers')
			console.log('- Exemples de rapports:', backendReports.slice(0, 3).map(r => ({
				id: r.id,
				title: r.title,
				caseId: r.caseId,
				initiator: r.initiator
			})))
			console.log('- Exemples de dossiers:', backendCases.slice(0, 3).map(c => {
				let parsed: any = null
				if (c.dataJson) {
					try {
						parsed = JSON.parse(c.dataJson)
					} catch (e) {
						parsed = '[invalid-json]'
					}
				}
				return { id: c.id, reference: c.reference, dataJson: parsed }
			}))
		}
	}, [backendReports, backendCases])

	const [requestOpen, setRequestOpen] = useState(false)
	const [selectedReport, setSelectedReport] = useState<Report | null>(null)
	const [enteredCode, setEnteredCode] = useState('')
	const [codeValid, setCodeValid] = useState(false)
	const [validatingCode, setValidatingCode] = useState(false)
	const [validationMessage, setValidationMessage] = useState('')
	const [requestReason, setRequestReason] = useState('')
	const [requestEmail, setRequestEmail] = useState('')
	const [requestCompany, setRequestCompany] = useState('')
	const [requestPhone, setRequestPhone] = useState('')
	const [accessCodes, setAccessCodes] = useState<string[]>([])
    const [loadingCodes, setLoadingCodes] = useState(false)
    const [downloadModalOpen, setDownloadModalOpen] = useState(false)
	
	// États pour le code temporaire et la validation
	const [temporaryCode, setTemporaryCode] = useState('')
	const [isValidatingCode, setIsValidatingCode] = useState(false)
	
	// États pour les demandes d'accès des propriétaires
	const [ownerRequestsOpen, setOwnerRequestsOpen] = useState(false)
	const [ownerRequests, setOwnerRequests] = useState<any[]>([])
	const [loadingOwnerRequests, setLoadingOwnerRequests] = useState(false)
	const [selectedRequest, setSelectedRequest] = useState<any>(null)
	const [rejectionReason, setRejectionReason] = useState('')
	const [processingRequest, setProcessingRequest] = useState(false)

	const [createOpen, setCreateOpen] = useState(false)
	const [createForm, setCreateForm] = useState<{ title: string; status: 'DISPONIBLE' | 'EN_ATTENTE' | 'TRAITE'; beneficiary?: string; initiator?: string; insured?: string; subscriber?: string; caseId?: string }>({ title: '', status: 'DISPONIBLE' })
    const [createFile, setCreateFile] = useState<File | null>(null)
	const [selectedCaseId, setSelectedCaseId] = useState<string>('')
	const [caseIdError, setCaseIdError] = useState<string>('')
	const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
	const [isSubmitting, setIsSubmitting] = useState(false)
	
	// État pour gérer plusieurs bénéficiaires dans le rapport
	const [reportBeneficiaries, setReportBeneficiaries] = useState<Array<{nom: string, prenom: string, dateNaissance: string}>>([
		{ nom: '', prenom: '', dateNaissance: '' }
	])

	// État pour gérer plusieurs assurés dans le rapport
	const [reportInsureds, setReportInsureds] = useState<Array<{nom: string, prenom: string, dateNaissance: string}>>([
		{ nom: '', prenom: '', dateNaissance: '' }
	])

	// Fonction pour ajouter un bénéficiaire au rapport
	const addReportBeneficiary = () => {
		setReportBeneficiaries([...reportBeneficiaries, { nom: '', prenom: '', dateNaissance: '' }])
	}

	// Fonction pour supprimer un bénéficiaire du rapport
	const removeReportBeneficiary = (index: number) => {
		if (reportBeneficiaries.length > 1) {
			setReportBeneficiaries(reportBeneficiaries.filter((_, i) => i !== index))
		}
	}

	// Fonction pour mettre à jour un bénéficiaire du rapport
	const updateReportBeneficiary = (index: number, field: string, value: string) => {
		const updated = [...reportBeneficiaries]
		updated[index] = { ...updated[index], [field]: value }
		setReportBeneficiaries(updated)
	}

	// Fonction pour ajouter un assuré au rapport
	const addReportInsured = () => {
		setReportInsureds([...reportInsureds, { nom: '', prenom: '', dateNaissance: '' }])
	}

	// Fonction pour supprimer un assuré du rapport
	const removeReportInsured = (index: number) => {
		if (reportInsureds.length > 1) {
			setReportInsureds(reportInsureds.filter((_, i) => i !== index))
		}
	}

	// Fonction pour mettre à jour un assuré du rapport
	const updateReportInsured = (index: number, field: string, value: string) => {
		const updated = [...reportInsureds]
		updated[index] = { ...updated[index], [field]: value }
		setReportInsureds(updated)
	}

	// États pour l'édition
	const [editOpen, setEditOpen] = useState(false)
	const [editForm, setEditForm] = useState<{ id: string; title: string; status: 'DISPONIBLE' | 'EN_ATTENTE' | 'TRAITE'; beneficiary?: string; initiator?: string; insured?: string; subscriber?: string; caseId?: string }>({ id: '', title: '', status: 'DISPONIBLE' })
	const [editFile, setEditFile] = useState<File | null>(null)
	const [editPreviewFile, setEditPreviewFile] = useState<File | null>(null)
	const [editCaseId, setEditCaseId] = useState<string>('')
	const [editCaseIdError, setEditCaseIdError] = useState<string>('')

	// États pour la suppression
	const [deleteOpen, setDeleteOpen] = useState(false)
	const [reportToDelete, setReportToDelete] = useState<Report | null>(null)

	const validateCaseId = async (caseId: string) => {
		if (!caseId.trim()) {
			setCaseIdError('')
			return false
		}
		
		try {
			// Rechercher d'abord dans les dossiers déjà chargés
			const existingCase = backendCases.find(c => c.reference === caseId)
			if (existingCase) {
				// Vérifier les permissions de l'utilisateur sur ce dossier
				try {
					const permissions = await getCasePermissions(existingCase.id, user?.name || '')
					if (!permissions.canEdit && !permissions.canDelete) {
						setCaseIdError('Permissions insuffisantes. Vous n\'êtes pas propriétaire de ce dossier.')
						return false
					}
				} catch (permError) {
					console.error('Erreur lors de la vérification des permissions:', permError)
					setCaseIdError('Erreur lors de la vérification des permissions du dossier')
					return false
				}
				
				setCaseIdError('')
				populateFormFromCase(existingCase)
				return true
			}
			
			// Si pas trouvé, essayer de le récupérer depuis l'API
			const foundCase = await findCaseByReference(caseId)
			if (foundCase) {
				// Vérifier les permissions de l'utilisateur sur ce dossier
				try {
					const permissions = await getCasePermissions(foundCase.id, user?.name || '')
					if (!permissions.canEdit && !permissions.canDelete) {
						setCaseIdError('Permissions insuffisantes. Vous n\'êtes pas propriétaire de ce dossier.')
						return false
					}
				} catch (permError) {
					console.error('Erreur lors de la vérification des permissions:', permError)
					setCaseIdError('Erreur lors de la vérification des permissions du dossier')
					return false
				}
				
				setCaseIdError('')
				populateFormFromCase(foundCase)
				// Ajouter le dossier à la liste locale
				setBackendCases(prev => [...prev, foundCase])
				return true
			} else {
				// Si le dossier n'existe pas dans le backend, essayer de le créer
				// en utilisant les données du localStorage comme fallback
				const localStorageCase = localStorageCases.find(c => c.code === caseId)
				
				if (localStorageCase) {
					// Créer le dossier dans le backend avec les données du localStorage
					try {
						const createdCase = await createCaseBackend({
							type: localStorageCase.type === 'enquete' ? 'ENQUETE' : 'FRAUDULEUX',
							status: localStorageCase.status === 'Enquête en cours' ? 'SOUS_ENQUETE' : 'FRAUDULEUX',
							data: localStorageCase.data
						}, user?.name || 'system')
						
						// Mettre à jour la liste locale
						setBackendCases(prev => [...prev, createdCase])
						setCaseIdError('')
						populateFormFromCase(createdCase)
						return true
					} catch (createError) {
						console.error('Erreur lors de la création du dossier:', createError)
						setCaseIdError('Erreur lors de la création du dossier')
						return false
					}
				} else {
					setCaseIdError('Dossier inexistant')
					return false
				}
			}
		} catch (error) {
			setCaseIdError('Erreur lors de la validation du dossier')
			return false
		}
	}

	const populateFormFromCase = (selectedCase: BackendCase) => {
		let caseData: any = {}
		try {
			caseData = JSON.parse(selectedCase.dataJson || '{}')
		} catch (e) {
			console.warn('JSON invalide pour le dossier', selectedCase.id, '- utilisation d\'un objet vide')
			caseData = {}
		}
		
		// Extraire les bénéficiaires multiples du dossier
		let beneficiaries: Array<{nom: string, prenom: string, dateNaissance: string}> = []
		
		if (caseData.beneficiaires && Array.isArray(caseData.beneficiaires)) {
			// Format nouveau avec tableau de bénéficiaires
			beneficiaries = caseData.beneficiaires.map((b: any) => ({
				nom: b.nom || '',
				prenom: b.prenom || '',
				dateNaissance: b.dateNaissance || ''
			}))
		} else if (caseData.beneficiaire_nom || caseData.beneficiaire_prenom) {
			// Format ancien avec un seul bénéficiaire
			beneficiaries = [{
				nom: caseData.beneficiaire_nom || '',
				prenom: caseData.beneficiaire_prenom || '',
				dateNaissance: caseData.beneficiaire_date_naissance || ''
			}]
		}
		
		// S'assurer qu'il y a au moins un bénéficiaire
		if (beneficiaries.length === 0) {
			beneficiaries = [{ nom: '', prenom: '', dateNaissance: '' }]
		}
		
		setReportBeneficiaries(beneficiaries)
		
		// Extraire les assurés multiples du dossier
		let insureds: Array<{nom: string, prenom: string, dateNaissance: string}> = []
		
		if (caseData.assures && Array.isArray(caseData.assures)) {
			// Format nouveau avec tableau d'assurés
			insureds = caseData.assures.map((a: any) => ({
				nom: a.nom || '',
				prenom: a.prenom || '',
				dateNaissance: a.dateNaissance || ''
			}))
		} else if (caseData.assure_nom || caseData.assure_prenom) {
			// Format ancien avec un seul assuré
			insureds = [{
				nom: caseData.assure_nom || '',
				prenom: caseData.assure_prenom || '',
				dateNaissance: caseData.assure_date_naissance || ''
			}]
		}
		
		// S'assurer qu'il y a au moins un assuré
		if (insureds.length === 0) {
			insureds = [{ nom: '', prenom: '', dateNaissance: '' }]
		}
		
		setReportInsureds(insureds)
		
		// Extraire les autres informations du dossier
		const subscriber = caseData.souscripteur_nom && caseData.souscripteur_prenom
			? `${caseData.souscripteur_nom} ${caseData.souscripteur_prenom}`.trim()
			: caseData.souscripteur_nom || caseData.souscripteur_prenom || ''
		
		const initiator = caseData.initiateur || caseData.initiator || ''
		
		setCreateForm(prev => ({
			...prev,
			subscriber: subscriber || prev.subscriber,
			initiator: initiator || prev.initiator
		}))
	}

	const validateCreateForm = () => {
		const errors: Record<string, string> = {}
		
		if (!createForm.title.trim()) {
			errors.title = 'Le titre est obligatoire'
		}
		
		// Validation des bénéficiaires multiples
		const validBeneficiaries = reportBeneficiaries.filter(b => b.nom.trim() && b.prenom.trim())
		if (validBeneficiaries.length === 0) {
			errors.beneficiaries = 'Au moins un bénéficiaire avec nom et prénom est obligatoire'
		}
		
		// Validation des assurés multiples
		const validInsureds = reportInsureds.filter(i => i.nom.trim() && i.prenom.trim())
		if (validInsureds.length === 0) {
			errors.insureds = 'Au moins un assuré avec nom et prénom est obligatoire'
		}
		
		if (!createForm.initiator?.trim()) {
			errors.initiator = 'L\'initiateur est obligatoire'
		}
		
		if (!createForm.subscriber?.trim()) {
			errors.subscriber = 'Le souscripteur est obligatoire'
		}
		
		if (!selectedCaseId.trim()) {
			errors.caseId = 'Le numéro de dossier est obligatoire'
		} else if (caseIdError) {
			errors.caseId = caseIdError
		}
		
		if (!createFile) {
			errors.file = 'Le fichier du rapport est obligatoire'
		}
		
		setValidationErrors(errors)
		return Object.keys(errors).length === 0
	}

	const handleCreateSubmit = async () => {
		if (!validateCreateForm()) {
			return
		}
		
		setIsSubmitting(true)
		
		try {
			// Préparer les données avec les bénéficiaires et assurés multiples
			const validBeneficiaries = reportBeneficiaries.filter(b => b.nom.trim() && b.prenom.trim())
			const validInsureds = reportInsureds.filter(i => i.nom.trim() && i.prenom.trim())
			const reportData = {
				...createForm,
				beneficiaries: JSON.stringify(validBeneficiaries), // Envoyer comme JSON string
				insureds: JSON.stringify(validInsureds), // Envoyer comme JSON string
				caseId: selectedCaseId
			}
			
							const created = await createReport(reportData, user?.name || '', !!createFile)
			const reportId = Number(created.id ?? created?.['id'])
			if (!Number.isNaN(reportId)) {
				const { uploadReportFile } = await import('../services/api')
				
				// Upload fichier principal du rapport
				if (createFile) {
					await uploadReportFile(reportId, createFile, 'Fichier principal du rapport', 'main')
				}
				
                // Upload de prévisualisation retiré
			}
			setCreateOpen(false)
			setCreateForm({ title: '', status: 'DISPONIBLE' })
			setReportBeneficiaries([{ nom: '', prenom: '', dateNaissance: '' }])
			setReportInsureds([{ nom: '', prenom: '', dateNaissance: '' }])
			setCreateFile(null)
            
			setSelectedCaseId('')
			setValidationErrors({})
			refresh()
		} catch (error: any) {
			console.error('Erreur lors de la création:', error)
			if (error.error) {
				alert('Erreur de validation: ' + error.error)
		} else {
				alert('Erreur lors de la création du rapport')
			}
		} finally {
			setIsSubmitting(false)
		}
	}

	const refresh = () => {
		setLoading(true)
		Promise.all([
			fetchReports().then(list => setBackendReports(list.map(mapBackend))),
			fetchCases().then(list => setBackendCases(list))
		])
			.catch(e => setError(e.message || 'Erreur de chargement'))
			.finally(() => setLoading(false))
	}

	const reports = useMemo(() => {
		let list = backendReports ?? []
		
		// Filtre par numéro de dossier
		if (caseNumberFilter.trim()) {
			console.log('Filtrage par numéro de dossier:', caseNumberFilter)
			const searchTerm = caseNumberFilter.toLowerCase().trim()
			
			list = list.filter(r => {
				// 1. Vérifier directement le caseReference du rapport
				if (r.caseId && r.caseId.toLowerCase().includes(searchTerm)) {
					console.log('Correspondance directe avec caseId:', r.caseId)
					return true
				}
				
				// 2. Rechercher dans les dossiers backend pour une correspondance par référence
				const matchingCase = backendCases.find(c => {
					return c.reference.toLowerCase().includes(searchTerm)
				})
				
				if (matchingCase) {
					console.log('Correspondance trouvée avec dossier:', matchingCase.reference)
					// Vérifier si le rapport est réellement lié à ce dossier
					// en comparant les initiateurs ou autres champs communs
					try {
						const caseData = JSON.parse(matchingCase.dataJson || '{}')
						const caseInitiator = String(caseData?.initiator || caseData?.initiateur || '').toLowerCase()
						const reportInitiator = String(r.initiator || '').toLowerCase()
						
						// Si les initiateurs correspondent, c'est probablement le bon rapport
						if (caseInitiator && reportInitiator && caseInitiator === reportInitiator) {
							console.log('Correspondance confirmée par initiateur:', caseInitiator)
							return true
						}
						
						// Vérifier aussi les autres champs pour plus de précision
						const caseBeneficiary = String(caseData?.beneficiaire_nom || caseData?.beneficiaire_prenom || '').toLowerCase()
						const reportBeneficiary = String(r.beneficiary || '').toLowerCase()
						
						if (caseBeneficiary && reportBeneficiary && caseBeneficiary.includes(reportBeneficiary)) {
							console.log('Correspondance confirmée par bénéficiaire')
							return true
						}
					} catch (e) {
						console.error('Erreur parsing JSON du dossier:', e)
					}
				}
				
				return false
			})
			console.log('Rapports filtrés:', list.length)
		}
		
		// Filtre par nature du sinistre (titre du rapport)
		if (natureFilter.trim()) {
			list = list.filter(r => 
				r.title.toLowerCase().includes(natureFilter.toLowerCase())
			)
		}
		
		// Filtre par statut
		if (statusFilter !== 'Tous') {
			const statusMap: Record<string, string> = {
				'Disponible': 'Disponible',
				'En attente': 'En attente',
				'Traité': 'Traité'
			}
			list = list.filter(r => r.status === statusMap[statusFilter])
		}
		
		// Filtre par favoris
		if (favoritesOnly) {
			list = list.filter(r => isFavorite(r.title))
		}
		
		// Tri par date (récent d'abord)
		const byDate = (d: string) => {
			const [dd, mm, yyyy] = d.split('/')
			return new Date(parseInt(yyyy), parseInt(mm) - 1, parseInt(dd)).getTime()
		}
		list.sort((a, b) => byDate(b.createdAt) - byDate(a.createdAt))
		
		return list
	}, [backendReports, caseNumberFilter, natureFilter, statusFilter, favoritesOnly, backendCases, isFavorite])

	// Réinitialiser la page quand les filtres changent
	useEffect(() => {
		setPage(1)
	}, [caseNumberFilter, natureFilter, statusFilter, favoritesOnly])

	const totalPages = Math.max(1, Math.ceil(reports.length / pageSize))
	const paged = reports.slice((page - 1) * pageSize, page * pageSize)

	const openAccessRequest = async (r: Report) => {
		setSelectedReport(r)
		setTemporaryCode('')
		setCodeValid(false)
		setValidationMessage('')
		setDownloadModalOpen(true)
	}

    const openRequestModal = (r: Report) => {
		setSelectedReport(r)
		setRequestReason('')
		setRequestEmail('')
		setRequestCompany('')
		setRequestPhone('')
		setRequestOpen(true)
	}


	const validateCode = async () => {
		if (!selectedReport) return
		
		setValidatingCode(true)
		setValidationMessage('')
		
		try {
			// Utiliser l'API backend pour valider le code
			const cleanTemporaryCode = temporaryCode.trim().toUpperCase()
			const reportId = Number(selectedReport.id)
			
			const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/download/validate-code`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ reportId, code: cleanTemporaryCode })
			})
			
			const data = await response.json()
			
			if (data.valid) {
				setCodeValid(true)
				setValidationMessage('✅ Code valide ! Vous pouvez maintenant télécharger le rapport.')
			} else {
				setCodeValid(false)
				setValidationMessage('❌ Code invalide. Vérifiez le code d\'accès fourni.')
			}
		} catch (error) {
			setCodeValid(false)
			setValidationMessage('❌ Erreur lors de la validation du code.')
			console.error('Erreur de validation:', error)
		} finally {
			setValidatingCode(false)
		}
	}

	const simulateDownload = async () => {
		if (!selectedReport) return
		
		// Vérifier que le code a été validé
		if (!codeValid) {
			alert('Veuillez d\'abord valider le code d\'accès avant de télécharger.')
			return
		}
		
		try {
			// Nettoie les espaces/tabulations éventuels saisis par l'utilisateur
			const cleanCode = temporaryCode.trim().replace(/\s*-\s*/g, '-').toUpperCase()
			await downloadReportSecured(Number(selectedReport.id), user?.name || '', cleanCode)
			recordDownload(selectedReport.title, user?.name || '')
			setDownloadModalOpen(false)
		} catch (e: any) {
			alert(e?.message ?? 'Téléchargement échoué')
		}
	}

	// Fonction pour formater les champs JSON (bénéficiaires et assurés)
	const formatJsonField = (jsonString: string | undefined): string => {
		if (!jsonString) return ''
		
		try {
			const parsed = JSON.parse(jsonString)
			if (Array.isArray(parsed)) {
				return parsed.map(item => {
					if (item.nom && item.prenom) {
						return `${item.nom} ${item.prenom}`.trim()
					} else if (item.nom) {
						return item.nom
					} else if (item.prenom) {
						return item.prenom
					}
					return ''
				}).filter(Boolean).join(', ')
			} else if (parsed.nom || parsed.prenom) {
				return `${parsed.nom || ''} ${parsed.prenom || ''}`.trim()
			}
			return jsonString
		} catch {
			// Si ce n'est pas du JSON valide, retourner la chaîne telle quelle
			return jsonString
		}
	}

	const openEditModal = (report: Report) => {
		setEditForm({
			id: report.id,
			title: report.title,
			status: report.status === 'Disponible' ? 'DISPONIBLE' : report.status === 'En attente' ? 'EN_ATTENTE' : 'TRAITE',
			beneficiary: formatJsonField(report.beneficiary),
			initiator: report.initiator,
			insured: formatJsonField(report.insured),
			subscriber: report.subscriber,
			caseId: report.caseId || ''
		})
		setEditCaseId(report.caseId || '')
		setEditCaseIdError('')
		setEditFile(null)
		setEditPreviewFile(null)
		setEditOpen(true)
	}

	const openDeleteModal = (report: Report) => {
		setReportToDelete(report)
		setDeleteOpen(true)
	}

	const validateEditCaseId = (caseId: string) => {
		if (!caseId.trim()) {
			setEditCaseIdError('')
			return false
		}
		
		const existingCase = backendCases.find(c => c.reference === caseId)
		if (!existingCase) {
			setEditCaseIdError('Numéro de dossier inexistant')
			return false
		} else {
			setEditCaseIdError('')
			return true
		}
	}



	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
			{loading && (<div className="mb-3 text-sm text-slate-500">Chargement des rapports…</div>)}
			{error && (<div className="mb-3 text-sm text-red-600">{error}</div>)}
			{caseNumberFilter && (
				<div className="mb-3 text-sm text-blue-600 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
					🔍 Recherche automatique effectuée pour le dossier : <strong>{caseNumberFilter}</strong>
					{reports.length === 0 && (
						<span className="block mt-1 text-slate-600">Aucun rapport trouvé pour ce dossier.</span>
					)}
				</div>
			)}
			<div className="mb-4 flex items-center justify-between">
				<div className="max-w-md">
					<label className="block">
						<span className="text-xs text-slate-600 dark:text-slate-300">Numéro de dossier</span>
						<input 
							value={caseNumberFilter} 
							onChange={e => setCaseNumberFilter(e.target.value)} 
							className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" 
							placeholder="Rechercher par numéro de dossier..." 
						/>
					</label>
				</div>
				<div className="flex gap-2">
					{pendingRequestsCount > 0 && (
						<Button 
							intent="secondary" 
							size="sm" 
							onClick={handleManageRequests}
							className="bg-orange-500 hover:bg-orange-600"
						>
							🔔 Demandes ({pendingRequestsCount})
						</Button>
					)}

					<Button intent="primary" size="sm" onClick={() => setCreateOpen(true)}>+ Ajouter un rapport</Button>
				</div>
			</div>

			{/* Filtres */}
			<div className="mb-6 space-y-4">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div>
						<label className="block text-xs text-slate-600 dark:text-slate-300 mb-1">Nature du sinistre</label>
						<input
							type="text"
							value={natureFilter}
							onChange={(e) => setNatureFilter(e.target.value)}
							placeholder="Rechercher par nature du sinistre..."
							className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
						/>
					</div>
					<div>
						<label className="block text-xs text-slate-600 dark:text-slate-300 mb-1">Statut</label>
						<select
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
							className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
						>
							<option value="Tous">Tous</option>
							<option value="Disponible">Disponible</option>
							<option value="En attente">En attente</option>
							<option value="Traité">Traité</option>
						</select>
					</div>
					<div>
						<label className="flex items-center">
							<input
								type="checkbox"
								checked={favoritesOnly}
								onChange={(e) => setFavoritesOnly(e.target.checked)}
								className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500"
							/>
							<span className="ml-2 text-sm text-slate-600 dark:text-slate-300">Favoris uniquement</span>
						</label>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
				{paged.map(r => (
					<ReportCard
						key={r.id}
						reportId={Number(r.id)}
						status={r.status}
						unavailable={r.unavailable}
						title={r.title}
						createdAt={r.createdAt}
						beneficiary={(() => {
							try {
								// Essayer de parser les bénéficiaires multiples
								const beneficiaries = JSON.parse(r.beneficiary || '[]')
								if (Array.isArray(beneficiaries) && beneficiaries.length > 0) {
									return beneficiaries.map((b: any) => `${b.nom} ${b.prenom}`).join(', ')
								}
							} catch {
								// Si ce n'est pas du JSON, retourner la valeur directe
							}
							return r.beneficiary
						})()}
						initiator={r.initiator}
						ownerLogo={(r as any).ownerLogo}
						insured={(() => {
							try {
								// Essayer de parser les assurés multiples
								const insureds = JSON.parse(r.insured || '[]')
								if (Array.isArray(insureds) && insureds.length > 0) {
									return insureds.map((i: any) => `${i.nom} ${i.prenom}`).join(', ')
								}
							} catch {
								// Si ce n'est pas du JSON, retourner la valeur directe
							}
							return r.insured
						})()}
						subscriber={r.subscriber}
						caseCode={r.caseId || ''}
						onDownload={async () => {
							try {
								await downloadAllReportFiles(Number(r.id), user?.name || '')
							} catch (e: any) {
								alert(e?.message ?? 'Téléchargement des fichiers échoué')
							}
						}}
						onRequestReport={() => handleRequestReport(Number(r.id), r.title)}
						onValidateCode={() => handleValidateCode(Number(r.id), r.title)}
                        onToggleFavorite={() => toggleFavorite(r.title)}
                        isFavorite={isFavorite(r.title)}
						canEdit={(() => {
							// Calculer directement les permissions basées sur le propriétaire
							const userName = user?.name || user?.firstName || ''
							const createdBy = r.createdBy || ''
							
							// Vérifications multiples pour la compatibilité
							const isOwner = createdBy === userName || 
											createdBy.toLowerCase() === userName.toLowerCase() ||
											createdBy === user?.firstName ||
											(userName === 'noumano' && createdBy === 'noumano') // Cas spécifique temporaire
							
							const permissionCanEdit = reportPermissions[Number(r.id)]?.canEdit || false
							const finalCanEdit = isOwner || permissionCanEdit
							
							// Debug permission si nécessaire
							if (!finalCanEdit && isOwner) {
								console.warn(`Propriétaire sans permission d'édition: ${r.title}`, { createdBy, userName, isOwner })
							}
							
							return finalCanEdit
						})()}
						canDelete={(() => {
							// Calculer directement les permissions basées sur le propriétaire
							const userName = user?.name || user?.firstName || ''
							const createdBy = r.createdBy || ''
							const isOwner = createdBy === userName || 
											createdBy.toLowerCase() === userName.toLowerCase() ||
											createdBy === user?.firstName ||
											(userName === 'noumano' && createdBy === 'noumano')
							const permissionCanDelete = reportPermissions[Number(r.id)]?.canDelete || false
							const finalCanDelete = isOwner || permissionCanDelete
							
							return finalCanDelete
						})()}
						onEdit={() => openEditModal(r)}
						onDelete={() => openDeleteModal(r)}
						createdBy={r.createdBy}
						currentUser={user?.name || ''}
					/>
				))}
			</div>

			<div className="mt-8 flex items-center justify-center gap-3">
				<Button intent="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Précédent</Button>
				<span className="text-sm">Page {page} / {totalPages}</span>
				<Button intent="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Suivant</Button>
			</div>

			<Modal open={requestOpen} onClose={() => setRequestOpen(false)} title="🔐 Demande d'accès au rapport">
				<div className="space-y-4 text-sm">
					<p className="text-slate-600 dark:text-slate-300">
						Ce rapport nécessite une autorisation d'accès. Veuillez remplir les informations ci-dessous.
					</p>
					
					<div className="space-y-3">
						<div>
							<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
								📋 Rapport
							</label>
							<p className="text-sm bg-slate-50 dark:bg-slate-800 p-2 rounded border">
								{selectedReport?.title}
							</p>
						</div>
						
						<div>
							<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
								👤 Demandeur
							</label>
							<p className="text-sm bg-slate-50 dark:bg-slate-800 p-2 rounded border">
								{user?.name || ''}
							</p>
						</div>
						
						<div>
							<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
								📧 Email *
							</label>
							<input 
								type="email"
								value={requestEmail}
								onChange={e => setRequestEmail(e.target.value)}
								placeholder="votre.email@exemple.com"
								className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
								required
							/>
						</div>
						
						<div>
							<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
								🏢 Compagnie *
							</label>
							<input 
								type="text"
								value={requestCompany}
								onChange={e => setRequestCompany(e.target.value)}
								placeholder="Nom de votre entreprise"
								className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
								required
							/>
						</div>
						
						<div>
							<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
								📱 Téléphone *
							</label>
							<input 
								type="tel"
								value={requestPhone}
								onChange={e => setRequestPhone(e.target.value)}
								placeholder="+225 0123456789"
								className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
								required
							/>
						</div>
						
						<div>
							<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
								💬 Motif de la demande *
							</label>
							<textarea 
								value={requestReason} 
								onChange={e => setRequestReason(e.target.value)} 
								className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" 
								rows={3} 
								placeholder="Expliquez pourquoi vous avez besoin de ce rapport..." 
								required
							/>
						</div>
					</div>
					
					<div className="flex justify-end gap-2 pt-4">
						<Button intent="secondary" onClick={() => setRequestOpen(false)}>
							Annuler
						</Button>
						<Button 
							intent="primary" 
							onClick={() => { 
								// Validation des champs obligatoires
								if (!requestEmail.trim()) {
									alert('Veuillez saisir votre email')
									return
								}
								if (!requestCompany.trim()) {
									alert('Veuillez saisir votre compagnie')
									return
								}
								if (!requestPhone.trim()) {
									alert('Veuillez saisir votre téléphone')
									return
								}
								if (!requestReason.trim()) {
									alert('Veuillez saisir le motif de votre demande')
									return
								}
								
								if (selectedReport) { 
									createAccessRequest(
										Number(selectedReport.id), 
										selectedReport.title, 
										user?.name || '',
										requestEmail,
										requestCompany,
										'',
										requestPhone,
										requestReason
									) 
									setRequestOpen(false) // Fermer le modal après envoi
								} 
							}}
						>
							Faire la demande
						</Button>
					</div>
				</div>
			</Modal>

			<Modal open={downloadModalOpen} onClose={() => setDownloadModalOpen(false)} title="🔐 Téléchargement sécurisé">
				<div className="space-y-4 text-sm">
					<p className="text-slate-600 dark:text-slate-300">
						Veuillez saisir votre code d'accès temporaire pour télécharger le rapport.
					</p>
					
					<div className="space-y-3">
						<div>
							<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
								📋 Rapport
							</label>
							<p className="text-sm bg-slate-50 dark:bg-slate-800 p-2 rounded border">
								{selectedReport?.title}
							</p>
						</div>
						
						<div>
							<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
								🔐 Code d'accès temporaire
							</label>
							<input 
								value={temporaryCode} 
								onChange={e => {
									setTemporaryCode(e.target.value.toUpperCase())
									setCodeValid(false)
									setValidationMessage('')
								}} 
								className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-mono" 
								placeholder="XXX-XXX-XXX" 
							/>
							<div className="text-xs text-slate-500 mt-1">
								Format: XXX-XXX-XXX (ex: ABC-123-DEF)
							</div>
						</div>
						
						{/* Bouton de validation */}
						<div className="flex justify-center">
							<Button 
								intent="secondary" 
								onClick={validateCode}
								disabled={validatingCode || !temporaryCode.trim()}
								className="min-w-[120px]"
							>
								{validatingCode ? (
									<>
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
										Validation...
									</>
								) : (
									'🔐 Valider le Code'
								)}
							</Button>
						</div>
						
						{/* Message de validation */}
						{validationMessage && (
							<div className={`p-3 rounded-md text-sm ${
								validationMessage.includes('✅') 
									? 'bg-green-50 border border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300'
									: 'bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
							}`}>
								{validationMessage}
							</div>
						)}
					</div>
					
					<div className="flex justify-end gap-2 pt-4">
						<Button intent="secondary" onClick={() => setDownloadModalOpen(false)}>
							Annuler
						</Button>
						<Button 
							intent="accent" 
							disabled={!codeValid} 
							onClick={simulateDownload}
							className={!codeValid ? 'opacity-50 cursor-not-allowed' : ''}
						>
							📥 Télécharger
						</Button>
					</div>
                </div>
            </Modal>
            {/* Modal de prévisualisation retiré */}

			<Modal open={createOpen} onClose={() => setCreateOpen(false)} title="➕ Ajouter un rapport">
				<div className="space-y-3 text-sm">
					<div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3 text-xs text-blue-700 dark:text-blue-300">
						<strong>Information :</strong> Vous ne pouvez créer un rapport que pour vos propres dossiers. Entrez le numéro de dossier et le système vérifiera automatiquement vos permissions. Tous les champs marqués d'un * sont obligatoires et doivent correspondre aux informations du dossier sélectionné. Le fichier du rapport est également obligatoire.
					</div>
					<label className="block">
						<span className="text-slate-600 dark:text-slate-300">Titre *</span>
						<input value={createForm.title} onChange={e => setCreateForm({ ...createForm, title: e.target.value })} className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2" />
						{validationErrors.title && <div className="text-xs text-red-600 mt-1">{validationErrors.title}</div>}
					</label>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						<label className="block">
							<span className="text-slate-600 dark:text-slate-300">Numéro de dossier *</span>
							<input 
								value={selectedCaseId} 
								onChange={async e => {
									setSelectedCaseId(e.target.value)
									if (e.target.value.trim()) {
										await validateCaseId(e.target.value)
									} else {
										setCaseIdError('')
									}
								}} 
								className={`mt-1 w-full rounded-md border px-3 py-2 text-sm ${
									caseIdError ? 'border-red-300 bg-red-50' : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'
								}`} 
								placeholder="Entrez le numéro de dossier" 
							/>
							{caseIdError && <div className="text-xs text-red-600 mt-1">{caseIdError}</div>}
							{validationErrors.caseId && <div className="text-xs text-red-600 mt-1">{validationErrors.caseId}</div>}
						</label>
						<label className="block">
							<span className="text-slate-600 dark:text-slate-300">Statut</span>
							<select value={createForm.status} onChange={e => setCreateForm({ ...createForm, status: e.target.value as any })} className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2">
								<option value="DISPONIBLE">Disponible</option>
								<option value="EN_ATTENTE">En attente</option>
								<option value="TRAITE">Traité</option>
							</select>
						</label>
						<div className="md:col-span-2">
							<div className="flex items-center justify-between mb-3">
								<span className="text-slate-600 dark:text-slate-300">Bénéficiaires *</span>
								<Button intent="secondary" size="sm" onClick={addReportBeneficiary}>+ Ajouter un bénéficiaire</Button>
							</div>
							{reportBeneficiaries.map((beneficiary, index) => (
								<div key={index} className="border border-slate-200 dark:border-slate-700 rounded-md p-4 mb-4">
									<div className="flex items-center justify-between mb-3">
										<span className="text-xs font-medium text-slate-600 dark:text-slate-300">Bénéficiaire {index + 1}</span>
										{reportBeneficiaries.length > 1 && (
											<button
												type="button"
												onClick={() => removeReportBeneficiary(index)}
												className="text-red-500 hover:text-red-700 text-sm"
											>
												Supprimer
											</button>
										)}
									</div>
									<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<label className="block">
											<span className="text-xs text-slate-600 dark:text-slate-300">Nom *</span>
											<input 
												value={beneficiary.nom} 
												onChange={e => updateReportBeneficiary(index, 'nom', e.target.value)} 
												className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" 
												placeholder="Nom de famille" 
											/>
						</label>
						<label className="block">
											<span className="text-xs text-slate-600 dark:text-slate-300">Prénom *</span>
											<input 
												value={beneficiary.prenom} 
												onChange={e => updateReportBeneficiary(index, 'prenom', e.target.value)} 
												className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" 
												placeholder="Prénom" 
											/>
						</label>
						<label className="block">
											<span className="text-xs text-slate-600 dark:text-slate-300">Date de naissance</span>
											<input 
												type="date" 
												value={beneficiary.dateNaissance} 
												onChange={e => updateReportBeneficiary(index, 'dateNaissance', e.target.value)} 
												className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" 
											/>
										</label>
									</div>
								</div>
							))}
							{validationErrors.beneficiaries && <div className="text-xs text-red-600 mt-1">{validationErrors.beneficiaries}</div>}
						</div>
						<label className="block">
							<span className="text-slate-600 dark:text-slate-300">Initiateur *</span>
							<input value={createForm.initiator ?? ''} onChange={e => setCreateForm({ ...createForm, initiator: e.target.value })} className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2" />
							{validationErrors.initiator && <div className="text-xs text-red-600 mt-1">{validationErrors.initiator}</div>}
						</label>
						<div className="md:col-span-2">
							<div className="flex items-center justify-between mb-3">
								<span className="text-slate-600 dark:text-slate-300">Assurés *</span>
								<Button intent="secondary" size="sm" onClick={addReportInsured}>+ Ajouter un assuré</Button>
							</div>
							{reportInsureds.map((insured, index) => (
								<div key={index} className="border border-slate-200 dark:border-slate-700 rounded-md p-4 mb-4">
									<div className="flex items-center justify-between mb-3">
										<span className="text-xs font-medium text-slate-600 dark:text-slate-300">Assuré {index + 1}</span>
										{reportInsureds.length > 1 && (
											<button
												type="button"
												onClick={() => removeReportInsured(index)}
												className="text-red-500 hover:text-red-700 text-sm"
											>
												Supprimer
											</button>
										)}
									</div>
									<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
										<label className="block">
											<span className="text-xs text-slate-600 dark:text-slate-300">Nom *</span>
											<input 
												value={insured.nom} 
												onChange={e => updateReportInsured(index, 'nom', e.target.value)} 
												className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" 
												placeholder="Nom de famille" 
											/>
						</label>
						<label className="block">
											<span className="text-xs text-slate-600 dark:text-slate-300">Prénom *</span>
											<input 
												value={insured.prenom} 
												onChange={e => updateReportInsured(index, 'prenom', e.target.value)} 
												className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" 
												placeholder="Prénom" 
											/>
						</label>
						<label className="block">
											<span className="text-xs text-slate-600 dark:text-slate-300">Date de naissance</span>
							<input 
												type="date" 
												value={insured.dateNaissance} 
												onChange={e => updateReportInsured(index, 'dateNaissance', e.target.value)} 
												className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" 
											/>
										</label>
									</div>
								</div>
							))}
							{validationErrors.insureds && <div className="text-xs text-red-600 mt-1">{validationErrors.insureds}</div>}
						</div>
						<label className="block">
							<span className="text-slate-600 dark:text-slate-300">Souscripteur *</span>
							<input value={createForm.subscriber ?? ''} onChange={e => setCreateForm({ ...createForm, subscriber: e.target.value })} className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2" />
							{validationErrors.subscriber && <div className="text-xs text-red-600 mt-1">{validationErrors.subscriber}</div>}
						</label>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Fichier rapport *</label>
							<FileInput label="Sélectionner le fichier du rapport" multiple={false} onFilesChange={files => setCreateFile(files[0] ?? null)} accept=".pdf,.txt,.doc,.docx" />
							{createFile && (<div className="mt-2 text-xs text-slate-500">{createFile.name} — {(createFile.size/1024).toFixed(1)} Ko</div>)}
							{validationErrors.file && <div className="text-xs text-red-600 mt-1">{validationErrors.file}</div>}
						</div>
						{/* Champ de prévisualisation retiré */}
					</div>
					<div className="flex justify-end gap-2 pt-2">
						<Button intent="secondary" onClick={() => setCreateOpen(false)}>Annuler</Button>
						<Button intent="primary" onClick={handleCreateSubmit} disabled={isSubmitting}>{isSubmitting ? 'Création en cours...' : 'Créer'}</Button>
					</div>
				</div>
			</Modal>

			{/* Modale d'édition */}
			<Modal open={editOpen} onClose={() => setEditOpen(false)} title="✏️ Modifier le rapport">
				<div className="space-y-3 text-sm">
					<label className="block">
						<span className="text-slate-600 dark:text-slate-300">Titre</span>
						<input value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2" />
					</label>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						<label className="block">
							<span className="text-slate-600 dark:text-slate-300">Statut</span>
							<select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value as any })} className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2">
								<option value="DISPONIBLE">Disponible</option>
								<option value="EN_ATTENTE">En attente</option>
								<option value="TRAITE">Traité</option>
							</select>
						</label>
						<label className="block">
							<span className="text-slate-600 dark:text-slate-300">Bénéficiaire</span>
							<input value={editForm.beneficiary ?? ''} onChange={e => setEditForm({ ...editForm, beneficiary: e.target.value })} className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2" />
						</label>
						<label className="block">
							<span className="text-slate-600 dark:text-slate-300">Initiateur</span>
							<input value={editForm.initiator ?? ''} onChange={e => setEditForm({ ...editForm, initiator: e.target.value })} className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2" />
						</label>
						<label className="block">
							<span className="text-slate-600 dark:text-slate-300">Assuré</span>
							<input value={editForm.insured ?? ''} onChange={e => setEditForm({ ...editForm, insured: e.target.value })} className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2" />
						</label>
						<label className="block">
							<span className="text-slate-600 dark:text-slate-300">Souscripteur</span>
							<input value={editForm.subscriber ?? ''} onChange={e => setEditForm({ ...editForm, subscriber: e.target.value })} className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2" />
						</label>
						<label className="block">
							<span className="text-slate-600 dark:text-slate-300">Numéro de dossier</span>
							<input 
								value={editCaseId} 
								onChange={e => {
									setEditCaseId(e.target.value)
									validateEditCaseId(e.target.value)
								}} 
								className={`mt-1 w-full rounded-md border px-3 py-2 text-sm ${
									editCaseIdError ? 'border-red-300 bg-red-50' : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'
								}`} 
								placeholder="Entrez le numéro de dossier (optionnel)" 
							/>
							{editCaseIdError && <div className="text-xs text-red-600 mt-1">{editCaseIdError}</div>}
						</label>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nouveau fichier rapport (optionnel)</label>
							<FileInput label="Remplacer le fichier du rapport" multiple={false} onFilesChange={files => setEditFile(files[0] ?? null)} accept=".pdf,.txt,.doc,.docx" />
							{editFile && (<div className="mt-2 text-xs text-slate-500">{editFile.name} — {(editFile.size/1024).toFixed(1)} Ko</div>)}
						</div>
						<div>
							<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nouveau fichier de prévisualisation (optionnel)</label>
							<FileInput label="Remplacer le fichier de prévisualisation" multiple={false} onFilesChange={files => setEditPreviewFile(files[0] ?? null)} accept=".pdf,.png,.jpg,.jpeg,.gif,.txt" />
							{editPreviewFile && (<div className="mt-2 text-xs text-slate-500">{editPreviewFile.name} — {(editPreviewFile.size/1024).toFixed(1)} Ko</div>)}
							<div className="mt-1 text-xs text-slate-400">
								Remplace le fichier de prévisualisation existant
							</div>
						</div>
					</div>
					<div className="flex justify-end gap-2 pt-2">
						<Button intent="secondary" onClick={() => setEditOpen(false)}>Annuler</Button>
						<Button intent="primary" onClick={async () => {
							if (!editForm.title.trim()) { alert('Titre requis'); return }
							if (editCaseId && editCaseIdError) { alert('Numéro de dossier invalide'); return }
							
							try {
								const updated = await updateReport(editForm.id, { ...editForm, caseId: editCaseId || undefined })
								const reportId = Number(updated.id ?? updated?.['id'])
								
								if (!Number.isNaN(reportId)) {
									const { uploadReportFile } = await import('../services/api')
									
									// Upload nouveau fichier principal si fourni
									if (editFile) {
										await uploadReportFile(reportId, editFile, 'Fichier principal du rapport (mis à jour)', 'main')
									}
									
									// Upload nouveau fichier de prévisualisation si fourni
									if (editPreviewFile) {
										await uploadReportFile(reportId, editPreviewFile, 'Fichier de prévisualisation (mis à jour)', 'preview')
									}
								}
								
								setEditOpen(false)
								refresh()
							} catch (e: any) {
								alert(e?.message ?? 'Erreur lors de la modification')
							}
						}}>Modifier</Button>
					</div>
				</div>
			</Modal>



			{/* Modale de suppression */}
			<Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="🗑️ Supprimer le rapport">
				<div className="space-y-3 text-sm">
					<p className="text-slate-600 dark:text-slate-300">
						Êtes-vous sûr de vouloir supprimer le rapport <strong>"{reportToDelete?.title}"</strong> ?
					</p>
					<p className="text-xs text-red-600">
						Cette action est irréversible et supprimera définitivement le rapport et tous ses fichiers associés.
					</p>
					<div className="flex justify-end gap-2 pt-2">
						<Button intent="secondary" onClick={() => setDeleteOpen(false)}>Annuler</Button>
						<Button intent="secondary" onClick={async () => {
							if (!reportToDelete) return
							try {
								await deleteReport(reportToDelete.id)
								setDeleteOpen(false)
								refresh()
							} catch (e: any) {
								alert(e?.message ?? 'Erreur lors de la suppression')
							}
						}} className="text-red-600 hover:text-red-700">Supprimer</Button>
					</div>
				</div>
			</Modal>





			{/* Modal pour créer une demande de rapport */}
			<ReportRequestModal
				isOpen={showReportRequestModal}
				onClose={() => setShowReportRequestModal(false)}
				reportId={selectedReportForRequest?.id || 0}
				reportTitle={selectedReportForRequest?.title || ''}
				onSuccess={handleRefreshRequests}
			/>

			{/* Modal pour gérer les demandes de rapport */}
			<ReportRequestsManagementModal
				isOpen={showRequestsManagementModal}
				onClose={() => setShowRequestsManagementModal(false)}
				onRefresh={handleRefreshRequests}
			/>

			{/* Modal pour valider un code de validation */}
			<ValidationCodeModal
				isOpen={showValidationCodeModal}
				onClose={() => setShowValidationCodeModal(false)}
				reportId={selectedReportForRequest?.id || 0}
				reportTitle={selectedReportForRequest?.title || ''}
				onSuccess={handleRefreshRequests}
			/>
		</div>
	)
}

export default ReportsPage


