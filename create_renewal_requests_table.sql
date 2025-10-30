-- Script de création de la table des demandes de renouvellement
-- À exécuter dans la base de données PostgreSQL

-- Créer la table renewal_requests
CREATE TABLE IF NOT EXISTS renewal_requests (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    request_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_date TIMESTAMP,
    processed_by BIGINT,
    rejection_reason TEXT,
    
    -- Contraintes de clés étrangères
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_renewal_requests_user_id ON renewal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_renewal_requests_status ON renewal_requests(status);
CREATE INDEX IF NOT EXISTS idx_renewal_requests_request_date ON renewal_requests(request_date);

-- Vérifier que la table a été créée
SELECT 'Table renewal_requests créée avec succès' as message;
