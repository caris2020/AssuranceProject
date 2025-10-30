# 🧪 Test des Fonctionnalités Modifier/Supprimer pour le Propriétaire

## 📋 Fonctionnalités Implémentées

**Objectif :** Permettre au propriétaire d'un rapport de le modifier et le supprimer, avec support des fichiers de prévisualisation.

## ✅ Tests à Effectuer

### 1. **Vérification des Permissions** 🔐
- [ ] **Connexion en tant que propriétaire** d'un rapport
- [ ] **Localiser un rapport créé par vous** dans la liste
- [ ] **Vérifier la présence des boutons** :
  - ✅ Bouton "Modifier" en bas de la carte
  - ✅ Bouton "Supprimer" en bas de la carte (texte rouge)
- [ ] **Tester avec un rapport d'un autre utilisateur** :
  - ❌ Pas de boutons Modifier/Supprimer
  - ✅ Message "👁️ Lecture seule - Rapport créé par [nom]"

### 2. **Test de Modification** ✏️

#### 2.1 Ouverture du Modal
- [ ] Cliquer sur "Modifier" d'un rapport dont vous êtes propriétaire
- [ ] Vérifier l'ouverture du modal "✏️ Modifier le rapport"
- [ ] Vérifier que les champs sont pré-remplis avec les données existantes

#### 2.2 Modification des Données
- [ ] **Modifier le titre** du rapport
- [ ] **Changer le statut** (Disponible/En attente/Traité)
- [ ] **Modifier les informations** (Bénéficiaire, Initiateur, etc.)
- [ ] **Tester le nouveau système de fichiers** :
  - ✅ Section "Nouveau fichier rapport (optionnel)" - à gauche
  - ✅ Section "Nouveau fichier de prévisualisation (optionnel)" - à droite

#### 2.3 Upload de Nouveaux Fichiers
- [ ] **Fichier principal** : Sélectionner un nouveau fichier principal
- [ ] **Fichier de prévisualisation** : Sélectionner un nouveau fichier de prévisualisation
- [ ] Vérifier l'affichage des noms et tailles des fichiers
- [ ] Cliquer sur "Modifier" pour sauvegarder

**Résultat attendu :**
- Modal se ferme
- Rapport mis à jour dans la liste
- Nouveaux fichiers uploadés avec les bonnes catégories

### 3. **Test de Suppression** 🗑️

#### 3.1 Ouverture du Modal de Suppression
- [ ] Cliquer sur "Supprimer" d'un rapport dont vous êtes propriétaire
- [ ] Vérifier l'ouverture du modal "🗑️ Supprimer le rapport"
- [ ] Lire les messages d'avertissement

#### 3.2 Confirmation de Suppression
- [ ] Vérifier le texte : "Êtes-vous sûr de vouloir supprimer le rapport [titre] ?"
- [ ] Vérifier l'avertissement : "Cette action est irréversible..."
- [ ] **Option 1** : Cliquer sur "Annuler" → Modal se ferme, rien ne change
- [ ] **Option 2** : Cliquer sur "Supprimer" → Rapport supprimé définitivement

**Résultat attendu :**
- Rapport disparaît de la liste
- Tous les fichiers associés sont supprimés
- Pas d'erreur dans la console

### 4. **Test de Prévisualisation après Modification** 👁️
- [ ] Modifier un rapport et ajouter un nouveau fichier de prévisualisation
- [ ] Cliquer sur "Prévisualiser" sur la carte du rapport modifié
- [ ] Vérifier que le **nouveau fichier de prévisualisation** s'affiche

### 5. **Tests de Permissions Avancés** 🔒

#### 5.1 Console de Débogage
- [ ] Ouvrir la console du navigateur (F12)
- [ ] Recharger la page des rapports
- [ ] Vérifier les logs de permissions :
```
Permissions pour le rapport [titre] (ID: [id]): {canEdit: true, canDelete: true}
Créé par: [votre_nom], Utilisateur actuel: [votre_nom]
```

#### 5.2 Test avec Différents Utilisateurs
- [ ] **Administrateur** : Doit pouvoir modifier/supprimer tous les rapports
- [ ] **Point Focal** : Doit pouvoir modifier/supprimer uniquement ses rapports
- [ ] **Autre utilisateur** : Lecture seule pour les rapports des autres

## 🔧 Vérifications Techniques

### API Calls à Vérifier (Onglet Network)
- [ ] **Lors de la modification** :
  - `PUT /api/reports/{id}` - Mise à jour des métadonnées
  - `POST /api/reports/{id}/files` (category: "main") - Si nouveau fichier principal
  - `POST /api/reports/{id}/files` (category: "preview") - Si nouveau fichier de prévisualisation

- [ ] **Lors de la suppression** :
  - `DELETE /api/reports/{id}` - Suppression du rapport

- [ ] **Lors du chargement des permissions** :
  - `GET /api/reports/{id}/permissions?userName=[nom]` - Pour chaque rapport

### Logs de Débogage
- [ ] Aucune erreur dans la console
- [ ] Messages de permissions affichés correctement
- [ ] Upload des fichiers confirmé

## 🎯 Critères de Succès

### ✅ **Succès Complet**
- [x] Boutons Modifier/Supprimer visibles pour le propriétaire
- [x] Modal de modification avec support des deux types de fichiers
- [x] Modifications sauvegardées correctement
- [x] Suppression fonctionne avec confirmation
- [x] Permissions respectées selon le propriétaire
- [x] Prévisualisation utilise les nouveaux fichiers

### ⚠️ **Problèmes Possibles**
- **Boutons non visibles** : Vérifier les permissions dans la console
- **Erreur lors de la modification** : Vérifier les logs backend
- **Fichiers non uploadés** : Vérifier les appels API dans Network

## 📝 **Fonctionnalités Ajoutées**

1. **Modal de modification amélioré** avec deux sections de fichiers
2. **Support des fichiers de prévisualisation** dans l'édition
3. **Upload intelligent** avec catégories (main/preview)
4. **Messages d'aide** pour guider l'utilisateur
5. **Logs de débogage** pour faciliter le troubleshooting

---

**Date de test :** _À remplir_  
**Testeur :** _À remplir_  
**Résultat :** _À remplir_ ✅/⚠️/❌

## 🚀 **Instructions d'Utilisation**

### Pour Modifier un Rapport :
1. Cliquez sur "Modifier" sur votre rapport
2. Modifiez les champs souhaités
3. Optionnellement, ajoutez de nouveaux fichiers
4. Cliquez sur "Modifier" pour sauvegarder

### Pour Supprimer un Rapport :
1. Cliquez sur "Supprimer" sur votre rapport
2. Confirmez la suppression
3. ⚠️ **Action irréversible** - tous les fichiers seront supprimés
