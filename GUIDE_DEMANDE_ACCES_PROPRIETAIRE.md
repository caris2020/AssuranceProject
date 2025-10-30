# 🔐 Guide du Système de Demande d'Accès par Propriétaire

## 📋 **Vue d'ensemble**

Le système a été modifié pour que ce soit l'**utilisateur propriétaire du rapport** qui reçoive et gère les demandes d'accès, et non plus l'administrateur. Cela rend le système plus décentralisé et efficace.

## 🔄 **Nouveau Workflow**

### **1. Demande d'Accès**
- **Utilisateur A** crée un rapport
- **Utilisateur B** voit le rapport avec le bouton "📝 Demande d'accès"
- **Utilisateur B** remplit le formulaire de demande
- **Utilisateur A** (propriétaire) reçoit la notification

### **2. Gestion par le Propriétaire**
- **Utilisateur A** clique sur "🔐 Demandes d'accès" dans la page Rapports
- **Utilisateur A** voit toutes les demandes en attente pour ses rapports
- **Utilisateur A** peut approuver ou rejeter chaque demande
- **Utilisateur B** reçoit le code temporaire ou la notification de rejet

## 🎯 **Avantages du Nouveau Système**

### **✅ Pour les Propriétaires**
- **Contrôle direct** : Gestion immédiate des demandes d'accès
- **Connaissance du contexte** : Meilleure compréhension des besoins
- **Réponse rapide** : Pas d'attente de l'administrateur
- **Responsabilité** : Contrôle total sur l'accès à leurs rapports

### **✅ Pour les Demandeurs**
- **Réponse plus rapide** : Contact direct avec le propriétaire
- **Communication directe** : Possibilité d'échange avec le propriétaire
- **Transparence** : Savoir qui gère leur demande

### **✅ Pour l'Organisation**
- **Décentralisation** : Réduction de la charge administrative
- **Efficacité** : Réponses plus rapides
- **Responsabilisation** : Chaque propriétaire gère ses rapports

## 🛠️ **Fonctionnalités Implémentées**

### **Backend**
- ✅ **Nouvelles méthodes Repository** : `findPendingRequestsForOwner()`, `findRequestsForOwner()`
- ✅ **Nouvelles méthodes Service** : `getPendingRequestsForOwner()`, `getRequestsForOwner()`
- ✅ **Nouveaux endpoints API** : `/api/access-requests/owner/{ownerId}/pending`
- ✅ **Notification au propriétaire** : `sendAccessRequestToOwner()`

### **Frontend**
- ✅ **Bouton "🔐 Demandes d'accès"** : Dans la page Rapports
- ✅ **Modal de gestion** : Interface pour approuver/rejeter
- ✅ **Nouvelles fonctions API** : `getPendingAccessRequestsForOwner()`
- ✅ **Interface utilisateur** : Affichage des demandes avec actions

## 📱 **Interface Utilisateur**

### **Pour les Propriétaires**
1. **Accès** : Bouton "🔐 Demandes d'accès" dans la page Rapports
2. **Vue** : Liste des demandes en attente avec détails
3. **Actions** : Boutons "Approuver" et "Rejeter" pour chaque demande
4. **Motif de rejet** : Champ obligatoire pour expliquer le rejet

### **Pour les Demandeurs**
1. **Demande** : Bouton "📝 Demande d'accès" sur les rapports des autres
2. **Formulaire** : Email, compagnie, téléphone, motif
3. **Suivi** : Notification de l'approbation/rejet
4. **Téléchargement** : Code temporaire pour accéder au rapport

## 🔧 **API Endpoints**

### **Nouveaux Endpoints**
```bash
# Récupérer les demandes en attente pour un propriétaire
GET /api/access-requests/owner/{ownerId}/pending

# Récupérer toutes les demandes pour un propriétaire
GET /api/access-requests/owner/{ownerId}

# Compter les demandes en attente pour un propriétaire
GET /api/access-requests/owner/{ownerId}/count/pending
```

