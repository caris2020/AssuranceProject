-- Script pour corriger les dates d'abonnement
-- Met à jour les dates d'abonnement pour qu'elles soient plus réalistes

-- 1. Utilisateur avec abonnement qui expire dans 30 jours
UPDATE users 
SET 
    subscription_start_date = CURRENT_DATE - INTERVAL '335 days',
    subscription_end_date = CURRENT_DATE + INTERVAL '30 days',
    subscription_active = true,
    subscription_status = 'ACTIVE'
WHERE username = 'octavio';

-- 2. Utilisateur avec abonnement qui expire dans 5 jours
UPDATE users 
SET 
    subscription_start_date = CURRENT_DATE - INTERVAL '360 days',
    subscription_end_date = CURRENT_DATE + INTERVAL '5 days',
    subscription_active = true,
    subscription_status = 'ACTIVE'
WHERE username = 'noumano';

-- 3. Utilisateur avec abonnement expiré
UPDATE users 
SET 
    subscription_start_date = CURRENT_DATE - INTERVAL '400 days',
    subscription_end_date = CURRENT_DATE - INTERVAL '10 days',
    subscription_active = false,
    subscription_status = 'EXPIRED'
WHERE username = 'JACQUES';

-- 4. Utilisateur avec abonnement qui commence dans 10 jours
UPDATE users 
SET 
    subscription_start_date = CURRENT_DATE + INTERVAL '10 days',
    subscription_end_date = CURRENT_DATE + INTERVAL '375 days',
    subscription_active = false,
    subscription_status = 'ACTIVE'
WHERE username = 'admin';

-- Afficher les résultats
SELECT 
    username,
    subscription_start_date,
    subscription_end_date,
    subscription_active,
    subscription_status,
    CASE 
        WHEN CURRENT_DATE < subscription_start_date THEN 'N\'A PAS COMMENCÉ'
        WHEN CURRENT_DATE > subscription_end_date THEN 'EXPIRÉ'
        ELSE 'EN COURS'
    END as etat_abonnement
FROM users 
WHERE subscription_start_date IS NOT NULL 
ORDER BY username;
