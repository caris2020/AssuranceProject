// Configuration pour la déconnexion automatique
export const AUTO_LOGOUT_CONFIG = {
	// Temps d'inactivité avant déconnexion automatique (en millisecondes)
	INACTIVITY_TIMEOUT: 180000, // 3 minutes
	
	// Temps avant d'afficher l'alerte (en millisecondes)
	WARNING_TIME: 60000, // 1 minute
	
	// Événements à surveiller pour détecter l'activité
	ACTIVITY_EVENTS: [
		'mousedown',
		'mousemove', 
		'keypress',
		'scroll',
		'touchstart',
		'click'
	] as const,
	
	// Messages d'alerte
	MESSAGES: {
		WARNING_TITLE: 'Déconnexion automatique',
		WARNING_TEXT: 'Vous serez déconnecté automatiquement en raison de l\'inactivité.',
		EXTEND_BUTTON: 'Rester connecté',
		LOGOUT_BUTTON: 'Déconnexion'
	}
} as const
