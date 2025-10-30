-- Script de diagnostic rapide de la base de données
-- Exécutez ce script pour vérifier rapidement l'état de votre base de données

-- 1. Test de connexion basique
SELECT '=== DIAGNOSTIC RAPIDE ===' as info;
SELECT 'Connexion' as info, 
       current_database() as database_name,
       current_user as user_name;

-- 2. Vérifier les tables principales
SELECT 'Tables principales' as info, 
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reports') 
            THEN 'EXISTE' ELSE 'N''EXISTE PAS' END as reports,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'insurance_cases') 
            THEN 'EXISTE' ELSE 'N''EXISTE PAS' END as insurance_cases,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'report_files') 
            THEN 'EXISTE' ELSE 'N''EXISTE PAS' END as report_files,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'case_attachments') 
            THEN 'EXISTE' ELSE 'N''EXISTE PAS' END as case_attachments;

-- 3. Compter les données (si les tables existent)
SELECT 'Données' as info,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reports') 
            THEN (SELECT COUNT(*)::text FROM reports) ELSE '0' END as reports_count,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'insurance_cases') 
            THEN (SELECT COUNT(*)::text FROM insurance_cases) ELSE '0' END as cases_count,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'report_files') 
            THEN (SELECT COUNT(*)::text FROM report_files) ELSE '0' END as files_count,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'case_attachments') 
            THEN (SELECT COUNT(*)::text FROM case_attachments) ELSE '0' END as attachments_count;

-- 4. Vérifier les contraintes de clés étrangères
SELECT 'Contraintes FK' as info, 
       tc.table_name, 
       tc.constraint_name
FROM information_schema.table_constraints tc
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name IN ('report_files', 'case_attachments')
ORDER BY tc.table_name;

-- 5. Test simple d'insertion (si les tables existent)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reports') THEN
        BEGIN
            INSERT INTO reports (title, content) VALUES ('Test diagnostic', 'Test de diagnostic rapide');
            RAISE NOTICE 'Test insertion reports: SUCCÈS';
            DELETE FROM reports WHERE title = 'Test diagnostic';
            RAISE NOTICE 'Test suppression reports: SUCCÈS';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Test reports: ÉCHEC - %', SQLERRM;
        END;
    ELSE
        RAISE NOTICE 'Table reports n''existe pas';
    END IF;
END $$;

-- 6. Résumé des problèmes
DO $$
DECLARE
    problems text[] := ARRAY[]::text[];
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reports') THEN
        problems := array_append(problems, 'Table reports manquante');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'insurance_cases') THEN
        problems := array_append(problems, 'Table insurance_cases manquante');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'report_files') THEN
        problems := array_append(problems, 'Table report_files manquante');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'case_attachments') THEN
        problems := array_append(problems, 'Table case_attachments manquante');
    END IF;
    
    IF array_length(problems, 1) IS NULL THEN
        RAISE NOTICE 'AUCUN PROBLÈME DÉTECTÉ - Base de données OK';
    ELSE
        RAISE NOTICE 'PROBLÈMES DÉTECTÉS: %', array_to_string(problems, ', ');
        RAISE NOTICE 'SOLUTION: Exécuter reparation_complete_bd.sql';
    END IF;
END $$;

SELECT '=== DIAGNOSTIC TERMINÉ ===' as info;
