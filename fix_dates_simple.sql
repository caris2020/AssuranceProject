-- Corriger les dates d'abonnement
UPDATE users 
SET 
    subscription_start_date = CURRENT_DATE,
    subscription_end_date = CURRENT_DATE + INTERVAL '1 year',
    subscription_active = true,
    subscription_status = 'ACTIVE'
WHERE role != 'ADMIN';

-- Pour les administrateurs
UPDATE users 
SET 
    subscription_start_date = CURRENT_DATE,
    subscription_end_date = CURRENT_DATE + INTERVAL '100 years',
    subscription_active = true,
    subscription_status = 'ACTIVE'
WHERE role = 'ADMIN';
