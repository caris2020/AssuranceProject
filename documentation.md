# Documentation - Système de Gestion des Rapports et Dossiers

## 🎯 Fonctionnalités Implémentées

### 1. Validation des Champs Obligatoires
- **Tous les champs sont obligatoires** lors de la création d'un rapport :
  - Titre du rapport
  - **Bénéficiaires** (au moins un avec nom et prénom)
  - **Assurés** (au moins un avec nom et prénom)
  - Initiateur
  - Souscripteur
  - Numéro de dossier
  - **Fichier du rapport** (maintenant obligatoire)

### 2. Gestion des Bénéficiaires et Assurés Multiples
- **Plusieurs bénéficiaires par dossier** : Un dossier peut avoir 1 ou plusieurs bénéficiaires
- **Plusieurs assurés par dossier** : Un dossier peut avoir 1 ou plusieurs assurés
- **Interface dynamique** : Ajout/suppression de bénéficiaires et assurés dans les formulaires
- **Validation** : Au moins un bénéficiaire et un assuré avec nom et prénom sont obligatoires
- **Stockage JSON** : Les bénéficiaires et assurés sont stockés en JSON dans la base de données
- **Compatibilité** : Support des anciens dossiers avec un seul bénéficiaire/assuré

### 3. Persistance Permanente des Dossiers
- **Les dossiers sont maintenant persistés en base de données** de manière permanente
- **Création automatique** : Si un dossier n'existe pas lors de la création d'un rapport, il est automatiquement créé
- **Synchronisation backend-frontend** : Le frontend utilise maintenant l'API backend au lieu du localStorage
- **Données structurées** : Les informations du dossier sont stockées en JSON dans la base de données

### 4. Migration Automatique des Dossiers
- **Migration transparente** : Les dossiers existants dans le localStorage sont automatiquement migrés vers le backend
- **Compatibilité** : Le système fonctionne avec les deux sources de données pendant la transition
- **Pas de perte de données** : Tous les dossiers existants sont préservés

### 5. Gestion des Fichiers Améliorée
- **Correction de l'erreur LOB stream** : Problème résolu avec la gestion des données binaires
- **Validation de taille** : Limite de 10MB par fichier
- **Gestion d'erreurs robuste** : Messages d'erreur clairs et gestion des exceptions
- **Chiffrement** : Les fichiers sont chiffrés avant stockage en base de données

## 🔧 Corrections Techniques

### Problème LOB Stream Résolu
- **Cause** : Utilisation de `@Lob` avec `@Basic(fetch = FetchType.LAZY)` causait des problèmes avec certains SGBD
- **Solution** : Remplacement par `@Column(columnDefinition = "BLOB")` pour une gestion plus robuste
- **Fichiers modifiés** :
  - `ReportFile.java` : Correction des annotations JPA (suppression des @Lob redondants)
  - `CaseAttachment.java` : Correction des annotations JPA (suppression des @Lob redondants)
  - `UploadService.java` : Amélioration de la gestion d'erreurs avec détection spécifique de l'erreur LOB stream
- **Script de correction** : `fix_blob_columns.sql` pour corriger la structure de la base de données

### Migration des Dossiers
- **Fonctionnalité** : Migration automatique des dossiers localStorage → backend
- **Déclenchement** : Automatique lors du premier chargement si des dossiers existent en localStorage
- **Sécurité** : Pas de perte de données, migration progressive

### Gestion des Bénéficiaires et Assurés Multiples
- **Entité Report** : Modification pour stocker les bénéficiaires et assurés en JSON
- **Validation** : Au moins un bénéficiaire et un assuré obligatoires avec nom et prénom
- **Interface** : Formulaires dynamiques avec ajout/suppression de bénéficiaires et assurés
- **Compatibilité** : Support des anciens formats de données

### Améliorations de l'Interface Utilisateur
- **Scrolling dans les modales** : Les modales ont maintenant une hauteur maximale avec défilement automatique
- **Réorganisation des champs** : Le numéro de dossier et le statut ont été échangés de position dans le formulaire de création de rapport
- **Meilleure expérience utilisateur** : Les formulaires longs peuvent maintenant être parcourus facilement
- **Interface responsive** : Adaptation aux différentes tailles d'écran

## 📋 Validation et Correspondance des Données

### Validation Côté Client (Frontend)
- **Validation en temps réel** : Vérification des champs obligatoires
- **Validation des bénéficiaires** : Au moins un bénéficiaire avec nom et prénom
- **Validation des assurés** : Au moins un assuré avec nom et prénom
- **Auto-complétion** : Les champs sont pré-remplis depuis les données du dossier
- **Messages d'erreur** : Affichage clair des erreurs de validation

### Validation Côté Serveur (Backend)
- **Validation des champs obligatoires** : Vérification côté serveur
- **Validation des bénéficiaires** : Vérification de la présence d'au moins un bénéficiaire
- **Validation des assurés** : Vérification de la présence d'au moins un assuré
- **Création automatique des dossiers** : Si un dossier n'existe pas, il est créé automatiquement
- **Gestion des erreurs** : Messages d'erreur détaillés retournés au frontend

### Correspondance des Données
- **Vérification de cohérence** : Les données du rapport doivent correspondre aux données du dossier
- **Flexibilité** : Le système accepte les variations mineures entre frontend et backend
- **Auto-création** : Les dossiers manquants sont créés automatiquement

