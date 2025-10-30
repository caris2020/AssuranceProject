import React, { useState, useEffect } from 'react'
import { Button } from './primitives/Button'
import { getCaseAttachments, downloadCaseAttachment, CaseAttachment } from '../modules/services/api'

type Props = {
	status: 'Sous enquête' | 'Frauduleux' | 'Preuve insuffisante'
	code?: string
	caseId?: number // ID du dossier pour récupérer les fichiers attachés
	createdAt?: string
	createdBy?: string
	currentUser?: string
	assureNom?: string
	assurePrenom?: string
	beneficiaireNom?: string
	beneficiairePrenom?: string
	souscripteurNom?: string
	souscripteurPrenom?: string
	declarantNom?: string
	declarantPrenom?: string
	natureSinistre?: string
	natureFraude?: string
	dateSinistre?: string
	lieuSinistre?: string
	onView?: () => void
	onViewReports?: () => void
	onStatusChange?: (newStatus: 'SOUS_ENQUETE' | 'FRAUDULEUX' | 'PREUVE_INSUFFISANTE') => void
	onEdit?: () => void
	onDelete?: () => void
	canEditStatus?: boolean
	canDelete?: boolean
	data?: any // Données complètes du dossier
}

export const CaseCard: React.FC<Props> = ({ 
	status, 
	code, 
	caseId,
	createdAt = '—', 
	createdBy,
	currentUser,
	assureNom, 
	assurePrenom, 
	beneficiaireNom, 
	beneficiairePrenom, 
	souscripteurNom, 
	souscripteurPrenom, 
	declarantNom, 
	declarantPrenom, 
	natureSinistre, 
	natureFraude, 
	dateSinistre,
	lieuSinistre,
	onView,
	onViewReports,
	onStatusChange,
	onEdit,
	onDelete,
	canEditStatus = false,
	canDelete = false,
	data
}) => {
	const [showDetails, setShowDetails] = useState(false)
	const [attachments, setAttachments] = useState<CaseAttachment[]>([])
	const [loadingAttachments, setLoadingAttachments] = useState(false)

	const badge = () => {
		switch (status) {
			case 'Sous enquête':
				return <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-800 px-2 py-0.5 text-xs">Sous enquête</span>
			case 'Frauduleux':
				return <span className="inline-flex items-center rounded-full bg-red-100 text-red-800 px-2 py-0.5 text-xs">Frauduleux</span>
			case 'Preuve insuffisante':
				return <span className="inline-flex items-center rounded-full bg-orange-100 text-orange-800 px-2 py-0.5 text-xs">Preuve insuffisante</span>
		}
	}

	const getTitle = () => {
		if (status === 'Sous enquête') {
			return natureSinistre || 'Dossier d\'enquête'
		} else if (status === 'Frauduleux') {
			return natureFraude || 'Dossier frauduleux'
		} else {
			return natureSinistre || natureFraude || 'Dossier'
		}
	}

	const handleViewClick = () => {
		setShowDetails(true)
		loadAttachments()
	}

	// Charger les fichiers attachés au dossier
	const loadAttachments = async () => {
		if (!caseId) return
		
		try {
			setLoadingAttachments(true)
			const attachments = await getCaseAttachments(caseId)
			setAttachments(attachments)
		} catch (error) {
			console.error('Erreur lors du chargement des fichiers attachés:', error)
			setAttachments([])
		} finally {
			setLoadingAttachments(false)
		}
	}

	// Télécharger un fichier attaché
	const handleDownloadAttachment = async (attachment: CaseAttachment) => {
		if (!caseId) return
		
		try {
			await downloadCaseAttachment(caseId, attachment.id, attachment.fileName)
		} catch (error) {
			console.error('Erreur lors du téléchargement:', error)
			alert('Erreur lors du téléchargement du fichier')
		}
	}

	return (
		<>
			<div className="rounded-xl border border-slate-200 bg-white dark:bg-slate-800 shadow hover:border-brand-200 hover:shadow-2xl transition transform duration-150 hover:-translate-y-1 hover:z-10">
				<div className="p-4">
					<div className="h-10 w-10 rounded-lg bg-brand-50 text-brand-700 grid place-items-center">
						{status === 'Sous enquête' ? '🔍' : status === 'Frauduleux' ? '🚨' : '⚠️'}
					</div>
					<h3 className="mt-3 font-semibold">{getTitle()}</h3>
					<p className="text-sm text-slate-600 dark:text-slate-300">Créé le {createdAt}</p>
					{createdBy && (
						<p className="text-xs text-slate-500 mt-1">
							Par: <span className="font-medium">{createdBy}</span>
							{currentUser && createdBy === currentUser && (
								<span className="ml-2 inline-flex items-center rounded-full bg-green-100 text-green-800 px-2 py-0.5 text-xs">
									👤 Votre dossier
								</span>
							)}
						</p>
					)}
					{code && (
						<p className="text-xs text-slate-500 mt-1">
							Code: <span className="font-mono font-medium text-brand-600">{code}</span>
						</p>
					)}
					<div className="mt-4 space-y-1 text-sm">
						{assureNom && assurePrenom && (
							<div className="flex items-center gap-2">
								<span>👤</span>
								<span className="text-slate-600 dark:text-slate-300">Assuré:</span>
								<span className="ml-auto font-medium">{assurePrenom} {assureNom}</span>
							</div>
						)}
						{beneficiaireNom && beneficiairePrenom && (
							<div className="flex items-center gap-2">
								<span>🎯</span>
								<span className="text-slate-600 dark:text-slate-300">Bénéficiaire:</span>
								<span className="ml-auto font-medium">{beneficiairePrenom} {beneficiaireNom}</span>
							</div>
						)}
						{souscripteurNom && souscripteurPrenom && (
							<div className="flex items-center gap-2">
								<span>📋</span>
								<span className="text-slate-600 dark:text-slate-300">Souscripteur:</span>
								<span className="ml-auto font-medium">{souscripteurPrenom} {souscripteurNom}</span>
							</div>
						)}
						{declarantNom && declarantPrenom && (
							<div className="flex items-center gap-2">
								<span>📝</span>
								<span className="text-slate-600 dark:text-slate-300">Déclarant:</span>
								<span className="ml-auto font-medium">{declarantPrenom} {declarantNom}</span>
							</div>
						)}
						{dateSinistre && (
							<div className="flex items-center gap-2">
								<span>📅</span>
								<span className="text-slate-600 dark:text-slate-300">Date sinistre:</span>
								<span className="ml-auto font-medium">{new Date(dateSinistre).toLocaleDateString('fr-FR')}</span>
							</div>
						)}
						{lieuSinistre && (
							<div className="flex items-center gap-2">
								<span>📍</span>
								<span className="text-slate-600 dark:text-slate-300">Lieu sinistre:</span>
								<span className="ml-auto font-medium">{lieuSinistre}</span>
							</div>
						)}
					</div>
					<div className="mt-3 flex items-center gap-2">
						{badge()}
					</div>
					
					{canEditStatus && onStatusChange && (
						<div className="mt-3">
							<label className="block">
								<span className="text-xs text-slate-600 dark:text-slate-300">Modifier le statut</span>
								<select 
									value={(() => {
										switch (status) {
											case 'Sous enquête': return 'SOUS_ENQUETE'
											case 'Frauduleux': return 'FRAUDULEUX'
											case 'Preuve insuffisante': return 'PREUVE_INSUFFISANTE'
											default: return 'SOUS_ENQUETE'
										}
									})()}
									onChange={e => onStatusChange(e.target.value as any)}
									className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-xs"
								>
									<option value="SOUS_ENQUETE">Sous enquête</option>
									<option value="FRAUDULEUX">Frauduleux</option>
									<option value="PREUVE_INSUFFISANTE">Preuve insuffisante</option>
								</select>
							</label>
						</div>
					)}
					<div className="mt-4 space-y-2">
						<Button intent="primary" onClick={handleViewClick} className="w-full">
							Voir le dossier
						</Button>
						{onViewReports && (
							<Button 
								intent="secondary" 
								onClick={onViewReports} 
								className="w-full"
							>
								📋 Voir rapport
							</Button>
						)}
						{canEditStatus && onEdit && (
							<Button 
								intent="secondary" 
								onClick={onEdit} 
								className="w-full"
							>
								✏️ Modifier le dossier
							</Button>
						)}
						{canDelete && onDelete && (
							<Button 
								intent="secondary" 
								onClick={onDelete} 
								className="w-full bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
							>
								🗑️ Supprimer le dossier
							</Button>
						)}
					</div>
				</div>
			</div>

			{/* Modal des détails du dossier */}
			{showDetails && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white dark:bg-slate-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
						<div className="p-6">
							<div className="flex items-center justify-between mb-6">
								<h2 className="text-xl font-semibold">Détails du dossier {code}</h2>
								<button
									onClick={() => setShowDetails(false)}
									className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
								>
									✕
								</button>
							</div>

							{/* Informations générales */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<h3 className="text-lg font-medium mb-4">Informations générales</h3>
									<div className="space-y-3">
										<div>
											<span className="text-sm text-slate-600 dark:text-slate-300">Statut:</span>
											<div className="mt-1">{badge()}</div>
										</div>
										<div>
											<span className="text-sm text-slate-600 dark:text-slate-300">Date de création:</span>
											<div className="font-medium">{createdAt}</div>
										</div>
										<div>
											<span className="text-sm text-slate-600 dark:text-slate-300">Code de référence:</span>
											<div className="font-mono font-medium text-brand-600">{code}</div>
										</div>
									</div>
								</div>

								<div>
									<h3 className="text-lg font-medium mb-4">Nature du dossier</h3>
									<div className="space-y-3">
										{natureSinistre && (
											<div>
												<span className="text-sm text-slate-600 dark:text-slate-300">Nature du sinistre:</span>
												<div className="font-medium">{natureSinistre}</div>
											</div>
										)}
										{natureFraude && (
											<div>
												<span className="text-sm text-slate-600 dark:text-slate-300">Nature de la fraude:</span>
												<div className="font-medium">{natureFraude}</div>
											</div>
										)}
									</div>
								</div>
							</div>

							{/* Personnes impliquées */}
							<div className="mt-8">
								<h3 className="text-lg font-medium mb-4">Personnes impliquées</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									{/* Assurés */}
									{data?.assures && Array.isArray(data.assures) && data.assures.length > 0 && (
										<div>
											<h4 className="font-medium mb-3">Assurés</h4>
											<div className="space-y-2">
												{data.assures.map((assure: any, index: number) => (
													<div key={index} className="bg-slate-50 dark:bg-slate-700 p-3 rounded-md">
														<div className="font-medium">{assure.prenom} {assure.nom}</div>
														{assure.dateNaissance && (
															<div className="text-sm text-slate-600 dark:text-slate-300">
																Date de naissance: {assure.dateNaissance}
															</div>
														)}
													</div>
												))}
											</div>
										</div>
									)}

									{/* Bénéficiaires */}
									{data?.beneficiaires && Array.isArray(data.beneficiaires) && data.beneficiaires.length > 0 && (
										<div>
											<h4 className="font-medium mb-3">Bénéficiaires</h4>
											<div className="space-y-2">
												{data.beneficiaires.map((beneficiaire: any, index: number) => (
													<div key={index} className="bg-slate-50 dark:bg-slate-700 p-3 rounded-md">
														<div className="font-medium">{beneficiaire.prenom} {beneficiaire.nom}</div>
														{beneficiaire.dateNaissance && (
															<div className="text-sm text-slate-600 dark:text-slate-300">
																Date de naissance: {beneficiaire.dateNaissance}
															</div>
														)}
													</div>
												))}
											</div>
										</div>
									)}
								</div>

								{/* Souscripteur et Déclarant */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
									{(souscripteurNom || souscripteurPrenom) && (
										<div>
											<h4 className="font-medium mb-3">Souscripteur</h4>
											<div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-md">
												<div className="font-medium">{souscripteurPrenom} {souscripteurNom}</div>
												{data?.souscripteur_date_naissance && (
													<div className="text-sm text-slate-600 dark:text-slate-300">
														Date de naissance: {data.souscripteur_date_naissance}
													</div>
												)}
											</div>
										</div>
									)}

									{(declarantNom || declarantPrenom) && (
										<div>
											<h4 className="font-medium mb-3">Déclarant</h4>
											<div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-md">
												<div className="font-medium">{declarantPrenom} {declarantNom}</div>
												{data?.declarant_date_naissance && (
													<div className="text-sm text-slate-600 dark:text-slate-300">
														Date de naissance: {data.declarant_date_naissance}
													</div>
												)}
											</div>
										</div>
									)}
								</div>
							</div>

							{/* Informations supplémentaires */}
							{data && (
								<div className="mt-8">
									<h3 className="text-lg font-medium mb-4">Informations supplémentaires</h3>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										{data.date_sinistre && (
											<div>
												<span className="text-sm text-slate-600 dark:text-slate-300">Date du sinistre:</span>
												<div className="font-medium">{new Date(data.date_sinistre).toLocaleDateString('fr-FR')}</div>
											</div>
										)}
										{data.lieu_sinistre && (
											<div>
												<span className="text-sm text-slate-600 dark:text-slate-300">Lieu du sinistre:</span>
												<div className="font-medium">{data.lieu_sinistre}</div>
											</div>
										)}
										{data.date_declaration && (
											<div>
												<span className="text-sm text-slate-600 dark:text-slate-300">Date de déclaration:</span>
												<div className="font-medium">{data.date_declaration}</div>
											</div>
										)}
										{data.lieu_declaration && (
											<div>
												<span className="text-sm text-slate-600 dark:text-slate-300">Lieu de déclaration:</span>
												<div className="font-medium">{data.lieu_declaration}</div>
											</div>
										)}
									</div>
									{data.zones_ombre && (
										<div className="mt-4">
											<span className="text-sm text-slate-600 dark:text-slate-300">Zones d'ombre:</span>
											<div className="mt-1 p-3 bg-slate-50 dark:bg-slate-700 rounded-md">
												{data.zones_ombre}
											</div>
										</div>
									)}
								</div>
							)}

							{/* Fichiers attachés */}
							<div className="mt-8">
								<h3 className="text-lg font-medium mb-4">📎 Fichiers attachés</h3>
								{loadingAttachments ? (
									<div className="text-center py-4">
										<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto"></div>
										<p className="text-sm text-slate-600 dark:text-slate-300 mt-2">Chargement des fichiers...</p>
									</div>
								) : attachments.length > 0 ? (
									<div className="space-y-3">
										{attachments.map((attachment) => (
											<div key={attachment.id} className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
												<div className="flex items-center justify-between">
													<div className="flex-1">
														<div className="flex items-center gap-2">
															<span className="text-lg">
																{attachment.fileType === 'pdf' && '📄'}
																{attachment.fileType === 'image' && '🖼️'}
																{attachment.fileType === 'document' && '📝'}
																{attachment.fileType === 'spreadsheet' && '📊'}
																{attachment.fileType === 'text' && '📄'}
																{attachment.fileType === 'other' && '📎'}
															</span>
															<div>
																<div className="font-medium text-sm">{attachment.fileName}</div>
																<div className="text-xs text-slate-600 dark:text-slate-300">
																	{attachment.formattedSize} • {attachment.fileType}
																	{attachment.category && ` • ${attachment.category}`}
																</div>
																{attachment.description && (
																	<div className="text-xs text-slate-500 mt-1">{attachment.description}</div>
																)}
															</div>
														</div>
													</div>
													<Button
														intent="secondary"
														size="sm"
														onClick={() => handleDownloadAttachment(attachment)}
														className="ml-3"
													>
														⬇️ Télécharger
													</Button>
												</div>
											</div>
										))}
									</div>
								) : (
									<div className="text-center py-6 bg-slate-50 dark:bg-slate-700 rounded-lg">
										<div className="text-4xl mb-2">📎</div>
										<p className="text-slate-600 dark:text-slate-300">Aucun fichier attaché à ce dossier</p>
										<p className="text-xs text-slate-500 mt-1">Les fichiers uploadés pendant la saisie apparaîtront ici</p>
									</div>
								)}
							</div>

							{/* Boutons d'action */}
							<div className="mt-8 flex justify-end gap-3">
								<Button intent="secondary" onClick={() => setShowDetails(false)}>
									Fermer
								</Button>
								{canEditStatus && onEdit && (
									<Button intent="primary" onClick={() => {
										setShowDetails(false)
										onEdit()
									}}>
										Modifier le dossier
									</Button>
								)}
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	)
}
