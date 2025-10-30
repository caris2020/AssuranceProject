import React, { useState } from 'react'
import { validateCodeAndDownload } from '../services/api'
import { Button } from '../../ui'

interface ValidationCodeModalProps {
  isOpen: boolean
  onClose: () => void
  reportId: number
  reportTitle: string
  onSuccess?: () => void
}

export const ValidationCodeModal: React.FC<ValidationCodeModalProps> = ({
  isOpen,
  onClose,
  reportId,
  reportTitle,
  onSuccess
}) => {
  const [validationCode, setValidationCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validationCode.trim()) {
      setError('Veuillez saisir le code de validation')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Valider le code et marquer comme téléchargée
      await validateCodeAndDownload(validationCode.trim())
      
      // Télécharger le rapport
      const downloadUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/download/${reportId}?validationCode=${validationCode.trim()}`
      
      // Ouvrir le téléchargement dans un nouvel onglet
      window.open(downloadUrl, '_blank')
      
      // Réinitialiser le formulaire
      setValidationCode('')
      setLoading(false)
      
      // Fermer la modal et notifier le succès
      onClose()
      if (onSuccess) {
        onSuccess()
      }
      
      // Afficher un message de succès
      alert('Code validé avec succès ! Le téléchargement a commencé.')
      
    } catch (error) {
      setLoading(false)
      setError('Code de validation invalide ou expiré. Veuillez vérifier votre code.')
      console.error('Erreur validation code:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Validation du code</h2>
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
              Rapport à télécharger
            </label>
            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
              {reportTitle}
            </div>
          </div>

          <div>
            <label htmlFor="validationCode" className="block text-sm font-medium text-gray-700 mb-1">
              Code de validation *
            </label>
            <input
              id="validationCode"
              type="text"
              value={validationCode}
              onChange={(e) => setValidationCode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Entrez votre code de validation"
              required
              disabled={loading}
              autoComplete="off"
            />
            <p className="text-xs text-gray-500 mt-1">
              Le code a été envoyé par email et SMS. Il expire dans 24h.
            </p>
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
              {loading ? 'Validation...' : 'Valider et télécharger'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
