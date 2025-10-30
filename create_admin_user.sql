-- Script pour créer l'administrateur initial
-- Le mot de passe sera encodé par Spring Security

-- Insérer l'administrateur initial
INSERT INTO users (
    username, 
    first_name, 
    last_name, 
    date_of_birth, 
    insurance_company, 
    password, 
    email, 
    status, 
    role, 
    created_at, 
    is_active
) VALUES (
    'admin',
    'Administrateur',
    'Système',
    '1990-01-01',
    'Système',
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', -- mot de passe: admin123
    'admin@assurance.com',
    'REGISTERED',
    'ADMIN',
    NOW(),
    true
);

-- Insérer quelques utilisateurs de test
INSERT INTO users (
    username, 
    first_name, 
    last_name, 
    date_of_birth, 
    insurance_company, 
    password, 
    email, 
    status, 
    role, 
    created_at, 
    is_active
) VALUES 
(
    'user1',
    'Jean',
    'Dupont',
    '1985-05-15',
    'Entreprise A',
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', -- mot de passe: admin123
    'jean.dupont@entreprisea.com',
    'REGISTERED',
    'USER',
    NOW(),
    true
),
(
    'user2',
    'Marie',
    'Martin',
    '1990-08-22',
    'Entreprise B',
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', -- mot de passe: admin123
    'marie.martin@entrepriseb.com',
    'REGISTERED',
    'USER',
    NOW(),
    true
);

-- Afficher les utilisateurs créés
SELECT username, first_name, last_name, insurance_company, role, status FROM users;
