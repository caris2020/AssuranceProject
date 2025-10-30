@echo off
echo Correction des dates d'abonnement...
echo.

echo Date actuelle:
docker-compose exec -T db psql -U postgres -d assurance -c "SELECT CURRENT_DATE;"

echo.
echo Etat avant correction:
docker-compose exec -T db psql -U postgres -d assurance -c "SELECT id, username, subscription_start_date, subscription_end_date, subscription_active, subscription_status, role FROM users ORDER BY id;"

echo.
echo Correction des utilisateurs normaux...
docker-compose exec -T db psql -U postgres -d assurance -c "UPDATE users SET subscription_start_date = CURRENT_DATE, subscription_end_date = CURRENT_DATE + INTERVAL '1 year', subscription_active = true, subscription_status = 'ACTIVE' WHERE role != 'ADMIN';"

echo.
echo Correction des administrateurs...
docker-compose exec -T db psql -U postgres -d assurance -c "UPDATE users SET subscription_start_date = CURRENT_DATE, subscription_end_date = CURRENT_DATE + INTERVAL '100 years', subscription_active = true, subscription_status = 'ACTIVE' WHERE role = 'ADMIN';"

echo.
echo Etat apres correction:
docker-compose exec -T db psql -U postgres -d assurance -c "SELECT id, username, subscription_start_date, subscription_end_date, subscription_active, subscription_status, role, (subscription_end_date - CURRENT_DATE) as jours_restants FROM users ORDER BY id;"

echo.
echo Correction terminee!
pause
