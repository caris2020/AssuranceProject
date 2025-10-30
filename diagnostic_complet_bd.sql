-- Script de diagnostic complet pour identifier les problèmes de base de données
-- Exécutez ce script pour diagnostiquer tous les problèmes potentiels

-- ===== 1. VÉRIFICATION DE LA CONNEXION ET DES PERMISSIONS =====
SELECT '=== DIAGNOSTIC COMPLET DE LA BASE DE DONNÉES ===' as info;

-- Vérifier la base de données actuelle
SELECT 'Base de données actuelle' as info, current_database() as database_name;

-- Vérifier l'utilisateur actuel
SELECT 'Utilisateur actuel' as info, current_user as user_name;

-- Vérifier les permissions
SELECT 'Permissions utilisateur' as info, 
       has_database_privilege(current_user, current_database(), 'CREATE') as can_create,
       has_database_privilege(current_user, current_database(), 'CONNECT') as can_connect;

-- ===== 2. VÉRIFICATION DES TABLES PRINCIPALES =====
SELECT '=== VÉRIFICATION DES TABLES PRINCIPALES ===' as info;

-- Lister toutes les tables existantes
SELECT 'Toutes les tables' as info, table_name, table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Vérifier spécifiquement les tables principales
SELECT 'Tables principales' as info, 
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reports') 
            THEN 'EXISTE' ELSE 'N''EXISTE PAS' END as reports_status,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'insurance_cases') 
            THEN 'EXISTE' ELSE 'N''EXISTE PAS' END as insurance_cases_status,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'report_files') 
            THEN 'EXISTE' ELSE 'N''EXISTE PAS' END as report_files_status,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'case_attachments') 
            THEN 'EXISTE' ELSE 'N''EXISTE PAS' END as case_attachments_status;

-- ===== 3. VÉRIFICATION DE LA STRUCTURE DES TABLES =====
SELECT '=== VÉRIFICATION DE LA STRUCTURE ===' as info;

-- Structure de reports (si elle existe)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reports') THEN
        RAISE NOTICE 'Table reports existe - vérification de la structure...';
    ELSE
        RAISE NOTICE 'PROBLÈME: Table reports n''existe pas!';
    END IF;
END $$;

-- Structure de insurance_cases (si elle existe)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'insurance_cases') THEN
        RAISE NOTICE 'Table insurance_cases existe - vérification de la structure...';
    ELSE
        RAISE NOTICE 'PROBLÈME: Table insurance_cases n''existe pas!';
    END IF;
END $$;

-- ===== 4. VÉRIFICATION DES DONNÉES =====
SELECT '=== VÉRIFICATION DES DONNÉES ===' as info;

-- Compter les enregistrements dans chaque table
SELECT 'Comptage des données' as info,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reports') 
            THEN (SELECT COUNT(*)::text FROM reports) ELSE 'TABLE N''EXISTE PAS' END as reports_count,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'insurance_cases') 
            THEN (SELECT COUNT(*)::text FROM insurance_cases) ELSE 'TABLE N''EXISTE PAS' END as insurance_cases_count,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'report_files') 
            THEN (SELECT COUNT(*)::text FROM report_files) ELSE 'TABLE N''EXISTE PAS' END as report_files_count,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'case_attachments') 
            THEN (SELECT COUNT(*)::text FROM case_attachments) ELSE 'TABLE N''EXISTE PAS' END as case_attachments_count;

-- ===== 5. VÉRIFICATION DES CONTRAINTES =====
SELECT '=== VÉRIFICATION DES CONTRAINTES ===' as info;

-- Vérifier les contraintes de clés primaires
SELECT 'Clés primaires' as info, 
       tc.table_name, 
       tc.constraint_name, 
       kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'PRIMARY KEY'
AND tc.table_name IN ('reports', 'insurance_cases', 'report_files', 'case_attachments')
ORDER BY tc.table_name;

-- Vérifier les contraintes de clés étrangères
SELECT 'Clés étrangères' as info, 
       tc.table_name, 
       tc.constraint_name, 
       kcu.column_name, 
       ccu.table_name AS foreign_table_name,
       ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name IN ('reports', 'insurance_cases', 'report_files', 'case_attachments')
ORDER BY tc.table_name;

-- ===== 6. VÉRIFICATION DES INDEX =====
SELECT '=== VÉRIFICATION DES INDEX ===' as info;

-- Lister tous les index
SELECT 'Index existants' as info, 
       tablename, 
       indexname, 
       indexdef
FROM pg_indexes 
WHERE tablename IN ('reports', 'insurance_cases', 'report_files', 'case_attachments')
ORDER BY tablename, indexname;

-- ===== 7. VÉRIFICATION DES SÉQUENCES =====
SELECT '=== VÉRIFICATION DES SÉQUENCES ===' as info;

