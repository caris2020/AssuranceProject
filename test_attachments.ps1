Write-Host "Test de l'API des fichiers attachés" -ForegroundColor Green

# Test 1: Lister les fichiers attachés du dossier 14
Write-Host "`nTest 1: Lister les fichiers attachés du dossier 14" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/files/cases/14/attachments" -Method GET
    Write-Host "Réponse:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Erreur: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Code d'erreur: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}

# Test 2: Uploader un fichier sur le dossier 14
Write-Host "`nTest 2: Uploader un fichier sur le dossier 14" -ForegroundColor Yellow
try {
    $filePath = "test_api_simple.html"
    if (Test-Path $filePath) {
        $boundary = [System.Guid]::NewGuid().ToString()
        $LF = "`r`n"
        
        $bodyLines = (
            "--$boundary",
            "Content-Disposition: form-data; name=`"file`"; filename=`"$filePath`"",
            "Content-Type: text/html",
            "",
            [System.IO.File]::ReadAllText($filePath),
            "--$boundary",
            "Content-Disposition: form-data; name=`"description`"",
            "",
            "Test upload PowerShell",
            "--$boundary--"
        ) -join $LF
        
        $headers = @{
            "Content-Type" = "multipart/form-data; boundary=$boundary"
        }
        
        $response = Invoke-RestMethod -Uri "http://localhost:8080/api/files/cases/14/upload" -Method POST -Body $bodyLines -Headers $headers
        Write-Host "Réponse:" -ForegroundColor Green
        $response | ConvertTo-Json -Depth 10
    } else {
        Write-Host "Fichier $filePath non trouvé" -ForegroundColor Red
    }
} catch {
    Write-Host "Erreur: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Code d'erreur: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}

Write-Host "`nTest terminé" -ForegroundColor Green
