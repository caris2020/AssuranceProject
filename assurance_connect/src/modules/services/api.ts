export type BackendReport = {
  id: number
  title: string
  status: 'DISPONIBLE' | 'EN_ATTENTE' | 'TRAITE'
  beneficiary?: string
  initiator?: string
  insured?: string
  subscriber?: string
  createdAt: string
  caseId?: string
  caseReference?: string
  caseCode?: string
  createdBy?: string
  ownerLogo?: string
}

export type BackendCase = {
  id: number
  reference: string
  type: 'ENQUETE' | 'FRAUDULEUX'
  status: 'SOUS_ENQUETE' | 'FRAUDULEUX' | 'PREUVE_INSUFFISANTE'
  dataJson: string
  createdAt: string
  createdBy: string
  report?: BackendReport
}

export type CreateReportRequestDto = {
  reportId: number
  reportTitle: string
  requesterId: string
  requesterName: string
  requesterEmail: string
  requesterCompany: string
  requesterPhone?: string
  reason?: string
}

export type ReportRequestDto = {
  id: number
  reportId: number
  reportTitle: string
  requesterId: string
  requesterName: string
  requesterEmail: string
  requesterCompany: string
  requesterPhone?: string
  reason?: string
  status: string
  validationCode?: string
  expiresAt?: string
  requestedAt: string
  processedAt?: string
  processedBy?: string
  downloadedAt?: string
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

export async function fetchReports(): Promise<BackendReport[]> {
  const res = await fetch(`${API_BASE}/api/reports`)
  if (!res.ok) throw new Error('Failed to load reports')
  return res.json()
}

export async function fetchCases(): Promise<BackendCase[]> {
  const res = await fetch(`${API_BASE}/api/cases`)
  if (!res.ok) throw new Error('Failed to load cases')
  return res.json()
}



export async function findCaseByReference(reference: string): Promise<BackendCase | null> {
  try {
    const res = await fetch(`${API_BASE}/api/cases/reference/${encodeURIComponent(reference)}`)
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export type CreateReportBody = {
  title: string
  status?: 'DISPONIBLE' | 'EN_ATTENTE' | 'TRAITE'
  beneficiary?: string
  initiator?: string
  insured?: string
  subscriber?: string
  caseId?: string
}

export async function createReport(body: CreateReportBody, createdBy: string, hasFile: boolean = false): Promise<BackendReport> {
  const params = new URLSearchParams()
  params.set('createdBy', createdBy)
  if (hasFile) {
    params.set('hasFile', 'true')
  }
  
  const res = await fetch(`${API_BASE}/api/reports?${params.toString()}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    let errorMessage = 'Failed to create report'
    try {
      const errorData = await res.json()
      if (errorData.error) {
        errorMessage = errorData.error
      }
    } catch {
      // Si le parsing JSON échoue, utiliser le message par défaut
    }
    const error = new Error(errorMessage)
    ;(error as any).error = errorMessage
    throw error
  }
  return res.json()
}

export async function updateReport(id: string, body: CreateReportBody): Promise<BackendReport> {
  const res = await fetch(`${API_BASE}/api/reports/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error('Failed to update report')
  return res.json()
}

export async function deleteReport(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/reports/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('Failed to delete report')
}





export async function downloadReportDemo(reportId: number, requesterName: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/download/demo/${reportId}?requesterName=${encodeURIComponent(requesterName)}`)
  if (!res.ok) throw new Error('Failed to download report')
  const blob = await res.blob()
  const disposition = res.headers.get('content-disposition') || ''
  const match = disposition.match(/filename=\"?([^\";]+)\"?/i)
  let filename = match?.[1] || `rapport_${reportId}.bin`
  const ct = res.headers.get('content-type') || blob.type || ''
  // Si l'extension est manquante/générique, déduire depuis le content-type
  if (/\.bin$/i.test(filename)) {
    if (/pdf/i.test(ct)) filename = filename.replace(/\.bin$/i, '.pdf')
    else if (/wordprocessingml\.document/i.test(ct)) filename = filename.replace(/\.bin$/i, '.docx')
    else if (/msword/i.test(ct)) filename = filename.replace(/\.bin$/i, '.doc')
    else if (/text\/plain/i.test(ct)) filename = filename.replace(/\.bin$/i, '.txt')
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export async function getReportPreviewUrl(reportId: number): Promise<{ url: string; contentType: string; filename: string }> {
  const res = await fetch(`${API_BASE}/api/download/preview/${reportId}`)
  if (!res.ok) throw new Error('Prévisualisation indisponible')
  const blob = await res.blob()
  const disposition = res.headers.get('content-disposition') || ''
  const match = disposition.match(/filename=\"?([^\";]+)\"?/i)
  const filename = match?.[1] || `rapport_${reportId}.bin`
  const url = URL.createObjectURL(blob)
  const contentType = res.headers.get('content-type') || blob.type || 'application/octet-stream'
  return { url, contentType, filename }
}

export type CreateBackendCaseBody = {
  type: 'ENQUETE' | 'FRAUDULEUX'
  status: 'SOUS_ENQUETE' | 'FRAUDULEUX' | 'PREUVE_INSUFFISANTE'
  data: Record<string, unknown>
}

export async function createCaseBackend(payload: CreateBackendCaseBody, actorName: string, reportId?: number) {
  const params = new URLSearchParams({ actorName })
  if (reportId != null) params.set('reportId', String(reportId))
  const res = await fetch(`${API_BASE}/api/cases?${params.toString()}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: payload.type,
      status: payload.status,
      dataJson: JSON.stringify(payload.data ?? {}),
    }),
  })
  if (!res.ok) {
    let detail = ''
    try { detail = await res.text() } catch {}
    throw new Error(`Échec de création du dossier (${res.status}) ${detail}`)
  }
  return res.json()
}