-- Vérifier les séquences pour les IDs auto-incrémentés
SELECT 'Séquences' as info, 
       sequence_name, 
       last_value, 
       is_called
FROM information_schema.sequences 
WHERE sequence_name LIKE '%_id_seq'
ORDER BY sequence_name;

-- ===== 8. VÉRIFICATION DES ERREURS POTENTIELLES =====
SELECT '=== VÉRIFICATION DES ERREURS POTENTIELLES ===' as info;

-- Vérifier les colonnes BYTEA problématiques
SELECT 'Colonnes BYTEA' as info, 
       table_name, 
       column_name, 
       data_type,
       CASE WHEN data_type = 'bytea' THEN 'OK' ELSE 'PROBLÈME' END as status
FROM information_schema.columns 
WHERE table_name IN ('report_files', 'case_attachments')
AND column_name IN ('iv', 'cipher_text')
ORDER BY table_name, column_name;

-- Vérifier les contraintes NOT NULL manquantes
SELECT 'Contraintes NOT NULL' as info, 
       table_name, 
       column_name, 
       is_nullable,
       CASE WHEN is_nullable = 'NO' THEN 'OK' ELSE 'ATTENTION' END as status
FROM information_schema.columns 
WHERE table_name IN ('report_files', 'case_attachments')
AND column_name IN ('report_id', 'case_id', 'filename')
ORDER BY table_name, column_name;

-- ===== 9. TEST DE FONCTIONNALITÉ =====
SELECT '=== TEST DE FONCTIONNALITÉ ===' as info;

-- Test d'insertion dans report_files (si la table existe)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'report_files') THEN
        BEGIN
            INSERT INTO report_files (report_id, filename, content_type, file_size, iv, cipher_text)
            VALUES (999, 'test_diagnostic.txt', 'text/plain', 0, '\x00000000000000000000000000000000', '\x');
            RAISE NOTICE 'Test d''insertion report_files: SUCCÈS';
            
            DELETE FROM report_files WHERE filename = 'test_diagnostic.txt';
            RAISE NOTICE 'Test de suppression report_files: SUCCÈS';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Test d''insertion report_files: ÉCHEC - %', SQLERRM;
        END;
    ELSE
        RAISE NOTICE 'Test d''insertion report_files: TABLE N''EXISTE PAS';
    END IF;
END $$;

-- Test d'insertion dans case_attachments (si la table existe)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'case_attachments') THEN
        BEGIN
            INSERT INTO case_attachments (case_id, filename, content_type, file_size, iv, cipher_text)
            VALUES (999, 'test_diagnostic.txt', 'text/plain', 0, '\x00000000000000000000000000000000', '\x');
            RAISE NOTICE 'Test d''insertion case_attachments: SUCCÈS';
            
            DELETE FROM case_attachments WHERE filename = 'test_diagnostic.txt';
            RAISE NOTICE 'Test de suppression case_attachments: SUCCÈS';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Test d''insertion case_attachments: ÉCHEC - %', SQLERRM;
        END;
    ELSE
        RAISE NOTICE 'Test d''insertion case_attachments: TABLE N''EXISTE PAS';
    END IF;
END $$;

-- ===== 10. RÉSUMÉ DES PROBLÈMES =====
SELECT '=== RÉSUMÉ DES PROBLÈMES ===' as info;

-- Identifier les problèmes principaux
DO $$
DECLARE
    problems text[] := ARRAY[]::text[];
BEGIN
    -- Vérifier les tables manquantes
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
    
    -- Afficher les problèmes
    IF array_length(problems, 1) IS NULL THEN
        RAISE NOTICE 'AUCUN PROBLÈME MAJEUR DÉTECTÉ';
    ELSE
        RAISE NOTICE 'PROBLÈMES DÉTECTÉS: %', array_to_string(problems, ', ');
    END IF;
END $$;

-- ===== 11. RECOMMANDATIONS =====
SELECT '=== RECOMMANDATIONS ===' as info;

-- Afficher les recommandations selon l'état
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reports') THEN
        RAISE NOTICE 'RECOMMANDATION: Exécuter le script de création des tables principales';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'report_files') THEN
        RAISE NOTICE 'RECOMMANDATION: Exécuter create_file_tables.sql';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'report_files') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'report_files' AND column_name = 'description') THEN
        RAISE NOTICE 'RECOMMANDATION: Exécuter update_file_tables.sql pour ajouter les nouvelles colonnes';
    END IF;
    
    RAISE NOTICE 'RECOMMANDATION: Redémarrer l''application Spring Boot après les corrections';
END $$;

SELECT '=== DIAGNOSTIC TERMINÉ ===' as info;
