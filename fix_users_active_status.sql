-- Script pour corriger le statut actif des utilisateurs
-- Tous les utilisateurs avec le statut REGISTERED doivent être actifs

UPDATE users 
SET is_active = true 
WHERE status = 'REGISTERED' AND is_active = false;

-- Vérifier le résultat
SELECT 
    id,
    username,
    email,
    status,
    is_active,
    CASE 
        WHEN status = 'REGISTERED' AND is_active = true THEN '✅ Correct'
        WHEN status = 'REGISTERED' AND is_active = false THEN '❌ Problème'
        ELSE '⚠️ Autre statut'
    END as verification
FROM users 
WHERE status = 'REGISTERED'
ORDER BY created_at DESC;
