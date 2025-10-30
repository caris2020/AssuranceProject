-- Script de vérification de l'état de la base de données
-- Ce script vérifie l'existence des tables et leur structure

-- 1. Vérifier l'existence des tables principales
SELECT 'Tables existantes' as info, table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('reports', 'insurance_cases', 'report_files', 'case_attachments')
ORDER BY table_name;

-- 2. Vérifier la structure de la table reports
SELECT 'Structure reports' as info, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'reports'
ORDER BY ordinal_position;

-- 3. Vérifier la structure de la table insurance_cases
SELECT 'Structure insurance_cases' as info, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'insurance_cases'
ORDER BY ordinal_position;

-- 4. Vérifier si les tables de fichiers existent
SELECT 'Tables de fichiers' as info, 
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'report_files') 
            THEN 'EXISTE' ELSE 'N''EXISTE PAS' END as report_files_status,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'case_attachments') 
            THEN 'EXISTE' ELSE 'N''EXISTE PAS' END as case_attachments_status;

-- 5. Si les tables de fichiers existent, vérifier leur structure
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'report_files') THEN
        RAISE NOTICE 'Table report_files existe - vérification de la structure...';
    ELSE
        RAISE NOTICE 'Table report_files n''existe pas';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'case_attachments') THEN
        RAISE NOTICE 'Table case_attachments existe - vérification de la structure...';
    ELSE
        RAISE NOTICE 'Table case_attachments n''existe pas';
    END IF;
END $$;

-- 6. Compter les enregistrements dans chaque table
SELECT 'Comptage des données' as info,
       (SELECT COUNT(*) FROM reports) as reports_count,
       (SELECT COUNT(*) FROM insurance_cases) as insurance_cases_count,
       (SELECT COUNT(*) FROM report_files WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'report_files')) as report_files_count,
       (SELECT COUNT(*) FROM case_attachments WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'case_attachments')) as case_attachments_count;

-- 7. Vérifier les contraintes de clés étrangères
SELECT 'Contraintes FK' as info, 
       tc.table_name, 
       tc.constraint_name, 
       kcu.column_name, 
       ccu.table_name AS foreign_table_name,
       ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name IN ('reports', 'insurance_cases', 'report_files', 'case_attachments');

-- 8. Vérifier les index existants
SELECT 'Index existants' as info, 
       tablename, 
       indexname, 
       indexdef
FROM pg_indexes 
WHERE tablename IN ('reports', 'insurance_cases', 'report_files', 'case_attachments')
ORDER BY tablename, indexname;
