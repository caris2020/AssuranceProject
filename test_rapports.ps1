Write-Host "Test de l'API des fichiers attachés aux rapports" -ForegroundColor Green

# Test 1: Lister les rapports
Write-Host "`nTest 1: Lister les rapports" -ForegroundColor Yellow
try {
    $reports = Invoke-RestMethod -Uri "http://localhost:8080/api/reports" -Method GET
    Write-Host "Rapports trouvés: $($reports.Count)" -ForegroundColor Green
    
    if ($reports.Count -gt 0) {
        $firstReport = $reports[0]
        Write-Host "Premier rapport: ID=$($firstReport.id), Titre=$($firstReport.title)" -ForegroundColor Cyan
        
        # Test 2: Lister les fichiers attachés du premier rapport
        Write-Host "`nTest 2: Lister les fichiers attachés du rapport $($firstReport.id)" -ForegroundColor Yellow
        try {
            $files = Invoke-RestMethod -Uri "http://localhost:8080/api/files/reports/$($firstReport.id)/files" -Method GET
            Write-Host "Fichiers attachés trouvés: $($files.files.Count)" -ForegroundColor Green
            
            if ($files.files.Count -gt 0) {
                Write-Host "Premier fichier: $($files.files[0].fileName)" -ForegroundColor Cyan
            } else {
                Write-Host "Aucun fichier attaché trouvé" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "Erreur lors de la récupération des fichiers attachés: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        # Test 3: Uploader un fichier de test
        Write-Host "`nTest 3: Uploader un fichier de test" -ForegroundColor Yellow
        try {
            # Créer un fichier de test
            "Ceci est un fichier de test pour vérifier l'upload de rapport" | Out-File -FilePath "test_rapport.txt" -Encoding UTF8
            
            $form = @{
                file = Get-Item "test_rapport.txt"
                description = "Test upload rapport"
                category = "justificatif"
            }
            
            $uploadResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/files/reports/$($firstReport.id)/upload" -Method POST -Form $form
            Write-Host "Upload réussi: $($uploadResponse.file.fileName)" -ForegroundColor Green
            
            # Vérifier que le fichier apparaît dans la liste
            Start-Sleep 2
            $filesAfter = Invoke-RestMethod -Uri "http://localhost:8080/api/files/reports/$($firstReport.id)/files" -Method GET
            Write-Host "Fichiers attachés après upload: $($filesAfter.files.Count)" -ForegroundColor Green
            
            if ($filesAfter.files.Count -gt 0) {
                Write-Host "Fichier uploadé visible: $($filesAfter.files[0].fileName)" -ForegroundColor Green
            }
            
        } catch {
            Write-Host "Erreur lors de l'upload: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "Erreur lors de la récupération des rapports: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest terminé" -ForegroundColor Green
