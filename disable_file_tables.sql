-- Script pour désactiver complètement les tables de fichiers
-- Ce script supprime temporairement les tables de fichiers pour éviter les erreurs LOB

-- Supprimer les tables de fichiers
DROP TABLE IF EXISTS report_files CASCADE;
DROP TABLE IF EXISTS case_attachments CASCADE;

-- Vérifier que les tables ont été supprimées
SELECT 'Tables supprimées' as status, 
       CASE WHEN NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'report_files') 
            AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'case_attachments')
       THEN 'SUCCÈS' ELSE 'ÉCHEC' END as result;

-- Afficher les tables restantes
SELECT 'Tables restantes' as info, table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
