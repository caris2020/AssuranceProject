# Validation des Rapports - Documentation

## Vue d'ensemble

Le système de création de rapports a été amélioré pour garantir que tous les champs obligatoires sont renseignés et que les informations correspondent aux données du dossier associé.

## Champs Obligatoires

Lors de la création d'un rapport, les champs suivants sont **obligatoires** :

1. **Titre** - Le titre du rapport
2. **Bénéficiaire** - Le nom du bénéficiaire
3. **Initiateur** - L'entité qui a initié le rapport
4. **Assuré** - Le nom de l'assuré
5. **Souscripteur** - Le nom du souscripteur
6. **Numéro de dossier** - L'identifiant du dossier associé (ID numérique ou code alphanumérique)
7. **Fichier du rapport** - Le fichier du rapport (PDF, TXT, DOC, DOCX)

## Validation Côté Client

### Fonctionnalités ajoutées :

1. **Validation en temps réel** : Les champs sont validés à la saisie
2. **Indicateurs visuels** : Les champs obligatoires sont marqués d'un astérisque (*)
3. **Messages d'erreur** : Affichage des erreurs de validation sous chaque champ
4. **Auto-remplissage** : Les champs sont automatiquement pré-remplis avec les données du dossier sélectionné
5. **Validation avant soumission** : Vérification complète avant l'envoi au serveur
6. **Validation du fichier** : Le fichier du rapport est obligatoire

### Interface utilisateur :

- Les champs obligatoires sont marqués avec un astérisque rouge (*)
- Les erreurs de validation s'affichent en rouge sous les champs concernés
- Une note d'information explique les exigences
- Le bouton de soumission est désactivé pendant le traitement
- Le champ fichier indique clairement qu'il est obligatoire

## Validation Côté Serveur

### Fonctionnalités ajoutées :

1. **Validation des champs obligatoires** : Vérification que tous les champs requis sont présents
2. **Validation de l'existence du dossier** : Vérification que le dossier référencé existe (par ID ou code)
3. **Validation de correspondance** : Vérification que les informations correspondent aux données du dossier
4. **Validation du fichier** : Vérification que le fichier du rapport est fourni
5. **Messages d'erreur détaillés** : Retour d'erreurs spécifiques pour chaque problème

### Logique de validation :

```java
// Validation des champs obligatoires
validateRequiredFields(payload)

// Validation du fichier obligatoire
if (!hasFile) {
    throw new IllegalArgumentException("Le fichier du rapport est obligatoire");
}

// Validation de la correspondance avec le dossier
validateCaseCorrespondence(payload)

// Validation de la correspondance des données
validateFieldCorrespondence(payload, caseDataJson)
```

## Gestion des Erreurs

### Côté serveur :
- Retour de codes HTTP appropriés (400 pour les erreurs de validation)
- Messages d'erreur en français
- Gestion des exceptions avec rollback automatique
- Support des codes de dossier alphanumériques

### Côté client :
- Affichage des erreurs de validation du serveur
- Gestion des erreurs réseau
- Messages d'erreur utilisateur-friendly

## Auto-remplissage des Champs

Lorsqu'un numéro de dossier valide est saisi (ID ou code) :

1. **Extraction des données** : Les informations sont extraites du dossier sélectionné
2. **Pré-remplissage** : Les champs sont automatiquement remplis avec les données du dossier
3. **Formatage** : Les noms et prénoms sont combinés automatiquement
4. **Préservation** : Les données existantes sont préservées si les champs sont déjà remplis

### Champs auto-remplis :
- Bénéficiaire : `beneficiaire_nom + beneficiaire_prenom`
- Assuré : `assure_nom + assure_prenom`
- Souscripteur : `souscripteur_nom + souscripteur_prenom`
- Initiateur : `initiateur` ou `initiator`

## Support des Codes de Dossier

Le système accepte maintenant :
- **IDs numériques** : Identifiants numériques des dossiers
- **Codes alphanumériques** : Codes de référence des dossiers (ex: ABC-123-XYZ)

La validation recherche automatiquement le dossier par ID ou par code de référence.

## Sécurité

- Validation côté serveur obligatoire (ne pas se fier uniquement au client)
- Vérification de l'existence des dossiers avant association
- Audit trail pour toutes les créations de rapports
- Gestion sécurisée des erreurs (pas d'exposition d'informations sensibles)
- Validation obligatoire du fichier pour éviter les rapports vides

## Utilisation

1. Ouvrir le formulaire de création de rapport
2. Saisir le numéro de dossier (ID ou code) - les champs se remplissent automatiquement
3. Vérifier et ajuster les informations si nécessaire
4. Remplir le titre du rapport
5. Sélectionner le statut
6. **Sélectionner obligatoirement un fichier** (PDF, TXT, DOC, DOCX)
7. Valider le formulaire

Le système vérifiera automatiquement la cohérence des données et affichera les erreurs si nécessaire.