### **Endpoints Existants (Modifiés)**
```bash
# Créer une demande d'accès (notification au propriétaire)
POST /api/access-requests

# Approuver une demande (par le propriétaire)
POST /api/access-requests/{requestId}/approve

# Rejeter une demande (par le propriétaire)
POST /api/access-requests/{requestId}/reject
```

## 📊 **Base de Données**

### **Tables Utilisées**
- `access_requests` : Stockage des demandes
- `temporary_access_codes` : Codes temporaires générés
- `reports` : Informations sur les rapports et leurs propriétaires

### **Requêtes Principales**
```sql
-- Demandes en attente pour un propriétaire
SELECT ar.* FROM access_requests ar 
WHERE ar.status = 'PENDING' 
AND ar.report_id IN (SELECT r.id FROM reports r WHERE r.created_by = ?)

-- Compter les demandes en attente
SELECT COUNT(*) FROM access_requests ar 
WHERE ar.status = 'PENDING' 
AND ar.report_id IN (SELECT r.id FROM reports r WHERE r.created_by = ?)
```

## 🔔 **Notifications**

### **Types de Notifications**
1. **Demande créée** : Notification au propriétaire du rapport
2. **Demande approuvée** : Code temporaire envoyé au demandeur
3. **Demande rejetée** : Motif de rejet envoyé au demandeur

### **Canaux de Notification**
- ✅ **Email** : Notifications détaillées
- ✅ **SMS** : Codes d'accès rapides
- ✅ **In-app** : Notifications dans l'interface

## 🚀 **Utilisation**

### **Étape 1 : Faire une Demande**
1. Aller sur la page Rapports
2. Trouver un rapport créé par un autre utilisateur
3. Cliquer sur "📝 Demande d'accès"
4. Remplir le formulaire (email, compagnie, téléphone, motif)
5. Cliquer sur "Faire la demande"

### **Étape 2 : Gérer les Demandes (Propriétaire)**
1. Aller sur la page Rapports
2. Cliquer sur "🔐 Demandes d'accès"
3. Voir la liste des demandes en attente
4. Pour chaque demande :
   - **Approuver** : Cliquer sur "Approuver" → Code généré automatiquement
   - **Rejeter** : Cliquer sur "Rejeter" → Saisir le motif → Confirmer

### **Étape 3 : Utiliser le Code (Demandeur)**
1. Recevoir la notification d'approbation
2. Aller sur la page Rapports
3. Cliquer sur "🔐 Télécharger avec code"
4. Saisir le code temporaire
5. Télécharger le rapport

## 🔒 **Sécurité**

### **Contrôles Implémentés**
- ✅ **Vérification des permissions** : Seul le propriétaire peut gérer ses demandes
- ✅ **Codes temporaires** : Expiration automatique (24h par défaut)
- ✅ **Validation des données** : Champs obligatoires et validation
- ✅ **Audit trail** : Traçabilité complète des actions

### **Bonnes Pratiques**
- **Motifs de rejet** : Toujours expliquer pourquoi une demande est rejetée
- **Codes temporaires** : Utilisation unique et expiration
- **Notifications** : Confirmation de toutes les actions importantes

## 🐛 **Dépannage**

### **Problèmes Courants**
1. **Demande non reçue** : Vérifier les notifications in-app
2. **Code expiré** : Demander un nouveau code au propriétaire
3. **Erreur d'approbation** : Vérifier les permissions utilisateur

### **Logs de Debug**
```bash
# Backend
tail -f logs/application.log | grep "ACCESS_REQUEST"

# Frontend
# Ouvrir la console du navigateur pour voir les erreurs
```

## ✅ **Validation**

### **Tests à Effectuer**
1. ✅ **Créer une demande** : Vérifier que le propriétaire reçoit la notification
2. ✅ **Approuver une demande** : Vérifier que le demandeur reçoit le code
3. ✅ **Rejeter une demande** : Vérifier que le demandeur reçoit le motif
4. ✅ **Utiliser le code** : Vérifier que le téléchargement fonctionne
5. ✅ **Expiration du code** : Vérifier que les codes expirés sont rejetés

---

**🎉 Le système de demande d'accès par propriétaire est maintenant opérationnel !**
