-- Script de correction des dates d'abonnement
-- Ce script corrige les dates d'abonnement pour qu'elles soient basées sur la date actuelle

-- Afficher la date actuelle
SELECT 'Date actuelle:' as info, CURRENT_DATE as current_date;

-- Afficher l'état actuel des abonnements
SELECT 
    id,
    username,
    subscription_start_date,
    subscription_end_date,
    subscription_active,
    subscription_status,
    role,
    CASE 
        WHEN subscription_end_date < CURRENT_DATE THEN 'EXPIRÉ'
        WHEN subscription_end_date = CURRENT_DATE THEN 'EXPIRE AUJOURD\'HUI'
        WHEN subscription_end_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'EXPIRE BIENTÔT'
        ELSE 'ACTIF'
    END as statut_calculé
FROM users 
ORDER BY id;

-- Corriger les dates d'abonnement pour qu'elles soient basées sur la date actuelle
-- Les abonnements commencent aujourd'hui et durent 1 an
UPDATE users 
SET 
    subscription_start_date = CURRENT_DATE,
    subscription_end_date = CURRENT_DATE + INTERVAL '1 year',
    subscription_active = true,
    subscription_status = 'ACTIVE'
WHERE role != 'ADMIN';

-- Pour les administrateurs, s'assurer qu'ils ont un abonnement qui n'expire jamais
UPDATE users 
SET 
    subscription_start_date = CURRENT_DATE,
    subscription_end_date = CURRENT_DATE + INTERVAL '100 years',
    subscription_active = true,
    subscription_status = 'ACTIVE'
WHERE role = 'ADMIN';

-- Afficher l'état après correction
SELECT 
    id,
    username,
    subscription_start_date,
    subscription_end_date,
    subscription_active,
    subscription_status,
    role,
    CASE 
        WHEN subscription_end_date < CURRENT_DATE THEN 'EXPIRÉ'
        WHEN subscription_end_date = CURRENT_DATE THEN 'EXPIRE AUJOURD\'HUI'
        WHEN subscription_end_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'EXPIRE BIENTÔT'
        ELSE 'ACTIF'
    END as statut_calculé,
    (subscription_end_date - CURRENT_DATE) as jours_restants
FROM users 
ORDER BY id;

-- Vérifier que les calculs sont corrects
SELECT 
    'Vérification des calculs' as info,
    COUNT(*) as total_utilisateurs,
    COUNT(CASE WHEN subscription_active = true THEN 1 END) as abonnements_actifs,
    COUNT(CASE WHEN subscription_status = 'ACTIVE' THEN 1 END) as statut_actif,
    COUNT(CASE WHEN role = 'ADMIN' THEN 1 END) as administrateurs
FROM users;
