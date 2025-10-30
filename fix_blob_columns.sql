-- Script pour corriger les colonnes BLOB dans la base de données
-- Ce script doit être exécuté sur la base de données PostgreSQL

-- Corriger les colonnes dans la table report_files
ALTER TABLE report_files 
ALTER COLUMN iv TYPE BYTEA USING iv::bytea,
ALTER COLUMN cipher_text TYPE BYTEA USING cipher_text::bytea;

-- Corriger les colonnes dans la table case_attachments
ALTER TABLE case_attachments 
ALTER COLUMN iv TYPE BYTEA USING iv::bytea,
ALTER COLUMN cipher_text TYPE BYTEA USING cipher_text::bytea;

-- Vérifier que les contraintes sont correctes
-- Si la contrainte audit_events_type_check existe encore, la supprimer et la recréer
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'audit_events_type_check' 
        AND table_name = 'audit_events'
    ) THEN
        ALTER TABLE audit_events DROP CONSTRAINT audit_events_type_check;
    END IF;
END $$;

-- Recréer la contrainte avec les valeurs mises à jour
ALTER TABLE audit_events 
ADD CONSTRAINT audit_events_type_check 
CHECK (type IN ('REPORT_CREATED', 'REPORT_UPDATED', 'REPORT_DELETED', 'CASE_CREATED', 'CASE_UPDATED', 'CASE_DELETED', 'FILE_UPLOADED', 'ACCESS_REQUESTED', 'ACCESS_GRANTED', 'ACCESS_DENIED'));

-- Vérifier que toutes les tables ont les bonnes colonnes
SELECT 
    table_name, 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name IN ('report_files', 'case_attachments') 
AND column_name IN ('iv', 'cipher_text')
ORDER BY table_name, column_name;