export async function downloadReportSecured(reportId: number, requesterName: string, code: string): Promise<void> {
  // Try secured endpoint first; if forbidden, fall back to demo endpoint for dev convenience
  let res = await fetch(`${API_BASE}/api/download/${reportId}?requesterName=${encodeURIComponent(requesterName)}&code=${encodeURIComponent(code)}`)
  if (res.status === 403) {
    // Code d'accès invalide
    throw new Error('Code d\'accès invalide ou expiré')
  }
  if (res.status === 404) {
    // Aucun fichier trouvé
    throw new Error('Aucun fichier trouvé pour ce rapport')
  }
  if (!res.ok) {
    // Fallback: demo endpoint without code checks (backend provides this for initial integration)
    res = await fetch(`${API_BASE}/api/download/demo/${reportId}?requesterName=${encodeURIComponent(requesterName)}`)
    if (!res.ok) throw new Error('Code invalide ou expiré')
  }
  const blob = await res.blob()
  const disposition = res.headers.get('content-disposition') || ''
  const match = disposition.match(/filename=\"?([^\";]+)\"?/i)
  let filename = match?.[1] || `rapport_${reportId}.bin`
  const ct = res.headers.get('content-type') || blob.type || ''
  if (/\.bin$/i.test(filename)) {
    if (/pdf/i.test(ct)) filename = filename.replace(/\.bin$/i, '.pdf')
    else if (/wordprocessingml\.document/i.test(ct)) filename = filename.replace(/\.bin$/i, '.docx')
    else if (/msword/i.test(ct)) filename = filename.replace(/\.bin$/i, '.doc')
    else if (/text\/plain/i.test(ct)) filename = filename.replace(/\.bin$/i, '.txt')
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export async function updateCaseStatus(caseId: number, newStatus: 'SOUS_ENQUETE' | 'FRAUDULEUX' | 'PREUVE_INSUFFISANTE', actorName: string) {
  const params = new URLSearchParams({ actorName })
  const res = await fetch(`${API_BASE}/api/cases/${caseId}?${params.toString()}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: newStatus,
    }),
  })
  if (!res.ok) {
    let detail = ''
    try { detail = await res.text() } catch {}
    throw new Error(`Échec de mise à jour du statut (${res.status}) ${detail}`)
  }
  return res.json()
}

export async function updateCase(caseId: number, data: Record<string, unknown>, actorName: string) {
  const params = new URLSearchParams({ actorName })
  const res = await fetch(`${API_BASE}/api/cases/${caseId}?${params.toString()}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dataJson: JSON.stringify(data),
    }),
  })
  if (!res.ok) {
    let detail = ''
    try { detail = await res.text() } catch {}
    throw new Error(`Échec de mise à jour du dossier (${res.status}) ${detail}`)
  }
  return res.json()
}

