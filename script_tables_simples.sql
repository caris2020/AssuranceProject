-- Script simple pour créer les tables de base
-- Exécutez ce script dans pgAdmin

-- Créer la table reports
CREATE TABLE IF NOT EXISTS reports (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Créer la table insurance_cases
CREATE TABLE IF NOT EXISTS insurance_cases (
    id BIGSERIAL PRIMARY KEY,
    case_number VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Créer la table report_files
CREATE TABLE IF NOT EXISTS report_files (
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

-- Créer la table case_attachments
CREATE TABLE IF NOT EXISTS case_attachments (
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

-- Insérer des données de test
INSERT INTO reports (title, content) VALUES 
('Rapport Test 1', 'Contenu du rapport de test 1'),
('Rapport Test 2', 'Contenu du rapport de test 2'),
('Rapport Test 3', 'Contenu du rapport de test 3');

INSERT INTO insurance_cases (case_number, description, status) VALUES 
('CASE-001', 'Dossier d''assurance test 1', 'OPEN'),
('CASE-002', 'Dossier d''assurance test 2', 'IN_PROGRESS'),
('CASE-003', 'Dossier d''assurance test 3', 'CLOSED');

-- Vérifier les tables créées
SELECT 'Tables créées' as info, 
       COUNT(*) as nombre_tables
FROM information_schema.tables 
WHERE table_name IN ('reports', 'insurance_cases', 'report_files', 'case_attachments');

-- Vérifier les données
SELECT 'Données' as info,
       (SELECT COUNT(*) FROM reports) as reports_count,
       (SELECT COUNT(*) FROM insurance_cases) as cases_count;
