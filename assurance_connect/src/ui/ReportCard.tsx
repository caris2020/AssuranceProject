import React, { useState } from 'react'
import { Button } from './primitives/Button'
import { getReportFiles, downloadReportFile, deleteReportFile, ReportFile } from '../modules/services/api'

type Props = {
	status: 'Disponible' | 'En attente' | 'Traité'
	title?: string
	createdAt?: string
	beneficiary?: string
	initiator?: string
	insured?: string
	subscriber?: string
	unavailable?: boolean
	onDownload?: () => void
	onRequestAccess?: () => void
	onDownloadWithCode?: () => void
	onRequestReport?: () => void
	onValidateCode?: () => void
	onToggleFavorite?: () => void
	isFavorite?: boolean
	caseCode?: string
	onEdit?: () => void
	onDelete?: () => void
	canEdit?: boolean
	canDelete?: boolean
	createdBy?: string
	currentUser?: string
	reportId?: number // ID du rapport pour récupérer les fichiers attachés
	ownerLogo?: string
}

export const ReportCard: React.FC<Props> = ({ status, title = 'Titre du rapport', createdAt = '—', beneficiary = '—', initiator = '—', insured = '—', subscriber = '—', unavailable, onDownload, onRequestAccess, onDownloadWithCode, onRequestReport, onValidateCode, onToggleFavorite, isFavorite, caseCode, onEdit, onDelete, canEdit = false, canDelete = false, createdBy, currentUser, reportId, ownerLogo }) => {
	const [showFiles, setShowFiles] = useState(false)
	const [files, setFiles] = useState<ReportFile[]>([])
	const [loadingFiles, setLoadingFiles] = useState(false)

	const loadFiles = async () => {
		if (!reportId || !currentUser || !createdBy || currentUser !== createdBy) {
			console.warn('Tentative d\'accès aux fichiers par un non-propriétaire')
			return
		}
		try {
			setLoadingFiles(true)
			const reportFiles = await getReportFiles(reportId)
			setFiles(reportFiles)
		} catch (error) {
			console.error('Erreur lors du chargement des fichiers attachés:', error)
			setFiles([])
		} finally {
			setLoadingFiles(false)
		}
	}

	const handleDownloadFile = async (file: ReportFile) => {
		if (!reportId) return
		try {
			await downloadReportFile(reportId, file.id, file.fileName)
		} catch (error) {
			console.error('Erreur lors du téléchargement:', error)
			alert('Erreur lors du téléchargement du fichier')
		}
	}

	const handleDeleteFile = async (file: ReportFile) => {
		if (!reportId) return
		if (!confirm('Supprimer ce fichier du rapport ?')) return
		try {
			await deleteReportFile(reportId, file.id)
			await loadFiles()
		} catch (error) {
			console.error('Erreur lors de la suppression:', error)
			alert('Erreur lors de la suppression du fichier')
		}
	}
	const badge = () => {
		switch (status) {
			case 'Disponible':
				return <span className="inline-flex items-center rounded-full bg-accent-100 text-accent-800 px-2 py-0.5 text-xs">Disponible</span>
			case 'En attente':
				return <span className="inline-flex items-center rounded-full bg-yellow-100 text-yellow-800 px-2 py-0.5 text-xs">En attente</span>
			case 'Traité':
				return <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-xs">Traité</span>
		}
	}

	return (
		<>
			<div className={`rounded-xl border ${unavailable ? 'border-slate-200 opacity-60' : 'border-slate-200'} bg-white dark:bg-slate-800 shadow hover:border-brand-200 hover:shadow-2xl transition transform duration-150 hover:-translate-y-1 hover:z-10`}>
			<div className="p-4">
				<div className="h-10 w-10 rounded-lg bg-brand-50 text-brand-700 grid place-items-center">📄</div>
				<button type="button" className="float-right text-lg" aria-label="Favori" onClick={onToggleFavorite}>{isFavorite ? '★' : '☆'}</button>
				<h3 className="mt-3 font-semibold">{title}</h3>
				<p className="text-sm text-slate-600 dark:text-slate-300">Créé le {createdAt}</p>
				{createdBy && (
					<p className="text-xs text-slate-500 mt-1">
						Par: <span className="font-medium">{createdBy}</span>
						{currentUser && createdBy === currentUser && (
							<span className="ml-2 inline-flex items-center rounded-full bg-green-100 text-green-800 px-2 py-0.5 text-xs">
								👤 Votre rapport
							</span>
						)}
					</p>
				)}
				{caseCode && (<p className="text-xs text-slate-500 mt-1">Dossier: <span className="font-mono">{caseCode}</span></p>)}
				<div className="mt-4 space-y-1 text-sm">
					<div className="flex items-center gap-2"><span>👤</span><span className="text-slate-600 dark:text-slate-300">Bénéficiaire:</span><span className="ml-auto font-medium">{beneficiary}</span></div>
					<div className="flex items-center gap-2">
						<span>📝</span>
						<span className="text-slate-600 dark:text-slate-300">Initiateur:</span>
						<span className="ml-auto font-medium text-red-600 dark:text-red-400 flex items-center gap-2">
							{ownerLogo && (
								<img src={ownerLogo} alt="Logo" className="h-5 w-5 rounded object-contain bg-white" />
							)}
							{initiator}
						</span>
					</div>
					<div className="flex items-center gap-2"><span>🏥</span><span className="text-slate-600 dark:text-slate-300">Assuré:</span><span className="ml-auto font-medium">{insured}</span></div>
					<div className="flex items-center gap-2"><span>📋</span><span className="text-slate-600 dark:text-slate-300">Souscripteur:</span><span className="ml-auto font-medium">{subscriber}</span></div>
				</div>
				<div className="mt-3 flex items-center gap-2">{badge()}</div>
                <div className="mt-4 grid grid-cols-3 gap-2">
					{/* Boutons pour les utilisateurs non-propriétaires */}
					{currentUser && createdBy && currentUser !== createdBy ? (
						<>
							{onRequestReport && (
								<Button intent="secondary" onClick={onRequestReport}>📝 Demander rapport</Button>
							)}
							{onValidateCode && (
								<Button intent="primary" onClick={onValidateCode}>🔐 Valider code</Button>
							)}
						</>
					) : currentUser && createdBy && currentUser === createdBy ? (
						/* Bouton propriétaire: un seul bouton 'Télécharger' */
						<Button intent={unavailable ? 'secondary' : 'primary'} disabled={unavailable} onClick={onDownload}>Télécharger</Button>
					) : (
						/* Pour les utilisateurs sans propriétaire défini ou autres cas */
						<>
							{onRequestReport && (
								<Button intent="secondary" onClick={onRequestReport}>📝 Demander rapport</Button>
							)}
							{onValidateCode && (
								<Button intent="primary" onClick={onValidateCode}>🔐 Valider code</Button>
							)}
						</>
					)}
					{/* Seul le propriétaire du rapport peut voir le bouton Fichiers */}
					{currentUser && createdBy && currentUser === createdBy ? (
						<Button intent="secondary" onClick={() => { setShowFiles(true); loadFiles(); }}>📎 Fichiers</Button>
                    ) : (<div className="flex items-center justify-center"><span className="text-xs text-slate-400">—</span></div>)}
				</div>
				{(canEdit || canDelete) && (
					<div className="mt-2 grid grid-cols-2 gap-2">
						{canEdit && <Button intent="secondary" size="sm" onClick={onEdit}>Modifier</Button>}
						{canDelete && <Button intent="secondary" size="sm" onClick={onDelete} className="text-red-600 hover:text-red-700">Supprimer</Button>}
					</div>
				)}
				{!canEdit && !canDelete && currentUser && createdBy && currentUser !== createdBy && (
					<div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded text-xs text-gray-600 text-center">
						👁️ Lecture seule - Rapport créé par {createdBy}
					</div>
				)}
			</div>
		</div>

		{/* Modal pour les fichiers attachés */}
		{showFiles && (
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
				<div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-lg font-semibold">📎 Fichiers attachés au rapport</h3>
						<button
							onClick={() => setShowFiles(false)}
							className="text-gray-500 hover:text-gray-700 text-xl"
						>
							×
						</button>
					</div>

					{loadingFiles ? (
						<div className="text-center py-4">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto"></div>
							<p className="text-sm text-slate-600 dark:text-slate-300 mt-2">Chargement des fichiers...</p>
						</div>
					) : (() => {
						const mainFiles = files.filter(file => 
							file.category !== 'preview' && 
							!file.description?.toLowerCase().includes('prévisualisation') &&
							!file.description?.toLowerCase().includes('preview')
						)
                        return mainFiles.length > 0 ? (
							<div className="space-y-3">
								{mainFiles.map((file) => (
									<div key={file.id} className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
										<div className="flex items-center justify-between">
											<div className="flex-1">
												<div className="flex items-center gap-2">
													<span className="text-lg">
														{file.fileType === 'pdf' && '📄'}
														{file.fileType === 'image' && '🖼️'}
														{file.fileType === 'document' && '📝'}
														{file.fileType === 'spreadsheet' && '📊'}
														{file.fileType === 'text' && '📄'}
														{file.fileType === 'other' && '📎'}
													</span>
													<div>
														<div className="font-medium text-sm">{file.fileName}</div>
														<div className="text-xs text-slate-600 dark:text-slate-300">
															{file.formattedSize} • {file.fileType}
															{file.category && file.category !== 'main' && ` • ${file.category}`}
														</div>
														{file.description && (
															<div className="text-xs text-slate-500 mt-1">{file.description}</div>
														)}
													</div>
												</div>
											</div>
											<Button
												intent="secondary"
												size="sm"
												onClick={() => handleDownloadFile(file)}
												className="ml-3"
											>
												⬇️ Télécharger
											</Button>
											<Button
												intent="secondary"
												size="sm"
												onClick={() => handleDeleteFile(file)}
												className="ml-2 bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
											>
												🗑️ Supprimer
											</Button>
										</div>
									</div>
								))}
							</div>
                        ) : (
                            <div className="text-center py-6 bg-slate-50 dark:bg-slate-700 rounded-lg">
								<div className="text-4xl mb-2">📎</div>
								<p className="text-slate-600 dark:text-slate-300">Aucun fichier de rapport attaché</p>
								<p className="text-xs text-slate-500 mt-1">Les fichiers de rapport apparaîtront ici</p>
							</div>
						)
					})()}
				</div>
			</div>
		)}
	</>
	)
}