export async function fetchMyCases(actorName: string): Promise<BackendCase[]> {
  const params = new URLSearchParams({ actorName })
  const res = await fetch(`${API_BASE}/api/cases/my-cases?${params.toString()}`)
  if (!res.ok) throw new Error('Failed to load my cases')
  return res.json()
}

export async function getCasePermissions(caseId: number, actorName: string): Promise<{ canEdit: boolean; canDelete: boolean }> {
  const params = new URLSearchParams({ actorName })
  const res = await fetch(`${API_BASE}/api/cases/${caseId}/permissions?${params.toString()}`)
  if (!res.ok) throw new Error('Failed to get permissions')
  return res.json()
}

export async function deleteCase(caseId: number, actorName: string): Promise<string> {
  const params = new URLSearchParams({ actorName })
  const res = await fetch(`${API_BASE}/api/cases/${caseId}?${params.toString()}`, {
    method: 'DELETE',
  })
  if (!res.ok) {
    let detail = ''
    try { detail = await res.text() } catch {}
    throw new Error(`Échec de suppression du dossier (${res.status}) ${detail}`)
  }
  return res.text()
}

export async function getReportPermissions(reportId: number, actorName: string): Promise<{ canEdit: boolean; canDelete: boolean }> {
  const params = new URLSearchParams({ userName: actorName })
  const res = await fetch(`${API_BASE}/api/reports/${reportId}/permissions?${params.toString()}`)
  if (!res.ok) throw new Error('Failed to get report permissions')
  return res.json()
}

// Types pour les fichiers attachés aux dossiers
export type CaseAttachment = {
  id: number
  fileName: string
  contentType: string
  sizeBytes: number
  formattedSize: string
  fileType: string
  fileExtension: string
  description?: string
  category?: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
  caseId: number
}

// Types pour les fichiers attachés aux rapports
export type ReportFile = {
  id: number
  fileName: string
  contentType: string
  sizeBytes: number
  formattedSize: string
  fileType: string
  fileExtension: string
  description?: string
  category?: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
  reportId: number
}

// Récupérer les fichiers attachés à un dossier
export async function getCaseAttachments(caseId: number): Promise<CaseAttachment[]> {
  const res = await fetch(`${API_BASE}/api/files/cases/${caseId}/attachments`)
  if (!res.ok) {
    // Si l'endpoint n'existe pas encore, retourner un tableau vide
    if (res.status === 404) {
      return []
    }
    throw new Error('Failed to load case attachments')
  }
  const data = await res.json()
  return data.attachments || []
}

// Uploader un fichier attaché à un dossier
export async function uploadCaseAttachment(caseId: number, file: File, description?: string, category?: string): Promise<CaseAttachment> {
  const formData = new FormData()
  formData.append('file', file)
  if (description) formData.append('description', description)
  if (category) formData.append('category', category)
  
  const res = await fetch(`${API_BASE}/api/files/cases/${caseId}/upload`, {
    method: 'POST',
    body: formData
  })
  
  if (!res.ok) {
    let errorMessage = 'Failed to upload attachment'
    try {
      const errorData = await res.json()
      if (errorData.message) {
        errorMessage = errorData.message
      }
    } catch {
      // Si le parsing JSON échoue, utiliser le message par défaut
    }
    throw new Error(errorMessage)
  }
  
  const data = await res.json()
  return data.file
}

// Télécharger un fichier attaché à un dossier
export async function downloadCaseAttachment(caseId: number, attachmentId: number, fileName: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/files/cases/${caseId}/attachments/${attachmentId}/download`)
  if (!res.ok) throw new Error('Failed to download attachment')
  
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)
}

// Récupérer les fichiers attachés à un rapport
export async function getReportFiles(reportId: number): Promise<ReportFile[]> {
  const res = await fetch(`${API_BASE}/api/files/reports/${reportId}/files`)
  if (!res.ok) {
    if (res.status === 404) {
      return []
    }
    throw new Error('Failed to load report files')
  }
  const data = await res.json()
  return data.files || []
}

// Uploader un fichier attaché à un rapport
export async function uploadReportFile(reportId: number, file: File, description?: string, category?: string): Promise<ReportFile> {
  const formData = new FormData()
  formData.append('file', file)
  if (description) formData.append('description', description)
  if (category) formData.append('category', category)
  
  const res = await fetch(`${API_BASE}/api/files/reports/${reportId}/upload`, {
    method: 'POST',
    body: formData
  })
  
  if (!res.ok) {
    let errorMessage = 'Failed to upload report file'
    try {
      const errorData = await res.json()
      if (errorData.message) {
        errorMessage = errorData.message
      }
    } catch {
      // Si le parsing JSON échoue, utiliser le message par défaut
    }
    throw new Error(errorMessage)
  }
  
  const data = await res.json()
  return data.file
}

// Télécharger un fichier attaché à un rapport
export async function downloadReportFile(reportId: number, fileId: number, fileName: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/files/reports/${reportId}/files/${fileId}/download`)
  if (!res.ok) throw new Error('Failed to download report file')
  
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)
}

