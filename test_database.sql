-- Script de test pour vérifier que la base de données fonctionne
-- Exécutez ce script après avoir exécuté fix_database_final_emergency.sql

-- 1. Vérifier que les tables existent
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('report_files', 'case_attachments', 'reports', 'insurance_cases')
ORDER BY table_name;

-- 2. Vérifier la structure des tables problématiques
SELECT 
    table_name, 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('report_files', 'case_attachments')
ORDER BY table_name, column_name;

-- 3. Tester l'insertion dans report_files
INSERT INTO report_files (report_id, filename, content_type, file_size, iv, cipher_text)
VALUES (999, 'test.txt', 'text/plain', 0, '\x00000000000000000000000000000000', '\x');

-- 4. Vérifier l'insertion
SELECT * FROM report_files WHERE filename = 'test.txt';

-- 5. Nettoyer le test
DELETE FROM report_files WHERE filename = 'test.txt';

-- 6. Vérifier qu'il n'y a plus de données de test
SELECT COUNT(*) FROM report_files WHERE filename = 'test.txt';
