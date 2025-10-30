-- Script de mise à jour pour le système d'abonnement
-- À exécuter sur la base de données existante

-- 1. Ajouter les nouvelles colonnes à la table users
ALTER TABLE users 
ADD COLUMN subscription_start_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN subscription_end_date DATE DEFAULT (CURRENT_DATE + INTERVAL '1 year'),
ADD COLUMN subscription_active BOOLEAN DEFAULT TRUE,
ADD COLUMN last_renewal_request_date DATE,
ADD COLUMN subscription_status VARCHAR(20) DEFAULT 'ACTIVE';

-- 2. Mettre à jour les utilisateurs existants avec des abonnements valides
UPDATE users 
SET 
    subscription_start_date = COALESCE(created_at::DATE, CURRENT_DATE),
    subscription_end_date = COALESCE(created_at::DATE, CURRENT_DATE) + INTERVAL '1 year',
    subscription_active = TRUE,
    subscription_status = 'ACTIVE'
WHERE subscription_start_date IS NULL;

-- 3. Mettre à jour les abonnements expirés
UPDATE users 
SET 
    subscription_active = FALSE,
    subscription_status = 'EXPIRED'
WHERE subscription_end_date < CURRENT_DATE;

-- 4. Créer un index pour optimiser les requêtes d'abonnement
CREATE INDEX idx_users_subscription_status ON users(subscription_status);
CREATE INDEX idx_users_subscription_end_date ON users(subscription_end_date);
CREATE INDEX idx_users_subscription_active ON users(subscription_active);

-- 5. Créer une vue pour les abonnements expirés
CREATE OR REPLACE VIEW expired_subscriptions AS
SELECT 
    id,
    username,
    first_name,
    last_name,
    email,
    insurance_company,
    subscription_start_date,
    subscription_end_date,
    subscription_active,
    subscription_status,
    last_renewal_request_date,
    CURRENT_DATE - subscription_end_date AS days_expired
FROM users 
WHERE subscription_end_date < CURRENT_DATE 
AND subscription_active = TRUE;

-- 6. Créer une vue pour les abonnements expirant bientôt (30 jours)
CREATE OR REPLACE VIEW expiring_soon_subscriptions AS
SELECT 
    id,
    username,
    first_name,
    last_name,
    email,
    insurance_company,
    subscription_start_date,
    subscription_end_date,
    subscription_active,
    subscription_status,
    subscription_end_date - CURRENT_DATE AS days_until_expiration
FROM users 
WHERE subscription_end_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '30 days')
AND subscription_status = 'ACTIVE'
AND subscription_active = TRUE;

-- 7. Créer une vue pour les demandes de renouvellement en attente
CREATE OR REPLACE VIEW pending_renewal_subscriptions AS
SELECT 
    id,
    username,
    first_name,
    last_name,
    email,
    insurance_company,
    subscription_start_date,
    subscription_end_date,
    subscription_active,
    subscription_status,
    last_renewal_request_date,
    CURRENT_DATE - last_renewal_request_date AS days_since_request
FROM users 
WHERE subscription_status = 'PENDING_RENEWAL'
AND last_renewal_request_date IS NOT NULL;

-- 8. Créer une fonction pour renouveler un abonnement
CREATE OR REPLACE FUNCTION renew_user_subscription(user_id BIGINT)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE users 
    SET 
        subscription_start_date = CURRENT_DATE,
        subscription_end_date = CURRENT_DATE + INTERVAL '1 year',
        subscription_active = TRUE,
        subscription_status = 'ACTIVE',
        last_renewal_request_date = NULL
    WHERE id = user_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- 9. Créer une fonction pour demander un renouvellement