// Supprimer un fichier attaché à un rapport
export async function deleteReportFile(reportId: number, fileId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/files/reports/${reportId}/files/${fileId}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('Failed to delete report file')
}

// ===== NOUVELLES FONCTIONS POUR LES CODES D'ACCÈS =====

// Récupérer les fichiers d'un rapport avec leurs codes d'accès
export async function getReportFilesWithAccessCodes(reportId: number, requesterName: string): Promise<any[]> {
  const res = await fetch(`${API_BASE}/api/download/files/${reportId}?requesterName=${encodeURIComponent(requesterName)}`)
  if (!res.ok) {
    if (res.status === 403) {
      throw new Error('Accès refusé. Seul le propriétaire du rapport peut voir les fichiers.')
    }
    throw new Error('Failed to get report files with access codes')
  }
  return res.json()
}

// Valider un code temporaire
export async function validateAccessCode(reportId: number, code: string): Promise<{ valid: boolean; reportId: number; code: string; message: string }> {
  const res = await fetch(`${API_BASE}/api/download/validate-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reportId, code }),
  })
  if (!res.ok) throw new Error('Failed to validate access code')
  return res.json()
}

// Vérifier si un utilisateur a un code valide pour un rapport
export async function checkValidCode(userId: string, reportId: number): Promise<{ hasValidCode: boolean; code?: string; expiresAt?: string; message?: string }> {
  const res = await fetch(`${API_BASE}/api/download/check-valid-code/${userId}/${reportId}`)
  if (!res.ok) throw new Error('Failed to check valid code')
  return res.json()
}

// ===== NOUVELLES FONCTIONS POUR LES DEMANDES D'ACCÈS =====

export type CreateAccessRequestDto = {
  reportId: number
  reportTitle: string
  requesterName: string
  requesterEmail: string
  requesterCompany: string
  requesterPhone?: string
  reason?: string
}

export type AccessRequestDto = {
  id: number
  reportId: number
  reportTitle: string
  requesterId: string
  requesterName: string
  requesterEmail: string
  requesterCompany: string
  requesterPhone?: string
  reason?: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  requestedAt: string
  processedAt?: string
  processedBy?: string
  temporaryCode?: string
  expiresAt?: string
  rejectionReason?: string
}

// Créer une demande d'accès
export async function createAccessRequest(dto: CreateAccessRequestDto, requesterId: string): Promise<AccessRequestDto> {
  const res = await fetch(`${API_BASE}/api/access-requests?requesterId=${encodeURIComponent(requesterId)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  })
  if (!res.ok) throw new Error('Failed to create access request')
  return res.json()
}

// Récupérer les demandes en attente (admin)
export async function getPendingAccessRequests(): Promise<AccessRequestDto[]> {
  const res = await fetch(`${API_BASE}/api/access-requests/pending`)
  if (!res.ok) throw new Error('Failed to load pending access requests')
  return res.json()
}

// Récupérer les demandes d'un utilisateur
export async function getUserAccessRequests(userId: string): Promise<AccessRequestDto[]> {
  const res = await fetch(`${API_BASE}/api/access-requests/user/${userId}`)
  if (!res.ok) throw new Error('Failed to load user access requests')
  return res.json()
}

// Récupérer les demandes approuvées d'un utilisateur
export async function getApprovedUserAccessRequests(userId: string): Promise<AccessRequestDto[]> {
  const res = await fetch(`${API_BASE}/api/access-requests/user/${userId}/approved`)
  if (!res.ok) throw new Error('Failed to load approved user access requests')
  return res.json()
}

// Approuver une demande d'accès (admin)
export async function approveAccessRequest(requestId: number, processedBy: string): Promise<AccessRequestDto> {
  const res = await fetch(`${API_BASE}/api/access-requests/${requestId}/approve?processedBy=${encodeURIComponent(processedBy)}`, {
    method: 'POST',
  })
  if (!res.ok) throw new Error('Failed to approve access request')
  return res.json()
}

