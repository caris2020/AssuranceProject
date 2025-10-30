-- Script pour corriger le conflit de colonnes dans access_requests
-- Exécuter ce script dans votre base de données PostgreSQL

-- 1. Vérifier la structure actuelle de la table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'access_requests';

-- 2. Supprimer la table access_requests si elle existe
DROP TABLE IF EXISTS access_requests CASCADE;

-- 3. Supprimer la séquence si elle existe
DROP SEQUENCE IF EXISTS access_requests_id_seq CASCADE;

-- 4. Créer la nouvelle table avec la structure correcte
CREATE TABLE access_requests (
    id BIGSERIAL PRIMARY KEY,
    report_id BIGINT NOT NULL,
    report_title VARCHAR(255) NOT NULL,
    requester_id VARCHAR(255) NOT NULL,
    requester_name VARCHAR(255) NOT NULL,
    requester_email VARCHAR(255) NOT NULL,
    requester_company VARCHAR(255) NOT NULL,
    requester_phone VARCHAR(50),
    reason TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    processed_by VARCHAR(255),
    temporary_code VARCHAR(20),
    expires_at TIMESTAMP,
    rejection_reason TEXT
);

-- 5. Créer des index pour améliorer les performances
CREATE INDEX idx_access_requests_report_id ON access_requests(report_id);
CREATE INDEX idx_access_requests_requester_id ON access_requests(requester_id);
CREATE INDEX idx_access_requests_status ON access_requests(status);
CREATE INDEX idx_access_requests_requested_at ON access_requests(requested_at);

-- 6. Vérifier que la table a été créée correctement
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'access_requests'
ORDER BY ordinal_position;

-- 7. Insérer quelques données de test (optionnel)
INSERT INTO access_requests (
    report_id, 
    report_title, 
    requester_id, 
    requester_name, 
    requester_email, 
    requester_company,
    status,
    temporary_code,
    expires_at
) VALUES 
(1, 'Rapport Test 1', 'user1', 'Jean Dupont', 'jean@example.com', 'Entreprise A', 'APPROVED', 'ABC-123-DEF', CURRENT_TIMESTAMP + INTERVAL '24 hours'),
(2, 'Rapport Test 2', 'user2', 'Marie Martin', 'marie@example.com', 'Entreprise B', 'PENDING', NULL, NULL);

-- 8. Vérifier les données insérées
SELECT * FROM access_requests;
