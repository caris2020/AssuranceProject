-- Script pour ajouter les colonnes manquantes de subscription
-- Ajouter les colonnes manquantes
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_start_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_end_date DATE DEFAULT (CURRENT_DATE + INTERVAL '1 year');
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_active BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'ACTIVE';

-- Mettre à jour les utilisateurs existants
UPDATE users 
SET subscription_start_date = CURRENT_DATE,
    subscription_end_date = CURRENT_DATE + INTERVAL '1 year',
    subscription_active = TRUE,
    subscription_status = 'ACTIVE'
WHERE subscription_start_date IS NULL 
   OR subscription_end_date IS NULL 
   OR subscription_active IS NULL 
   OR subscription_status IS NULL;

-- Vérifier les administrateurs
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
