-- Script de diagnostic rapide pour vérifier l'état de la base de données
-- Exécutez ce script pour comprendre le problème

-- 1. Vérifier si les tables existent
SELECT 'Tables existantes' as info, table_name 
FROM information_schema.tables 
WHERE table_name IN ('report_files', 'case_attachments')
ORDER BY table_name;

-- 2. Si les tables existent, vérifier leur structure
SELECT 'Structure report_files' as info, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'report_files'
ORDER BY ordinal_position;

SELECT 'Structure case_attachments' as info, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'case_attachments'
ORDER BY ordinal_position;

-- 3. Vérifier les contraintes
SELECT 'Contraintes' as info, table_name, constraint_name, constraint_type
FROM information_schema.table_constraints 
WHERE table_name IN ('report_files', 'case_attachments')
ORDER BY table_name, constraint_name;
