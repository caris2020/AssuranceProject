import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '../../ui'
import { validateInvitation, useInvitation, completeUserRegistration, checkUsernameExists } from '../services/api'

const RegisterPage: React.FC = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')
    
    const [loading, setLoading] = useState(true)
    const [validating, setValidating] = useState(false)
    const [invitation, setInvitation] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)
    
    // États du formulaire
    const [formData, setFormData] = useState({
        username: '',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        password: '',
        confirmPassword: '',
        companyLogo: ''
    })
    const [logoPreview, setLogoPreview] = useState<string>('')
    
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})
    const [usernameExists, setUsernameExists] = useState(false)
    const [checkingUsername, setCheckingUsername] = useState(false)
    
    // Valider le token d'invitation au chargement
    useEffect(() => {
        if (token) {
            validateInvitationToken()
        } else {
            setError('Token d\'invitation manquant')
            setLoading(false)
        }
    }, [token])
    
    const validateInvitationToken = async () => {
        try {
            setValidating(true)
            const invitationData = await validateInvitation(token!)
            setInvitation(invitationData)
            setFormData(prev => ({
                ...prev,
                username: invitationData.email.split('@')[0] // Username par défaut basé sur l'email
            }))
        } catch (error) {
            setError('Token d\'invitation invalide ou expiré')
        } finally {
            setValidating(false)
            setLoading(false)
        }
    }
    
    // Vérifier si le username existe
    useEffect(() => {
        if (formData.username && formData.username.length >= 3) {
            const timeoutId = setTimeout(() => {
                checkUsername()
            }, 500)
            
            return () => clearTimeout(timeoutId)
        } else {
            setUsernameExists(false)
        }
    }, [formData.username])
    
    const checkUsername = async () => {
        try {
            setCheckingUsername(true)
            const exists = await checkUsernameExists(formData.username)
            setUsernameExists(exists)
        } catch (error) {
            console.error('Erreur lors de la vérification du username:', error)
        } finally {
            setCheckingUsername(false)
        }
    }
    
    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        
        // Effacer l'erreur du champ modifié
        if (formErrors[field]) {
            setFormErrors(prev => ({ ...prev, [field]: '' }))
        }
    }

    const handleLogoFileChange = (file?: File | null) => {
        if (!file) {
            setFormData(prev => ({ ...prev, companyLogo: '' }))
            setLogoPreview('')
            return
        }
        const reader = new FileReader()
        reader.onload = () => {
            const base64 = typeof reader.result === 'string' ? reader.result : ''
            setFormData(prev => ({ ...prev, companyLogo: base64 }))
            setLogoPreview(base64)
        }
        reader.readAsDataURL(file)
    }
    
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {}
        
        if (!formData.username.trim()) {
            errors.username = 'Le nom d\'utilisateur est requis'
        } else if (formData.username.length < 3) {
            errors.username = 'Le nom d\'utilisateur doit contenir au moins 3 caractères'
        } else if (usernameExists) {
            errors.username = 'Ce nom d\'utilisateur existe déjà'
        }
        
        if (!formData.firstName.trim()) {
            errors.firstName = 'Le prénom est requis'
        }
        
        if (!formData.lastName.trim()) {
            errors.lastName = 'Le nom est requis'
        }
        
        if (!formData.dateOfBirth) {
            errors.dateOfBirth = 'La date de naissance est requise'
        } else {
            const birthDate = new Date(formData.dateOfBirth)
            const today = new Date()
            const age = today.getFullYear() - birthDate.getFullYear()
            if (age < 18) {
                errors.dateOfBirth = 'Vous devez avoir au moins 18 ans'
            }
        }
        
        if (!formData.password) {
            errors.password = 'Le mot de passe est requis'
        } else if (formData.password.length < 8) {
            errors.password = 'Le mot de passe doit contenir au moins 8 caractères'
        }
        
        if (!formData.confirmPassword) {
            errors.confirmPassword = 'La confirmation du mot de passe est requise'
        } else if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Les mots de passe ne correspondent pas'
        }
        
        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!validateForm()) {
            return
        }
        
        try {
            setValidating(true)
            
            // Marquer l'invitation comme utilisée
            await useInvitation(token!)
            
            // Finaliser l'inscription
            await completeUserRegistration({
                email: invitation.email,
                username: formData.username,
                firstName: formData.firstName,
                lastName: formData.lastName,
                dateOfBirth: formData.dateOfBirth,
                password: formData.password,
                companyLogo: formData.companyLogo || undefined
            })
            
            // Rediriger vers la page de connexion
            navigate('/login?registered=true')
            
        } catch (error: any) {
            setError(error.message || 'Erreur lors de l\'inscription')
        } finally {
            setValidating(false)
        }
    }
    
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">
                        {validating ? 'Validation de l\'invitation...' : 'Chargement...'}
                    </p>
                </div>
            </div>
        )
    }
    
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <div className="text-center">
                        <div className="text-red-500 text-6xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Erreur d'invitation
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            {error}
                        </p>
                        <Button onClick={() => navigate('/login')}>
                            Retour à la connexion
                        </Button>
                    </div>
                </div>
            </div>
        )
    }
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                        Finaliser votre inscription
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                        Compagnie: <span className="font-semibold">{invitation?.insuranceCompany}</span>
                    </p>
                </div>
                
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {/* Nom d'utilisateur */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Nom d'utilisateur
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    value={formData.username}
                                    onChange={(e) => handleInputChange('username', e.target.value)}
                                    className={`appearance-none relative block w-full px-3 py-2 border ${
                                        formErrors.username || usernameExists 
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-1 sm:text-sm`}
                                    placeholder="Nom d'utilisateur"
                                />
                                {checkingUsername && (
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                    </div>
                                )}
                            </div>
                            {formErrors.username && (
                                <p className="mt-1 text-sm text-red-600">{formErrors.username}</p>
                            )}
                            {usernameExists && !formErrors.username && (
                                <p className="mt-1 text-sm text-red-600">Ce nom d'utilisateur existe déjà</p>
                            )}
                        </div>
                        
                        {/* Prénom et Nom */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Prénom
                                </label>
                                <input
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    required
                                    value={formData.firstName}
                                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                                    className={`mt-1 block w-full px-3 py-2 border ${
                                        formErrors.firstName 
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-1 sm:text-sm`}
                                    placeholder="Prénom"
                                />
                                {formErrors.firstName && (
                                    <p className="mt-1 text-sm text-red-600">{formErrors.firstName}</p>
                                )}
                            </div>
                            
                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Nom
                                </label>
                                <input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    required
                                    value={formData.lastName}
                                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                                    className={`mt-1 block w-full px-3 py-2 border ${
                                        formErrors.lastName 
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-1 sm:text-sm`}
                                    placeholder="Nom"
                                />
                                {formErrors.lastName && (
                                    <p className="mt-1 text-sm text-red-600">{formErrors.lastName}</p>
                                )}
                            </div>
                        </div>
                        
                        {/* Date de naissance */}
                        <div>
                            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Date de naissance
                            </label>
                            <input
                                id="dateOfBirth"
                                name="dateOfBirth"
                                type="date"
                                required
                                value={formData.dateOfBirth}
                                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                                className={`mt-1 block w-full px-3 py-2 border ${
                                    formErrors.dateOfBirth 
                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-1 sm:text-sm`}
                            />
                            {formErrors.dateOfBirth && (
                                <p className="mt-1 text-sm text-red-600">{formErrors.dateOfBirth}</p>
                            )}
                        </div>
                        
                        {/* Logo de compagnie (optionnel) */}
                        <div>
                            <label htmlFor="companyLogo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Logo de compagnie (optionnel)
                            </label>
                            <div className="mt-1 flex items-center gap-3">
                                <input
                                    id="companyLogo"
                                    name="companyLogo"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleLogoFileChange(e.target.files?.[0])}
                                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-md cursor-pointer focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                                {logoPreview && (
                                    <img src={logoPreview} alt="Aperçu logo" className="h-10 w-10 rounded border border-gray-200 object-contain bg-white" />
                                )}
                            </div>
                            <p className="mt-1 text-xs text-gray-500">Formats acceptés: PNG, JPG. Le logo sera affiché dans la barre du haut.</p>
                        </div>
                        
                        {/* Mot de passe */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Mot de passe
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={(e) => handleInputChange('password', e.target.value)}
                                className={`mt-1 block w-full px-3 py-2 border ${
                                    formErrors.password 
                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-1 sm:text-sm`}
                                placeholder="Mot de passe"
                            />
                            {formErrors.password && (
                                <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                            )}
                        </div>
                        
                        {/* Confirmation du mot de passe */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Confirmer le mot de passe
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                value={formData.confirmPassword}
                                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                className={`mt-1 block w-full px-3 py-2 border ${
                                    formErrors.confirmPassword 
                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-1 sm:text-sm`}
                                placeholder="Confirmer le mot de passe"
                            />
                            {formErrors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
                            )}
                        </div>
                    </div>
                    
                    <div>
                        <Button
                            type="submit"
                            disabled={validating || usernameExists || checkingUsername}
                            className="w-full"
                        >
                            {validating ? 'Finalisation...' : 'Finaliser l\'inscription'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default RegisterPage
