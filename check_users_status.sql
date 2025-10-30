-- Script pour vérifier l'état des utilisateurs
SELECT 
    id,
    username,
    email,
    first_name,
    last_name,
    insurance_company,
    status,
    role,
    is_active,
    created_at,
    last_login_at
FROM users 
ORDER BY created_at DESC;
