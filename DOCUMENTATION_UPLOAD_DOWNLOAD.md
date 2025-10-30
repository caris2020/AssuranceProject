# 📁 Documentation - Upload et Download de Fichiers

## 🎯 Vue d'ensemble

Cette documentation décrit les endpoints d'upload et download de fichiers pour les rapports et dossiers d'assurance.

## 📋 Endpoints Disponibles

### 📄 Gestion des Fichiers - Rapports

#### 1. Upload de Fichier de Rapport
```http
POST /api/files/reports/{reportId}/upload
```

**Paramètres:**
- `reportId` (path): ID du rapport
- `file` (form-data): Fichier à uploader
- `description` (form-data, optionnel): Description du fichier
- `fileType` (form-data, optionnel): Type de fichier (pdf, document, image, etc.)

**Exemple avec curl:**
```bash
curl -X POST \
  -F "file=@document.pdf" \
  -F "description=Rapport d'enquête" \
  -F "fileType=pdf" \
  http://localhost:8080/api/files/reports/1/upload
```

**Réponse:**
```json
{
  "success": true,
  "message": "Fichier téléchargé avec succès",
  "file": {
    "id": 1,
    "fileName": "document.pdf",
    "contentType": "application/pdf",
    "sizeBytes": 1024000,
    "formattedSize": "1.0 MB",
    "fileType": "pdf",
    "description": "Rapport d'enquête",
    "createdAt": "2024-01-15T10:30:00",
    "reportId": 1
  }
}
```

#### 2. Lister les Fichiers d'un Rapport
```http
GET /api/files/reports/{reportId}/files
```

**Exemple:**
```bash
curl http://localhost:8080/api/files/reports/1/files
```

#### 3. Télécharger un Fichier de Rapport
```http
GET /api/files/reports/{reportId}/files/{fileId}/download
```

**Exemple:**
```bash
curl -o downloaded_file.pdf \
  http://localhost:8080/api/files/reports/1/files/1/download
```

#### 4. Rechercher dans les Fichiers de Rapport
```http
GET /api/files/reports/{reportId}/files/search?fileName={searchTerm}
```

**Exemple:**
```bash
curl "http://localhost:8080/api/files/reports/1/files/search?fileName=rapport"
```

#### 5. Supprimer un Fichier de Rapport
```http
DELETE /api/files/reports/{reportId}/files/{fileId}
```

**Exemple:**
```bash
curl -X DELETE http://localhost:8080/api/files/reports/1/files/1
```

### 📁 Gestion des Pièces Jointes - Dossiers

#### 1. Upload de Pièce Jointe de Dossier
```http
POST /api/files/cases/{caseId}/upload
```

**Paramètres:**
- `caseId` (path): ID du dossier
- `file` (form-data): Fichier à uploader
- `description` (form-data, optionnel): Description de la pièce jointe
- `category` (form-data, optionnel): Catégorie (document, photo, rapport, etc.)

**Exemple avec curl:**
```bash
curl -X POST \
  -F "file=@photo.jpg" \
  -F "description=Photo du sinistre" \
  -F "category=photo" \
  http://localhost:8080/api/files/cases/1/upload
```

**Réponse:**
```json
{
  "success": true,
  "message": "Pièce jointe téléchargée avec succès",
  "file": {
    "id": 1,
    "fileName": "photo.jpg",
    "contentType": "image/jpeg",
    "sizeBytes": 512000,
    "formattedSize": "512.0 KB",
    "fileType": "image",
    "description": "Photo du sinistre",
    "category": "photo",
    "createdAt": "2024-01-15T10:30:00",
    "caseId": 1
  }
}
```

#### 2. Lister les Pièces Jointes d'un Dossier
```http
GET /api/files/cases/{caseId}/attachments
```

**Exemple:**
```bash
curl http://localhost:8080/api/files/cases/1/attachments
```

#### 3. Télécharger une Pièce Jointe
```http
GET /api/files/cases/{caseId}/attachments/{attachmentId}/download
```

**Exemple:**
```bash
curl -o downloaded_attachment.jpg \
  http://localhost:8080/api/files/cases/1/attachments/1/download
```

#### 4. Rechercher dans les Pièces Jointes
```http
GET /api/files/cases/{caseId}/attachments/search?fileName={searchTerm}
```

**Exemple:**
```bash
curl "http://localhost:8080/api/files/cases/1/attachments/search?fileName=photo"
```

