# Guide de Test - Système de Demandes d'Accès

## Problème identifié
Les utilisateurs ne reçoivent pas les demandes d'accès par email ni dans la plateforme.

## Solutions implémentées

### 1. Correction du backend
- ✅ **AccessRequestService** : Correction de `getPendingRequestsForOwner()` pour filtrer par propriétaire
- ✅ **AccessRequestRepository** : Utilisation de la méthode existante `findPendingRequestsForOwner()`
- ✅ **NotificationService** : Ajout de logs de debug pour tracer les notifications
- ✅ **AccessRequestController** : Ajout d'endpoint de test

### 2. Correction du frontend
- ✅ **Reports.tsx** : Ajout de logs de debug dans `loadOwnerRequests()`
- ✅ **API** : Utilisation correcte de `getPendingAccessRequestsForOwner()`

## Tests à effectuer

### Test 1 : Vérifier la création de demande d'accès
```bash
# Créer une demande d'accès de test
curl -X POST http://localhost:8080/api/access-requests/test/create
```

### Test 2 : Vérifier la récupération des demandes
```bash
# Récupérer les demandes en attente pour un propriétaire
curl "http://localhost:8080/api/access-requests/owner/admin/pending"
```

### Test 3 : Vérifier les logs de notification
Regarder les logs du backend pour voir :
```
🔔 NOTIFICATION: Envoi de notification au propriétaire pour la demande X
   - Rapport: [titre]
   - Demandeur: [nom]
   - Email: [email]
   - Propriétaire trouvé: [ownerId]
✅ NOTIFICATION: Notification envoyée avec succès
```

### Test 4 : Test dans l'interface
1. Ouvrir la page des rapports
2. Cliquer sur "🔐 Demandes d'accès"
3. Vérifier que la modal s'ouvre
4. Vérifier les logs dans la console du navigateur

## Problèmes potentiels restants

### 1. Services de notification non configurés
- **EmailService** : Peut ne pas être configuré pour envoyer de vrais emails
- **SmsService** : Peut ne pas être configuré pour envoyer de vrais SMS
- **InAppNotificationService** : Peut ne pas être correctement implémenté

### 2. Base de données
- Vérifier que les tables `access_request` et `report` existent
- Vérifier que les relations sont correctes

### 3. Permissions
- Vérifier que l'utilisateur a les bonnes permissions pour voir les demandes

## Commandes de debug

### Vérifier les tables en base
```sql
-- Vérifier les demandes d'accès
SELECT * FROM access_request ORDER BY requested_at DESC LIMIT 10;

-- Vérifier les rapports
SELECT id, title, created_by FROM report ORDER BY created_at DESC LIMIT 10;

-- Vérifier les demandes pour un propriétaire
SELECT ar.* FROM access_request ar 
JOIN report r ON ar.report_id = r.id 
WHERE r.created_by = 'admin' 
AND ar.status = 'PENDING';
```

### Vérifier les logs du backend
```bash
# Suivre les logs en temps réel
tail -f logs/application.log | grep -i "notification\|access"
```

## Prochaines étapes

1. **Tester la création** de demandes d'accès
2. **Vérifier les logs** de notification
3. **Configurer les services** de notification si nécessaire
4. **Tester l'interface** utilisateur
5. **Corriger les problèmes** identifiés
