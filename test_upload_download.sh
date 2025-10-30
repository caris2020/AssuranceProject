#!/bin/bash

# Script de test pour les endpoints d'upload et download
# Usage: ./test_upload_download.sh

API_BASE="http://localhost:8080/api"
REPORT_ID=1
CASE_ID=1

echo "🚀 Test des endpoints d'upload et download"
echo "=========================================="
echo ""

# Test de connexion
echo "1. Test de connexion API..."
curl -s "$API_BASE/reports" | jq '.[0:2]' 2>/dev/null || echo "❌ Erreur de connexion"
echo ""

# Créer un fichier de test
echo "2. Création d'un fichier de test..."
echo "Ceci est un fichier de test pour l'upload." > test_file.txt
echo "✅ Fichier de test créé: test_file.txt"
echo ""

# Test upload fichier rapport
echo "3. Test upload fichier rapport..."
UPLOAD_RESPONSE=$(curl -s -X POST \
  -F "file=@test_file.txt" \
  -F "description=Test upload rapport" \
  -F "fileType=text" \
  "$API_BASE/files/reports/$REPORT_ID/upload")

echo "Réponse upload rapport:"
echo "$UPLOAD_RESPONSE" | jq '.' 2>/dev/null || echo "$UPLOAD_RESPONSE"
echo ""

# Test upload pièce jointe dossier
echo "4. Test upload pièce jointe dossier..."
UPLOAD_CASE_RESPONSE=$(curl -s -X POST \
  -F "file=@test_file.txt" \
  -F "description=Test upload dossier" \
  -F "category=document" \
  "$API_BASE/files/cases/$CASE_ID/upload")

echo "Réponse upload dossier:"
echo "$UPLOAD_CASE_RESPONSE" | jq '.' 2>/dev/null || echo "$UPLOAD_CASE_RESPONSE"
echo ""

# Lister les fichiers de rapport
echo "5. Lister les fichiers de rapport..."
REPORT_FILES=$(curl -s "$API_BASE/files/reports/$REPORT_ID/files")
echo "Fichiers du rapport $REPORT_ID:"
echo "$REPORT_FILES" | jq '.' 2>/dev/null || echo "$REPORT_FILES"
echo ""

# Lister les pièces jointes de dossier
echo "6. Lister les pièces jointes de dossier..."
CASE_ATTACHMENTS=$(curl -s "$API_BASE/files/cases/$CASE_ID/attachments")
echo "Pièces jointes du dossier $CASE_ID:"
echo "$CASE_ATTACHMENTS" | jq '.' 2>/dev/null || echo "$CASE_ATTACHMENTS"
echo ""

# Extraire les IDs des fichiers pour le test de download
REPORT_FILE_ID=$(echo "$REPORT_FILES" | jq -r '.files[0].id' 2>/dev/null)
CASE_ATTACHMENT_ID=$(echo "$CASE_ATTACHMENTS" | jq -r '.attachments[0].id' 2>/dev/null)

if [ "$REPORT_FILE_ID" != "null" ] && [ "$REPORT_FILE_ID" != "" ]; then
    echo "7. Test download fichier rapport (ID: $REPORT_FILE_ID)..."
    curl -s -o "downloaded_report_file.txt" \
      "$API_BASE/files/reports/$REPORT_ID/files/$REPORT_FILE_ID/download"
    
    if [ -f "downloaded_report_file.txt" ]; then
        echo "✅ Fichier rapport téléchargé: downloaded_report_file.txt"
        echo "Contenu:"
        cat "downloaded_report_file.txt"
        echo ""
    else
        echo "❌ Erreur lors du téléchargement du fichier rapport"
    fi
else
    echo "⚠️ Aucun fichier de rapport trouvé pour le test de download"
fi

if [ "$CASE_ATTACHMENT_ID" != "null" ] && [ "$CASE_ATTACHMENT_ID" != "" ]; then
    echo "8. Test download pièce jointe dossier (ID: $CASE_ATTACHMENT_ID)..."
    curl -s -o "downloaded_case_attachment.txt" \
      "$API_BASE/files/cases/$CASE_ID/attachments/$CASE_ATTACHMENT_ID/download"
    
    if [ -f "downloaded_case_attachment.txt" ]; then
        echo "✅ Pièce jointe dossier téléchargée: downloaded_case_attachment.txt"
        echo "Contenu:"
        cat "downloaded_case_attachment.txt"
        echo ""
    else
        echo "❌ Erreur lors du téléchargement de la pièce jointe"
    fi
else
    echo "⚠️ Aucune pièce jointe trouvée pour le test de download"
fi

# Test de recherche
echo "9. Test de recherche dans les fichiers..."
SEARCH_RESPONSE=$(curl -s "$API_BASE/files/reports/$REPORT_ID/files/search?fileName=test")
echo "Résultats de recherche 'test':"
echo "$SEARCH_RESPONSE" | jq '.' 2>/dev/null || echo "$SEARCH_RESPONSE"
echo ""

# Nettoyage
echo "10. Nettoyage des fichiers de test..."
rm -f test_file.txt downloaded_report_file.txt downloaded_case_attachment.txt
echo "✅ Fichiers de test supprimés"
echo ""

echo "🎉 Tests terminés!"
echo ""
echo "📋 Résumé des endpoints testés:"
echo "   ✅ POST /api/files/reports/{id}/upload"
echo "   ✅ POST /api/files/cases/{id}/upload"
echo "   ✅ GET /api/files/reports/{id}/files"
echo "   ✅ GET /api/files/cases/{id}/attachments"
echo "   ✅ GET /api/files/reports/{id}/files/{fileId}/download"
echo "   ✅ GET /api/files/cases/{id}/attachments/{attachmentId}/download"
echo "   ✅ GET /api/files/reports/{id}/files/search"
echo ""
echo "🌐 Interface web disponible: test_file_upload_download.html"