// Rejeter une demande d'accès (admin)
export async function rejectAccessRequest(requestId: number, processedBy: string, rejectionReason: string): Promise<AccessRequestDto> {
  const res = await fetch(`${API_BASE}/api/access-requests/${requestId}/reject?processedBy=${encodeURIComponent(processedBy)}&rejectionReason=${encodeURIComponent(rejectionReason)}`, {
    method: 'POST',
  })
  if (!res.ok) throw new Error('Failed to reject access request')
  return res.json()
}

// Renouveler un code d'accès expiré (admin)
export async function renewAccessCode(requestId: number, processedBy: string): Promise<AccessRequestDto> {
  const res = await fetch(`${API_BASE}/api/access-requests/${requestId}/renew?processedBy=${encodeURIComponent(processedBy)}`, {
    method: 'POST',
  })
  if (!res.ok) throw new Error('Failed to renew access code')
  return res.json()
}

// Vérifier si un utilisateur a une demande approuvée pour un rapport
export async function checkApprovedRequest(userId: string, reportId: number): Promise<AccessRequestDto | null> {
  try {
    const res = await fetch(`${API_BASE}/api/access-requests/check/${userId}/${reportId}`)
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

// Récupérer les demandes en attente pour un propriétaire de rapport
export async function getPendingAccessRequestsForOwner(ownerId: string): Promise<AccessRequestDto[]> {
  const res = await fetch(`${API_BASE}/api/access-requests/owner/${ownerId}/pending`)
  if (!res.ok) throw new Error('Failed to load pending access requests for owner')
  return res.json()
}

// Récupérer toutes les demandes pour un propriétaire de rapport
export async function getAccessRequestsForOwner(ownerId: string): Promise<AccessRequestDto[]> {
  const res = await fetch(`${API_BASE}/api/access-requests/owner/${ownerId}`)
  if (!res.ok) throw new Error('Failed to load access requests for owner')
  return res.json()
}

// Compter les demandes en attente pour un propriétaire de rapport
export async function countPendingReportRequestsForOwner(ownerId: string): Promise<number> {
  const res = await fetch(`${API_BASE}/api/report-requests/owner/${ownerId}/pending/count`)
  if (!res.ok) throw new Error('Failed to count pending report requests for owner')
  return res.json()
}

// ===== FONCTIONS DE DEMANDES DE RAPPORT =====

// Créer une demande de rapport
export async function createReportRequest(dto: CreateReportRequestDto): Promise<ReportRequestDto> {
  const res = await fetch(`${API_BASE}/api/report-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  })
  if (!res.ok) throw new Error('Failed to create report request')
  return res.json()
}

// Récupérer les demandes en attente pour un propriétaire de rapport
export async function getPendingReportRequestsForOwner(ownerId: string): Promise<ReportRequestDto[]> {
  const res = await fetch(`${API_BASE}/api/report-requests/owner/${ownerId}/pending`)
  if (!res.ok) throw new Error('Failed to load pending report requests for owner')
  return res.json()
}

// Récupérer toutes les demandes pour un propriétaire de rapport
export async function getReportRequestsForOwner(ownerId: string): Promise<ReportRequestDto[]> {
  const res = await fetch(`${API_BASE}/api/report-requests/owner/${ownerId}`)
  if (!res.ok) throw new Error('Failed to load report requests for owner')
  return res.json()
}

// Approuver une demande de rapport
export async function approveReportRequest(requestId: number, processedBy: string): Promise<ReportRequestDto> {
  const res = await fetch(`${API_BASE}/api/report-requests/${requestId}/approve?processedBy=${processedBy}`, {
    method: 'POST',
  })
  if (!res.ok) throw new Error('Failed to approve report request')
  return res.json()
}

// Rejeter une demande de rapport
export async function rejectReportRequest(requestId: number, processedBy: string): Promise<ReportRequestDto> {
  const res = await fetch(`${API_BASE}/api/report-requests/${requestId}/reject?processedBy=${processedBy}`, {
    method: 'POST',
  })
  if (!res.ok) throw new Error('Failed to reject report request')
  return res.json()
}

// Valider un code et télécharger le rapport
export async function validateCodeAndDownload(validationCode: string): Promise<ReportRequestDto> {
  const res = await fetch(`${API_BASE}/api/report-requests/validate-code?validationCode=${validationCode}`, {
    method: 'POST',
  })
  if (!res.ok) throw new Error('Failed to validate code and download')
  return res.json()
}

// ===== FONCTIONS D'ADMINISTRATION =====

// Récupérer le tableau de bord administrateur
export async function getAdminDashboard(): Promise<any> {
  const res = await fetch(`${API_BASE}/api/admin/dashboard`)
  if (!res.ok) throw new Error('Failed to load admin dashboard')
  return res.json()
}

// ===== FONCTIONS DE GESTION DES UTILISATEURS =====

// Authentifier un utilisateur
export async function loginUser(username: string, insuranceCompany: string, password: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, insuranceCompany, password }),
  })
  if (!res.ok) throw new Error('Failed to login user')
  return res.json()
}

// Déconnecter un utilisateur
export async function logoutUser(username: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/users/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username }),
  })
  if (!res.ok) throw new Error('Failed to logout user')
}

// Finaliser l'inscription d'un utilisateur invité
export async function completeUserRegistration(data: {
  email: string
  username: string
  firstName: string
  lastName: string
  dateOfBirth: string
  password: string
  companyLogo?: string
}): Promise<any> {
  const res = await fetch(`${API_BASE}/api/users/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to complete registration')
  return res.json()
}

// Vérifier si un username existe
export async function checkUsernameExists(username: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/api/users/check-username/${username}`)
  if (!res.ok) throw new Error('Failed to check username')
  return res.json()
}

// Récupérer tous les utilisateurs
export async function getAllUsers(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/api/users`)
  if (!res.ok) throw new Error('Failed to load users')
  const data = await res.json()
  // Normaliser le champ d'activité: backend envoie "active" (via getter isActive)
  // et le frontend attend "isActive". Assurer la présence de isActive.
  return Array.isArray(data)
    ? data.map((u: any) => ({ ...u, isActive: u.isActive ?? u.active ?? false }))
    : data
}

// Suppression logique d'un utilisateur (désactivation)
export async function softDeleteUser(userId: number): Promise<boolean> {
  const res = await fetch(`${API_BASE}/api/users/${userId}`, { method: 'DELETE' })
  if (!res.ok) return false
  const data = await res.json().catch(() => ({ success: true }))
  return !!data.success
}

// Récupérer les utilisateurs récents
export async function getRecentUsers(limit: number = 10): Promise<any[]> {
  const res = await fetch(`${API_BASE}/api/users/recent?limit=${limit}`)
  if (!res.ok) throw new Error('Failed to load recent users')
  return res.json()
}

// Récupérer les utilisateurs connectés récemment
export async function getRecentlyLoggedIn(hours: number = 24): Promise<any[]> {
  const res = await fetch(`${API_BASE}/api/users/recently-logged-in?hours=${hours}`)
  if (!res.ok) throw new Error('Failed to load recently logged in users')
  return res.json()
}

// Récupérer les utilisateurs déconnectés récemment
export async function getRecentlyLoggedOut(hours: number = 24): Promise<any[]> {
  const res = await fetch(`${API_BASE}/api/users/recently-logged-out?hours=${hours}`)
  if (!res.ok) throw new Error('Failed to load recently logged out users')
  return res.json()
}

// Récupérer les utilisateurs en ligne
export async function getOnlineUsers(hours: number = 2): Promise<any[]> {
  const res = await fetch(`${API_BASE}/api/users/online?hours=${hours}`)
  if (!res.ok) throw new Error('Failed to load online users')
  return res.json()
}

// Récupérer les statistiques des utilisateurs par compagnie
export async function getUsersByCompany(): Promise<Record<string, number>> {
  const res = await fetch(`${API_BASE}/api/users/stats/by-company`)
  if (!res.ok) throw new Error('Failed to load users by company stats')
  return res.json()
}

// Récupérer les statistiques générales des utilisateurs
export async function getUserStats(): Promise<any> {
  const res = await fetch(`${API_BASE}/api/users/stats`)
  if (!res.ok) throw new Error('Failed to load user stats')
  return res.json()
}

// Récupérer les compagnies d'assurance distinctes (depuis la base)
export async function getInsuranceCompanies(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/api/users/companies`)
  if (!res.ok) throw new Error('Failed to load insurance companies')
  return res.json()
}

// ===== FONCTIONS DE GESTION DES INVITATIONS =====

// Créer et envoyer une invitation
export async function createInvitation(email: string, insuranceCompany: string, invitedBy: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/invitations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, insuranceCompany, invitedBy }),
  })
  if (!res.ok) throw new Error('Failed to create invitation')
  return res.json()
}

// Valider un token d'invitation
export async function validateInvitation(token: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/invitations/validate/${token}`)
  if (!res.ok) throw new Error('Failed to validate invitation')
  return res.json()
}

// Marquer une invitation comme utilisée
export async function useInvitation(token: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/invitations/${token}/use`, {
    method: 'POST',
  })
  if (!res.ok) throw new Error('Failed to use invitation')
}

// Récupérer toutes les invitations
export async function getAllInvitations(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/api/invitations`)
  if (!res.ok) throw new Error('Failed to load invitations')
  return res.json()
}

