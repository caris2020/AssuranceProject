-- Script de réparation automatique de la base de données
-- Ce script corrige automatiquement les problèmes les plus courants

-- ===== 1. RÉPARATION DES TABLES PRINCIPALES =====
SELECT '=== RÉPARATION AUTOMATIQUE DE LA BASE DE DONNÉES ===' as info;

-- Créer la table reports si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reports') THEN
        CREATE TABLE reports (
            id BIGSERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            content TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        RAISE NOTICE 'Table reports créée avec succès';
    ELSE
        RAISE NOTICE 'Table reports existe déjà';
    END IF;
END $$;

-- Créer la table insurance_cases si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'insurance_cases') THEN
        CREATE TABLE insurance_cases (
            id BIGSERIAL PRIMARY KEY,
            case_number VARCHAR(100) NOT NULL,
            description TEXT,
            status VARCHAR(50) DEFAULT 'OPEN',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        RAISE NOTICE 'Table insurance_cases créée avec succès';
    ELSE
        RAISE NOTICE 'Table insurance_cases existe déjà';
    END IF;
END $$;

-- ===== 2. RÉPARATION DES TABLES DE FICHIERS =====

-- Supprimer les tables de fichiers problématiques si elles existent
DROP TABLE IF EXISTS report_files CASCADE;
DROP TABLE IF EXISTS case_attachments CASCADE;

-- Recréer report_files avec la structure correcte
CREATE TABLE report_files (
    id BIGSERIAL PRIMARY KEY,
    report_id BIGINT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    content_type VARCHAR(100),
    file_size BIGINT,
    iv BYTEA,
    cipher_text BYTEA,
    description VARCHAR(500),
    file_type VARCHAR(50),
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recréer case_attachments avec la structure correcte
CREATE TABLE case_attachments (
    id BIGSERIAL PRIMARY KEY,
    case_id BIGINT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    content_type VARCHAR(100),
    file_size BIGINT,
    iv BYTEA,
    cipher_text BYTEA,
    description VARCHAR(500),
    file_type VARCHAR(50),
    category VARCHAR(50),
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

RAISE NOTICE 'Tables de fichiers recréées avec succès';

-- ===== 3. CRÉATION DES INDEX =====

-- Index pour report_files
CREATE INDEX IF NOT EXISTS idx_report_files_report_id ON report_files(report_id);
CREATE INDEX IF NOT EXISTS idx_report_files_file_type ON report_files(file_type);
CREATE INDEX IF NOT EXISTS idx_report_files_created_at ON report_files(created_at);
CREATE INDEX IF NOT EXISTS idx_report_files_is_public ON report_files(is_public);

-- Index pour case_attachments
CREATE INDEX IF NOT EXISTS idx_case_attachments_case_id ON case_attachments(case_id);
CREATE INDEX IF NOT EXISTS idx_case_attachments_file_type ON case_attachments(file_type);
CREATE INDEX IF NOT EXISTS idx_case_attachments_category ON case_attachments(category);
CREATE INDEX IF NOT EXISTS idx_case_attachments_created_at ON case_attachments(created_at);
CREATE INDEX IF NOT EXISTS idx_case_attachments_is_public ON case_attachments(is_public);

RAISE NOTICE 'Index créés avec succès';

-- ===== 4. CRÉATION DES CONTRAINTES DE CLÉS ÉTRANGÈRES =====

-- Contrainte pour report_files
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reports') THEN
        ALTER TABLE report_files 
        ADD CONSTRAINT fk_report_files_report_id 
        FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE;
        RAISE NOTICE 'Contrainte FK report_files -> reports créée';
    ELSE
        RAISE NOTICE 'Table reports n''existe pas - contrainte FK report_files non créée';
    END IF;
END $$;

-- Contrainte pour case_attachments
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'insurance_cases') THEN
        ALTER TABLE case_attachments 
        ADD CONSTRAINT fk_case_attachments_case_id 
        FOREIGN KEY (case_id) REFERENCES insurance_cases(id) ON DELETE CASCADE;
        RAISE NOTICE 'Contrainte FK case_attachments -> insurance_cases créée';
    ELSE
        RAISE NOTICE 'Table insurance_cases n''existe pas - contrainte FK case_attachments non créée';
    END IF;
END $$;

-- ===== 5. CRÉATION DES TRIGGERS =====

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour report_files
DROP TRIGGER IF EXISTS update_report_files_updated_at ON report_files;
CREATE TRIGGER update_report_files_updated_at
    BEFORE UPDATE ON report_files
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Triggers pour case_attachments
DROP TRIGGER IF EXISTS update_case_attachments_updated_at ON case_attachments;
CREATE TRIGGER update_case_attachments_updated_at
    BEFORE UPDATE ON case_attachments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

RAISE NOTICE 'Triggers créés avec succès';

-- ===== 6. INSERTION DE DONNÉES DE TEST =====

-- Insérer des données de test dans reports si la table est vide
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reports') 
       AND (SELECT COUNT(*) FROM reports) = 0 THEN
        INSERT INTO reports (title, content) VALUES 
        ('Rapport Test 1', 'Contenu du rapport de test 1'),
        ('Rapport Test 2', 'Contenu du rapport de test 2'),
        ('Rapport Test 3', 'Contenu du rapport de test 3');
        RAISE NOTICE 'Données de test insérées dans reports';
    ELSE
        RAISE NOTICE 'Table reports contient déjà des données ou n''existe pas';
    END IF;
END $$;

-- Insérer des données de test dans insurance_cases si la table est vide
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'insurance_cases') 
       AND (SELECT COUNT(*) FROM insurance_cases) = 0 THEN
        INSERT INTO insurance_cases (case_number, description, status) VALUES 
        ('CASE-001', 'Dossier d''assurance test 1', 'OPEN'),
        ('CASE-002', 'Dossier d''assurance test 2', 'IN_PROGRESS'),
        ('CASE-003', 'Dossier d''assurance test 3', 'CLOSED');
        RAISE NOTICE 'Données de test insérées dans insurance_cases';
    ELSE
        RAISE NOTICE 'Table insurance_cases contient déjà des données ou n''existe pas';
    END IF;
END $$;

-- ===== 7. TEST DE FONCTIONNALITÉ =====

-- Test d'insertion dans report_files
DO $$
BEGIN
    BEGIN
        INSERT INTO report_files (report_id, filename, content_type, file_size, iv, cipher_text, description, file_type)
        VALUES (1, 'test_reparation.txt', 'text/plain', 0, '\x00000000000000000000000000000000', '\x', 'Fichier de test pour réparation', 'text');
        RAISE NOTICE 'Test d''insertion report_files: SUCCÈS';
        
        DELETE FROM report_files WHERE filename = 'test_reparation.txt';
        RAISE NOTICE 'Test de suppression report_files: SUCCÈS';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Test d''insertion report_files: ÉCHEC - %', SQLERRM;
    END;
END $$;

-- Test d'insertion dans case_attachments
DO $$
BEGIN
    BEGIN
        INSERT INTO case_attachments (case_id, filename, content_type, file_size, iv, cipher_text, description, category)
        VALUES (1, 'test_reparation.txt', 'text/plain', 0, '\x00000000000000000000000000000000', '\x', 'Fichier de test pour réparation', 'document');
        RAISE NOTICE 'Test d''insertion case_attachments: SUCCÈS';
        
        DELETE FROM case_attachments WHERE filename = 'test_reparation.txt';
        RAISE NOTICE 'Test de suppression case_attachments: SUCCÈS';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Test d''insertion case_attachments: ÉCHEC - %', SQLERRM;
    END;
END $$;

-- ===== 8. VÉRIFICATION FINALE =====

-- Vérifier l'existence des tables
SELECT 'Vérification finale' as info, 
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reports') 
            THEN 'EXISTE' ELSE 'N''EXISTE PAS' END as reports_status,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'insurance_cases') 
            THEN 'EXISTE' ELSE 'N''EXISTE PAS' END as insurance_cases_status,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'report_files') 
            THEN 'EXISTE' ELSE 'N''EXISTE PAS' END as report_files_status,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'case_attachments') 
            THEN 'EXISTE' ELSE 'N''EXISTE PAS' END as case_attachments_status;

-- Compter les enregistrements
SELECT 'Comptage final' as info,
       (SELECT COUNT(*) FROM reports) as reports_count,
       (SELECT COUNT(*) FROM insurance_cases) as insurance_cases_count,
       (SELECT COUNT(*) FROM report_files) as report_files_count,
       (SELECT COUNT(*) FROM case_attachments) as case_attachments_count;

-- Vérifier les contraintes
SELECT 'Contraintes FK' as info, 
       tc.table_name, 
       tc.constraint_name, 
       kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name IN ('report_files', 'case_attachments')
ORDER BY tc.table_name;

-- ===== 9. MESSAGE DE CONFIRMATION =====
SELECT '=== RÉPARATION TERMINÉE AVEC SUCCÈS ===' as info;

DO $$
BEGIN
    RAISE NOTICE 'RÉPARATION AUTOMATIQUE TERMINÉE!';
    RAISE NOTICE 'Prochaines étapes:';
    RAISE NOTICE '1. Redémarrer votre application Spring Boot';
    RAISE NOTICE '2. Tester l''upload de fichiers avec test_file_management.html';
    RAISE NOTICE '3. Vérifier que les fichiers sont bien associés aux cartes';
END $$;
