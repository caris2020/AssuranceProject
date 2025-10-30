import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Button } from '../../ui'
import { useAuth } from '../state/AuthState'

const LoginPage: React.FC = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { login } = useAuth()
    
    const [formData, setFormData] = useState({
        username: '',
        insuranceCompany: '',
        password: ''
    })
    
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    
    // Afficher le message de succès si l'utilisateur vient de s'inscrire
    useEffect(() => {
        if (searchParams.get('registered') === 'true') {
            setSuccess('Inscription réussie ! Vous pouvez maintenant vous connecter.')
        }
    }, [searchParams])
    
    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        // Effacer les messages d'erreur quand l'utilisateur tape
        if (error) setError(null)
    }
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!formData.username || !formData.insuranceCompany || !formData.password) {
            setError('Veuillez remplir tous les champs')
            return
        }
        
        try {
            setLoading(true)
            setError(null)
            
            const success = await login(formData.username, formData.insuranceCompany, formData.password)
            
            if (success) {
                // Rediriger vers le tableau de bord
                navigate('/')
            } else {
                setError('Identifiants incorrects. Veuillez vérifier vos informations.')
            }
            
        } catch (error: any) {
            setError(error.message || 'Erreur lors de la connexion')
        } finally {
            setLoading(false)
        }
    }
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                        Connexion
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                        Accédez à votre espace d'assurance
                    </p>
                </div>
                
                {success && (
                    <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-md p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-green-800 dark:text-green-200">{success}</p>
                            </div>
                        </div>
                    </div>
                )}
                
                {error && (
                    <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                            </div>
                        </div>
                    </div>
                )}
                
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="insuranceCompany" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Compagnie d'assurance
                            </label>
                            <input
                                id="insuranceCompany"
                                name="insuranceCompany"
                                type="text"
                                required
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-700"
                                placeholder="Ex: AXA, Allianz, etc."
                                value={formData.insuranceCompany}
                                onChange={(e) => handleInputChange('insuranceCompany', e.target.value)}
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Nom d'utilisateur
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-700"
                                placeholder="Votre nom d'utilisateur"
                                value={formData.username}
                                onChange={(e) => handleInputChange('username', e.target.value)}
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Mot de passe
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-700"
                                placeholder="Votre mot de passe"
                                value={formData.password}
                                onChange={(e) => handleInputChange('password', e.target.value)}
                            />
                            <div className="mt-1 text-right">
                                <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400">
                                    Mot de passe oublié ?
                                </Link>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {loading ? 'Connexion...' : 'Se connecter'}
                        </Button>
                    </div>
                    
                    <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Pas encore de compte ?{' '}
                            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                                S'inscrire
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default LoginPage