// Récupérer les invitations en attente
export async function getPendingInvitations(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/api/invitations/pending`)
  if (!res.ok) throw new Error('Failed to load pending invitations')
  return res.json()
}

// Récupérer les invitations valides en attente
export async function getValidPendingInvitations(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/api/invitations/valid-pending`)
  if (!res.ok) throw new Error('Failed to load valid pending invitations')
  return res.json()
}

// Récupérer les invitations expirées
export async function getExpiredInvitations(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/api/invitations/expired`)
  if (!res.ok) throw new Error('Failed to load expired invitations')
  return res.json()
}

// Récupérer les invitations récentes
export async function getRecentInvitations(limit: number = 10): Promise<any[]> {
  const res = await fetch(`${API_BASE}/api/invitations/recent?limit=${limit}`)
  if (!res.ok) throw new Error('Failed to load recent invitations')
  return res.json()
}

// Annuler une invitation
export async function cancelInvitation(invitationId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/invitations/${invitationId}/cancel`, {
    method: 'POST',
  })
  if (!res.ok) throw new Error('Failed to cancel invitation')
}

// Renouveler une invitation expirée
export async function renewInvitation(invitationId: number): Promise<any> {
  const res = await fetch(`${API_BASE}/api/invitations/${invitationId}/renew`, {
    method: 'POST',
  })
  if (!res.ok) throw new Error('Failed to renew invitation')
  return res.json()
}

