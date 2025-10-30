-- Script pour vider la base de données et permettre la recréation des données de test
-- Exécutez ce script avant de redémarrer l'application

-- Supprimer toutes les données existantes
DELETE FROM report_files;
DELETE FROM case_attachments;
DELETE FROM reports;
DELETE FROM insurance_cases;
DELETE FROM audit_events;
DELETE FROM access_requests;

-- Réinitialiser les séquences d'auto-incrémentation
ALTER SEQUENCE IF EXISTS reports_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS insurance_cases_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS audit_events_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS access_requests_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS report_files_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS case_attachments_id_seq RESTART WITH 1;

-- Vérifier que les tables sont vides
SELECT 'reports' as table_name, COUNT(*) as count FROM reports
UNION ALL
SELECT 'insurance_cases', COUNT(*) FROM insurance_cases
UNION ALL
SELECT 'audit_events', COUNT(*) FROM audit_events
UNION ALL
SELECT 'access_requests', COUNT(*) FROM access_requests
UNION ALL
SELECT 'report_files', COUNT(*) FROM report_files
UNION ALL
SELECT 'case_attachments', COUNT(*) FROM case_attachments;
