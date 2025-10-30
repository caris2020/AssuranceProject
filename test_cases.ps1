Write-Host "Test de l'API des dossiers" -ForegroundColor Green

# Test 1: Lister tous les dossiers
Write-Host "`nTest 1: Lister tous les dossiers" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/cases" -Method GET
    Write-Host "Réponse:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
    
    if ($response -and $response.Count -gt 0) {
        Write-Host "`nPremier dossier trouvé:" -ForegroundColor Cyan
        $firstCase = $response[0]
        Write-Host "ID: $($firstCase.id)" -ForegroundColor White
        Write-Host "Référence: $($firstCase.reference)" -ForegroundColor White
        Write-Host "Statut: $($firstCase.status)" -ForegroundColor White
    } else {
        Write-Host "Aucun dossier trouvé" -ForegroundColor Red
    }
} catch {
    Write-Host "Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest terminé" -ForegroundColor Green
