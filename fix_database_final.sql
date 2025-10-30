-- Script final pour corriger la structure de la base de données PostgreSQL
-- Ce script corrige les colonnes problématiques qui causent l'erreur de validation

-- 1. Vérifier la structure actuelle
SELECT 
    table_name, 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('report_files', 'case_attachments') 
AND column_name IN ('iv', 'cipher_text')
ORDER BY table_name, column_name;

-- 2. Supprimer les colonnes problématiques de report_files
ALTER TABLE report_files DROP COLUMN IF EXISTS iv CASCADE;
ALTER TABLE report_files DROP COLUMN IF EXISTS cipher_text CASCADE;

-- 3. Supprimer les colonnes problématiques de case_attachments
ALTER TABLE case_attachments DROP COLUMN IF EXISTS iv CASCADE;
ALTER TABLE case_attachments DROP COLUMN IF EXISTS cipher_text CASCADE;

-- 4. Recréer les colonnes avec le bon type BYTEA
ALTER TABLE report_files ADD COLUMN iv BYTEA;
ALTER TABLE report_files ADD COLUMN cipher_text BYTEA;

ALTER TABLE case_attachments ADD COLUMN iv BYTEA;
ALTER TABLE case_attachments ADD COLUMN cipher_text BYTEA;

-- 5. Vérifier la structure après correction
SELECT 
    table_name, 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('report_files', 'case_attachments') 
AND column_name IN ('iv', 'cipher_text')
ORDER BY table_name, column_name;

-- 6. Vérifier que les tables sont accessibles
SELECT COUNT(*) FROM report_files;
SELECT COUNT(*) FROM case_attachments;

-- 7. Vérifier que les contraintes sont correctes
SELECT 
    constraint_name, 
    table_name, 
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name IN ('report_files', 'case_attachments');
