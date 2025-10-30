// Script pour forcer le rafraîchissement des données d'abonnement
// À exécuter dans la console du navigateur

console.log('Forçage du rafraîchissement des données d\'abonnement...');

// 1. Supprimer les données utilisateur du localStorage
localStorage.removeItem('assurance_user');
console.log('✅ Données utilisateur supprimées du localStorage');

// 2. Recharger la page pour forcer la reconnexion
console.log('🔄 Rechargement de la page...');
window.location.reload();
