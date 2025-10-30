-- Script d'urgence pour corriger la base de données PostgreSQL
-- Ce script supprime et recrée les tables problématiques

-- 1. Supprimer les tables problématiques
DROP TABLE IF EXISTS report_files CASCADE;
DROP TABLE IF EXISTS case_attachments CASCADE;

-- 2. Recréer report_files avec structure simple
CREATE TABLE report_files (
    id BIGSERIAL PRIMARY KEY,
    report_id BIGINT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    content_type VARCHAR(100),
    file_size BIGINT,
    iv BYTEA DEFAULT '\x00000000000000000000000000000000',
    cipher_text BYTEA DEFAULT '\x',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Recréer case_attachments avec structure simple
CREATE TABLE case_attachments (
    id BIGSERIAL PRIMARY KEY,
    case_id BIGINT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    content_type VARCHAR(100),
    file_size BIGINT,
    iv BYTEA DEFAULT '\x00000000000000000000000000000000',
    cipher_text BYTEA DEFAULT '\x',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Vérifier la structure
SELECT 'report_files' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'report_files'
UNION ALL
SELECT 'case_attachments' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'case_attachments'
ORDER BY table_name, column_name;
