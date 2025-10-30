-- Script définitif pour corriger la base de données PostgreSQL
-- Ce script résout définitivement le problème LOB stream

-- 1. Supprimer complètement les tables problématiques
DROP TABLE IF EXISTS report_files CASCADE;
DROP TABLE IF EXISTS case_attachments CASCADE;

-- 2. Vérifier qu'elles sont bien supprimées
SELECT 'Tables supprimées' as status, table_name 
FROM information_schema.tables 
WHERE table_name IN ('report_files', 'case_attachments');

-- 3. Recréer report_files avec structure BYTEA correcte
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

-- 4. Recréer case_attachments avec structure BYTEA correcte
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

-- 5. Vérifier la structure finale
SELECT 'Structure finale' as status, table_name, column_name, data_type
FROM information_schema.columns 
WHERE table_name IN ('report_files', 'case_attachments')
ORDER BY table_name, column_name;

-- 6. Tester l'insertion d'une ligne vide
INSERT INTO report_files (report_id, filename, content_type, file_size, iv, cipher_text)
VALUES (999, 'test.txt', 'text/plain', 0, '\x00000000000000000000000000000000', '\x');

-- 7. Vérifier l'insertion
SELECT 'Test insertion' as status, * FROM report_files WHERE filename = 'test.txt';

-- 8. Nettoyer le test
DELETE FROM report_files WHERE filename = 'test.txt';

-- 9. Vérifier que les tables sont vides
SELECT 'Tables vides' as status, 
       (SELECT COUNT(*) FROM report_files) as report_files_count,
       (SELECT COUNT(*) FROM case_attachments) as case_attachments_count;
