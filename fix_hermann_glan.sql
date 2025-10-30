-- Script pour corriger spécifiquement l'utilisateur hermann glan
-- Email: noumano296@gmail.com

-- 1. Vérifier l'état actuel
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
WHERE email = 'noumano296@gmail.com';

-- 2. Corriger l'utilisateur hermann glan
UPDATE users 
SET is_active = true 
WHERE email = 'noumano296@gmail.com' AND status = 'REGISTERED';

-- 3. Vérifier le résultat après correction
SELECT 
    id,
    username,
    email,
    status,
    is_active,
    CASE 
        WHEN status = 'REGISTERED' AND is_active = true THEN '✅ Correct - Bouton Désactiver visible'
        WHEN status = 'REGISTERED' AND is_active = false THEN '❌ Problème - Bouton Activer visible'
        ELSE '⚠️ Autre statut'
    END as verification
FROM users 
WHERE email = 'noumano296@gmail.com';
