-- Script de vérification et création des tables de base
-- Exécutez ce script dans pgAdmin

-- Vérifier la connexion
SELECT 'Connexion OK' as status, current_database() as database_name;

-- Créer la table reports si elle n'existe pas
CREATE TABLE IF NOT EXISTS reports (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Créer la table insurance_cases si elle n'existe pas
CREATE TABLE IF NOT EXISTS insurance_cases (
    id BIGSERIAL PRIMARY KEY,
    case_number VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insérer des données de test
INSERT INTO reports (title, content) VALUES 
('Rapport Test 1', 'Contenu du rapport de test 1')
ON CONFLICT DO NOTHING;

INSERT INTO insurance_cases (case_number, description, status) VALUES 
('CASE-001', 'Dossier d''assurance test 1', 'OPEN')
ON CONFLICT DO NOTHING;

-- Vérifier les tables
SELECT 'Tables existantes' as info, table_name 
FROM information_schema.tables 
WHERE table_name IN ('reports', 'insurance_cases')
ORDER BY table_name;

-- Vérifier les données
SELECT 'Données' as info,
       (SELECT COUNT(*) FROM reports) as reports_count,
       (SELECT COUNT(*) FROM insurance_cases) as cases_count;
