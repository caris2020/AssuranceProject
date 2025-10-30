import React, { useState } from 'react'
import { useAuth } from '../state/AuthState'
import { createReportRequest } from '../services/api'
import { Button } from '../../ui'

interface ReportRequestModalProps {
  isOpen: boolean
  onClose: () => void
  reportId: number
  reportTitle: string
  onSuccess?: () => void
}

export const ReportRequestModal: React.FC<ReportRequestModalProps> = ({
  isOpen,
  onClose,
  reportId,
  reportTitle,
  onSuccess
}) => {
  const { user } = useAuth()
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user?.name || !user?.email || !user?.insuranceCompany) {
      setError('Informations utilisateur manquantes')
      return
    }

    if (!reason.trim()) {
      setError('Veuillez indiquer le motif de votre demande')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await createReportRequest({
        reportId,
        reportTitle,
        requesterId: user.name,
        requesterName: user.name,
        requesterEmail: user.email,
        requesterCompany: user.insuranceCompany,
        requesterPhone: user.phone || '',
        reason: reason.trim()
      })

      // Réinitialiser le formulaire
      setReason('')
      setLoading(false)
      
      // Fermer la modal et notifier le succès
      onClose()
      if (onSuccess) {
        onSuccess()
      }
      
      // Afficher un message de succès
      alert('Votre demande de rapport a été envoyée avec succès ! Vous recevrez une notification dès qu\'elle sera traitée.')
      
    } catch (error) {
      setLoading(false)
      setError('Erreur lors de l\'envoi de la demande. Veuillez réessayer.')
      console.error('Erreur création demande de rapport:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Demande de rapport</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rapport demandé
            </label>
            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
              {reportTitle}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Votre nom
            </label>
            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
              {user?.name}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Votre compagnie
            </label>
            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
              {user?.insuranceCompany}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Votre email
            </label>
            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
              {user?.email}
            </div>
          </div>

          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
              Motif de la demande *
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Expliquez pourquoi vous avez besoin de ce rapport..."
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Envoi...' : 'Envoyer la demande'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
