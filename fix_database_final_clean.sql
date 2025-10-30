-- Script de nettoyage final pour supprimer toutes les références aux fichiers
-- Exécuter ce script pour résoudre définitivement l'erreur LOB

-- 1. Supprimer les tables de fichiers si elles existent encore
DROP TABLE IF EXISTS report_files CASCADE;
DROP TABLE IF EXISTS case_attachments CASCADE;

-- 2. Supprimer les contraintes et index liés aux fichiers
DO $$
BEGIN
    -- Supprimer les contraintes de clés étrangères si elles existent
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_report_files_report_id') THEN
        ALTER TABLE report_files DROP CONSTRAINT fk_report_files_report_id;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_case_attachments_case_id') THEN
        ALTER TABLE case_attachments DROP CONSTRAINT fk_case_attachments_case_id;
    END IF;
    
    -- Supprimer les index si ils existent
    DROP INDEX IF EXISTS idx_report_files_report_id;
    DROP INDEX IF EXISTS idx_case_attachments_case_id;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Ignorer les erreurs si les objets n'existent pas
        NULL;
END $$;

-- 3. Vérifier qu'il n'y a plus de références aux fichiers
SELECT 'Vérification des tables restantes:' as info;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%file%' OR table_name LIKE '%attachment%';

-- 4. Vérifier les contraintes restantes
SELECT 'Vérification des contraintes:' as info;
SELECT constraint_name, table_name, column_name 
FROM information_schema.key_column_usage 
WHERE table_schema = 'public' 
AND (constraint_name LIKE '%file%' OR constraint_name LIKE '%attachment%');

-- 5. Nettoyer les séquences si elles existent
DROP SEQUENCE IF EXISTS report_files_id_seq CASCADE;
DROP SEQUENCE IF EXISTS case_attachments_id_seq CASCADE;

-- 6. Vérifier l'état final
SELECT 'État final de la base de données:' as info;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 7. Message de confirmation
SELECT 'Nettoyage terminé. Les tables de fichiers ont été supprimées.' as status;
