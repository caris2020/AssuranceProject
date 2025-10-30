# Gestion des Fichiers - Association aux Cartes (Rapports/Dossiers)

## Vue d'ensemble

Ce système permet d'associer chaque fichier téléchargé à une carte spécifique (rapport ou dossier d'assurance). Chaque fichier est automatiquement lié à sa carte parent et peut être géré de manière centralisée.

## Architecture

### Entités

1. **ReportFile** - Fichiers associés aux rapports
2. **CaseAttachment** - Pièces jointes associées aux dossiers d'assurance

### Relations

- `ReportFile` → `Report` (Many-to-One)
- `CaseAttachment` → `InsuranceCase` (Many-to-One)

## Fonctionnalités

### 1. Upload de Fichiers

#### Pour les Rapports
```http
POST /api/files/reports/{reportId}/upload
Content-Type: multipart/form-data

Parameters:
- file: Le fichier à télécharger
- description: Description optionnelle du fichier
- fileType: Type de fichier optionnel
```

#### Pour les Dossiers
```http
POST /api/files/cases/{caseId}/upload
Content-Type: multipart/form-data

Parameters:
- file: Le fichier à télécharger
- description: Description optionnelle du fichier
- category: Catégorie optionnelle (preuve, document, photo, etc.)
```

### 2. Téléchargement de Fichiers

#### Fichiers de Rapports
```http
GET /api/files/reports/{reportId}/files/{fileId}/download
```

#### Pièces Jointes de Dossiers
```http
GET /api/files/cases/{caseId}/attachments/{attachmentId}/download
```

### 3. Listage des Fichiers

#### Fichiers d'un Rapport
```http
GET /api/files/reports/{reportId}/files
```

#### Pièces Jointes d'un Dossier
```http
GET /api/files/cases/{caseId}/attachments
```

### 4. Recherche de Fichiers

#### Recherche par Nom
```http
GET /api/files/reports/{reportId}/files/search?fileName=document
GET /api/files/cases/{caseId}/attachments/search?fileName=photo
```

### 5. Filtrage

#### Par Type de Fichier
```http
GET /api/files/reports/{reportId}/files/type/pdf
GET /api/files/reports/{reportId}/files/type/image
```

#### Par Catégorie (Dossiers uniquement)
```http
GET /api/files/cases/{caseId}/attachments/category/preuve
GET /api/files/cases/{caseId}/attachments/category/document
```

### 6. Suppression

```http
DELETE /api/files/reports/{reportId}/files/{fileId}
DELETE /api/files/cases/{caseId}/attachments/{attachmentId}
```

## Types de Fichiers Supportés

- **PDF**: Documents PDF
- **Documents**: .doc, .docx
- **Images**: .jpg, .jpeg, .png, .gif
- **Tableurs**: .xls, .xlsx
- **Texte**: .txt

## Catégories de Pièces Jointes (Dossiers)

- `preuve` - Preuves et justificatifs
- `document` - Documents administratifs
- `photo` - Photographies
- `rapport` - Rapports d'enquête
- `autre` - Autres types

## Structure des Données

### ReportFile
```json
{
  "id": 1,
  "fileName": "document.pdf",
  "contentType": "application/pdf",
  "sizeBytes": 1024000,
  "formattedSize": "1.0 MB",
  "fileType": "pdf",
  "fileExtension": "pdf",
  "description": "Rapport d'enquête",
  "isPublic": false,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z",
  "reportId": 123
}
```

### CaseAttachment
```json
{
  "id": 1,
  "fileName": "photo_accident.jpg",
  "contentType": "image/jpeg",
  "sizeBytes": 512000,
  "formattedSize": "512.0 KB",
  "fileType": "image",
  "fileExtension": "jpg",
  "description": "Photo de l'accident",
  "category": "preuve",
  "isPublic": false,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z",
  "caseId": 456
}
```

## Sécurité

### Chiffrement
- Les fichiers peuvent être chiffrés (optionnel)
- Chaque fichier a son propre IV (Initialization Vector)
- Support AES-256

### Contrôles d'Accès
- Vérification de l'existence de la carte parent
- Validation des types de fichiers
- Limitation de la taille (50MB max)

## Exemples d'Utilisation

### JavaScript (Frontend)

#### Upload d'un fichier vers un rapport
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('description', 'Rapport d\'enquête');
formData.append('fileType', 'pdf');

fetch(`/api/files/reports/${reportId}/upload`, {
    method: 'POST',
    body: formData
})
.then(response => response.json())
.then(data => {
    if (data.success) {
        console.log('Fichier uploadé:', data.file);
    }
});
```

#### Récupération des fichiers d'un rapport
```javascript
fetch(`/api/files/reports/${reportId}/files`)
.then(response => response.json())
.then(data => {
    if (data.success) {
        data.files.forEach(file => {
            console.log(`Fichier: ${file.fileName} (${file.formattedSize})`);
        });
    }
});
```

#### Téléchargement d'un fichier
```javascript
const downloadFile = (fileId) => {
    window.open(`/api/files/reports/${reportId}/files/${fileId}/download`);
};
```

### cURL

#### Upload
```bash
curl -X POST \
  -F "file=@document.pdf" \
  -F "description=Rapport d'enquête" \
  -F "fileType=pdf" \
  http://localhost:8080/api/files/reports/123/upload
```

#### Listage
```bash
curl http://localhost:8080/api/files/reports/123/files
```

#### Recherche
```bash
curl "http://localhost:8080/api/files/reports/123/files/search?fileName=document"
```

## Configuration

### Limites
- Taille maximale: 50MB par fichier
- Types de fichiers autorisés: pdf, doc, docx, jpg, jpeg, png, gif, xls, xlsx, txt

### Base de Données
- Tables: `report_files`, `case_attachments`
- Index optimisés pour les performances
- Contraintes de clés étrangères avec suppression en cascade

## Migration

Pour mettre à jour votre base de données existante :

```bash
psql -d votre_base -f update_file_tables.sql
```

## Monitoring

### Statistiques
- Nombre de fichiers par rapport/dossier
- Taille totale des fichiers
- Types de fichiers les plus utilisés

### Logs
- Uploads réussis/échoués
- Téléchargements
- Suppressions

## Support

Pour toute question ou problème :
1. Vérifiez les logs de l'application
2. Consultez la documentation de l'API
3. Contactez l'équipe de développement