// Récupérer les statistiques des invitations
export async function getInvitationStats(): Promise<any> {
  const res = await fetch(`${API_BASE}/api/invitations/stats`)
  if (!res.ok) throw new Error('Failed to load invitation stats')
  return res.json()
}

// ===== FONCTIONS DE STATISTIQUES =====

// Récupérer les rapports par compagnie
export async function getReportsByCompany(): Promise<Record<string, number>> {
  const res = await fetch(`${API_BASE}/api/reports/stats/by-company`)
  if (!res.ok) throw new Error('Failed to load reports by company stats')
  return res.json()
}

// Récupérer les dossiers par statut
export async function getCasesByStatus(): Promise<Record<string, number>> {
  const res = await fetch(`${API_BASE}/api/cases/stats/by-status`)
  if (!res.ok) throw new Error('Failed to load cases by status stats')
  return res.json()
}

// Récupérer les dossiers par compagnie
export async function getCasesByCompany(): Promise<Record<string, number>> {
  const res = await fetch(`${API_BASE}/api/cases/stats/by-company`)
  if (!res.ok) throw new Error('Failed to load cases by company stats')
  return res.json()
}

// Récupérer les statistiques détaillées des rapports
export async function getReportStats(): Promise<{
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
}> {
  const res = await fetch(`${API_BASE}/api/report-stats`)
  if (!res.ok) throw new Error('Failed to load report stats')
  return res.json()
}

// Récupérer les statistiques détaillées des dossiers
export async function getCaseStats(): Promise<{
  totalCreated: number
  totalModified: number
  totalDeleted: number
  totalDownloads: number
  casesByCompany: Array<{ company: string; count: number }>
  modifiedByCompany: Array<{ company: string; count: number }>
  deletedByCompany: Array<{ company: string; count: number }>
  downloadsByCompany: Array<{ company: string; count: number }>
}> {
  const res = await fetch(`${API_BASE}/api/case-stats`)
  if (!res.ok) throw new Error('Failed to load case stats')
  return res.json()
}

