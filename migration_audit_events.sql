-- Migration pour corriger la contrainte audit_events_type_check
-- Exécuter ce script dans votre base de données PostgreSQL

-- 1. Vérifier la contrainte actuelle
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'audit_events'::regclass AND conname = 'audit_events_type_check';

-- 2. Supprimer la contrainte existante si elle existe
ALTER TABLE audit_events DROP CONSTRAINT IF EXISTS audit_events_type_check;

-- 3. Recréer la contrainte avec tous les types d'événements
ALTER TABLE audit_events ADD CONSTRAINT audit_events_type_check 
CHECK (type IN (
    'ACCESS_REQUEST_CREATED',
    'ACCESS_REQUEST_APPROVED', 
    'ACCESS_REQUEST_REJECTED',
    'REPORT_CREATED',
    'REPORT_DOWNLOADED',
    'CASE_CREATED'
));

-- 4. Vérifier que la contrainte fonctionne
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'audit_events'::regclass AND conname = 'audit_events_type_check';

-- 5. Vérifier les types existants dans la table
SELECT DISTINCT type FROM audit_events ORDER BY type;

-- 6. Test d'insertion (optionnel - décommenter pour tester)
-- INSERT INTO audit_events (type, message, actor, atiso) 
-- VALUES ('REPORT_CREATED', 'Test migration', 'system', NOW());
