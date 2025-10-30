-- Script de test de connexion à la base de données
-- Exécutez ce script pour vérifier que la connexion fonctionne

-- 1. Test de connexion basique
SELECT 'Test de connexion' as info, 
       current_database() as database_name,
       current_user as user_name,
       version() as postgresql_version;

-- 2. Vérifier les tables existantes
SELECT 'Tables existantes' as info, table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 3. Test simple d'insertion et sélection
DO $$
BEGIN
    -- Créer une table de test temporaire
    CREATE TEMP TABLE test_connection (
        id SERIAL PRIMARY KEY,
        message VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Insérer une ligne de test
    INSERT INTO test_connection (message) VALUES ('Test de connexion réussi');
    
    -- Vérifier l'insertion
    RAISE NOTICE 'Test d''insertion: SUCCÈS';
    
    -- Nettoyer
    DROP TABLE test_connection;
    RAISE NOTICE 'Test de nettoyage: SUCCÈS';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'ERREUR DE CONNEXION: %', SQLERRM;
END $$;

-- 4. Vérifier les permissions
SELECT 'Permissions' as info,
       has_database_privilege(current_user, current_database(), 'CREATE') as can_create,
       has_database_privilege(current_user, current_database(), 'CONNECT') as can_connect,
       has_database_privilege(current_user, current_database(), 'INSERT') as can_insert,
       has_database_privilege(current_user, current_database(), 'SELECT') as can_select;

-- 5. Test de performance
SELECT 'Test de performance' as info,
       clock_timestamp() as current_time,
       pg_database_size(current_database()) as database_size_bytes;

SELECT '=== TEST DE CONNEXION TERMINÉ ===' as info;
