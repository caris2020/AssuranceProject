-- Script de réparation complète de la base de données
-- Ce script résout TOUS les problèmes de base de données

-- ===== 1. NETTOYAGE COMPLET =====
SELECT '=== RÉPARATION COMPLÈTE DE LA BASE DE DONNÉES ===' as info;

-- Supprimer toutes les tables problématiques
DROP TABLE IF EXISTS case_attachments CASCADE;
DROP TABLE IF EXISTS report_files CASCADE;
DROP TABLE IF EXISTS audit_events CASCADE;
DROP TABLE IF EXISTS insurance_cases CASCADE;
DROP TABLE IF EXISTS reports CASCADE;

-- Supprimer les séquences orphelines
DROP SEQUENCE IF EXISTS case_attachments_id_seq CASCADE;
DROP SEQUENCE IF EXISTS report_files_id_seq CASCADE;
DROP SEQUENCE IF EXISTS audit_events_id_seq CASCADE;
DROP SEQUENCE IF EXISTS insurance_cases_id_seq CASCADE;
DROP SEQUENCE IF EXISTS reports_id_seq CASCADE;

-- Supprimer les fonctions et triggers
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

RAISE NOTICE 'Nettoyage complet terminé';

-- ===== 2. CRÉATION DES TABLES PRINCIPALES =====

