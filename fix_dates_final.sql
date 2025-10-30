-- Script de correction des dates d'abonnement
-- Utiliser des dates fixes pour éviter les problèmes de guillemets

-- Corriger les dates pour les utilisateurs normaux
UPDATE users 
SET subscription_start_date = '2024-12-27'::date,
    subscription_end_date = '2025-12-27'::date,
    subscription_active = true,
    subscription_status = 'ACTIVE'
WHERE role != 'ADMIN';

-- Corriger les dates pour les administrateurs
UPDATE users 
SET subscription_start_date = '2024-12-27'::date,
    subscription_end_date = '2124-12-27'::date,
    subscription_active = true,
    subscription_status = 'ACTIVE'
WHERE role = 'ADMIN';

-- Vérifier les résultats
SELECT 
    id,
    username,
    subscription_start_date,
    subscription_end_date,
    subscription_active,
    subscription_status,
    role,
    (subscription_end_date - CURRENT_DATE) as jours_restants
FROM users 
ORDER BY id;