#### 5. Supprimer une Pièce Jointe
```http
DELETE /api/files/cases/{caseId}/attachments/{attachmentId}
```

**Exemple:**
```bash
curl -X DELETE http://localhost:8080/api/files/cases/1/attachments/1
```

## 🔧 Types de Fichiers Supportés

### Extensions Autorisées
- **Documents**: `.pdf`, `.doc`, `.docx`
- **Images**: `.jpg`, `.jpeg`, `.png`, `.gif`
- **Tableurs**: `.xls`, `.xlsx`
- **Texte**: `.txt`

### Types de Fichiers Détectés
- `pdf`: Fichiers PDF
- `document`: Documents Word
- `image`: Images
- `spreadsheet`: Tableurs Excel
- `text`: Fichiers texte
- `other`: Autres types

### Catégories de Pièces Jointes
- `document`: Documents généraux
- `photo`: Photographies
- `rapport`: Rapports
- `facture`: Factures
- `contrat`: Contrats
- `autre`: Autres catégories

## 📏 Limitations

- **Taille maximale**: 50 MB par fichier
- **Types de fichiers**: Seules les extensions listées ci-dessus sont autorisées
- **Encryption**: Désactivée par défaut (peut être activée via configuration)

## 🚀 Tests

### Interface Web
Ouvrez `test_file_upload_download.html` dans votre navigateur pour tester interactivement tous les endpoints.

### Script de Test
Exécutez le script de test :
```bash
chmod +x test_upload_download.sh
./test_upload_download.sh
```

### Tests Manuels avec curl

#### Test d'Upload
```bash
# Créer un fichier de test
echo "Contenu de test" > test.txt

# Upload vers un rapport
curl -X POST \
  -F "file=@test.txt" \
  -F "description=Test upload" \
  http://localhost:8080/api/files/reports/1/upload

# Upload vers un dossier
curl -X POST \
  -F "file=@test.txt" \
  -F "description=Test upload dossier" \
  -F "category=document" \
  http://localhost:8080/api/files/cases/1/upload
```

#### Test de Download
```bash
# Lister les fichiers
curl http://localhost:8080/api/files/reports/1/files

# Télécharger un fichier (remplacez {fileId} par l'ID réel)
curl -o downloaded_file.txt \
  http://localhost:8080/api/files/reports/1/files/{fileId}/download
```

## 🔍 Gestion des Erreurs

### Codes d'Erreur Communs

- **400 Bad Request**: Paramètres manquants ou invalides
- **404 Not Found**: Rapport/Dossier/Fichier introuvable
- **413 Payload Too Large**: Fichier trop volumineux (> 50MB)
- **415 Unsupported Media Type**: Type de fichier non autorisé
- **500 Internal Server Error**: Erreur serveur

### Messages d'Erreur Typiques

```json
{
  "success": false,
  "message": "Le fichier est trop volumineux. Taille maximale: 50MB"
}
```

```json
{
  "success": false,
  "message": "Type de fichier non autorisé: virus.exe"
}
```

```json
{
  "success": false,
  "message": "Rapport introuvable avec l'ID: 999"
}
```

## 📊 Statistiques

### Endpoints de Statistiques
```http
GET /api/files/reports/{reportId}/files/count
GET /api/files/cases/{caseId}/attachments/count
```

### Endpoints de Fichiers Récents
```http
GET /api/files/reports/{reportId}/files/recent
GET /api/files/cases/{caseId}/attachments/recent
```

## 🔐 Sécurité

- Validation des types de fichiers
- Limitation de taille
- Sanitisation des noms de fichiers
- Support optionnel du chiffrement AES-256
- Gestion des permissions (public/privé)

## 📝 Notes d'Implémentation

- Les fichiers sont stockés en base de données (BYTEA)
- Support du chiffrement optionnel avec vecteur d'initialisation
- Métadonnées complètes (taille, type, date de création)
- Indexation pour les recherches rapides
- Gestion automatique des extensions de fichiers

## 🌐 Interface Web

L'interface web `test_file_upload_download.html` fournit :
- ✅ Test de connexion API
- 📤 Upload de fichiers (drag & drop)
- 📋 Liste des fichiers avec métadonnées
- 🔍 Recherche en temps réel
- ⬇️ Téléchargement en un clic
- 🗑️ Suppression avec confirmation
- 📊 Statistiques en temps réel

---

**Version**: 1.0  
**Date**: 2024-01-15  
**Auteur**: Système de Gestion d'Assurance
