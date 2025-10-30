Write-Host "Test d'upload simple" -ForegroundColor Green

# Créer un fichier de test
$testContent = "Ceci est un fichier de test pour vérifier l'upload"
$testContent | Out-File -FilePath "test_file.txt" -Encoding UTF8

Write-Host "Fichier de test créé: test_file.txt" -ForegroundColor Yellow

# Test d'upload
try {
    $form = @{
        file = Get-Item "test_file.txt"
        description = "Test upload simple"
        category = "test"
    }
    
    Write-Host "Upload en cours..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/files/cases/14/upload" -Method POST -Form $form
    
    Write-Host "Réponse:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
    
    # Vérifier immédiatement si le fichier est dans la base
    Write-Host "`nVérification dans la base de données..." -ForegroundColor Yellow
    $attachments = Invoke-RestMethod -Uri "http://localhost:8080/api/files/cases/14/attachments" -Method GET
    Write-Host "Fichiers attachés:" -ForegroundColor Green
    $attachments | ConvertTo-Json -Depth 10
    
} catch {
    Write-Host "Erreur: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Code d'erreur: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}

Write-Host "`nTest terminé" -ForegroundColor Green
