Write-Host "Test de l'API des fichiers attachés" -ForegroundColor Green

# Test 1: Lister les fichiers attachés du dossier 1
Write-Host "`nTest 1: Lister les fichiers attachés du dossier 1" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/files/cases/1/attachments" -Method GET
    Write-Host "Réponse:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Uploader un fichier
Write-Host "`nTest 2: Uploader un fichier" -ForegroundColor Yellow
try {
    $filePath = "test_api_simple.html"
    if (Test-Path $filePath) {
        $form = @{
            file = Get-Item $filePath
            description = "Test upload PowerShell"
        }
        
        $response = Invoke-RestMethod -Uri "http://localhost:8080/api/files/cases/1/upload" -Method POST -Form $form
        Write-Host "Réponse:" -ForegroundColor Green
        $response | ConvertTo-Json -Depth 10
    } else {
        Write-Host "Fichier $filePath non trouvé" -ForegroundColor Red
    }
} catch {
    Write-Host "Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest terminé" -ForegroundColor Green
