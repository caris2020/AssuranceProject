Write-Host "Test de l'API des dossiers et fichiers attachés" -ForegroundColor Green

# Test 1: Lister les dossiers
Write-Host "`nTest 1: Lister les dossiers" -ForegroundColor Yellow
try {
    $cases = Invoke-RestMethod -Uri "http://localhost:8080/api/cases" -Method GET
    Write-Host "Dossiers trouvés: $($cases.Count)" -ForegroundColor Green
    
    if ($cases.Count -gt 0) {
        $firstCase = $cases[0]
        Write-Host "Premier dossier: ID=$($firstCase.id), Référence=$($firstCase.reference)" -ForegroundColor Cyan
        
        # Test 2: Lister les fichiers attachés du premier dossier
        Write-Host "`nTest 2: Lister les fichiers attachés du dossier $($firstCase.id)" -ForegroundColor Yellow
        try {
            $attachments = Invoke-RestMethod -Uri "http://localhost:8080/api/files/cases/$($firstCase.id)/attachments" -Method GET
            Write-Host "Fichiers attachés trouvés: $($attachments.attachments.Count)" -ForegroundColor Green
            
            if ($attachments.attachments.Count -gt 0) {
                Write-Host "Premier fichier: $($attachments.attachments[0].fileName)" -ForegroundColor Cyan
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
            "Ceci est un fichier de test pour vérifier l'upload" | Out-File -FilePath "test_dossier.txt" -Encoding UTF8
            
            $form = @{
                file = Get-Item "test_dossier.txt"
                description = "Test upload dossier"
                category = "justificatif"
            }
            
            $uploadResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/files/cases/$($firstCase.id)/upload" -Method POST -Form $form
            Write-Host "Upload réussi: $($uploadResponse.file.fileName)" -ForegroundColor Green
            
            # Vérifier que le fichier apparaît dans la liste
            Start-Sleep 2
            $attachmentsAfter = Invoke-RestMethod -Uri "http://localhost:8080/api/files/cases/$($firstCase.id)/attachments" -Method GET
            Write-Host "Fichiers attachés après upload: $($attachmentsAfter.attachments.Count)" -ForegroundColor Green
            
            if ($attachmentsAfter.attachments.Count -gt 0) {
                Write-Host "Fichier uploadé visible: $($attachmentsAfter.attachments[0].fileName)" -ForegroundColor Green
            }
            
        } catch {
            Write-Host "Erreur lors de l'upload: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "Erreur lors de la récupération des dossiers: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest terminé" -ForegroundColor Green
