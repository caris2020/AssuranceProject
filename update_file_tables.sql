-- Script de mise à jour des tables de fichiers pour associer les fichiers aux cartes (rapports/dossiers)
-- Ce script ajoute les nouvelles colonnes nécessaires pour la gestion avancée des fichiers

-- 1. Vérifier l'existence des tables
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'report_files') THEN
        RAISE EXCEPTION 'La table report_files n''existe pas. Veuillez d''abord exécuter le script de création des tables.';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'case_attachments') THEN
        RAISE EXCEPTION 'La table case_attachments n''existe pas. Veuillez d''abord exécuter le script de création des tables.';
    END IF;
END $$;

-- 2. Ajouter les nouvelles colonnes à report_files
ALTER TABLE report_files 
ADD COLUMN IF NOT EXISTS description VARCHAR(500),
ADD COLUMN IF NOT EXISTS file_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 3. Ajouter les nouvelles colonnes à case_attachments
ALTER TABLE case_attachments 
ADD COLUMN IF NOT EXISTS description VARCHAR(500),
ADD COLUMN IF NOT EXISTS file_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS category VARCHAR(50),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 4. Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_report_files_report_id ON report_files(report_id);
CREATE INDEX IF NOT EXISTS idx_report_files_file_type ON report_files(file_type);
CREATE INDEX IF NOT EXISTS idx_report_files_created_at ON report_files(created_at);
CREATE INDEX IF NOT EXISTS idx_report_files_is_public ON report_files(is_public);

CREATE INDEX IF NOT EXISTS idx_case_attachments_case_id ON case_attachments(case_id);
CREATE INDEX IF NOT EXISTS idx_case_attachments_file_type ON case_attachments(file_type);
CREATE INDEX IF NOT EXISTS idx_case_attachments_category ON case_attachments(category);
CREATE INDEX IF NOT EXISTS idx_case_attachments_created_at ON case_attachments(created_at);
CREATE INDEX IF NOT EXISTS idx_case_attachments_is_public ON case_attachments(is_public);

-- 5. Créer des contraintes de clés étrangères si elles n'existent pas
DO $$
BEGIN
    -- Contrainte pour report_files
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_report_files_report_id' 
        AND table_name = 'report_files'
    ) THEN
        ALTER TABLE report_files 
        ADD CONSTRAINT fk_report_files_report_id 
        FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE;
    END IF;
    
    -- Contrainte pour case_attachments
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_case_attachments_case_id' 
        AND table_name = 'case_attachments'
    ) THEN
        ALTER TABLE case_attachments 
        ADD CONSTRAINT fk_case_attachments_case_id 
        FOREIGN KEY (case_id) REFERENCES insurance_cases(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 6. Créer des triggers pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour report_files
DROP TRIGGER IF EXISTS update_report_files_updated_at ON report_files;
CREATE TRIGGER update_report_files_updated_at
    BEFORE UPDATE ON report_files
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour case_attachments
DROP TRIGGER IF EXISTS update_case_attachments_updated_at ON case_attachments;
CREATE TRIGGER update_case_attachments_updated_at
    BEFORE UPDATE ON case_attachments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Vérifier la structure finale
SELECT 'Structure finale report_files' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'report_files'
ORDER BY ordinal_position;

SELECT 'Structure finale case_attachments' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'case_attachments'
ORDER BY ordinal_position;

-- 8. Vérifier les index créés
SELECT 'Index report_files' as table_name, indexname, indexdef
FROM pg_indexes 
WHERE tablename = 'report_files';

SELECT 'Index case_attachments' as table_name, indexname, indexdef
FROM pg_indexes 
WHERE tablename = 'case_attachments';

-- 9. Statistiques des tables
SELECT 'Statistiques' as info,
       (SELECT COUNT(*) FROM report_files) as report_files_count,
       (SELECT COUNT(*) FROM case_attachments) as case_attachments_count;

-- 10. Message de confirmation
SELECT 'Mise à jour terminée avec succès!' as status;
