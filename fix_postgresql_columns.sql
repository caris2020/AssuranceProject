-- Script pour corriger les colonnes BYTEA dans PostgreSQL
-- Ce script doit être exécuté sur la base de données PostgreSQL

-- Vérifier d'abord la structure actuelle
SELECT 
    table_name, 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('report_files', 'case_attachments') 
AND column_name IN ('iv', 'cipher_text')
ORDER BY table_name, column_name;

-- Corriger les colonnes dans la table report_files
-- Si les colonnes n'existent pas, les créer
DO $$
BEGIN
    -- Vérifier si la colonne iv existe dans report_files
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'report_files' AND column_name = 'iv'
    ) THEN
        ALTER TABLE report_files ADD COLUMN iv BYTEA;
    ELSE
        ALTER TABLE report_files ALTER COLUMN iv TYPE BYTEA USING iv::bytea;
    END IF;
    
    -- Vérifier si la colonne cipher_text existe dans report_files
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'report_files' AND column_name = 'cipher_text'
    ) THEN
        ALTER TABLE report_files ADD COLUMN cipher_text BYTEA;
    ELSE
        ALTER TABLE report_files ALTER COLUMN cipher_text TYPE BYTEA USING cipher_text::bytea;
    END IF;
END $$;

-- Corriger les colonnes dans la table case_attachments
DO $$
BEGIN
    -- Vérifier si la colonne iv existe dans case_attachments
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'case_attachments' AND column_name = 'iv'
    ) THEN
        ALTER TABLE case_attachments ADD COLUMN iv BYTEA;
    ELSE
        ALTER TABLE case_attachments ALTER COLUMN iv TYPE BYTEA USING iv::bytea;
    END IF;
    
    -- Vérifier si la colonne cipher_text existe dans case_attachments
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'case_attachments' AND column_name = 'cipher_text'
    ) THEN
        ALTER TABLE case_attachments ADD COLUMN cipher_text BYTEA;
    ELSE
        ALTER TABLE case_attachments ALTER COLUMN cipher_text TYPE BYTEA USING cipher_text::bytea;
    END IF;
END $$;

-- Vérifier la structure après correction
SELECT 
    table_name, 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('report_files', 'case_attachments') 
AND column_name IN ('iv', 'cipher_text')
ORDER BY table_name, column_name;
