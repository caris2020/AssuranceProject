# Script PowerShell pour corriger les dates d'abonnement
Write-Host "Début de la correction des dates d'abonnement..." -ForegroundColor Green

# Vérifier que Docker est en cours d'exécution
Write-Host "Vérification de l'état des conteneurs..." -ForegroundColor Yellow
docker-compose ps

# Afficher la date actuelle
Write-Host "`nDate actuelle dans la base de données:" -ForegroundColor Cyan
docker-compose exec db psql -U postgres -d assurance -c "SELECT CURRENT_DATE;"

# Afficher l'état actuel des abonnements
Write-Host "`nÉtat actuel des abonnements:" -ForegroundColor Cyan
docker-compose exec db psql -U postgres -d assurance -c "SELECT id, username, subscription_start_date, subscription_end_date, subscription_active, subscription_status, role FROM users ORDER BY id;"

# Corriger les dates d'abonnement pour les utilisateurs normaux
Write-Host "`nCorrection des dates d'abonnement pour les utilisateurs normaux..." -ForegroundColor Yellow
docker-compose exec db psql -U postgres -d assurance -c "UPDATE users SET subscription_start_date = CURRENT_DATE, subscription_end_date = CURRENT_DATE + INTERVAL '1 year', subscription_active = true, subscription_status = 'ACTIVE' WHERE role != 'ADMIN';"

# Corriger les dates d'abonnement pour les administrateurs
Write-Host "`nCorrection des dates d'abonnement pour les administrateurs..." -ForegroundColor Yellow
docker-compose exec db psql -U postgres -d assurance -c "UPDATE users SET subscription_start_date = CURRENT_DATE, subscription_end_date = CURRENT_DATE + INTERVAL '100 years', subscription_active = true, subscription_status = 'ACTIVE' WHERE role = 'ADMIN';"

# Afficher l'état après correction
Write-Host "`nÉtat après correction:" -ForegroundColor Green
docker-compose exec db psql -U postgres -d assurance -c "SELECT id, username, subscription_start_date, subscription_end_date, subscription_active, subscription_status, role, (subscription_end_date - CURRENT_DATE) as jours_restants FROM users ORDER BY id;"

Write-Host "`nCorrection terminée!" -ForegroundColor Green
