# 🧪 Test du Workflow de Fichier de Prévisualisation

## 📋 Fonctionnalité Implémentée

**Objectif :** Permettre d'ajouter un fichier de prévisualisation lors de la création d'un rapport, qui sera affiché quand on clique sur "Prévisualiser" sur la carte.

## ✅ Étapes de Test

### 1. **Vérification de l'Interface** 👀
- [ ] Ouvrir l'application et aller sur la page Rapports
- [ ] Cliquer sur "+ Ajouter un rapport"
- [ ] Vérifier la présence de **deux sections de fichiers** :
  - ✅ "Fichier rapport *" (obligatoire) - à gauche
  - ✅ "Fichier de prévisualisation" (optionnel) - à droite

### 2. **Test de Création avec Fichier de Prévisualisation** 📄
- [ ] Remplir tous les champs obligatoires du formulaire
- [ ] **Fichier rapport :** Sélectionner un fichier PDF principal
- [ ] **Fichier de prévisualisation :** Sélectionner une image ou PDF différent
- [ ] Cliquer sur "Créer"
- [ ] Vérifier que le rapport est créé avec succès

**Résultat attendu :**
- Modal se ferme
- Nouveau rapport apparaît dans la liste
- Pas d'erreur dans la console

### 3. **Test de Prévisualisation** 👁️
- [ ] Localiser le rapport créé dans la liste
- [ ] Cliquer sur le bouton "Prévisualiser"
- [ ] Vérifier que le **fichier de prévisualisation** s'ouvre (pas le fichier principal)

**Résultat attendu :**
- Nouvel onglet s'ouvre
- Affichage du fichier de prévisualisation sélectionné
- Pour une image : affichage centré
- Pour un PDF : iframe intégré

### 4. **Test sans Fichier de Prévisualisation** ⚠️
- [ ] Créer un nouveau rapport
- [ ] Remplir tous les champs + fichier principal
- [ ] **Laisser vide** le fichier de prévisualisation
- [ ] Créer le rapport
- [ ] Cliquer sur "Prévisualiser"

**Résultat attendu :**
- Fallback vers l'ancienne méthode de prévisualisation cryptée
- Modal de prévisualisation sécurisée s'affiche

### 5. **Test des Types de Fichiers** 📁
Tester avec différents formats pour le fichier de prévisualisation :
- [ ] **PDF :** Doit s'afficher dans un iframe
- [ ] **Image PNG/JPG :** Doit s'afficher centrée
- [ ] **Fichier texte :** Doit se télécharger ou s'afficher

## 🔧 Vérifications Techniques

### Console du Navigateur
Vérifier qu'il n'y a pas d'erreurs lors de :
- [ ] Sélection des fichiers
- [ ] Création du rapport
- [ ] Ouverture de la prévisualisation

### Network Tab
Vérifier les appels API :
- [ ] Upload du fichier principal avec `category: "main"`
- [ ] Upload du fichier de prévisualisation avec `category: "preview"`
- [ ] Appel à `/api/reports/{id}/files` pour récupérer les fichiers
- [ ] Appel à `/api/reports/{reportId}/files/{fileId}/preview` pour la prévisualisation

## 🎯 Critères de Succès

### ✅ **Succès Complet**
- [x] Interface avec deux boutons de fichiers visible
- [x] Upload des deux fichiers fonctionne
- [x] Prévisualisation affiche le bon fichier
- [x] Fallback fonctionne sans fichier de prévisualisation
- [x] Pas d'erreur dans la console

### ⚠️ **Problèmes Possibles**
- **Fichier de prévisualisation non uploadé :** Vérifier les logs backend
- **Prévisualisation montre le mauvais fichier :** Vérifier le filtre par category
- **Erreur 404 sur l'endpoint :** Vérifier que le backend est redémarré

## 📝 **Instructions d'Utilisation**

1. **Pour l'utilisateur :**
   - Le fichier rapport est **obligatoire** (fichier principal du rapport)
   - Le fichier de prévisualisation est **optionnel** (pour l'aperçu public)
   - Utilisez des formats visuels pour la prévisualisation (PDF, images)

2. **Avantages :**
   - Prévisualisation rapide sans révéler le contenu complet
   - Fichier principal reste sécurisé
   - Expérience utilisateur améliorée

---

**Date de test :** _À remplir_  
**Testeur :** _À remplir_  
**Résultat :** _À remplir_ ✅/⚠️/❌
