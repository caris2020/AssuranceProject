-- Script pour corriger les colonnes LOB dans la base de données
-- Exécuter ce script dans votre base de données PostgreSQL

-- 1. Vérifier la structure actuelle des tables
SELECT table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name IN ('report_files', 'case_attachments')
ORDER BY table_name, ordinal_position;

-- 2. Modifier les colonnes LOB pour utiliser BLOB au lieu de BYTEA
-- Pour PostgreSQL, BYTEA est équivalent à BLOB

-- Vérifier si les colonnes existent déjà
DO $$
BEGIN
    -- Pour report_files
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'report_files' AND column_name = 'iv') THEN
        ALTER TABLE report_files ALTER COLUMN iv TYPE BYTEA;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'report_files' AND column_name = 'cipher_text') THEN
        ALTER TABLE report_files ALTER COLUMN cipher_text TYPE BYTEA;
    END IF;
    
    -- Pour case_attachments
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'case_attachments' AND column_name = 'iv') THEN
        ALTER TABLE case_attachments ALTER COLUMN iv TYPE BYTEA;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'case_attachments' AND column_name = 'cipher_text') THEN
        ALTER TABLE case_attachments ALTER COLUMN cipher_text TYPE BYTEA;
    END IF;
END $$;

-- 3. Vérifier la structure après modification
SELECT table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name IN ('report_files', 'case_attachments')
ORDER BY table_name, ordinal_position;

-- 4. Vérifier les contraintes
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid IN ('report_files'::regclass, 'case_attachments'::regclass);
