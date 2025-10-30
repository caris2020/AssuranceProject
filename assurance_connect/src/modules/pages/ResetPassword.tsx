import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '../../ui'

const ResetPasswordPage: React.FC = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')
    
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [validating, setValidating] = useState(true)
    const [tokenValid, setTokenValid] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    useEffect(() => {
        if (!token) {
            setMessage({ type: 'error', text: 'Token de réinitialisation manquant' })
            setValidating(false)
            return
        }

        // Vérifier la validité du token
        const verifyToken = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/password-reset/verify/${token}`)
                const data = await response.json()
                
                if (data.valid) {
                    setTokenValid(true)
                } else {
                    setMessage({ type: 'error', text: 'Lien de réinitialisation invalide ou expiré' })
                }
            } catch (error) {
                setMessage({ type: 'error', text: 'Erreur lors de la vérification du lien' })
            } finally {
                setValidating(false)
            }
        }

        verifyToken()
    }, [token])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' })
            return
        }

        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Le mot de passe doit contenir au moins 6 caractères' })
            return
        }

        setLoading(true)
        setMessage(null)

        try {
            const response = await fetch('http://localhost:8080/api/password-reset/reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    newPassword
                })
            })

            const data = await response.json()

            if (data.success) {
                setMessage({ type: 'success', text: data.message })
                setTimeout(() => {
                    navigate('/login')
                }, 2000)
            } else {
                setMessage({ type: 'error', text: data.message })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Erreur lors de la réinitialisation du mot de passe' })
        } finally {
            setLoading(false)
        }
    }

    if (validating) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                    <p className="mt-4 text-center text-sm text-gray-600">
                        Vérification du lien de réinitialisation...
                    </p>
                </div>
            </div>
        )
    }

    if (!tokenValid) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                                <span className="text-red-600 text-xl">❌</span>
                            </div>
                            <h3 className="mt-4 text-lg font-medium text-gray-900">
                                Lien invalide
                            </h3>
                            <p className="mt-2 text-sm text-gray-500">
                                Ce lien de réinitialisation est invalide ou a expiré.
                            </p>
                            <div className="mt-6">
                                <button
                                    onClick={() => navigate('/forgot-password')}
                                    className="text-sm text-blue-600 hover:text-blue-500"
                                >
                                    Demander un nouveau lien
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-2xl">🔑</span>
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Nouveau mot de passe
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Entrez votre nouveau mot de passe
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                                Nouveau mot de passe
                            </label>
                            <div className="mt-1">
                                <input
                                    id="newPassword"
                                    name="newPassword"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Votre nouveau mot de passe"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                Confirmer le mot de passe
                            </label>
                            <div className="mt-1">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Confirmez votre nouveau mot de passe"
                                />
                            </div>
                        </div>

                        {message && (
                            <div className={`rounded-md p-4 ${
                                message.type === 'success' 
                                    ? 'bg-green-50 border border-green-200' 
                                    : 'bg-red-50 border border-red-200'
                            }`}>
                                <p className={`text-sm ${
                                    message.type === 'success' ? 'text-green-800' : 'text-red-800'
                                }`}>
                                    {message.text}
                                </p>
                            </div>
                        )}

                        <div>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
                            </Button>
                        </div>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => navigate('/login')}
                                className="text-sm text-blue-600 hover:text-blue-500"
                            >
                                Retour à la connexion
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ResetPasswordPage
