-- Script pour recréer les tables avec la bonne structure
-- ATTENTION : Ce script supprime et recrée les tables, toutes les données seront perdues !

-- Supprimer les tables existantes
DROP TABLE IF EXISTS report_files CASCADE;
DROP TABLE IF EXISTS case_attachments CASCADE;

-- Recréer la table report_files avec la bonne structure
CREATE TABLE report_files (
    id BIGSERIAL PRIMARY KEY,
    report_id BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    content_type VARCHAR(255),
    size_bytes BIGINT,
    iv BYTEA, -- Colonne BLOB correctement configurée
    cipher_text BYTEA, -- Colonne BLOB correctement configurée
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
);

-- Recréer la table case_attachments avec la bonne structure
CREATE TABLE case_attachments (
    id BIGSERIAL PRIMARY KEY,
    insurance_case_id BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    content_type VARCHAR(255),
    size_bytes BIGINT,
    iv BYTEA, -- Colonne BLOB correctement configurée
    cipher_text BYTEA, -- Colonne BLOB correctement configurée
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (insurance_case_id) REFERENCES insurance_cases(id) ON DELETE CASCADE
);

-- Vérifier la structure créée
SELECT 
    table_name, 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name IN ('report_files', 'case_attachments') 
AND column_name IN ('iv', 'cipher_text')
ORDER BY table_name, column_name;
