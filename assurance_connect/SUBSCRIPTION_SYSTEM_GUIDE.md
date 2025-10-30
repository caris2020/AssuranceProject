# Guide du Système d'Abonnement

## Vue d'ensemble

Le système d'abonnement a été implémenté pour gérer automatiquement les accès des utilisateurs à l'application Assurance Connect. Chaque utilisateur bénéficie d'un abonnement d'un an renouvelable.

## Fonctionnalités principales

### ⏰ Abonnement automatique d'un an
- **Durée** : 1 an (365 jours) à partir de la création du compte
- **Renouvellement** : Manuel par l'administrateur
- **Expiration automatique** : Désactivation automatique après expiration

### 🔄 Système de renouvellement
- **Demande utilisateur** : L'utilisateur peut demander un renouvellement
- **Approbation admin** : Seul l'administrateur peut renouveler l'abonnement
- **Statuts** : Actif, Expiré, En attente de renouvellement, Suspendu

### 📊 Surveillance automatique
- **Vérification quotidienne** : Tâche planifiée à 00:00
- **Mise à jour automatique** : Statuts mis à jour automatiquement
- **Notifications** : Alertes pour expiration proche

## Statuts d'abonnement

### 🟢 ACTIVE
- Abonnement en cours et valide
- Utilisateur peut accéder à toutes les fonctionnalités
- Date d'expiration dans le futur

### 🔴 EXPIRED
- Abonnement expiré
- Utilisateur ne peut plus accéder à l'application
- Peut demander un renouvellement

### 🟡 PENDING_RENEWAL
- Demande de renouvellement en attente
- En attente d'approbation par l'administrateur
- Utilisateur ne peut pas accéder à l'application

### ⚫ SUSPENDED
- Abonnement suspendu par l'administrateur
- Accès temporairement bloqué
- Peut être réactivé par l'administrateur

## Architecture technique

### Backend

#### Entité User (modifiée)
```java
// Nouveaux champs ajoutés
private LocalDate subscriptionStartDate = LocalDate.now();
private LocalDate subscriptionEndDate = LocalDate.now().plusYears(1);
private boolean subscriptionActive = true;
private LocalDate lastRenewalRequestDate;
private SubscriptionStatus subscriptionStatus = SubscriptionStatus.ACTIVE;
```

#### Service SubscriptionService
- `checkExpiredSubscriptions()` : Vérification quotidienne automatique
- `renewUserSubscription()` : Renouvellement d'abonnement
- `requestSubscriptionRenewal()` : Demande de renouvellement
- `getExpiredSubscriptions()` : Liste des abonnements expirés
- `getPendingRenewalSubscriptions()` : Demandes en attente
- `getSubscriptionsExpiringSoon()` : Expiration proche

#### Contrôleur SubscriptionController
- `POST /api/subscriptions/renew/{userId}` : Renouvellement (admin)
- `POST /api/subscriptions/request-renewal/{userId}` : Demande (utilisateur)
- `GET /api/subscriptions/expired` : Abonnements expirés
- `GET /api/subscriptions/pending-renewal` : Demandes en attente
- `GET /api/subscriptions/expiring-soon` : Expiration proche
- `GET /api/subscriptions/check/{userId}` : Vérification statut
- `GET /api/subscriptions/stats` : Statistiques

### Frontend

#### Composants
- `SubscriptionInfo` : Affichage des informations d'abonnement
- `SubscriptionManagement` : Gestion côté administrateur

#### Services
- `subscriptionService` : Appels API pour les abonnements

## Workflow utilisateur

### 1. Création de compte
```
Utilisateur créé → Abonnement initialisé (1 an) → Statut ACTIVE
```

### 2. Pendant l'abonnement
```
Utilisateur actif → Accès complet → Surveillance quotidienne
```

### 3. Expiration proche (30 jours)
```
Alerte utilisateur → Notification d'expiration → Possibilité de demande
```

### 4. Expiration
```
Abonnement expiré → Statut EXPIRED → Accès bloqué
```

### 5. Demande de renouvellement
```
Utilisateur demande → Statut PENDING_RENEWAL → Notification admin
```

### 6. Renouvellement
```
Admin approuve → Nouvel abonnement (1 an) → Statut ACTIVE
```

## Workflow administrateur

### 1. Surveillance
- Consultation des abonnements expirés
- Vérification des demandes de renouvellement
- Suivi des expirations proches

### 2. Gestion
- Renouvellement des abonnements
- Approbation des demandes
- Suspension si nécessaire

### 3. Statistiques
- Nombre d'abonnements expirés
- Demandes en attente
- Expirations proches

## Configuration

### Tâches planifiées
```java
@Scheduled(cron = "0 0 0 * * ?") // Quotidien à 00:00
public void checkExpiredSubscriptions()
```

### Durées configurables
- **Durée d'abonnement** : 1 an (365 jours)
- **Alerte expiration** : 30 jours avant
- **Vérification** : Quotidienne

## Interface utilisateur

### Pour l'utilisateur
- **Dashboard** : Affichage du temps restant
- **Profil** : Informations détaillées d'abonnement
- **Alertes** : Notifications d'expiration proche
- **Demande** : Bouton de demande de renouvellement

### Pour l'administrateur
- **Gestion** : Interface de gestion des abonnements
- **Onglets** : Expirés, En attente, Expiration proche
- **Actions** : Renouvellement, approbation
- **Statistiques** : Vue d'ensemble

## Sécurité

### Contrôles d'accès
- **Vérification automatique** : À chaque connexion
- **Blocage automatique** : Si abonnement expiré
- **Permissions** : Seul l'admin peut renouveler

### Validation
- **Dates** : Validation des dates d'abonnement
- **Statuts** : Vérification des statuts valides
- **Permissions** : Contrôle des droits d'action

## Tests recommandés

### Tests fonctionnels
1. **Création d'utilisateur** : Vérifier l'initialisation de l'abonnement
2. **Expiration** : Tester l'expiration automatique
3. **Renouvellement** : Tester le processus de renouvellement
4. **Demande** : Tester les demandes de renouvellement

### Tests d'intégration
1. **API** : Tester tous les endpoints
2. **Interface** : Tester les composants frontend
3. **Workflow** : Tester les scénarios complets

### Tests de performance
1. **Tâches planifiées** : Vérifier l'exécution quotidienne
2. **Base de données** : Tester les requêtes
3. **Interface** : Tester la réactivité

## Maintenance

### Surveillance
- **Logs** : Surveiller les tâches planifiées
- **Erreurs** : Vérifier les échecs de renouvellement
- **Performance** : Optimiser les requêtes

### Sauvegarde
- **Données** : Sauvegarder les informations d'abonnement
- **Configuration** : Sauvegarder les paramètres
- **Logs** : Conserver les logs d'activité

## Support

En cas de problème avec le système d'abonnement :

1. **Vérifier les logs** : Rechercher les erreurs
2. **Contrôler les tâches** : Vérifier l'exécution des tâches planifiées
3. **Tester les API** : Vérifier les endpoints
4. **Consulter la base** : Vérifier les données d'abonnement

## Évolutions futures

### Fonctionnalités possibles
- **Renouvellement automatique** : Avec paiement
- **Durées flexibles** : Abonnements de différentes durées
- **Notifications** : Emails/SMS d'alerte
- **Historique** : Suivi des renouvellements
- **Rapports** : Statistiques avancées
