-- Script pour créer la table temporary_access_codes
-- Exécuter ce script dans votre base de données PostgreSQL

-- 1. Supprimer la table si elle existe
DROP TABLE IF EXISTS temporary_access_codes CASCADE;

-- 2. Supprimer la séquence si elle existe
DROP SEQUENCE IF EXISTS temporary_access_codes_id_seq CASCADE;

-- 3. Créer la nouvelle table
CREATE TABLE temporary_access_codes (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    report_id BIGINT NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP,
    created_by VARCHAR(255) NOT NULL
);

-- 4. Créer des index pour améliorer les performances
CREATE INDEX idx_temporary_access_codes_code ON temporary_access_codes(code);
CREATE INDEX idx_temporary_access_codes_report_id ON temporary_access_codes(report_id);
CREATE INDEX idx_temporary_access_codes_user_id ON temporary_access_codes(user_id);
CREATE INDEX idx_temporary_access_codes_expires_at ON temporary_access_codes(expires_at);
CREATE INDEX idx_temporary_access_codes_used ON temporary_access_codes(used);

-- 5. Insérer quelques codes de test
INSERT INTO temporary_access_codes (
    code, 
    report_id, 
    user_id, 
    expires_at, 
    used, 
    created_by
) VALUES 
('ABC-123-DEF', 1, 'user1', CURRENT_TIMESTAMP + INTERVAL '24 hours', FALSE, 'admin'),
('XYZ-789-GHI', 2, 'user2', CURRENT_TIMESTAMP + INTERVAL '24 hours', FALSE, 'admin'),
('TEST-001-CODE', 3, 'user3', CURRENT_TIMESTAMP + INTERVAL '24 hours', FALSE, 'admin');

-- 6. Vérifier la structure de la table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'temporary_access_codes'
ORDER BY ordinal_position;

-- 7. Vérifier les données insérées
SELECT * FROM temporary_access_codes;
