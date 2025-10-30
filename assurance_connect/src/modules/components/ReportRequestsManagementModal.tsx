import React, { useState, useEffect } from 'react'
import { useAuth } from '../state/AuthState'
import { getPendingReportRequestsForOwner, approveReportRequest, rejectReportRequest } from '../services/api'
import { ReportRequestDto } from '../services/api'
import { Button } from '../../ui'

interface ReportRequestsManagementModalProps {
  isOpen: boolean
  onClose: () => void
  onRefresh?: () => void
}

export const ReportRequestsManagementModal: React.FC<ReportRequestsManagementModalProps> = ({
  isOpen,
  onClose,
  onRefresh
}) => {
  const { user } = useAuth()
  const [requests, setRequests] = useState<ReportRequestDto[]>([])
  const [loading, setLoading] = useState(false)
  const [processingRequest, setProcessingRequest] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadRequests = async () => {
    if (!user?.name) return

    setLoading(true)
    setError(null)

    try {
      const pendingRequests = await getPendingReportRequestsForOwner(user.name)
      setRequests(pendingRequests)
    } catch (error) {
      setError('Erreur lors du chargement des demandes')
      console.error('Erreur chargement demandes:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadRequests()
    }
  }, [isOpen, user?.name])

  const handleApprove = async (requestId: number) => {
    if (!user?.name) return

    setProcessingRequest(requestId)
    setError(null)

    try {
      await approveReportRequest(requestId, user.name)
      
      // Recharger les demandes
      await loadRequests()
      
      // Notifier le parent
      if (onRefresh) {
        onRefresh()
      }
      
      alert('Demande approuvée ! Un code de validation a été envoyé au demandeur.')
      
    } catch (error) {
      setError('Erreur lors de l\'approbation de la demande')
      console.error('Erreur approbation:', error)
    } finally {
      setProcessingRequest(null)
    }
  }

  const handleReject = async (requestId: number) => {
    if (!user?.name) return

    if (!confirm('Êtes-vous sûr de vouloir rejeter cette demande ?')) {
      return
    }

    setProcessingRequest(requestId)
    setError(null)

    try {
      await rejectReportRequest(requestId, user.name)
      
      // Recharger les demandes
      await loadRequests()
      
      // Notifier le parent
      if (onRefresh) {
        onRefresh()
      }
      
      alert('Demande rejetée.')
      
    } catch (error) {
      setError('Erreur lors du rejet de la demande')
      console.error('Erreur rejet:', error)
    } finally {
      setProcessingRequest(null)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Demandes de rapport en attente</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-2 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Chargement des demandes...</div>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Aucune demande en attente</div>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Demande pour : {request.reportTitle}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Demandeur : {request.requesterName} ({request.requesterCompany})
                    </p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {request.requestedAt}
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-sm text-gray-700">
                    <strong>Email :</strong> {request.requesterEmail}
                  </p>
                  {request.requesterPhone && (
                    <p className="text-sm text-gray-700">
                      <strong>Téléphone :</strong> {request.requesterPhone}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-700">
                    <strong>Motif :</strong>
                  </p>
                  <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded mt-1">
                    {request.reason || 'Aucun motif fourni'}
                  </p>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReject(request.id)}
                    disabled={processingRequest === request.id}
                  >
                    {processingRequest === request.id ? 'Rejet...' : 'Rejeter'}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleApprove(request.id)}
                    disabled={processingRequest === request.id}
                  >
                    {processingRequest === request.id ? 'Approbation...' : 'Approuver'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Fermer
          </Button>
        </div>
      </div>
    </div>
  )
}
