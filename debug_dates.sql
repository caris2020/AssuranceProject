-- Script de débogage pour les calculs de dates
SELECT 
    username,
    subscription_start_date,
    subscription_end_date,
    CURRENT_DATE as current_date,
    (subscription_end_date - CURRENT_DATE) as days_remaining_sql,
    CASE 
        WHEN role = 'ADMIN' THEN 'ADMIN - Pas de calcul'
        ELSE (subscription_end_date - CURRENT_DATE)::text
    END as calculated_days
FROM users 
ORDER BY role, username;