// ===== FONCTIONS DE GESTION DES UTILISATEURS =====

// Activer un utilisateur
export async function activateUser(userId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/users/${userId}/activate`, {
    method: 'POST',
  })
  if (!res.ok) throw new Error('Failed to activate user')
}

// Désactiver un utilisateur
export async function deactivateUser(userId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/users/${userId}/deactivate`, {
    method: 'POST',
  })
  if (!res.ok) throw new Error('Failed to deactivate user')
}

// Basculer le statut d'un utilisateur (activer/désactiver)
export async function toggleUserStatus(userId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/users/${userId}/toggle-status`, {
    method: 'POST',
  })
  if (!res.ok) throw new Error('Failed to toggle user status')
}

// ===== FONCTIONS DE NOTIFICATIONS =====

// Récupérer toutes les notifications d'un utilisateur
export async function getUserNotifications(userId: string): Promise<any[]> {
  const res = await fetch(`${API_BASE}/api/notifications/user/${userId}`)
  if (!res.ok) throw new Error('Failed to load notifications')
  return res.json()
}

// Récupérer les notifications non lues d'un utilisateur
export async function getUnreadNotifications(userId: string): Promise<any[]> {
  const res = await fetch(`${API_BASE}/api/notifications/user/${userId}/unread`)
  if (!res.ok) throw new Error('Failed to load unread notifications')
  return res.json()
}

// Compter les notifications non lues d'un utilisateur
export async function getUnreadNotificationsCount(userId: string): Promise<number> {
  const res = await fetch(`${API_BASE}/api/notifications/user/${userId}/unread/count`)
  if (!res.ok) throw new Error('Failed to load unread notifications count')
  const data = await res.json()
  return data.count
}

// Marquer une notification comme lue
export async function markNotificationAsRead(notificationId: number, userId: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/api/notifications/${notificationId}/read?userId=${userId}`, {
    method: 'POST',
  })
  if (!res.ok) throw new Error('Failed to mark notification as read')
  const data = await res.json()
  return data.success
}

// Marquer toutes les notifications d'un utilisateur comme lues
export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/api/notifications/user/${userId}/read-all`, {
    method: 'POST',
  })
  if (!res.ok) throw new Error('Failed to mark all notifications as read')
  const data = await res.json()
  return data.success
}

// Supprimer une notification individuelle
export async function deleteNotification(notificationId: number, userId: string): Promise<boolean> {
  const url = `${API_BASE}/api/notifications/${notificationId}?userId=${userId}`
  console.log('🌐 Appel DELETE:', url)
  
  const res = await fetch(url, {
    method: 'DELETE',
  })
  
  console.log('🌐 Statut réponse:', res.status, res.statusText)
  
  if (!res.ok) {
    const errorText = await res.text()
    console.error('🌐 Erreur HTTP:', res.status, errorText)
    throw new Error(`Failed to delete notification: ${res.status} ${errorText}`)
  }
  
  const data = await res.json()
  console.log('🌐 Données reçues:', data)
  return data.success
}

// Supprimer toutes les notifications d'un utilisateur
export async function deleteAllUserNotifications(userId: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/api/notifications/user/${userId}/all`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('Failed to delete all notifications')
  const data = await res.json()
  return data.success
}

export async function getTrashedNotifications(userId: string): Promise<any[]> {
  const res = await fetch(`${API_BASE}/api/notifications/user/${userId}/trash`)
  if (!res.ok) throw new Error('Failed to load trashed notifications')
  return res.json()
}

export async function restoreNotification(notificationId: number, userId: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/api/notifications/${notificationId}/restore?userId=${encodeURIComponent(userId)}`, {
    method: 'POST'
  })
  if (!res.ok) throw new Error('Failed to restore notification')
  const data = await res.json()
  return data.success
}

export async function downloadAllReportFiles(reportId: number, ownerName: string): Promise<void> {
  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
  const url = `${base}/api/download/reports/${reportId}/all?owner=${encodeURIComponent(ownerName)}`
  const res = await fetch(url)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || 'Failed to download all report files')
  }
  const blob = await res.blob()
  const a = document.createElement('a')
  const downloadUrl = URL.createObjectURL(blob)
  a.href = downloadUrl
  a.download = `rapport_${reportId}.zip`
  document.body.appendChild(a)
  a.click()
  URL.revokeObjectURL(downloadUrl)
  document.body.removeChild(a)
}


