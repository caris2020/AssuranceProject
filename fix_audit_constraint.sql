-- Script pour corriger la contrainte de base de données audit_events
-- Exécuter ce script dans votre base de données PostgreSQL

-- 1. Supprimer la contrainte existante
ALTER TABLE audit_events DROP CONSTRAINT IF EXISTS audit_events_type_check;

-- 2. Recréer la contrainte avec tous les types d'événements
ALTER TABLE audit_events ADD CONSTRAINT audit_events_type_check 
CHECK (type IN (
    'ACCESS_REQUEST_CREATED',
    'ACCESS_REQUEST_APPROVED', 
    'ACCESS_REQUEST_REJECTED',
    'REPORT_CREATED',
    'REPORT_DOWNLOADED',
    'CASE_CREATED'
));

-- 3. Vérifier que la contrainte fonctionne
-- Test d'insertion (optionnel)
-- INSERT INTO audit_events (type, message, actor, atiso) 
-- VALUES ('REPORT_CREATED', 'Test', 'system', NOW());

-- 4. Vérifier les types existants dans la table
SELECT DISTINCT type FROM audit_events;
