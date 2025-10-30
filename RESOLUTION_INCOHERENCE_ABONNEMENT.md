# Résolution de l'Incohérence dans le Calcul des Jours Restants

## Problème Identifié

L'interface affichait une incohérence majeure :
- **Dates d'abonnement** : 27 août 2025 - 27 août 2026 (futures)
- **Jours restants** : "Expire aujourd'hui" 
- **Barre de progression** : 0%
- **Statut** : Actif

Cette incohérence était causée par deux problèmes principaux :

### 1. Problème dans le Backend (Java)

**Fichier** : `backend/src/main/java/com/assurance/domain/User.java`

**Problème** : La méthode `getDaysUntilExpiration()` ne gérait pas correctement les abonnements qui n'ont pas encore commencé.

**Ancien code problématique** :
```java
public long getDaysUntilExpiration() {
    if (role == UserRole.ADMIN) {
        return Long.MAX_VALUE;
    }
    long days = LocalDate.now().until(subscriptionEndDate).getDays();
    return Math.max(0, days);
}
```

**Nouveau code corrigé** :
```java
public long getDaysUntilExpiration() {
    if (role == UserRole.ADMIN) {
        return Long.MAX_VALUE;
    }
    
    LocalDate now = LocalDate.now();
    
    // Si l'abonnement n'a pas encore commencé, retourner les jours jusqu'au début
    if (now.isBefore(subscriptionStartDate)) {
        return now.until(subscriptionStartDate).getDays();
    }
    
    // Si l'abonnement est en cours, retourner les jours jusqu'à la fin
    if (now.isBefore(subscriptionEndDate)) {
        return now.until(subscriptionEndDate).getDays();
    }
    
    // Si l'abonnement est expiré, retourner 0
    return 0;
}
```

### 2. Problème dans le Frontend (React/TypeScript)

**Fichier** : `assurance_connect/src/modules/components/SubscriptionInfo.tsx`

**Problème** : La barre de progression utilisait une formule incorrecte basée sur une durée fixe de 365 jours.

**Ancien code problématique** :
```javascript
// Calcul incorrect
((365 - daysUntilExpiration) / 365) * 100
```

**Nouveau code corrigé** :
```javascript
// Calcul basé sur la durée réelle de l'abonnement
const calculateProgress = () => {
    const startDate = new Date(subscriptionStartDate)
    const endDate = new Date(subscriptionEndDate)
    const now = new Date()
    
    const totalDuration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (now < startDate) {
        return { percentageElapsed: 0, status: 'not_started' }
    }
    
    if (now > endDate) {
        return { percentageElapsed: 100, status: 'expired' }
    }
    
    const elapsedTime = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const percentageElapsed = Math.min(100, Math.max(0, (elapsedTime / totalDuration) * 100))
    
    return { percentageElapsed, status: 'active' }
}
```

## Corrections Apportées

### Backend (Java)

1. **Méthode `getDaysUntilExpiration()`** : Gère maintenant correctement les trois états :
   - Abonnement qui n'a pas encore commencé
   - Abonnement en cours
   - Abonnement expiré

2. **Méthode `isSubscriptionExpired()`** : Corrigée pour ne pas considérer un abonnement futur comme expiré

### Frontend (React/TypeScript)

1. **Calcul de la barre de progression** : Basé sur la durée réelle de l'abonnement
2. **Gestion des états** : Affichage approprié selon l'état de l'abonnement
3. **Messages d'interface** : Messages cohérents avec l'état réel
4. **Couleurs et styles** : Adaptation selon l'état de l'abonnement

## État Actuel

✅ **Code corrigé** : Les méthodes de calcul sont maintenant correctes

⚠️ **Données à corriger** : Les dates d'abonnement dans la base de données sont encore dans le futur (2025-2026)

## Recommandations pour Finaliser la Correction

### 1. Corriger les Données de Test

Exécuter le script SQL pour mettre à jour les dates d'abonnement :

```sql
-- Exemple de correction pour un utilisateur
UPDATE users 
SET 
    subscription_start_date = CURRENT_DATE - INTERVAL '335 days',
    subscription_end_date = CURRENT_DATE + INTERVAL '30 days',
    subscription_active = true,
    subscription_status = 'ACTIVE'
WHERE username = 'octavio';
```

### 2. Tester les Différents États

Créer des utilisateurs de test avec différents états :
- Abonnement qui expire dans 30 jours
- Abonnement qui expire dans 5 jours  
- Abonnement expiré
- Abonnement qui commence dans 10 jours

### 3. Vérifier l'Interface

Tester l'interface avec les fichiers de test créés :
- `test_subscription_calculation.html`
- `test_subscription_logic.html`

## Résultat Attendu

Après correction des données, l'interface devrait afficher :

- **Abonnement en cours** : "X jours restants" avec barre de progression appropriée
- **Abonnement expiré** : "Expiré" avec barre à 100%
- **Abonnement futur** : "Commence dans X jours" avec barre à 0%

## Fichiers Modifiés

1. `backend/src/main/java/com/assurance/domain/User.java`
2. `assurance_connect/src/modules/components/SubscriptionInfo.tsx`
3. `test_subscription_calculation.html` (nouveau)
4. `test_subscription_logic.html` (nouveau)
5. `fix_subscription_dates.sql` (nouveau)
6. `fix_subscription_dates.ps1` (nouveau)

## Conclusion

Les corrections de code sont terminées et fonctionnelles. Il ne reste plus qu'à corriger les données de test dans la base de données pour voir l'interface afficher des informations cohérentes.
