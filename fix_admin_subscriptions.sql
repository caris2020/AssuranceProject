-- Script pour corriger les abonnements des administrateurs
-- Ce script réactive les abonnements des administrateurs qui auraient été désactivés

-- Réactiver les abonnements des administrateurs
UPDATE users 
SET subscription_active = true,
    subscription_status = 'ACTIVE'
WHERE role = 'ADMIN' 
  AND (subscription_active = false OR subscription_status IN ('EXPIRED', 'PENDING_RENEWAL', 'SUSPENDED'));

-- Mettre à jour les dates d'abonnement des administrateurs si nécessaire
UPDATE users 
SET subscription_start_date = CURRENT_DATE,
    subscription_end_date = CURRENT_DATE + INTERVAL '1 year'
WHERE role = 'ADMIN' 
  AND (subscription_start_date IS NULL OR subscription_end_date IS NULL);

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
    subscription_end_date
FROM users 
WHERE role = 'ADMIN';

-- Afficher le nombre d'administrateurs mis à jour
SELECT 
    COUNT(*) as admin_count,
    SUM(CASE WHEN subscription_active = true THEN 1 ELSE 0 END) as active_subscriptions
FROM users 
WHERE role = 'ADMIN';
