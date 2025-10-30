# Guide de Déconnexion Automatique

## Vue d'ensemble

Le système de déconnexion automatique a été implémenté pour améliorer la sécurité de l'application Assurance Connect. Il déconnecte automatiquement les utilisateurs après 1 minute d'inactivité.

## Fonctionnalités

### ⏰ Déconnexion automatique
- **Délai d'inactivité** : 1 minute (60 secondes)
- **Déconnexion automatique** : L'utilisateur est déconnecté automatiquement après le délai

### ⚠️ Système d'alerte
- **Alerte préventive** : Affichée 30 secondes avant la déconnexion
- **Compte à rebours** : Affichage du temps restant en temps réel
- **Options utilisateur** : Possibilité de rester connecté ou de se déconnecter manuellement

### 🎯 Détection d'activité
Le système surveille les événements suivants :
- Clics de souris (`mousedown`, `click`)
- Mouvements de souris (`mousemove`)
- Frappe au clavier (`keypress`)
- Défilement (`scroll`)
- Touchers sur écran tactile (`touchstart`)

## Composants implémentés

### 1. Hook `useAutoLogout`
```typescript
const { timeRemaining, showWarning, extendSession, logout } = useAutoLogout()
```

**Propriétés retournées :**
- `timeRemaining` : Temps restant avant déconnexion (en millisecondes)
- `showWarning` : Booléen indiquant si l'alerte doit être affichée
- `extendSession` : Fonction pour prolonger la session
- `logout` : Fonction pour se déconnecter manuellement

### 2. Composant `AutoLogoutAlert`
Affiche une alerte en haut à droite de l'écran avec :
- Compte à rebours en temps réel
- Bouton "Rester connecté"
- Bouton "Déconnexion"

### 3. Composant `SessionTimer`
Affiche un timer dans la barre de navigation avec :
- Icône d'horloge
- Compte à rebours formaté (MM:SS)
- Couleurs changeantes selon le temps restant :
  - 🟡 Jaune : 30-20 secondes
  - 🟠 Orange : 20-10 secondes  
  - 🔴 Rouge : Moins de 10 secondes

## Configuration

### Fichier de configuration : `src/modules/config/autoLogout.ts`

```typescript
export const AUTO_LOGOUT_CONFIG = {
  INACTIVITY_TIMEOUT: 60000,    // 1 minute
  WARNING_TIME: 30000,          // 30 secondes
  ACTIVITY_EVENTS: [...],       // Événements surveillés
  MESSAGES: {                   // Messages personnalisables
    WARNING_TITLE: 'Déconnexion automatique',
    WARNING_TEXT: 'Vous serez déconnecté automatiquement...',
    EXTEND_BUTTON: 'Rester connecté',
    LOGOUT_BUTTON: 'Déconnexion'
  }
}
```

## Personnalisation

### Modifier le délai d'inactivité
```typescript
// Dans autoLogout.ts
INACTIVITY_TIMEOUT: 120000, // 2 minutes
```

### Modifier le délai d'alerte
```typescript
// Dans autoLogout.ts
WARNING_TIME: 45000, // 45 secondes avant déconnexion
```

### Ajouter des événements de surveillance
```typescript
// Dans autoLogout.ts
ACTIVITY_EVENTS: [
  'mousedown',
  'mousemove',
  'keypress',
  'scroll',
  'touchstart',
  'click',
  'focus',     // Nouvel événement
  'blur'       // Nouvel événement
]
```

## Intégration dans l'application

### Dans App.tsx
```typescript
const AppContent: React.FC = () => {
  const { timeRemaining, showWarning, extendSession } = useAutoLogout()
  
  return (
    <div>
      {/* Alerte de déconnexion */}
      {showWarning && (
        <AutoLogoutAlert
          timeRemaining={timeRemaining}
          onExtend={extendSession}
          onLogout={logout}
        />
      )}
      
      {/* Timer dans la navigation */}
      <SessionTimer timeRemaining={timeRemaining} showWarning={showWarning} />
    </div>
  )
}
```

## Comportement utilisateur

### Scénario normal
1. L'utilisateur se connecte
2. Après 30 secondes d'inactivité, l'alerte apparaît
3. Le timer affiche le compte à rebours
4. L'utilisateur peut :
   - Cliquer "Rester connecté" pour prolonger la session
   - Cliquer "Déconnexion" pour se déconnecter immédiatement
   - Attendre la déconnexion automatique

### Réinitialisation automatique
- Toute activité utilisateur réinitialise le timer
- L'alerte disparaît automatiquement
- Le processus recommence

## Sécurité

### Avantages
- ✅ Protection contre les sessions oubliées
- ✅ Réduction des risques de sécurité
- ✅ Conformité aux bonnes pratiques
- ✅ Expérience utilisateur transparente

### Gestion des cas particuliers
- Les timers sont nettoyés lors de la déconnexion
- Les écouteurs d'événements sont supprimés proprement
- Pas d'interférence avec les autres fonctionnalités

## Tests recommandés

1. **Test d'inactivité** : Laisser l'application inactive pendant 1 minute
2. **Test d'activité** : Interagir avec l'application pour vérifier la réinitialisation
3. **Test d'alerte** : Vérifier l'apparition de l'alerte à 30 secondes
4. **Test de prolongation** : Cliquer "Rester connecté" pour vérifier la réinitialisation
5. **Test de déconnexion manuelle** : Cliquer "Déconnexion" pour vérifier la déconnexion immédiate

## Support technique

En cas de problème ou de question concernant le système de déconnexion automatique, consultez :
- Les logs de la console pour les messages de déconnexion
- La configuration dans `autoLogout.ts`
- L'implémentation dans `useAutoLogout.ts`
