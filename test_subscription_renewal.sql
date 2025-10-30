-- Script pour tester le système de demande de renouvellement d'abonnement
-- Créer un utilisateur test avec un abonnement expiré

-- Insérer un utilisateur test avec un abonnement expiré
INSERT INTO users (
    username,
    first_name,
    last_name,
    date_of_birth,
    insurance_company,
    password,
    email,
    status,
    role,
    subscription_start_date,
    subscription_end_date,
    subscription_active,
    subscription_status,
    is_active,
    created_at
) VALUES (
    'test_user',
    'Test',
    'User',
    '1990-01-01',
    'Test Insurance',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: password
    'test@example.com',
    'REGISTERED',
    'USER',
    '2023-01-01',
    '2024-01-01', -- Date d'expiration dans le passé
    false,
    'EXPIRED',
    true,
    CURRENT_TIMESTAMP
) ON CONFLICT (username) DO NOTHING;

-- Insérer un utilisateur test avec un abonnement expirant bientôt
INSERT INTO users (
    username,
    first_name,
    last_name,
    date_of_birth,
    insurance_company,
    password,
    email,
    status,
    role,
    subscription_start_date,
    subscription_end_date,
    subscription_active,
    subscription_status,
    is_active,
    created_at
) VALUES (
    'test_user2',
    'Test',
    'User2',
    '1990-01-01',
    'Test Insurance 2',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: password
    'test2@example.com',
    'REGISTERED',
    'USER',
    '2024-01-01',
    CURRENT_DATE + INTERVAL '15 days', -- Expire dans 15 jours
    true,
    'ACTIVE',
    true,
    CURRENT_TIMESTAMP
) ON CONFLICT (username) DO NOTHING;

-- Afficher les utilisateurs créés
SELECT 
    id,
    username,
    first_name,
    last_name,
    email,
    subscription_start_date,
    subscription_end_date,
    subscription_active,
    subscription_status,
    CASE 
        WHEN subscription_end_date < CURRENT_DATE THEN 'Expiré'
        WHEN subscription_end_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'Expire bientôt'
        ELSE 'Actif'
    END as statut_abonnement,
    (subscription_end_date - CURRENT_DATE) as jours_restants
FROM users 
WHERE username IN ('test_user', 'test_user2')
ORDER BY username;

-- Afficher les statistiques d'abonnement
SELECT 
    COUNT(*) as total_users,
    SUM(CASE WHEN subscription_status = 'EXPIRED' THEN 1 ELSE 0 END) as expired_count,
    SUM(CASE WHEN subscription_status = 'PENDING_RENEWAL' THEN 1 ELSE 0 END) as pending_renewal_count,
    SUM(CASE WHEN subscription_end_date <= CURRENT_DATE + INTERVAL '30 days' AND subscription_status = 'ACTIVE' THEN 1 ELSE 0 END) as expiring_soon_count
FROM users 
WHERE role = 'USER';
