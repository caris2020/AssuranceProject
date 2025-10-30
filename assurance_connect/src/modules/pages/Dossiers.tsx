import React, { useMemo, useState, useEffect } from 'react'
import { Button, FileInput } from '../../ui'
import { CaseCard } from '../../ui/CaseCard'
import { useAppState } from '../state/AppState'
import { useAuth } from '../state/AuthState'
import { useNavigate } from 'react-router-dom'
import { createCaseBackend, fetchCases, BackendCase, updateCaseStatus as updateCaseStatusAPI, updateCase, deleteCase, getCasePermissions, uploadCaseAttachment } from '../services/api'

const DossiersPage: React.FC = () => {
	const { cases: localStorageCases, createCase } = useAppState()
	const { user } = useAuth()
	const navigate = useNavigate()
	const [backendCases, setBackendCases] = useState<BackendCase[]>([])
	const [loading, setLoading] = useState(true)
	const [migrating, setMigrating] = useState(false)
	const [casePermissions, setCasePermissions] = useState<Record<number, { canEdit: boolean; canDelete: boolean }>>({})
	const [tab, setTab] = useState<'list' | 'new' | 'edit'>('new')
	// Supprimé car nous n'avons plus besoin de filtrer par type
	const [editingCase, setEditingCase] = useState<BackendCase | null>(null)
	// Pagination
	const [page, setPage] = useState(1)
	const pageSize = 6
	const [status, setStatus] = useState<'SOUS_ENQUETE' | 'FRAUDULEUX' | 'PREUVE_INSUFFISANTE'>('SOUS_ENQUETE')
	const [form, setForm] = useState<Record<string, any>>({})
	const [attachments, setAttachments] = useState<File[]>([])
	
	// Filtres
	const [searchTerm, setSearchTerm] = useState('')
	const [statusFilter, setStatusFilter] = useState('Tous')
	const [sortBy, setSortBy] = useState('Date (récent d\'abord)')
	const [favoritesOnly, setFavoritesOnly] = useState(false)
	const [insuredFilter, setInsuredFilter] = useState('')
	const [beneficiaryFilter, setBeneficiaryFilter] = useState('')
	const [subscriberFilter, setSubscriberFilter] = useState('')
	const [initiatorFilter, setInitiatorFilter] = useState('')
	
	// État pour gérer plusieurs bénéficiaires
	const [beneficiaries, setBeneficiaries] = useState<Array<{nom: string, prenom: string, dateNaissance: string}>>([
		{ nom: '', prenom: '', dateNaissance: '' }
	])

	// État pour gérer plusieurs assurés
	const [insureds, setInsureds] = useState<Array<{nom: string, prenom: string, dateNaissance: string}>>([
		{ nom: '', prenom: '', dateNaissance: '' }
	])

	// Fonction pour ajouter un bénéficiaire
	const addBeneficiary = () => {
		setBeneficiaries([...beneficiaries, { nom: '', prenom: '', dateNaissance: '' }])
	}

	// Fonction pour supprimer un bénéficiaire
	const removeBeneficiary = (index: number) => {
		if (beneficiaries.length > 1) {
			setBeneficiaries(beneficiaries.filter((_, i) => i !== index))
		}
	}

	// Fonction pour mettre à jour un bénéficiaire
	const updateBeneficiary = (index: number, field: string, value: string) => {
		const updated = [...beneficiaries]
		updated[index] = { ...updated[index], [field]: value }
		setBeneficiaries(updated)
	}

	// Fonction pour ajouter un assuré
	const addInsured = () => {
		setInsureds([...insureds, { nom: '', prenom: '', dateNaissance: '' }])
	}

	// Fonction pour supprimer un assuré
	const removeInsured = (index: number) => {
		if (insureds.length > 1) {
			setInsureds(insureds.filter((_, i) => i !== index))
		}
	}

	// Fonction pour mettre à jour un assuré
	const updateInsured = (index: number, field: string, value: string) => {
		const updated = [...insureds]
		updated[index] = { ...updated[index], [field]: value }
		setInsureds(updated)
	}

	// Charger les dossiers depuis le backend
	useEffect(() => {
		const loadCases = async () => {
			try {
				setLoading(true)
				const cases = await fetchCases()
				setBackendCases(cases)
				
				// Charger les permissions pour chaque dossier
				const permissions: Record<number, { canEdit: boolean; canDelete: boolean }> = {}
				for (const caseItem of cases) {
					try {
						const perms = await getCasePermissions(caseItem.id, user.name)
						permissions[caseItem.id] = perms
					} catch (error) {
						console.error(`Erreur lors du chargement des permissions pour le dossier ${caseItem.id}:`, error)
						permissions[caseItem.id] = { canEdit: false, canDelete: false }
					}
				}
				setCasePermissions(permissions)
				
				// Migration automatique des dossiers du localStorage vers le backend
				if (localStorageCases.length > 0 && cases.length === 0) {
					await migrateLocalStorageCases()
				}
			} catch (error) {
				console.error('Erreur lors du chargement des dossiers:', error)
			} finally {
				setLoading(false)
			}
		}
		
		loadCases()
	}, [localStorageCases.length, user.name])

	// Fonction de migration des dossiers du localStorage vers le backend
	const migrateLocalStorageCases = async () => {
		setMigrating(true)
		try {
			for (const localCase of localStorageCases) {
				try {
					await createCaseBackend({
						type: localCase.type === 'enquete' ? 'ENQUETE' : 'FRAUDULEUX',
						status: localCase.status === 'Enquête en cours' ? 'SOUS_ENQUETE' : 'FRAUDULEUX',
						data: localCase.data
					}, user.name)
				} catch (error) {
					console.error(`Erreur lors de la migration du dossier ${localCase.code}:`, error)
				}
			}
			
			// Recharger les dossiers après migration
			const updatedCases = await fetchCases()
			setBackendCases(updatedCases)
			
			// Nettoyer le localStorage après migration réussie
			// Note: Cette ligne supprime tous les dossiers du localStorage
			// car ils ont été migrés vers le backend
			localStorage.removeItem('assurance_app_state')
		} catch (error) {
			console.error('Erreur lors de la migration:', error)
		} finally {
			setMigrating(false)
		}
	}

	const submit = (e: React.FormEvent) => {
		e.preventDefault()
		
		// Validation des bénéficiaires
		const validBeneficiaries = beneficiaries.filter(b => b.nom.trim() && b.prenom.trim())
		if (validBeneficiaries.length === 0) {
			return alert('Au moins un bénéficiaire avec nom et prénom est obligatoire')
		}
		
		// Validation des assurés
		const validInsureds = insureds.filter(i => i.nom.trim() && i.prenom.trim())
		if (validInsureds.length === 0) {
			return alert('Au moins un assuré avec nom et prénom est obligatoire')
		}
		
		// Validation pour les dossiers d'enquête uniquement
		if (!form.nature_sinistre) return alert('Renseignez au minimum: Nature du sinistre')
		
		// Préparer les données avec les bénéficiaires et assurés multiples
		const formData = {
			...form,
			beneficiaires: validBeneficiaries,
			assures: validInsureds, // Utiliser assures pour les assurés
		}
		
		// Créer uniquement dans le backend
		;(async () => {
			try {
				const newCase = await createCaseBackend({
					type: 'ENQUETE',
					status: 'SOUS_ENQUETE', // Toujours "Sous enquête" pour les nouveaux dossiers
					data: formData,
				}, user.name)
				
				// Uploader les fichiers attachés si il y en a
				if (attachments.length > 0) {
					try {
						for (const file of attachments) {
							await uploadCaseAttachment(
								newCase.id, 
								file, 
								`Fichier uploadé lors de la création du dossier: ${file.name}`,
								'justificatif'
							)
						}
						console.log(`${attachments.length} fichier(s) uploadé(s) avec succès`)
					} catch (uploadError) {
						console.error('Erreur lors de l\'upload des fichiers:', uploadError)
						alert('Le dossier a été créé mais il y a eu une erreur lors de l\'upload des fichiers: ' + (uploadError instanceof Error ? uploadError.message : 'Erreur inconnue'))
					}
				}
				
				// Recharger les dossiers
				const updatedCases = await fetchCases()
				setBackendCases(updatedCases)
			} catch (error) {
				console.error('Erreur lors de la création du dossier:', error)
				alert('Erreur lors de la création du dossier: ' + (error instanceof Error ? error.message : 'Erreur inconnue'))
			}
		})()
		
		setForm({})
		setBeneficiaries([{ nom: '', prenom: '', dateNaissance: '' }])
		setInsureds([{ nom: '', prenom: '', dateNaissance: '' }])
		setAttachments([])
		setTab('list')
		setPage(1) // Retourner à la première page
	}

	// Filtrage et tri des dossiers
	const filtered = useMemo(() => {
		let filteredCases = backendCases.filter(c => {
			// Gérer le parsing JSON de manière sécurisée
			let caseData: any = {}
			try {
				caseData = JSON.parse(c.dataJson || '{}')
			} catch (error) {
				console.warn('Erreur de parsing JSON pour le dossier', c.id, ':', error)
				caseData = {}
			}
			
			// Filtre par recherche (titre/nature du sinistre)
			if (searchTerm && !caseData.nature_sinistre?.toLowerCase().includes(searchTerm.toLowerCase())) {
				return false
			}
			
			// Filtre par statut
			if (statusFilter !== 'Tous') {
				const statusMap: Record<string, string> = {
					'Sous enquête': 'SOUS_ENQUETE',
					'Frauduleux': 'FRAUDULEUX',
					'Preuve insuffisante': 'PREUVE_INSUFFISANTE'
				}
				if (c.status !== statusMap[statusFilter]) {
					return false
				}
			}
			
			// Filtre par assuré
			if (insuredFilter) {
				const insuredNames = caseData.assures?.map((a: any) => a.nom?.toLowerCase()) || []
				const oldInsuredName = caseData.assure_nom?.toLowerCase() || ''
				if (!insuredNames.some((name: string) => name.includes(insuredFilter.toLowerCase())) && 
					!oldInsuredName.includes(insuredFilter.toLowerCase())) {
					return false
				}
			}
			
			// Filtre par bénéficiaire
			if (beneficiaryFilter) {
				const beneficiaryNames = caseData.beneficiaires?.map((b: any) => b.nom?.toLowerCase()) || []
				const oldBeneficiaryName = caseData.beneficiaire_nom?.toLowerCase() || ''
				if (!beneficiaryNames.some((name: string) => name.includes(beneficiaryFilter.toLowerCase())) && 
					!oldBeneficiaryName.includes(beneficiaryFilter.toLowerCase())) {
					return false
				}
			}
			
			// Filtre par souscripteur
			if (subscriberFilter && !caseData.souscripteur_nom?.toLowerCase().includes(subscriberFilter.toLowerCase())) {
				return false
			}
			
			// Filtre par initiateur (créateur)
			if (initiatorFilter && !c.createdBy?.toLowerCase().includes(initiatorFilter.toLowerCase())) {
				return false
			}
			
			return true
		})
		
		// Tri
		filteredCases.sort((a, b) => {
			switch (sortBy) {
				case 'Date (récent d\'abord)':
					return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
				case 'Date (ancien d\'abord)':
					return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
				case 'Référence (A-Z)':
					return a.reference.localeCompare(b.reference)
				case 'Référence (Z-A)':
					return b.reference.localeCompare(a.reference)
				default:
					return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
			}
		})
		
		return filteredCases
	}, [backendCases, searchTerm, statusFilter, sortBy, insuredFilter, beneficiaryFilter, subscriberFilter, initiatorFilter])
	
	// Réinitialiser la page quand les filtres changent
	useEffect(() => {
		setPage(1)
	}, [searchTerm, statusFilter, sortBy, insuredFilter, beneficiaryFilter, subscriberFilter, initiatorFilter])

	// Pagination
	const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
	const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

	// Fonction pour mettre à jour le statut d'un dossier
	const updateCaseStatus = async (caseId: number, newStatus: 'SOUS_ENQUETE' | 'FRAUDULEUX' | 'PREUVE_INSUFFISANTE') => {
		try {
			// Utiliser la nouvelle fonction API qui inclut la vérification du créateur
			await updateCaseStatusAPI(caseId, newStatus, user.name)
			
			// Recharger les dossiers
			const updatedCases = await fetchCases()
			setBackendCases(updatedCases)
		} catch (error) {
			console.error('Erreur lors de la mise à jour du statut:', error)
			alert('Erreur lors de la mise à jour du statut: ' + (error instanceof Error ? error.message : 'Erreur inconnue'))
		}
	}

	// Fonction pour supprimer un dossier
	const handleDeleteCase = async (caseId: number) => {
		if (!confirm('Êtes-vous sûr de vouloir supprimer ce dossier ? Cette action est irréversible.')) {
			return
		}
		
		try {
			await deleteCase(caseId, user.name)
			
			// Recharger les dossiers
			const updatedCases = await fetchCases()
			setBackendCases(updatedCases)
			
			// Mettre à jour les permissions
			const permissions: Record<number, { canEdit: boolean; canDelete: boolean }> = {}
			for (const caseItem of updatedCases) {
				try {
					const perms = await getCasePermissions(caseItem.id, user.name)
					permissions[caseItem.id] = perms
				} catch (error) {
					permissions[caseItem.id] = { canEdit: false, canDelete: false }
				}
			}
			setCasePermissions(permissions)
			
			// Réinitialiser la page si nécessaire
			const newTotalPages = Math.max(1, Math.ceil(updatedCases.length / pageSize))
			if (page > newTotalPages) {
				setPage(newTotalPages)
			}
			
			alert('Dossier supprimé avec succès')
		} catch (error) {
			console.error('Erreur lors de la suppression du dossier:', error)
			alert('Erreur lors de la suppression du dossier: ' + (error instanceof Error ? error.message : 'Erreur inconnue'))
		}
	}

	// Fonction pour éditer un dossier
	const handleEditCase = (caseItem: BackendCase) => {
		setEditingCase(caseItem)
		
		// Parser les données JSON du dossier
		let caseData: any = {}
		try {
			caseData = JSON.parse(caseItem.dataJson || '{}')
		} catch (error) {
			console.warn('Erreur de parsing JSON pour le dossier', caseItem.id, ':', error)
			caseData = {}
		}
		
		// Pré-remplir le formulaire avec les données existantes
		setForm({
			souscripteur_nom: caseData.souscripteur_nom || '',
			souscripteur_prenom: caseData.souscripteur_prenom || '',
			souscripteur_date_naissance: caseData.souscripteur_date_naissance || '',
			declarant_nom: caseData.declarant_nom || '',
			declarant_prenom: caseData.declarant_prenom || '',
			declarant_date_naissance: caseData.declarant_date_naissance || '',
			nature_sinistre: caseData.nature_sinistre || '',
			date_sinistre: caseData.date_sinistre || '',
			lieu_sinistre: caseData.lieu_sinistre || '',
			date_declaration: caseData.date_declaration || '',
			lieu_declaration: caseData.lieu_declaration || '',
			zones_ombre: caseData.zones_ombre || ''
		})
		
		// Pré-remplir les bénéficiaires
		if (caseData.beneficiaires && Array.isArray(caseData.beneficiaires)) {
			setBeneficiaries(caseData.beneficiaires.length > 0 ? caseData.beneficiaires : [{ nom: '', prenom: '', dateNaissance: '' }])
		} else {
			setBeneficiaries([{ nom: '', prenom: '', dateNaissance: '' }])
		}
		
		// Pré-remplir les assurés
		if (caseData.assures && Array.isArray(caseData.assures)) {
			setInsureds(caseData.assures.length > 0 ? caseData.assures : [{ nom: '', prenom: '', dateNaissance: '' }])
		} else {
			setInsureds([{ nom: '', prenom: '', dateNaissance: '' }])
		}
		
		setTab('edit')
	}

	// Fonction pour soumettre les modifications
	const submitEdit = async (e: React.FormEvent) => {
		e.preventDefault()
		
		if (!editingCase) return
		
		// Validation des bénéficiaires
		const validBeneficiaries = beneficiaries.filter(b => b.nom.trim() && b.prenom.trim())
		if (validBeneficiaries.length === 0) {
			return alert('Au moins un bénéficiaire avec nom et prénom est obligatoire')
		}
		
		// Validation des assurés
		const validInsureds = insureds.filter(i => i.nom.trim() && i.prenom.trim())
		if (validInsureds.length === 0) {
			return alert('Au moins un assuré avec nom et prénom est obligatoire')
		}
		
		// Validation pour les dossiers d'enquête uniquement
		if (!form.nature_sinistre) return alert('Renseignez au minimum: Nature du sinistre')
		
		// Préparer les données avec les bénéficiaires et assurés multiples
		const formData = {
			...form,
			beneficiaires: validBeneficiaries,
			assures: validInsureds,
			attachments: attachments.map(f => ({ name: f.name, size: f.size, type: f.type }))
		}
		
		try {
			await updateCase(editingCase.id, formData, user.name)
			// Uploader les fichiers ajoutés pendant l'édition, s'il y en a
			if (attachments.length > 0) {
				try {
					for (const file of attachments) {
						await uploadCaseAttachment(
							editingCase.id,
							file,
							`Fichier uploadé lors de la modification du dossier: ${file.name}`,
							'justificatif'
						)
					}
					console.log(`${attachments.length} fichier(s) uploadé(s) pendant l'édition`)
				} catch (uploadError) {
					console.error("Erreur lors de l'upload des fichiers (édition):", uploadError)
					alert(
						"Les modifications ont été enregistrées mais l'upload des fichiers a échoué: " +
						(uploadError instanceof Error ? uploadError.message : 'Erreur inconnue')
					)
				}
			}
			
			// Recharger les dossiers
			const updatedCases = await fetchCases()
			setBackendCases(updatedCases)
			
			// Mettre à jour les permissions
			const permissions: Record<number, { canEdit: boolean; canDelete: boolean }> = {}
			for (const caseItem of updatedCases) {
				try {
					const perms = await getCasePermissions(caseItem.id, user.name)
					permissions[caseItem.id] = perms
				} catch (error) {
					permissions[caseItem.id] = { canEdit: false, canDelete: false }
				}
			}
			setCasePermissions(permissions)
			
			// Réinitialiser le formulaire
			setForm({})
			setBeneficiaries([{ nom: '', prenom: '', dateNaissance: '' }])
			setInsureds([{ nom: '', prenom: '', dateNaissance: '' }])
			setAttachments([])
			setEditingCase(null)
			setTab('list')
			setPage(1) // Retourner à la première page
			
			alert('Dossier modifié avec succès')
		} catch (error) {
			console.error('Erreur lors de la modification du dossier:', error)
			alert('Erreur lors de la modification du dossier: ' + (error instanceof Error ? error.message : 'Erreur inconnue'))
		}
	}

	// Fonction pour rediriger vers la page des rapports avec recherche automatique
	const handleViewReports = (caseReference: string) => {
		// Stocker le numéro de dossier dans localStorage pour la recherche automatique
		localStorage.setItem('reports_search_case', caseReference)
		// Rediriger vers la page des rapports en utilisant React Router
		navigate('/rapports')
	}

	// Convertir un dossier backend en format compatible avec CaseCard
	const mapBackendCaseToCard = (backendCase: BackendCase) => {
		// Gérer le parsing JSON de manière sécurisée
		let caseData: any = {}
		try {
			caseData = JSON.parse(backendCase.dataJson || '{}')
		} catch (error) {
			console.warn('Erreur de parsing JSON pour le dossier', backendCase.id, ':', error)
			caseData = {}
		}
		
		// Utiliser les permissions chargées depuis le backend
		const permissions = casePermissions[backendCase.id] || { canEdit: false, canDelete: false }
		
		// Debug: Afficher les permissions pour ce dossier
		console.log(`Permissions pour le dossier ${backendCase.reference} (ID: ${backendCase.id}):`, permissions)
		console.log(`Créé par: ${backendCase.createdBy}, Utilisateur actuel: ${user.name}`)
		
		return {
			id: backendCase.id.toString(),
			code: backendCase.reference,
			status: (() => {
				switch (backendCase.status) {
					case 'SOUS_ENQUETE':
						return 'Sous enquête'
					case 'FRAUDULEUX':
						return 'Frauduleux'
					case 'PREUVE_INSUFFISANTE':
						return 'Preuve insuffisante'
					default:
						return 'Sous enquête'
				}
			})() as 'Sous enquête' | 'Frauduleux' | 'Preuve insuffisante',
			type: (backendCase.type === 'ENQUETE' ? 'enquete' : 'frauduleux') as 'enquete' | 'frauduleux',
			createdAt: backendCase.createdAt,
			createdBy: backendCase.createdBy,
			currentUser: user.name,
			data: caseData,
			dateSinistre: caseData.date_sinistre,
			lieuSinistre: caseData.lieu_sinistre,
			canEditStatus: permissions.canEdit,
			canDelete: permissions.canDelete,
			onViewReports: () => handleViewReports(backendCase.reference)
		}
	}

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
			<div className="flex items-center gap-4 mb-4">
				        <Button intent={tab === 'new' ? 'primary' : 'secondary'} size="sm" onClick={() => { setTab('new'); setPage(1) }}>Nouveau dossier</Button>
        <Button intent={tab === 'list' ? 'primary' : 'secondary'} size="sm" onClick={() => { setTab('list'); setPage(1) }}>Liste des dossiers</Button>
        {editingCase && (
					<Button intent={tab === 'edit' ? 'primary' : 'secondary'} size="sm" onClick={() => setTab('edit')}>
						Modifier le dossier {editingCase.reference}
					</Button>
				)}
			</div>
			
			{loading && (
				<div className="text-center py-8">
					<div className="text-sm text-slate-500">Chargement des dossiers...</div>
				</div>
			)}
			
			{migrating && (
				<div className="text-center py-8">
					<div className="text-sm text-blue-500">Migration des dossiers en cours...</div>
				</div>
			)}
			
			{!loading && !migrating && (
				<>
					{tab === 'new' ? (
						<form onSubmit={submit} className="rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
							<h2 className="text-lg font-semibold">Dépôt de dossier — Enquête</h2>
							<div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3 mb-4">
								<p className="text-sm text-blue-700 dark:text-blue-300">
									💡 <strong>Note :</strong> Seuls les dossiers d'enquête peuvent être créés. Le statut sera automatiquement défini à "Enquête en cours".
								</p>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="md:col-span-2">
										<div className="flex items-center justify-between mb-3">
											<h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Assurés</h3>
											<Button intent="secondary" size="sm" onClick={addInsured}>+ Ajouter un assuré</Button>
										</div>
										{insureds.map((insured, index) => (
											<div key={index} className="border border-slate-200 dark:border-slate-700 rounded-md p-4 mb-4">
												<div className="flex items-center justify-between mb-3">
													<span className="text-xs font-medium text-slate-600 dark:text-slate-300">Assuré {index + 1}</span>
													{insureds.length > 1 && (
														<button
															type="button"
															onClick={() => removeInsured(index)}
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
															onChange={e => updateInsured(index, 'nom', e.target.value)} 
															className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" 
															placeholder="Nom de famille" 
														/>
													</label>
													<label className="block">
														<span className="text-xs text-slate-600 dark:text-slate-300">Prénom *</span>
														<input 
															value={insured.prenom} 
															onChange={e => updateInsured(index, 'prenom', e.target.value)} 
															className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" 
															placeholder="Prénom" 
														/>
													</label>
													<label className="block">
														<span className="text-xs text-slate-600 dark:text-slate-300">Date de naissance</span>
														<input 
															type="date" 
															value={insured.dateNaissance} 
															onChange={e => updateInsured(index, 'dateNaissance', e.target.value)} 
															className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" 
														/>
													</label>
												</div>
											</div>
										))}
									</div>
									<div className="md:col-span-2">
										<div className="flex items-center justify-between mb-3">
											<h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Bénéficiaires</h3>
											<Button intent="secondary" size="sm" onClick={addBeneficiary}>+ Ajouter un bénéficiaire</Button>
										</div>
										{beneficiaries.map((beneficiary, index) => (
											<div key={index} className="border border-slate-200 dark:border-slate-700 rounded-md p-4 mb-4">
												<div className="flex items-center justify-between mb-3">
													<span className="text-xs font-medium text-slate-600 dark:text-slate-300">Bénéficiaire {index + 1}</span>
													{beneficiaries.length > 1 && (
														<button
															type="button"
															onClick={() => removeBeneficiary(index)}
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
															onChange={e => updateBeneficiary(index, 'nom', e.target.value)} 
															className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" 
															placeholder="Nom de famille" 
														/>
													</label>
													<label className="block">
														<span className="text-xs text-slate-600 dark:text-slate-300">Prénom *</span>
														<input 
															value={beneficiary.prenom} 
															onChange={e => updateBeneficiary(index, 'prenom', e.target.value)} 
															className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" 
															placeholder="Prénom" 
														/>
													</label>
													<label className="block">
														<span className="text-xs text-slate-600 dark:text-slate-300">Date de naissance</span>
														<input 
															type="date" 
															value={beneficiary.dateNaissance} 
															onChange={e => updateBeneficiary(index, 'dateNaissance', e.target.value)} 
															className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" 
														/>
													</label>
												</div>
											</div>
										))}
									</div>
									<div className="md:col-span-2">
										<h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Identité du souscripteur</h3>
										<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
											<label className="block">
												<span className="text-xs text-slate-600 dark:text-slate-300">Nom</span>
												<input value={form.souscripteur_nom ?? ''} onChange={e => setForm({ ...form, souscripteur_nom: e.target.value })} className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" placeholder="Nom de famille" />
											</label>
											<label className="block">
												<span className="text-xs text-slate-600 dark:text-slate-300">Prénom</span>
												<input value={form.souscripteur_prenom ?? ''} onChange={e => setForm({ ...form, souscripteur_prenom: e.target.value })} className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" placeholder="Prénom" />
											</label>
											<label className="block">
												<span className="text-xs text-slate-600 dark:text-slate-300">Date de naissance</span>
												<input type="date" value={form.souscripteur_date_naissance ?? ''} onChange={e => setForm({ ...form, souscripteur_date_naissance: e.target.value })} className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" />
											</label>
										</div>
									</div>
									<div className="md:col-span-2">
										<h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Identité du déclarant</h3>
										<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
											<label className="block">
												<span className="text-xs text-slate-600 dark:text-slate-300">Nom</span>
												<input value={form.declarant_nom ?? ''} onChange={e => setForm({ ...form, declarant_nom: e.target.value })} className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" placeholder="Nom de famille" />
											</label>
											<label className="block">
												<span className="text-xs text-slate-600 dark:text-slate-300">Prénom</span>
												<input value={form.declarant_prenom ?? ''} onChange={e => setForm({ ...form, declarant_prenom: e.target.value })} className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" placeholder="Prénom" />
											</label>
											<label className="block">
												<span className="text-xs text-slate-600 dark:text-slate-300">Date de naissance</span>
												<input type="date" value={form.declarant_date_naissance ?? ''} onChange={e => setForm({ ...form, declarant_date_naissance: e.target.value })} className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" />
											</label>
										</div>
									</div>
									<label className="block md:col-span-2">
										<span className="text-xs text-slate-600 dark:text-slate-300">Nature du sinistre</span>
										<input value={form.nature_sinistre ?? ''} onChange={e => setForm({ ...form, nature_sinistre: e.target.value })} className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" placeholder="Ex: usurpation, décès fictif…" />
									</label>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
										<label className="block">
											<span className="text-xs text-slate-600 dark:text-slate-300">Date du sinistre</span>
											<input type="date" value={form.date_sinistre ?? ''} onChange={e => setForm({ ...form, date_sinistre: e.target.value })} className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" />
										</label>
										<label className="block">
											<span className="text-xs text-slate-600 dark:text-slate-300">Lieu du sinistre</span>
											<input value={form.lieu_sinistre ?? ''} onChange={e => setForm({ ...form, lieu_sinistre: e.target.value })} className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" placeholder="Ex: Paris, Lyon, Marseille..." />
										</label>
									</div>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
										<label className="block">
											<span className="text-xs text-slate-600 dark:text-slate-300">Date de déclaration</span>
											<input type="date" value={form.date_declaration ?? ''} onChange={e => setForm({ ...form, date_declaration: e.target.value })} className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" />
										</label>
										<label className="block">
											<span className="text-xs text-slate-600 dark:text-slate-300">Lieu de déclaration</span>
											<input value={form.lieu_declaration ?? ''} onChange={e => setForm({ ...form, lieu_declaration: e.target.value })} className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" />
										</label>
									</div>
									<label className="block md:col-span-2">
										<span className="text-xs text-slate-600 dark:text-slate-300">Zones d'ombre</span>
										<textarea value={form.zones_ombre ?? ''} onChange={e => setForm({ ...form, zones_ombre: e.target.value })} rows={4} className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" placeholder="Décrivez les zones d'ombre…" />
									</label>
									<div className="md:col-span-2">
										<FileInput label="Ajouter des justificatifs" multiple onFilesChange={setAttachments} accept=".pdf,.jpg,.png" />
										{attachments.length > 0 && (
											<ul className="mt-2 text-xs text-slate-600 dark:text-slate-300 space-y-1">
												{attachments.map(f => (<li key={f.name}>{f.name} — {(f.size/1024).toFixed(1)} Ko</li>))}
											</ul>
										)}
									</div>
								</div>
							<div className="flex justify-end">
								<Button intent="primary" type="submit">Soumettre</Button>
							</div>
						</form>
					) : tab === 'edit' ? (
						<form onSubmit={submitEdit} className="rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
							<h2 className="text-lg font-semibold">Modifier le dossier — {editingCase?.reference}</h2>
							<div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3 mb-4">
								<p className="text-sm text-yellow-700 dark:text-yellow-300">
									⚠️ <strong>Note :</strong> Vous modifiez le dossier {editingCase?.reference}. Toutes les modifications seront sauvegardées.
								</p>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="md:col-span-2">
									<div className="flex items-center justify-between mb-3">
										<h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Assurés</h3>
										<Button intent="secondary" size="sm" onClick={addInsured}>+ Ajouter un assuré</Button>
									</div>
									{insureds.map((insured, index) => (
										<div key={index} className="border border-slate-200 dark:border-slate-700 rounded-md p-4 mb-4">
											<div className="flex items-center justify-between mb-3">
												<span className="text-xs font-medium text-slate-600 dark:text-slate-300">Assuré {index + 1}</span>
												{insureds.length > 1 && (
													<button
														type="button"
														onClick={() => removeInsured(index)}
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
														onChange={e => updateInsured(index, 'nom', e.target.value)} 
														className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" 
														placeholder="Nom de famille" 
													/>
												</label>
												<label className="block">
													<span className="text-xs text-slate-600 dark:text-slate-300">Prénom *</span>
													<input 
														value={insured.prenom} 
														onChange={e => updateInsured(index, 'prenom', e.target.value)} 
														className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" 
														placeholder="Prénom" 
													/>
												</label>
												<label className="block">
													<span className="text-xs text-slate-600 dark:text-slate-300">Date de naissance</span>
													<input 
														type="date" 
														value={insured.dateNaissance} 
														onChange={e => updateInsured(index, 'dateNaissance', e.target.value)} 
														className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" 
													/>
												</label>
											</div>
										</div>
									))}
								</div>
								<div className="md:col-span-2">
									<div className="flex items-center justify-between mb-3">
										<h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Bénéficiaires</h3>
										<Button intent="secondary" size="sm" onClick={addBeneficiary}>+ Ajouter un bénéficiaire</Button>
									</div>
									{beneficiaries.map((beneficiary, index) => (
										<div key={index} className="border border-slate-200 dark:border-slate-700 rounded-md p-4 mb-4">
											<div className="flex items-center justify-between mb-3">
												<span className="text-xs font-medium text-slate-600 dark:text-slate-300">Bénéficiaire {index + 1}</span>
												{beneficiaries.length > 1 && (
													<button
														type="button"
														onClick={() => removeBeneficiary(index)}
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
														onChange={e => updateBeneficiary(index, 'nom', e.target.value)} 
														className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" 
														placeholder="Nom de famille" 
													/>
												</label>
												<label className="block">
													<span className="text-xs text-slate-600 dark:text-slate-300">Prénom *</span>
													<input 
														value={beneficiary.prenom} 
														onChange={e => updateBeneficiary(index, 'prenom', e.target.value)} 
														className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" 
														placeholder="Prénom" 
													/>
												</label>
												<label className="block">
													<span className="text-xs text-slate-600 dark:text-slate-300">Date de naissance</span>
													<input 
														type="date" 
														value={beneficiary.dateNaissance} 
														onChange={e => updateBeneficiary(index, 'dateNaissance', e.target.value)} 
														className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" 
													/>
												</label>
											</div>
										</div>
									))}
								</div>
								<div className="md:col-span-2">
									<h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Identité du souscripteur</h3>
									<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
										<label className="block">
											<span className="text-xs text-slate-600 dark:text-slate-300">Nom</span>
											<input value={form.souscripteur_nom ?? ''} onChange={e => setForm({ ...form, souscripteur_nom: e.target.value })} className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" placeholder="Nom de famille" />
										</label>
										<label className="block">
											<span className="text-xs text-slate-600 dark:text-slate-300">Prénom</span>
											<input value={form.souscripteur_prenom ?? ''} onChange={e => setForm({ ...form, souscripteur_prenom: e.target.value })} className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" placeholder="Prénom" />
										</label>
										<label className="block">
											<span className="text-xs text-slate-600 dark:text-slate-300">Date de naissance</span>
											<input type="date" value={form.souscripteur_date_naissance ?? ''} onChange={e => setForm({ ...form, souscripteur_date_naissance: e.target.value })} className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" />
										</label>
									</div>
								</div>
								<div className="md:col-span-2">
									<h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Identité du déclarant</h3>
									<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
										<label className="block">
											<span className="text-xs text-slate-600 dark:text-slate-300">Nom</span>
											<input value={form.declarant_nom ?? ''} onChange={e => setForm({ ...form, declarant_nom: e.target.value })} className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" placeholder="Nom de famille" />
										</label>
										<label className="block">
											<span className="text-xs text-slate-600 dark:text-slate-300">Prénom</span>
											<input value={form.declarant_prenom ?? ''} onChange={e => setForm({ ...form, declarant_prenom: e.target.value })} className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" placeholder="Prénom" />
										</label>
										<label className="block">
											<span className="text-xs text-slate-600 dark:text-slate-300">Date de naissance</span>
											<input type="date" value={form.declarant_date_naissance ?? ''} onChange={e => setForm({ ...form, declarant_date_naissance: e.target.value })} className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" />
										</label>
									</div>
								</div>
								<label className="block md:col-span-2">
									<span className="text-xs text-slate-600 dark:text-slate-300">Nature du sinistre</span>
									<input value={form.nature_sinistre ?? ''} onChange={e => setForm({ ...form, nature_sinistre: e.target.value })} className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" placeholder="Ex: usurpation, décès fictif…" />
								</label>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
									<label className="block">
										<span className="text-xs text-slate-600 dark:text-slate-300">Date du sinistre</span>
										<input type="date" value={form.date_sinistre ?? ''} onChange={e => setForm({ ...form, date_sinistre: e.target.value })} className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" />
									</label>
									<label className="block">
										<span className="text-xs text-slate-600 dark:text-slate-300">Lieu du sinistre</span>
										<input value={form.lieu_sinistre ?? ''} onChange={e => setForm({ ...form, lieu_sinistre: e.target.value })} className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" placeholder="Ex: Paris, Lyon, Marseille..." />
									</label>
								</div>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
									<label className="block">
										<span className="text-xs text-slate-600 dark:text-slate-300">Date de déclaration</span>
										<input type="date" value={form.date_declaration ?? ''} onChange={e => setForm({ ...form, date_declaration: e.target.value })} className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" />
									</label>
									<label className="block">
										<span className="text-xs text-slate-600 dark:text-slate-300">Lieu de déclaration</span>
										<input value={form.lieu_declaration ?? ''} onChange={e => setForm({ ...form, lieu_declaration: e.target.value })} className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" />
									</label>
								</div>
								<label className="block md:col-span-2">
									<span className="text-xs text-slate-600 dark:text-slate-300">Zones d'ombre</span>
									<textarea value={form.zones_ombre ?? ''} onChange={e => setForm({ ...form, zones_ombre: e.target.value })} rows={4} className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" placeholder="Décrivez les zones d'ombre…" />
								</label>
								<div className="md:col-span-2">
									<FileInput label="Ajouter des justificatifs" multiple onFilesChange={setAttachments} accept=".pdf,.jpg,.png" />
									{attachments.length > 0 && (
										<ul className="mt-2 text-xs text-slate-600 dark:text-slate-300 space-y-1">
											{attachments.map(f => (<li key={f.name}>{f.name} — {(f.size/1024).toFixed(1)} Ko</li>))}
										</ul>
									)}
								</div>
							</div>
							<div className="flex justify-end gap-3">
								<Button intent="secondary" onClick={() => {
									setEditingCase(null)
									setTab('list')
								}}>
									Annuler
								</Button>
								<Button intent="primary" type="submit">Sauvegarder les modifications</Button>
							</div>
						</form>
					) : (
						<div className="rounded-xl border border-slate-200 dark:border-slate-700 p-6">
							<h2 className="text-lg font-semibold">Dossiers — Tous les dossiers</h2>
							
							{/* Filtres */}
							<div className="mt-6 space-y-4">
								{/* Première ligne de filtres */}
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div>
										<label className="block text-xs text-slate-600 dark:text-slate-300 mb-1">Rechercher</label>
										<input
											type="text"
											value={searchTerm}
											onChange={(e) => setSearchTerm(e.target.value)}
											placeholder="Nature du sinistre..."
											className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
										/>
									</div>
									<div>
										<label className="block text-xs text-slate-600 dark:text-slate-300 mb-1">Filtrer par statut</label>
										<select
											value={statusFilter}
											onChange={(e) => setStatusFilter(e.target.value)}
											className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
										>
											<option value="Tous">Tous</option>
											<option value="Sous enquête">Sous enquête</option>
											<option value="Frauduleux">Frauduleux</option>
											<option value="Preuve insuffisante">Preuve insuffisante</option>
										</select>
									</div>
									<div>
										<label className="block text-xs text-slate-600 dark:text-slate-300 mb-1">Trier</label>
										<select
											value={sortBy}
											onChange={(e) => setSortBy(e.target.value)}
											className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
										>
											<option value="Date (récent d'abord)">Date (récent d'abord)</option>
											<option value="Date (ancien d'abord)">Date (ancien d'abord)</option>
											<option value="Référence (A-Z)">Référence (A-Z)</option>
											<option value="Référence (Z-A)">Référence (Z-A)</option>
										</select>
									</div>
								</div>
								
								{/* Checkbox favoris */}
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
								
								{/* Filtres par nom */}
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
									<div>
										<label className="block text-xs text-slate-600 dark:text-slate-300 mb-1">Assuré</label>
										<input
											type="text"
											value={insuredFilter}
											onChange={(e) => setInsuredFilter(e.target.value)}
											placeholder="Nom de l'assuré"
											className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
										/>
									</div>
									<div>
										<label className="block text-xs text-slate-600 dark:text-slate-300 mb-1">Bénéficiaire</label>
										<input
											type="text"
											value={beneficiaryFilter}
											onChange={(e) => setBeneficiaryFilter(e.target.value)}
											placeholder="Nom du bénéficiaire"
											className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
										/>
									</div>
									<div>
										<label className="block text-xs text-slate-600 dark:text-slate-300 mb-1">Souscripteur</label>
										<input
											type="text"
											value={subscriberFilter}
											onChange={(e) => setSubscriberFilter(e.target.value)}
											placeholder="Nom du souscripteur"
											className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
										/>
									</div>
									<div>
										<label className="block text-xs text-slate-600 dark:text-slate-300 mb-1">Initiateur</label>
										<input
											type="text"
											value={initiatorFilter}
											onChange={(e) => setInitiatorFilter(e.target.value)}
											placeholder="Nom de l'initiateur"
											className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
										/>
									</div>
								</div>
							</div>
							
							{filtered.length === 0 ? (
								<div className="py-8 text-sm text-slate-500 text-center">Aucun dossier pour l'instant</div>
							) : (
								<>
									<div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
										{paged.map(c => {
										const cardData = mapBackendCaseToCard(c)
										return (
											<CaseCard
												key={c.id}
												caseId={c.id}
												status={cardData.status}
												code={cardData.code}
												createdAt={new Date(cardData.createdAt).toLocaleDateString('fr-FR')}
												createdBy={cardData.createdBy}
												currentUser={cardData.currentUser}
												assureNom={(() => {
													if (cardData.data.assures && Array.isArray(cardData.data.assures)) {
														return cardData.data.assures.map((a: any) => a.nom).join(', ')
													}
													return cardData.data.assure_nom as string
												})()}
												assurePrenom={(() => {
													if (cardData.data.assures && Array.isArray(cardData.data.assures)) {
														return cardData.data.assures.map((a: any) => a.prenom).join(', ')
													}
													return cardData.data.assure_prenom as string
												})()}
												beneficiaireNom={(() => {
													if (cardData.data.beneficiaires && Array.isArray(cardData.data.beneficiaires)) {
														return cardData.data.beneficiaires.map((b: any) => b.nom).join(', ')
													}
													return cardData.data.beneficiaire_nom as string
												})()}
												beneficiairePrenom={(() => {
													if (cardData.data.beneficiaires && Array.isArray(cardData.data.beneficiaires)) {
														return cardData.data.beneficiaires.map((b: any) => b.prenom).join(', ')
													}
													return cardData.data.beneficiaire_prenom as string
												})()}
												souscripteurNom={cardData.data.souscripteur_nom as string}
												souscripteurPrenom={cardData.data.souscripteur_prenom as string}
												declarantNom={cardData.data.declarant_nom as string}
												declarantPrenom={cardData.data.declarant_prenom as string}
												natureSinistre={cardData.data.nature_sinistre as string}
												natureFraude={cardData.data.nature_fraude as string}
												dateSinistre={cardData.dateSinistre}
												lieuSinistre={cardData.lieuSinistre}
												onViewReports={cardData.onViewReports}
												onStatusChange={(newStatus) => updateCaseStatus(c.id, newStatus)}
												onEdit={() => handleEditCase(c)}
												onDelete={() => handleDeleteCase(c.id)}
												canEditStatus={cardData.canEditStatus}
												canDelete={cardData.canDelete}
												data={cardData.data}
											/>
										)
									})}
									</div>
									
									{/* Pagination */}
									<div className="mt-8 flex items-center justify-center gap-3">
										<Button intent="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Précédent</Button>
										<span className="text-sm">Page {page} / {totalPages}</span>
										<Button intent="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Suivant</Button>
									</div>
								</>
							)}
						</div>
					)}
				</>
			)}
		</div>
	)
}

export default DossiersPage