CREATE OR REPLACE FUNCTION request_subscription_renewal(user_id BIGINT)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE users 
    SET 
        subscription_status = 'PENDING_RENEWAL',
        last_renewal_request_date = CURRENT_DATE
    WHERE id = user_id 
    AND (subscription_status = 'EXPIRED' OR subscription_status = 'PENDING_RENEWAL');
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- 10. Créer une fonction pour vérifier les abonnements expirés
CREATE OR REPLACE FUNCTION check_expired_subscriptions()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    UPDATE users 
    SET 
        subscription_active = FALSE,
        subscription_status = 'EXPIRED'
    WHERE subscription_end_date < CURRENT_DATE 
    AND subscription_active = TRUE;
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- 11. Créer un trigger pour mettre à jour automatiquement les abonnements expirés
CREATE OR REPLACE FUNCTION update_expired_subscriptions()
RETURNS TRIGGER AS $$
BEGIN
    -- Mettre à jour les abonnements expirés lors de l'insertion ou mise à jour
    IF NEW.subscription_end_date < CURRENT_DATE THEN
        NEW.subscription_active = FALSE;
        NEW.subscription_status = 'EXPIRED';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_expired_subscriptions
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_expired_subscriptions();

-- 12. Insérer des données de test (optionnel)
-- Décommenter pour ajouter des utilisateurs de test avec différents statuts d'abonnement

/*
INSERT INTO users (
    username, first_name, last_name, email, insurance_company, 
    password, date_of_birth, status, role, subscription_start_date, 
    subscription_end_date, subscription_active, subscription_status
) VALUES 
-- Utilisateur avec abonnement expiré
('user_expired', 'Jean', 'Dupont', 'jean.dupont@test.com', 'Test Insurance',
 'password123', '1990-01-01', 'REGISTERED', 'USER', 
 '2023-01-01', '2024-01-01', FALSE, 'EXPIRED'),

-- Utilisateur avec abonnement expirant bientôt
('user_expiring', 'Marie', 'Martin', 'marie.martin@test.com', 'Test Insurance',
 'password123', '1990-01-01', 'REGISTERED', 'USER', 
 CURRENT_DATE - INTERVAL '340 days', CURRENT_DATE + INTERVAL '25 days', TRUE, 'ACTIVE'),

-- Utilisateur avec demande de renouvellement en attente
('user_pending', 'Pierre', 'Durand', 'pierre.durand@test.com', 'Test Insurance',
 'password123', '1990-01-01', 'REGISTERED', 'USER', 
 '2023-01-01', '2024-01-01', FALSE, 'PENDING_RENEWAL')
ON CONFLICT (username) DO NOTHING;
*/

-- 13. Créer des statistiques d'abonnement
CREATE OR REPLACE VIEW subscription_stats AS
SELECT 
    COUNT(*) AS total_users,
    COUNT(CASE WHEN subscription_status = 'ACTIVE' THEN 1 END) AS active_subscriptions,
    COUNT(CASE WHEN subscription_status = 'EXPIRED' THEN 1 END) AS expired_subscriptions,
    COUNT(CASE WHEN subscription_status = 'PENDING_RENEWAL' THEN 1 END) AS pending_renewals,
    COUNT(CASE WHEN subscription_status = 'SUSPENDED' THEN 1 END) AS suspended_subscriptions,
    COUNT(CASE WHEN subscription_end_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '30 days') THEN 1 END) AS expiring_soon
FROM users;

-- 14. Afficher les statistiques actuelles
SELECT 'Statistiques des abonnements après mise à jour:' AS info;
SELECT * FROM subscription_stats;

-- 15. Afficher les abonnements expirés
SELECT 'Abonnements expirés:' AS info;
SELECT username, first_name, last_name, subscription_end_date, days_expired 
FROM expired_subscriptions 
LIMIT 5;

-- 16. Afficher les abonnements expirant bientôt
SELECT 'Abonnements expirant bientôt:' AS info;
SELECT username, first_name, last_name, subscription_end_date, days_until_expiration 
FROM expiring_soon_subscriptions 
LIMIT 5;

-- Message de confirmation
SELECT 'Système d''abonnement mis à jour avec succès!' AS status;