## 🔐 Sécurité et Performance

### Sécurité
- **Chiffrement des fichiers** : Tous les fichiers sont chiffrés avant stockage
- **Validation stricte** : Vérification des types et formats de données
- **Gestion des erreurs** : Pas d'exposition d'informations sensibles dans les erreurs

### Performance
- **Chargement optimisé** : Les dossiers sont chargés une seule fois au démarrage
- **Mise en cache** : Les données sont mises en cache côté frontend
- **Requêtes optimisées** : Utilisation de requêtes JPA efficaces

## 🚀 Utilisation

### Création d'un Dossier
1. **Remplir les informations de base** : Souscripteur, déclarant
2. **Ajouter des assurés** : Cliquer sur "+ Ajouter un assuré"
3. **Remplir les informations** : Nom, prénom, date de naissance pour chaque assuré
4. **Ajouter des bénéficiaires** : Cliquer sur "+ Ajouter un bénéficiaire"

### Création d'un Rapport
1. **Ouvrir le formulaire** : Cliquer sur "+ Ajouter un rapport"
2. **Remplir les champs obligatoires** : Tous les champs marqués d'un * sont obligatoires
3. **Sélectionner le dossier** : Entrer le numéro de dossier (maintenant en première position)
4. **Choisir le statut** : Disponible, En attente, ou Traité (maintenant en deuxième position)
5. **Ajouter les bénéficiaires et assurés** : Utiliser les formulaires dynamiques
6. **Joindre le fichier** : Le fichier du rapport est obligatoire
7. **Valider** : Le formulaire peut être scrollé si nécessaire grâce à l'amélioration de l'interface
5. **Remplir les informations** : Nom, prénom, date de naissance pour chaque bénéficiaire
6. **Supprimer si nécessaire** : Boutons "Supprimer" pour retirer des assurés/bénéficiaires
7. **Validation** : Au moins un assuré et un bénéficiaire avec nom et prénom sont obligatoires

### Création d'un Rapport
1. **Sélectionner un dossier** : Entrer le code du dossier (ex: "IN-389450")
2. **Auto-complétion** : Les champs sont pré-remplis automatiquement, y compris les bénéficiaires et assurés
3. **Gérer les bénéficiaires** : Ajouter/supprimer des bénéficiaires selon les besoins
4. **Gérer les assurés** : Ajouter/supprimer des assurés selon les besoins
5. **Validation** : Tous les champs obligatoires sont vérifiés
6. **Upload du fichier** : Le fichier est obligatoire et chiffré
7. **Création** : Le rapport est créé et lié au dossier

### Migration des Dossiers
- **Automatique** : Se déclenche lors du premier accès à la page Dossiers
- **Transparente** : L'utilisateur voit un message "Migration en cours..."
- **Complète** : Tous les dossiers localStorage sont migrés vers le backend

## 📝 Notes Techniques

### Base de Données
- **Tables principales** : `reports`, `insurance_cases`, `report_files`, `case_attachments`
- **Relations** : Rapports liés aux dossiers via `case_id`
- **Données JSON** : 
  - Informations flexibles stockées en JSON dans `data_json`
  - Bénéficiaires multiples stockés en JSON dans `beneficiaries`
  - Assurés multiples stockés en JSON dans `insureds`

### Structure des Bénéficiaires et Assurés
```json
{
  "beneficiaires": [
    {
      "nom": "Dupont",
      "prenom": "Jean",
      "dateNaissance": "1980-01-01"
    },
    {
      "nom": "Martin",
      "prenom": "Marie",
      "dateNaissance": "1985-05-15"
    }
  ],
  "assures": [
    {
      "nom": "Durand",
      "prenom": "Pierre",
      "dateNaissance": "1975-03-20"
    },
    {
      "nom": "Leroy",
      "prenom": "Sophie",
      "dateNaissance": "1982-07-10"
    }
  ]
}
```

### API Endpoints
- **GET /api/reports** : Liste des rapports
- **POST /api/reports** : Création d'un rapport
- **GET /api/cases** : Liste des dossiers
- **POST /api/cases** : Création d'un dossier
- **POST /api/upload/report/{id}** : Upload de fichier pour un rapport

### Frontend
- **React/TypeScript** : Interface moderne et responsive
- **État global** : Gestion d'état avec localStorage et API backend
- **Validation** : Validation côté client et serveur
- **UX** : Interface intuitive avec feedback en temps réel
- **Formulaires dynamiques** : Ajout/suppression de bénéficiaires et assurés

## 🔧 Dépannage

### Erreur "Unable to access lob stream"
**Symptôme** : Erreur lors de l'upload de fichiers dans la création de rapports
**Cause** : Problème de configuration des colonnes BLOB dans la base de données
**Solution** :
1. Exécuter le script `fix_blob_columns.sql` sur la base de données PostgreSQL
2. Redémarrer l'application backend
3. Vérifier que les colonnes `iv` et `cipher_text` sont de type `BYTEA` dans les tables `report_files` et `case_attachments`

### Vérification de la base de données
```sql
-- Vérifier les types de colonnes
SELECT 
    table_name, 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name IN ('report_files', 'case_attachments') 
AND column_name IN ('iv', 'cipher_text')
ORDER BY table_name, column_name;
```
