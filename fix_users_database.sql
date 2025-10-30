-- Script pour corriger automatiquement le problème des utilisateurs inactifs
-- Ce script s'assure que tous les utilisateurs REGISTERED sont actifs

-- 1. Vérifier l'état actuel
SELECT 
    'État actuel' as info,
    COUNT(*) as total_users,
    COUNT(CASE WHEN status = 'REGISTERED' THEN 1 END) as registered_users,
    COUNT(CASE WHEN status = 'REGISTERED' AND is_active = true THEN 1 END) as registered_active,
    COUNT(CASE WHEN status = 'REGISTERED' AND is_active = false THEN 1 END) as registered_inactive
FROM users;

-- 2. Afficher les utilisateurs problématiques
SELECT 
    id,
    username,
    email,
    first_name,
    last_name,
    status,
    is_active,
    created_at
FROM users 
WHERE status = 'REGISTERED' AND is_active = false
ORDER BY created_at DESC;

-- 3. Corriger le problème (décommenter pour exécuter)
-- UPDATE users 
-- SET is_active = true 
-- WHERE status = 'REGISTERED' AND is_active = false;

-- 4. Vérifier le résultat après correction
-- SELECT 
--     'Après correction' as info,
--     COUNT(*) as total_users,
--     COUNT(CASE WHEN status = 'REGISTERED' THEN 1 END) as registered_users,
--     COUNT(CASE WHEN status = 'REGISTERED' AND is_active = true THEN 1 END) as registered_active,
--     COUNT(CASE WHEN status = 'REGISTERED' AND is_active = false THEN 1 END) as registered_inactive
-- FROM users;
