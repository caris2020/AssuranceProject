-- Script simple pour corriger la base de données PostgreSQL
-- Exécutez ce script dans votre client SQL PostgreSQL

-- 1. Supprimer complètement les tables problématiques
DROP TABLE IF EXISTS report_files CASCADE;
DROP TABLE IF EXISTS case_attachments CASCADE;

-- 2. Recréer la table report_files avec la bonne structure
CREATE TABLE report_files (
    id BIGSERIAL PRIMARY KEY,
    report_id BIGINT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    content_type VARCHAR(100),
    file_size BIGINT,
    iv BYTEA,
    cipher_text BYTEA,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Recréer la table case_attachments avec la bonne structure
CREATE TABLE case_attachments (
    id BIGSERIAL PRIMARY KEY,
    case_id BIGINT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    content_type VARCHAR(100),
    file_size BIGINT,
    iv BYTEA,
    cipher_text BYTEA,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Vérifier que les tables sont créées correctement
SELECT 
    table_name, 
    column_name, 
    data_type
FROM information_schema.columns 
WHERE table_name IN ('report_files', 'case_attachments')
ORDER BY table_name, column_name;
