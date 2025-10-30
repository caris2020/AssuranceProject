-- Script pour s'assurer que les administrateurs ont un abonnement qui ne expire jamais
-- Mettre à jour les administrateurs existants pour qu'ils aient un abonnement de 100 ans

UPDATE users 
SET subscription_end_date = CURRENT_DATE + INTERVAL '100 years',
    subscription_active = true,
    subscription_status = 'ACTIVE'
WHERE role = 'ADMIN';

-- Afficher les administrateurs pour vérification
SELECT 
    id,
    username,
    first_name,
    last_name,
    role,
    subscription_active,
    subscription_status,
    subscription_start_date,
    subscription_end_date,
    CASE 
        WHEN role = 'ADMIN' THEN 'Jamais (Administrateur)'
        ELSE (subscription_end_date - CURRENT_DATE)::text || ' jours'
    END as jours_restants
FROM users 
WHERE role = 'ADMIN';

-- Afficher un résumé
SELECT 
    COUNT(*) as total_admins,
    SUM(CASE WHEN subscription_active = true THEN 1 ELSE 0 END) as admins_actifs,
    SUM(CASE WHEN subscription_end_date > CURRENT_DATE + INTERVAL '50 years' THEN 1 ELSE 0 END) as admins_abonnement_permanent
FROM users 
WHERE role = 'ADMIN';