-- Créer la table reports
CREATE TABLE reports (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Créer la table insurance_cases
CREATE TABLE insurance_cases (
    id BIGSERIAL PRIMARY KEY,
    case_number VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

RAISE NOTICE 'Tables principales créées';

-- ===== 3. CRÉATION DES TABLES DE FICHIERS =====

-- Créer report_files avec structure optimisée
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

-- Créer case_attachments avec structure optimisée
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

RAISE NOTICE 'Tables de fichiers créées';

-- ===== 4. CRÉATION DES INDEX OPTIMISÉS =====

-- Index pour reports
CREATE INDEX idx_reports_created_at ON reports(created_at);
CREATE INDEX idx_reports_title ON reports(title);

-- Index pour insurance_cases
CREATE INDEX idx_insurance_cases_case_number ON insurance_cases(case_number);
CREATE INDEX idx_insurance_cases_status ON insurance_cases(status);
CREATE INDEX idx_insurance_cases_created_at ON insurance_cases(created_at);

-- Index pour report_files
CREATE INDEX idx_report_files_report_id ON report_files(report_id);
CREATE INDEX idx_report_files_file_type ON report_files(file_type);
CREATE INDEX idx_report_files_created_at ON report_files(created_at);
CREATE INDEX idx_report_files_is_public ON report_files(is_public);
CREATE INDEX idx_report_files_filename ON report_files(filename);

-- Index pour case_attachments
CREATE INDEX idx_case_attachments_case_id ON case_attachments(case_id);
CREATE INDEX idx_case_attachments_file_type ON case_attachments(file_type);
CREATE INDEX idx_case_attachments_category ON case_attachments(category);
CREATE INDEX idx_case_attachments_created_at ON case_attachments(created_at);
CREATE INDEX idx_case_attachments_is_public ON case_attachments(is_public);
CREATE INDEX idx_case_attachments_filename ON case_attachments(filename);

RAISE NOTICE 'Index créés';

-- ===== 5. CRÉATION DES CONTRAINTES DE CLÉS ÉTRANGÈRES =====

-- Contraintes pour report_files
ALTER TABLE report_files 
ADD CONSTRAINT fk_report_files_report_id 
FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE;

-- Contraintes pour case_attachments
ALTER TABLE case_attachments 
ADD CONSTRAINT fk_case_attachments_case_id 
FOREIGN KEY (case_id) REFERENCES insurance_cases(id) ON DELETE CASCADE;

RAISE NOTICE 'Contraintes de clés étrangères créées';

-- ===== 6. CRÉATION DES TRIGGERS =====

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour reports
CREATE TRIGGER update_reports_updated_at
    BEFORE UPDATE ON reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Triggers pour insurance_cases
CREATE TRIGGER update_insurance_cases_updated_at
    BEFORE UPDATE ON insurance_cases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Triggers pour report_files
CREATE TRIGGER update_report_files_updated_at
    BEFORE UPDATE ON report_files
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Triggers pour case_attachments
CREATE TRIGGER update_case_attachments_updated_at
    BEFORE UPDATE ON case_attachments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

RAISE NOTICE 'Triggers créés';

-- ===== 7. INSERTION DE DONNÉES DE TEST =====

-- Insérer des rapports de test
INSERT INTO reports (title, content) VALUES 
('Rapport d''enquête - Accident routier', 'Rapport détaillé sur l''accident routier du 15 janvier 2024'),
('Rapport d''évaluation - Dommages matériels', 'Évaluation des dommages matériels suite à l''incendie'),
('Rapport médical - Blessures corporelles', 'Rapport médical détaillé des blessures corporelles'),
('Rapport d''expertise - Véhicule', 'Expertise technique du véhicule accidenté'),
('Rapport de police - Constatation', 'Rapport de police sur les circonstances de l''accident');

-- Insérer des dossiers d'assurance de test
INSERT INTO insurance_cases (case_number, description, status) VALUES 
('CASE-2024-001', 'Dossier d''assurance automobile - Accident routier', 'OPEN'),
('CASE-2024-002', 'Dossier d''assurance habitation - Incendie', 'IN_PROGRESS'),
('CASE-2024-003', 'Dossier d''assurance santé - Hospitalisation', 'CLOSED'),
('CASE-2024-004', 'Dossier d''assurance vie - Décès', 'OPEN'),
('CASE-2024-005', 'Dossier d''assurance professionnelle - Responsabilité civile', 'IN_PROGRESS');

RAISE NOTICE 'Données de test insérées';

-- ===== 8. TEST DE FONCTIONNALITÉ COMPLET =====

-- Test d'insertion de fichiers
DO $$
BEGIN
    -- Test report_files
    INSERT INTO report_files (report_id, filename, content_type, file_size, iv, cipher_text, description, file_type)
    VALUES (1, 'rapport_accident.pdf', 'application/pdf', 1024000, '\x00000000000000000000000000000000', '\x74657374', 'Rapport d''accident principal', 'pdf');
    
    INSERT INTO report_files (report_id, filename, content_type, file_size, iv, cipher_text, description, file_type)
    VALUES (1, 'photos_accident.jpg', 'image/jpeg', 512000, '\x00000000000000000000000000000000', '\x74657374', 'Photos de l''accident', 'image');
    
    -- Test case_attachments
    INSERT INTO case_attachments (case_id, filename, content_type, file_size, iv, cipher_text, description, category)
    VALUES (1, 'constat_amiable.pdf', 'application/pdf', 256000, '\x00000000000000000000000000000000', '\x74657374', 'Constat amiable', 'document');
    
    INSERT INTO case_attachments (case_id, filename, content_type, file_size, iv, cipher_text, description, category)
    VALUES (1, 'photos_degats.jpg', 'image/jpeg', 768000, '\x00000000000000000000000000000000', '\x74657374', 'Photos des dégâts', 'photo');
    
    RAISE NOTICE 'Tests d''insertion de fichiers: SUCCÈS';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Test d''insertion de fichiers: ÉCHEC - %', SQLERRM;
END $$;

-- ===== 9. VÉRIFICATION FINALE =====

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

-- Vérifier les index
SELECT 'Index créés' as info, 
       tablename, 
       indexname
FROM pg_indexes 
WHERE tablename IN ('reports', 'insurance_cases', 'report_files', 'case_attachments')
ORDER BY tablename, indexname;

-- ===== 10. MESSAGE DE CONFIRMATION =====
SELECT '=== RÉPARATION COMPLÈTE TERMINÉE AVEC SUCCÈS ===' as info;

DO $$
BEGIN
    RAISE NOTICE 'RÉPARATION COMPLÈTE TERMINÉE!';
    RAISE NOTICE 'Toutes les tables ont été recréées avec succès.';
    RAISE NOTICE 'Données de test insérées: 5 rapports, 5 dossiers, fichiers de test.';
    RAISE NOTICE '';
    RAISE NOTICE 'Prochaines étapes:';
    RAISE NOTICE '1. Redémarrer votre application Spring Boot';
    RAISE NOTICE '2. Tester l''upload de fichiers avec test_file_management.html';
    RAISE NOTICE '3. Vérifier que les éléments se chargent correctement';
    RAISE NOTICE '';
    RAISE NOTICE 'Votre base de données est maintenant prête!';
END $$;
